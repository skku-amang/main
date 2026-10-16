// 스테이징 가짜 사용자 트래픽 (#748). 30분마다 CronJob이 한 번 돌린다.
//
// 프로덕션과 비슷한 빈도로 데이터가 쌓이게 하고(지우지 않음), 그 과정에서 TARGET_USER_ID 부원(스테이징에서
// 푸시를 켠 운영진 계정)에게 알림 유형이 골고루 자연스럽게 가게 한다. 빈도는 프로덕션 실측(2026-10, 최근
// 26주) 기준 — 동방 예약 하루 2.5건(평일 3·주말 1, 12~21시 시작, 1시간, 리드타임 중앙값 6시간), 모집 시즌엔
// 팀 1.5개/일·지원 8건/일, 가입 주 2건. 시즌은 압축: 공연당 팀이 차거나 마감이 지나면 봇1(운영진)이 새 공연을 연다.
//
// 등장인물
// - 봇1(운영진): 시즌 운영(공연 생성·마감), 가입 승인, 팀장 되찾기, 월 1회 팀 삭제
// - 봇2 + 가입 봇들(traffic-member-*, 봇과 같은 비밀번호): 팀 만들고 지원하고 가끔 나가고 동방을 예약하는 부원 풀
// - TARGET 부원: 새 팀의 30%에 팀원으로, 15%엔 팀장으로 들어간다. 동방 예약 40%에 같이 들어간다.
//   → TEAM_MEMBER_CHANGE·ATTRIBUTE_CHANGE·FILLED·LEADER_CHANGED·CREATED·DELETED, ROOM_RESERVATION_SOON,
//     EQUIPMENT_RETURN_DUE, USER_SIGNED_UP(운영진), PERFORMANCE_CREATED/UPDATED, TEAM_RECRUITMENT_DEADLINE(시즌 말).
//     별표한 팀 빈자리는 부원이 스테이징에서 봇 팀을 별표해 두면 '나가기' 때 온다.
// - 실행마다 시나리오를 "하루 목표 ÷ 그 시간대 실행 횟수" 확률로 고른다. 밤(23~09시 KST)엔 아무것도 만들지 않는다.
// - 실패해야 정상인 요청은 500이 아니라 정해진 오류 코드로 오는지 확인한다.
import http from "k6/http";
import { check, group, sleep } from "k6";

const API = __ENV.API_URL;
const ORIGIN = __ENV.ORIGIN;
const TARGET_USER_ID = Number(__ENV.TARGET_USER_ID) || null;
const TAG = "[traffic-bot]";
const MEMBER_PREFIX = "traffic-member-";
const MEMBER_DOMAIN = "amang.staging.json-server.win";
const VOCAL = 1;

const SEASON_TEAM_CAP = 45;
const SEASON_WEEKS = 4;
const RUNS_PER_HOUR = 2; // */30 cron

export const options = {
  vus: 1,
  iterations: 1,
  // 하나라도 실패하면 Job이 실패로 끝나 눈에 띄게
  thresholds: { checks: ["rate==1"] },
};

const think = () => sleep(1 + Math.random() * 3);
const chance = (p) => Math.random() < p;
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (list) => [...list].sort(() => Math.random() - 0.5);

const ok = (res, name) =>
  check(res, {
    [`${name} → ${res.status}`]: (r) => r.status >= 200 && r.status < 300,
  });
// 실패해야 정상인 요청: 기대한 오류 코드인지 (500이면 실패)
const rejects = (res, name, status) =>
  check(res, { [`${name} → ${status} 거절`]: (r) => r.status === status });
// 실제 데이터와 겹칠 수 있는 요청(예약·지원): 성공 또는 정해진 거절만 허용, 500은 실패
const okOr = (res, name, allowed) =>
  check(res, {
    [`${name} → ${res.status}`]: (r) =>
      (r.status >= 200 && r.status < 300) || allowed.includes(r.status),
  }) &&
  res.status >= 200 &&
  res.status < 300;

const data = (res) =>
  res.status >= 200 && res.status < 300 ? res.json("data") : undefined;

// 날짜 경계는 한국 기준 (서버·k6는 UTC). KST는 DST가 없어 산술로 충분
const KST = 9 * 36e5;
const HOUR = 36e5;
const DAY = 864e5;
const kstHour = (d) => Math.floor(((d.getTime() + KST) % DAY) / HOUR);
const kstDayIndex = (d) => Math.floor((d.getTime() + KST) / DAY);
const kstDow = (d) => (kstDayIndex(d) + 4) % 7; // 1970-01-01은 목요일(4)
const kstAt = (d, dayOffset, hour) =>
  new Date((kstDayIndex(d) + dayOffset) * DAY - KST + hour * HOUR);
const isWeekend = (d) => kstDow(d) === 0 || kstDow(d) === 6;

// 로컬 점검용: KST_HOUR로 시간대를, RATE로 확률 배수를 강제 (운영 CronJob은 둘 다 비움)
const SIMULATED_HOUR =
  __ENV.KST_HOUR === undefined ? null : Number(__ENV.KST_HOUR);
const RATE = Number(__ENV.RATE) || 1;

/** 하루 목표 건수를 허용 시간대의 실행 횟수로 나눈 확률. 밤엔 0 */
function roll(perDay, [from, to]) {
  const hour = SIMULATED_HOUR ?? kstHour(new Date());
  if (hour < from || hour >= to) return false;
  return chance((RATE * perDay) / ((to - from) * RUNS_PER_HOUR));
}
const DAYTIME = [9, 23];

/** 봇 한 명 = 쿠키 저장소 하나. 같은 VU 안에서 여러 사람으로 행동하려고 jar를 나눈다 */
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
    logout: () => http.post(API + "/auth/logout", null, params),
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

const teamDetail = (bot, id) => data(bot.get(`/teams/${id}`));
const leaderOf = (team) => team.leaderId ?? team.leader?.id;
const memberIds = (team) =>
  (team.teamSessions ?? []).flatMap((ts) =>
    (ts.members ?? []).map((m) => m.user?.id ?? m.userId),
  );
const participantIds = (team) => [leaderOf(team), ...memberIds(team)];
const isBotTeam = (team) => team.name.startsWith(TAG);

/** PUT /teams/:id는 전체 DTO를 요구한다. 지금 구성에서 일부만 바꿔 보낸다 */
function teamUpdateBody(team, patch) {
  return {
    name: team.name,
    description: team.description,
    leaderId: leaderOf(team),
    performanceId: team.performanceId,
    songName: team.songName,
    songArtist: team.songArtist,
    isFreshmenFixed: team.isFreshmenFixed,
    isSelfMade: team.isSelfMade,
    memberSessions: team.teamSessions.map((s) => ({
      sessionId: s.session.id,
      capacity: s.capacity,
      members: s.members.map((m) => ({ userId: m.user.id, index: m.index })),
    })),
    ...patch,
  };
}

function freeSlots(team) {
  return team.teamSessions
    .filter((ts) => ts.members.length < ts.capacity)
    .map((ts) => {
      const taken = new Set(ts.members.map((m) => m.index));
      let index = 1;
      while (taken.has(index)) index++;
      return { sessionId: ts.session.id, index };
    });
}

function slotOf(team, userId) {
  return team.teamSessions
    .map((ts) => ({ ts, m: ts.members.find((m) => m.user.id === userId) }))
    .filter((x) => x.m)
    .map((x) => ({ sessionId: x.ts.session.id, index: x.m.index }));
}

// ───────────────────────── 부원 풀 (가입 봇) ─────────────────────────

/** 승인된 가입 봇 중 몇 명을 골라 로그인한다. 봇2도 풀의 일원 */
function loginPool(bot1, bot2, count) {
  const members = (data(bot1.get("/users")) ?? []).filter((u) =>
    u.nickname?.startsWith(MEMBER_PREFIX),
  );
  const chosen = shuffle(members).slice(0, count);
  const pool = [bot2];
  for (const u of chosen) {
    try {
      pool.push(login(`${u.nickname}@${MEMBER_DOMAIN}`, __ENV.BOT_PASSWORD));
    } catch {
      // 비밀번호가 다른 계정(사람이 만든 것)이면 그냥 건너뜀
    }
  }
  return pool;
}

/** 가입 신청 → 운영진에게 USER_SIGNED_UP. 승인은 다음 실행들에서(approvePending) */
function signup(bot1) {
  group("가입 신청", () => {
    const stamp = Date.now().toString(36);
    const generations = data(bot1.get("/generations")) ?? [];
    const generation = generations.reduce(
      (a, b) => (a && a.id > b.id ? a : b),
      null,
    );
    if (!generation) return;
    ok(
      guest.post("/auth/signup", {
        email: `${MEMBER_PREFIX}${stamp}@${MEMBER_DOMAIN}`,
        password: __ENV.BOT_PASSWORD,
        name: `점검 부원 ${stamp.slice(-3)}`,
        nickname: `${MEMBER_PREFIX}${stamp}`,
        generationId: generation.id,
        sessions: [pick([1, 2, 3, 4, 5])],
      }),
      "POST /auth/signup",
    );
  });
}

/** 두 시간 넘게 기다린 가입 봇을 승인한다 → 그 계정에 USER_APPROVED */
function approvePending(bot1) {
  if (!bot1.me.isAdmin) return;
  const pending = (data(bot1.get("/users/admin/pending")) ?? []).filter(
    (u) =>
      u.email?.startsWith(MEMBER_PREFIX) &&
      Date.now() - new Date(u.createdAt).getTime() > 2 * HOUR,
  );
  if (!pending.length) return;
  group("가입 승인", () => {
    for (const u of pending)
      ok(bot1.patch(`/users/${u.id}/approve`), `승인 ${u.nickname}`);
  });
}

// ───────────────────────── 시즌 (공연) ─────────────────────────

function latestPerformance(bot) {
  const performances = data(bot.get("/performances")) ?? [];
  return performances.reduce((a, b) => (a && a.id > b.id ? a : b), null);
}

/**
 * 팀이 SEASON_TEAM_CAP개 찼거나 마감이 지났으면 새 공연을 연다(PERFORMANCE_CREATED → 승인 부원 전원).
 * 마감이 8주 넘게 남은 공연은 4주로 당긴다(1회, PERFORMANCE_UPDATED) — 시즌 말 D-1 알림이 실제로 오게.
 */
function currentSeason(bot1, teams) {
  const performance = latestPerformance(bot1);
  if (!bot1.me.isAdmin) return performance;
  const now = new Date();
  const teamCount = performance
    ? teams.filter((t) => t.performanceId === performance.id).length
    : 0;
  const closed =
    !performance || (performance.endAt && new Date(performance.endAt) <= now);

  if (closed || teamCount >= SEASON_TEAM_CAP) {
    let created;
    group("새 시즌 공연", () => {
      const n =
        (data(bot1.get("/performances")) ?? []).filter((p) =>
          p.name.startsWith(TAG),
        ).length + 1;
      const res = bot1.post("/performances", {
        name: `${TAG} 점검 공연 ${n}`,
        description:
          "스테이징 자동 점검용 공연입니다. 봇들이 팀을 만들고 지원합니다.",
        location: "스테이징 소극장",
        startAt: kstAt(now, SEASON_WEEKS * 7, 18).toISOString(),
        endAt: kstAt(now, SEASON_WEEKS * 7, 21).toISOString(),
      });
      if (ok(res, "POST /performances (새 시즌)")) created = data(res);
    });
    return created ?? performance;
  }

  if (
    performance.endAt &&
    new Date(performance.endAt).getTime() - now.getTime() > 8 * 7 * DAY
  ) {
    group("공연 마감을 4주 뒤로", () => {
      ok(
        bot1.patch(`/performances/${performance.id}`, {
          startAt: kstAt(now, SEASON_WEEKS * 7, 18).toISOString(),
          endAt: kstAt(now, SEASON_WEEKS * 7, 21).toISOString(),
        }),
        "PATCH /performances/:id (마감 4주 뒤)",
      );
    });
    return latestPerformance(bot1);
  }
  return performance;
}

/** 공연 참여자가 봇·풀·TARGET뿐일 때만 그 공연에 팀을 만든다 — 다른 부원에게 알림이 안 가게 */
function isBotPlayground(performance, teams, pool, bot1) {
  const allowed = new Set([
    bot1.me.id,
    TARGET_USER_ID,
    ...pool.map((b) => b.me.id),
  ]);
  const inPerf = teams.filter((t) => t.performanceId === performance.id);
  return (
    performance.name.startsWith(TAG) ||
    inPerf.every((t) =>
      participantIds(t).every(
        (id) =>
          allowed.has(id) ||
          (data(bot1.get(`/users/${id}`)) ?? {}).nickname?.startsWith(
            MEMBER_PREFIX,
          ),
      ),
    )
  );
}

// ───────────────────────── 팀 ─────────────────────────

const SONGS = [
  ["밤편지", "아이유"],
  ["Bohemian Rhapsody", "Queen"],
  ["Creep", "Radiohead"],
  ["좋은 날", "아이유"],
  ["Don't Look Back in Anger", "Oasis"],
  ["사건의 지평선", "윤하"],
  ["Smells Like Teen Spirit", "Nirvana"],
  ["나의 사춘기에게", "볼빨간사춘기"],
  ["Hotel California", "Eagles"],
  ["Butterfly", "러브홀릭"],
  ["Zombie", "The Cranberries"],
  ["그대에게", "신해철"],
  ["Sweet Child O' Mine", "Guns N' Roses"],
  ["어떤가요", "정준일"],
  ["Basket Case", "Green Day"],
  ["소녀", "이문세"],
];

/** 풀 멤버(또는 TARGET)가 팀장인 팀을 만든다. TARGET은 30% 팀원, 15% 팀장 */
function createTeam(bot1, pool, performance) {
  group("팀 생성", () => {
    const [songName, songArtist] = pick(SONGS);
    const creator = pick(pool);
    const targetRole = !TARGET_USER_ID
      ? "none"
      : chance(0.15)
        ? "leader"
        : chance(0.35)
          ? "member"
          : "none";
    const sessionIds = shuffle([1, 2, 3, 4, 5, 6, 7]).slice(
      0,
      2 + Math.floor(Math.random() * 3),
    );
    const memberSessions = sessionIds.map((sessionId) => ({
      sessionId,
      capacity: chance(0.3) ? 2 : 1,
      members: [],
    }));
    memberSessions[0].members.push({ userId: creator.me.id, index: 1 });
    if (targetRole === "member")
      memberSessions[1].members.push({ userId: TARGET_USER_ID, index: 1 });
    ok(
      creator.post("/teams", {
        name: `${TAG} ${songName}`,
        description: pick([
          "같이 즐겁게 해요",
          "초보 환영",
          "주 1회 합주",
          "공연 전까지 열심히",
        ]),
        leaderId: targetRole === "leader" ? TARGET_USER_ID : creator.me.id,
        performanceId: performance.id,
        songName,
        songArtist,
        isFreshmenFixed: chance(0.2),
        isSelfMade: false,
        memberSessions,
      }),
      "POST /teams",
    );
  });
}

/** 빈자리 있는 팀에 풀 멤버가 지원한다 → 팀원·팀장에게 TEAM_MEMBER_CHANGE, 마지막 자리면 팀장에게 TEAM_FILLED */
function applyToTeam(bot1, pool, teams, performance) {
  const candidates = shuffle(
    teams.filter((t) => t.performanceId === performance.id && isBotTeam(t)),
  );
  for (const summary of candidates) {
    const team = teamDetail(bot1, summary.id);
    if (!team) continue;
    const applicants = pool.filter(
      (b) => !participantIds(team).includes(b.me.id),
    );
    const slots = freeSlots(team);
    if (!applicants.length || !slots.length) continue;
    const applicant = pick(applicants);
    group("팀 지원", () => {
      okOr(
        applicant.patch(`/teams/${team.id}/apply`, [pick(slots)]),
        `지원 ${team.name}`,
        [409],
      );
    });
    return;
  }
}

/** 풀 멤버가 팀에서 나간다 → 팀원·팀장에게 TEAM_MEMBER_CHANGE, 별표한 비멤버에게 BOOKMARKED_TEAM_SPOT_OPENED */
function leaveTeam(bot1, pool, teams, performance) {
  const candidates = shuffle(
    teams.filter((t) => t.performanceId === performance.id && isBotTeam(t)),
  );
  for (const summary of candidates) {
    const team = teamDetail(bot1, summary.id);
    if (!team) continue;
    const leavers = pool.filter(
      (b) => b.me.id !== leaderOf(team) && slotOf(team, b.me.id).length,
    );
    if (!leavers.length) continue;
    const leaver = pick(leavers);
    group("팀 나가기", () => {
      ok(
        leaver.patch(`/teams/${team.id}/unapply`, slotOf(team, leaver.me.id)),
        `나가기 ${team.name}`,
      );
    });
    return;
  }
}

/** 팀장(풀 멤버 또는 운영진 봇1)이 팀 정보를 고친다 → 팀원에게 TEAM_ATTRIBUTE_CHANGE */
function editTeam(bot1, pool, teams, performance) {
  const candidates = shuffle(
    teams.filter((t) => t.performanceId === performance.id && isBotTeam(t)),
  );
  for (const summary of candidates) {
    const team = teamDetail(bot1, summary.id);
    if (!team) continue;
    const editor =
      pool.find((b) => b.me.id === leaderOf(team)) ??
      (bot1.me.isAdmin ? bot1 : null);
    if (!editor) continue;
    group("팀 정보 수정", () => {
      ok(
        editor.put(
          `/teams/${team.id}`,
          teamUpdateBody(team, {
            description: pick([
              "연습 요일 바꿨어요",
              "곡 키 반음 내림",
              "합주 시간 조정",
              "세션 모집 중",
            ]),
          }),
        ),
        `수정 ${team.name}`,
      );
    });
    return;
  }
}

/** 봇1(운영진)이 TARGET이 팀원인 팀의 팀장을 TARGET으로, 또는 TARGET이 팀장인 봇 팀을 봇에게 되돌린다 */
function leaderHandoff(bot1, pool, teams, performance, direction) {
  if (!TARGET_USER_ID || !bot1.me.isAdmin) return;
  const candidates = shuffle(
    teams.filter((t) => t.performanceId === performance.id && isBotTeam(t)),
  );
  for (const summary of candidates) {
    const team = teamDetail(bot1, summary.id);
    if (!team) continue;
    let nextLeader;
    if (
      direction === "to-target" &&
      leaderOf(team) !== TARGET_USER_ID &&
      memberIds(team).includes(TARGET_USER_ID)
    )
      nextLeader = TARGET_USER_ID;
    if (direction === "to-bot" && leaderOf(team) === TARGET_USER_ID)
      nextLeader =
        memberIds(team).find((id) => id !== TARGET_USER_ID) ?? pick(pool).me.id;
    if (!nextLeader) continue;
    group("팀장 교체", () => {
      ok(
        bot1.put(
          `/teams/${team.id}`,
          teamUpdateBody(team, { leaderId: nextLeader }),
        ),
        `팀장 교체 ${team.name}`,
      );
    });
    return;
  }
}

/** 월 1회: 가장 오래된 봇 팀 하나를 지운다 → 팀원에게 TEAM_DELETED. TARGET이 있는 팀을 우선 */
function deleteOldTeam(bot1, teams, performance) {
  if (!bot1.me.isAdmin) return;
  const botTeams = teams
    .filter((t) => t.performanceId === performance.id && isBotTeam(t))
    .sort((a, b) => a.id - b.id);
  const withTarget = botTeams.filter(
    (t) => TARGET_USER_ID && participantIds(t).includes(TARGET_USER_ID),
  );
  const victim = withTarget[0] ?? botTeams[0];
  if (!victim) return;
  group("오래된 팀 삭제", () => {
    ok(bot1.del(`/teams/${victim.id}`), `삭제 ${victim.name}`);
  });
}

// ───────────────────────── 예약 ─────────────────────────

/** 프로덕션 리드타임 분포: 당일 2~8시간 뒤 50%, 1~5일 뒤 40%, 65분 뒤 10%. 시작 12~21시 KST, 1~2시간 */
function roomSlot() {
  const now = new Date();
  let start;
  const r = Math.random();
  if (r < 0.1) start = new Date(now.getTime() + 65 * 60e3);
  else if (r < 0.6)
    start = new Date(
      now.getTime() + (2 + Math.floor(Math.random() * 7)) * HOUR,
    );
  else
    start = kstAt(
      now,
      1 + Math.floor(Math.random() * 5),
      12 + Math.floor(Math.random() * 10),
    );
  // 정시로 맞추고 12~21시 밖이면 다음 날 낮으로
  start = new Date(Math.ceil(start.getTime() / HOUR) * HOUR);
  if (kstHour(start) < 12 || kstHour(start) > 21)
    start = kstAt(start, 1, 12 + Math.floor(Math.random() * 10));
  const hours = chance(0.7) ? 1 : 2;
  return { start, end: new Date(start.getTime() + hours * HOUR) };
}

/** 동방 예약. 겹치면(409) 다른 슬롯으로 최대 3번. TARGET은 40%에 같이 들어간다 → ROOM_RESERVATION_SOON */
function reserveRoom(pool, room) {
  const creator = pick(pool);
  group("동방 예약", () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const { start, end } = roomSlot();
      const userIds = [creator.me.id];
      if (TARGET_USER_ID && chance(0.4)) userIds.push(TARGET_USER_ID);
      const res = creator.post("/rentals", {
        equipmentId: room.id,
        title: pick([
          `${TAG} 합주`,
          `${TAG} 개인 연습`,
          `${TAG} 보컬 연습`,
          `${TAG} 밴드 연습`,
        ]),
        startAt: start.toISOString(),
        endAt: end.toISOString(),
        userIds,
      });
      if (okOr(res, "POST /rentals (동방)", [409])) return;
    }
  });
}

/** 장비 대여, TARGET 포함. 오늘 22시(이미 20시 넘었으면 내일) 반납 → EQUIPMENT_RETURN_DUE */
function rentItem(bot1, item) {
  if (!TARGET_USER_ID) return;
  const now = new Date();
  const dayOffset = kstHour(now) >= 20 ? 1 : 0;
  group("장비 대여", () => {
    okOr(
      bot1.post("/rentals", {
        equipmentId: item.id,
        title: `${TAG} ${item.brand} ${item.model} 대여`,
        startAt: now.toISOString(),
        endAt: kstAt(now, dayOffset, 22).toISOString(),
        userIds: [bot1.me.id, TARGET_USER_ID],
      }),
      "POST /rentals (장비)",
      [409],
    );
  });
}

// ───────────────────────── 읽기·거절 ─────────────────────────

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

// ───────────────────────── 실행 ─────────────────────────

export default function () {
  const bot1 = login(__ENV.BOT_EMAIL, __ENV.BOT_PASSWORD);
  const bot2 = login(__ENV.BOT2_EMAIL, __ENV.BOT2_PASSWORD);
  const pool = loginPool(bot1, bot2, 3);
  const weekend = isWeekend(new Date());

  approvePending(bot1);
  let teams = data(bot1.get("/teams")) ?? [];
  const performance = currentSeason(bot1, teams);
  const recruiting =
    performance &&
    (!performance.endAt || new Date(performance.endAt) > new Date());
  const playground =
    recruiting && isBotPlayground(performance, teams, pool, bot1);
  teams = data(bot1.get("/teams")) ?? [];

  const equipments = data(bot1.get("/equipments")) ?? [];
  const room = equipments.find((e) => e.category === "ROOM");
  const item = equipments.find((e) => e.category !== "ROOM");

  browse(pick(pool));

  if (playground) {
    if (roll(1.5, [10, 23])) createTeam(bot1, pool, performance);
    for (let i = 0; i < 2; i++)
      if (roll(8, DAYTIME)) applyToTeam(bot1, pool, teams, performance);
    if (roll(1, DAYTIME)) leaveTeam(bot1, pool, teams, performance);
    if (roll(1, [10, 23])) editTeam(bot1, pool, teams, performance);
    if (roll(1 / 7, [10, 23]))
      leaderHandoff(bot1, pool, teams, performance, "to-target");
    if (roll(1 / 7, [10, 23]))
      leaderHandoff(bot1, pool, teams, performance, "to-bot");
    if (roll(1 / 30, [10, 23])) deleteOldTeam(bot1, teams, performance);
    if (roll(1 / 14, [10, 23]) && bot1.me.isAdmin)
      group("공연 정보 수정", () => {
        ok(
          bot1.patch(`/performances/${performance.id}`, {
            location: pick([
              "스테이징 소극장",
              "스테이징 대강당",
              "학생회관 지하",
            ]),
          }),
          "PATCH /performances/:id (장소)",
        );
      });
  }
  if (room && roll(weekend ? 1 : 3, [9, 23])) reserveRoom(pool, room);
  if (item && roll(1 / 7, [10, 20])) rentItem(bot1, item);
  if (roll(2 / 7, [10, 23])) signup(bot1);

  expectedRejections(bot1);

  for (const bot of [bot1, ...pool]) {
    ok(
      bot.patch("/notifications/read-all"),
      `${bot.me.nickname} 알림 모두 읽음`,
    );
    bot.logout();
  }
}
