// 스테이징 가짜 사용자 트래픽 (#748). 30분마다 CronJob이 한 번 돌린다.
// 실제 사용자처럼 둘러보고, 쓰기는 만든 즉시 되돌린다 — 실패해도 다음 실행 전에 남는 건
// "[traffic-bot]" 제목의 먼 미래 동방 예약 1건 또는 지원 1건뿐이다.
import http from "k6/http";
import { check, group } from "k6";

const API = __ENV.API_URL;
const ORIGIN = __ENV.ORIGIN;
const params = {
  headers: { Origin: ORIGIN, "Content-Type": "application/json" },
};

export const options = {
  vus: 1,
  iterations: 1,
  // 하나라도 실패하면 Job이 실패로 끝나 눈에 띄게
  thresholds: { checks: ["rate==1"] },
};

const ok = (res, name) =>
  check(res, {
    [`${name} ${res.status}`]: (r) => r.status >= 200 && r.status < 300,
  });

const data = (res) => res.json("data");

export default function () {
  let me;
  group("로그인", () => {
    const res = http.post(
      `${API}/auth/login`,
      JSON.stringify({ email: __ENV.BOT_EMAIL, password: __ENV.BOT_PASSWORD }),
      params,
    );
    if (!ok(res, "POST /auth/login"))
      throw new Error("로그인 실패 — 이후 단계 의미 없음");
    me = data(http.get(`${API}/auth/me`, params)).user;
  });

  let latest;
  let teams = [];
  group("둘러보기", () => {
    const perfRes = http.get(`${API}/performances`, params);
    ok(perfRes, "GET /performances");
    const performances = data(perfRes) ?? [];
    latest = performances.reduce((a, b) => (a && a.id > b.id ? a : b), null);

    const teamRes = http.get(`${API}/teams`, params);
    ok(teamRes, "GET /teams");
    teams = (data(teamRes) ?? []).filter(
      (t) => latest && t.performanceId === latest.id,
    );
    if (teams.length) {
      const pick = teams[Math.floor(Math.random() * teams.length)];
      ok(http.get(`${API}/teams/${pick.id}`, params), "GET /teams/:id");
    }

    ok(http.get(`${API}/equipments`, params), "GET /equipments");
    ok(http.get(`${API}/notifications`, params), "GET /notifications");
  });

  group("동방 예약 만들고 지우기", () => {
    const room = (data(http.get(`${API}/equipments`, params)) ?? []).find(
      (e) => e.category === "ROOM",
    );
    if (!room) return;
    // 60~120일 뒤 새벽 3시(KST) 30분 — 실제 예약과 겹칠 일이 거의 없는 시간대
    const start = new Date();
    start.setUTCDate(start.getUTCDate() + 60 + Math.floor(Math.random() * 60));
    start.setUTCHours(18, 0, 0, 0);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const created = http.post(
      `${API}/rentals`,
      JSON.stringify({
        equipmentId: room.id,
        title: "[traffic-bot] 스테이징 점검",
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        userIds: [me.id],
      }),
      params,
    );
    if (ok(created, "POST /rentals"))
      ok(
        http.del(`${API}/rentals/${data(created).id}`, null, params),
        "DELETE /rentals/:id",
      );
  });

  group("팀 지원하고 취소", () => {
    // 비어 있는 자리가 있는 팀 하나에 지원 → 바로 취소
    for (const team of teams) {
      for (const ts of team.teamSessions ?? []) {
        if (ts.members.length >= ts.capacity) continue;
        if (ts.members.some((m) => m.user.id === me.id)) continue;
        const taken = new Set(ts.members.map((m) => m.index));
        let index = 1;
        while (taken.has(index)) index++;
        const body = JSON.stringify([{ sessionId: ts.session.id, index }]);
        const applied = http.patch(
          `${API}/teams/${team.id}/apply`,
          body,
          params,
        );
        if (ok(applied, "PATCH /teams/:id/apply"))
          ok(
            http.patch(`${API}/teams/${team.id}/unapply`, body, params),
            "PATCH /teams/:id/unapply",
          );
        return;
      }
    }
  });

  group("별표 켜고 끄기", () => {
    if (!teams.length) return;
    const team = teams[Math.floor(Math.random() * teams.length)];
    const res = http.put(`${API}/team-bookmarks/${team.id}`, null, params);
    // 별표 기능(#761) 배포 전이면 건너뜀
    if (res.status === 404 && !res.json("error.detail")?.includes("팀")) return;
    if (ok(res, "PUT /team-bookmarks/:teamId"))
      ok(
        http.del(`${API}/team-bookmarks/${team.id}`, null, params),
        "DELETE /team-bookmarks/:teamId",
      );
  });

  http.post(`${API}/auth/logout`, null, params);
}
