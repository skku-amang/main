// 스테이징 가짜 사용자 트래픽 (#748). 30분마다 CronJob이 한 번 돌린다.
//
// 봇 두 명이 서로 주고받는다:
// - 봇1은 최신 공연에 "[traffic-bot] 점검 팀"을 하나 두고 지우지 않는다. 팀 생성은 그 공연
//   참여자 전원에게 알림이 가서(TEAM_CREATED), 공연마다 한 번만 만든다.
// - 봇2가 그 팀에 지원 → 봇1에게 알림이 오는지 확인 → 읽음 → 봇2 취소. 지원·취소·수정 알림은
//   팀원(봇)에게만 가서 실제 부원에게 알림이 가지 않는다.
// - 실패해야 정상인 요청은 500이 아니라 정해진 오류 코드로 오는지 확인한다.
// - 실행마다 일부 단계만 무작위로 고르고, 단계 사이에 1~4초 쉰다.
// - 시작할 때 지난 실행에서 남은 봇 예약·지원부터 정리한다.
import http from "k6/http";
import { check, group, sleep } from "k6";

const API = __ENV.API_URL;
const ORIGIN = __ENV.ORIGIN;
const TAG = "[traffic-bot]";

export const options = {
  vus: 1,
  iterations: 1,
  // 하나라도 실패하면 Job이 실패로 끝나 눈에 띄게
  thresholds: { checks: ["rate==1"] },
};

const think = () => sleep(1 + Math.random() * 3);
const chance = (p) => Math.random() < p;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

const ok = (res, name) =>
  check(res, {
    [`${name} → ${res.status}`]: (r) => r.status >= 200 && r.status < 300,
  });
// 실패해야 정상인 요청: 기대한 오류 코드인지 (500이면 실패)
const rejects = (res, name, status) =>
  check(res, { [`${name} → ${status} 거절`]: (r) => r.status === status });

const data = (res) => res.json("data");

/** 봇 한 명 = 쿠키 저장소 하나. 같은 VU 안에서 두 사람으로 행동하려고 jar를 나눈다 */
function login(email, password) {
  const jar = new http.CookieJar();
  const params = {
    headers: { Origin: ORIGIN, "Content-Type": "application/json" },
    jar,
  };
  const body = (b) => (b === undefined ? null : JSON.stringify(b));
  const bot = {
    get: (path) => http.get(API + path, params),
    post: (path, b) => http.post(API + path, body(b), params),
    put: (path, b) => http.put(API + path, body(b), params),
    patch: (path, b) => http.patch(API + path, body(b), params),
    del: (path) => http.del(API + path, null, params),
  };
  const res = bot.post("/auth/login", { email, password });
  if (!ok(res, `로그인 ${email}`))
    throw new Error("로그인 실패 — 이후 단계 의미 없음");
  bot.me = data(bot.get("/auth/me")).user;
  return bot;
}

const guest = {
  get: (path) => http.get(API + path, { headers: { Origin: ORIGIN } }),
  post: (path, b) =>
    http.post(API + path, JSON.stringify(b), {
      headers: { Origin: ORIGIN, "Content-Type": "application/json" },
    }),
};

// 60~120일 뒤 새벽 3시(KST) — 실제 예약과 겹칠 일이 거의 없는 시간대
function farFutureSlot() {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + 60 + Math.floor(Math.random() * 60));
  start.setUTCHours(18, 0, 0, 0);
  return { start, end: new Date(start.getTime() + 30 * 60 * 1000) };
}

function latestPerformance(bot) {
  const performances = data(bot.get("/performances")) ?? [];
  return performances.reduce((a, b) => (a && a.id > b.id ? a : b), null);
}

function cleanup(bot1, bot2, botTeam) {
  group("지난 실행 정리", () => {
    const from = new Date(Date.now() + 55 * 864e5).toISOString();
    const to = new Date(Date.now() + 130 * 864e5).toISOString();
    for (const r of data(bot1.get(`/rentals?from=${from}&to=${to}`)) ?? []) {
      if (r.title?.startsWith(TAG))
        ok(bot1.del(`/rentals/${r.id}`), "남은 봇 예약 삭제");
    }
    if (!botTeam) return;
    const leftover = botTeam.teamSessions
      .map((ts) => ({
        ts,
        m: ts.members.find((m) => m.user.id === bot2.me.id),
      }))
      .filter((x) => x.m)
      .map((x) => ({ sessionId: x.ts.session.id, index: x.m.index }));
    if (leftover.length)
      ok(
        bot2.patch(`/teams/${botTeam.id}/unapply`, leftover),
        "남은 봇 지원 취소",
      );
  });
}

function ensureBotTeam(bot1, performance) {
  const mine = (data(bot1.get("/teams")) ?? []).find(
    (t) =>
      t.performanceId === performance.id &&
      t.leader.id === bot1.me.id &&
      t.name.startsWith(TAG),
  );
  if (mine) return data(bot1.get(`/teams/${mine.id}`));

  const created = bot1.post("/teams", {
    name: `${TAG} 점검 팀`,
    description: "스테이징 자동 점검용 팀입니다. 지원하지 마세요.",
    leaderId: bot1.me.id,
    performanceId: performance.id,
    songName: `${TAG} 점검곡`,
    songArtist: "traffic-bot",
    isFreshmenFixed: false,
    isSelfMade: false,
    memberSessions: [
      { sessionId: 1, capacity: 1, members: [] },
      { sessionId: 2, capacity: 2, members: [] },
    ],
  });
  return ok(created, "POST /teams (점검 팀 첫 생성)") ? data(created) : null;
}

function browse(bot) {
  group("둘러보기", () => {
    const pages = [
      "/performances",
      "/teams",
      "/equipments",
      "/sessions",
      "/generations",
      "/notifications",
      "/notifications/unread-count",
      "/auth/sessions",
    ];
    for (const path of pages.filter(() => chance(0.6))) {
      ok(bot.get(path), `GET ${path}`);
      think();
    }
    const teams = data(bot.get("/teams")) ?? [];
    if (teams.length) ok(bot.get(`/teams/${pick(teams).id}`), "GET /teams/:id");
  });
}

function teamRoundTrip(bot1, bot2, team) {
  group("봇2 지원 → 봇1 알림 → 취소", () => {
    const open = team.teamSessions.filter(
      (ts) => ts.members.length < ts.capacity,
    );
    if (!open.length) return;
    const ts = pick(open);
    const taken = new Set(ts.members.map((m) => m.index));
    let index = 1;
    while (taken.has(index)) index++;
    const slot = [{ sessionId: ts.session.id, index }];

    const before = data(bot1.get("/notifications/unread-count")).count;
    if (!ok(bot2.patch(`/teams/${team.id}/apply`, slot), "봇2 지원")) return;
    think();

    rejects(
      bot2.patch(`/teams/${team.id}/apply`, slot),
      "같은 세션 중복 지원",
      409,
    );
    rejects(
      bot1.patch(`/teams/${team.id}/apply`, slot),
      "이미 찬 자리 지원",
      409,
    );

    // 알림은 이벤트로 비동기 생성 — 잠깐 기다리며 확인
    let after = before;
    for (let i = 0; i < 5 && after <= before; i++) {
      sleep(1);
      after = data(bot1.get("/notifications/unread-count")).count;
    }
    check(after, { "봇1에게 지원 알림 도착": (a) => a > before });

    const latest = (data(bot1.get("/notifications?limit=5"))?.items ?? []).find(
      (n) => n.type === "TEAM_MEMBER_CHANGE" && n.payload?.teamId === team.id,
    );
    if (latest)
      ok(bot1.patch(`/notifications/${latest.id}/read`), "알림 하나 읽음");

    if (chance(0.3)) {
      // 팀 설명 수정 → 팀원(봇2)에게 수정 알림. 구성원은 지금 그대로 보낸다
      const detail = data(bot1.get(`/teams/${team.id}`));
      ok(
        bot1.put(`/teams/${team.id}`, {
          name: detail.name,
          description: `스테이징 자동 점검용 팀입니다. 지원하지 마세요. (${new Date().toISOString()})`,
          leaderId: detail.leaderId ?? bot1.me.id,
          performanceId: detail.performanceId,
          songName: detail.songName,
          songArtist: detail.songArtist,
          isFreshmenFixed: detail.isFreshmenFixed,
          isSelfMade: detail.isSelfMade,
          memberSessions: detail.teamSessions.map((s) => ({
            sessionId: s.session.id,
            capacity: s.capacity,
            members: s.members.map((m) => ({
              userId: m.user.id,
              index: m.index,
            })),
          })),
        }),
        "팀장 팀 정보 수정",
      );
      think();
    }

    ok(bot2.patch(`/teams/${team.id}/unapply`, slot), "봇2 지원 취소");
    ok(bot1.patch("/notifications/read-all"), "봇1 알림 모두 읽음");
    ok(bot2.patch("/notifications/read-all"), "봇2 알림 모두 읽음");
  });
}

function rentalRoundTrip(bot1, bot2) {
  group("동방 예약 → 겹치는 예약 거절 → 삭제", () => {
    const room = (data(bot1.get("/equipments")) ?? []).find(
      (e) => e.category === "ROOM",
    );
    if (!room) return;
    const { start, end } = farFutureSlot();
    const body = (bot) => ({
      equipmentId: room.id,
      title: `${TAG} 스테이징 점검`,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      userIds: [bot.me.id],
    });
    const created = bot1.post("/rentals", body(bot1));
    if (!ok(created, "POST /rentals")) return;
    think();
    rejects(bot2.post("/rentals", body(bot2)), "같은 시간 동방 예약", 409);
    ok(bot1.del(`/rentals/${data(created).id}`), "DELETE /rentals/:id");
  });
}

function bookmarkRoundTrip(bot, team) {
  group("별표 켜고 끄기", () => {
    const res = bot.put(`/team-bookmarks/${team.id}`);
    // 별표 기능(#761) 배포 전이면 건너뜀
    if (res.status === 404 && !String(res.json("error.detail")).includes("팀"))
      return;
    if (ok(res, "PUT /team-bookmarks/:teamId"))
      ok(
        bot.del(`/team-bookmarks/${team.id}`),
        "DELETE /team-bookmarks/:teamId",
      );
  });
}

function expectedRejections(bot1) {
  group("실패해야 정상인 요청", () => {
    const cases = [
      () =>
        rejects(
          guest.post("/auth/login", {
            email: __ENV.BOT_EMAIL,
            password: "wrong-password!1",
          }),
          "틀린 비밀번호",
          401,
        ),
      () => rejects(guest.get("/users"), "비로그인 부원 목록", 401),
      () => rejects(guest.get("/notifications"), "비로그인 알림", 401),
      () => rejects(bot1.get("/teams/99999999"), "없는 팀", 404),
      () => rejects(bot1.post("/rentals", {}), "빈 예약 요청", 400),
    ];
    // 매번 다른 3개
    for (const run of cases.sort(() => Math.random() - 0.5).slice(0, 3)) {
      run();
      think();
    }
  });
}

export default function () {
  const bot1 = login(__ENV.BOT_EMAIL, __ENV.BOT_PASSWORD);
  const bot2 = login(__ENV.BOT2_EMAIL, __ENV.BOT2_PASSWORD);

  const performance = latestPerformance(bot1);
  // 모집 마감된 공연에는 팀을 만들거나 지원할 수 없음
  const recruiting =
    performance &&
    (!performance.endAt || new Date(performance.endAt) > new Date());
  const team = recruiting ? ensureBotTeam(bot1, performance) : null;

  cleanup(bot1, bot2, team);

  browse(pick([bot1, bot2]));
  if (team) teamRoundTrip(bot1, bot2, data(bot1.get(`/teams/${team.id}`)));
  if (chance(0.6)) rentalRoundTrip(bot1, bot2);
  expectedRejections(bot1);
  if (team && chance(0.5)) bookmarkRoundTrip(bot2, team);

  bot1.post("/auth/logout");
  bot2.post("/auth/logout");
}
