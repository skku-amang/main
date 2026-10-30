// Umami 관리자 비밀번호, 사이트 목록, AI 에이전트 계정을 git 선언에 맞춘다. sync마다 실행되므로 몇 번을 돌려도 결과가 같아야 한다.
// 사이트 삭제는 하지 않는다 (sites.json에서 빼도 통계는 남긴다)
import { readFileSync } from "node:fs";

const BASE = process.env.UMAMI_URL;
const PASSWORD = process.env.UMAMI_ADMIN_PASSWORD;
const DEFAULT_PASSWORD = "umami";
// 로컬 개발용 AI 에이전트 (특정 AI 도구에 묶이지 않음). API 키는 이 계정으로 한 번 발급 (.envrc.local.example Umami 블록)
const AI_AGENT_ID = "a436b103-1cc8-4006-838e-dc201e3b3f3a";
const AI_AGENT_PASSWORD = process.env.UMAMI_AI_AGENT_PASSWORD;
// 관리자가 아닌 계정은 팀에 속한 사이트만 볼 수 있다
const TEAM_NAME = "AMANG";
const sites = JSON.parse(readFileSync("/bootstrap/sites.json", "utf8"));

async function api(path, { token, method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

async function login(password) {
  const { status, data } = await api("/api/auth/login", {
    method: "POST",
    body: { username: "admin", password },
  });
  return status === 200 ? data.token : null;
}

let token = await login(PASSWORD);

// 새 DB면 Umami가 만든 기본 계정(admin/umami)이다. 선언된 비밀번호로 바꾼다
if (!token) {
  const defaultToken = await login(DEFAULT_PASSWORD);
  if (!defaultToken)
    throw new Error(
      "admin login failed with both declared and default password",
    );
  const { status } = await api("/api/me/password", {
    token: defaultToken,
    method: "POST",
    body: { currentPassword: DEFAULT_PASSWORD, newPassword: PASSWORD },
  });
  if (status !== 200) throw new Error(`password change failed: ${status}`);
  console.log("admin password set from secret");
  token = await login(PASSWORD);
}

for (const { id, name, domain } of sites) {
  // 관리자는 없는 사이트를 조회하면 200 + null을 받는다
  const { data: current } = await api(`/api/websites/${id}`, { token });

  if (!current) {
    const { status } = await api("/api/websites", {
      token,
      method: "POST",
      body: { id, name, domain },
    });
    if (status !== 200) throw new Error(`create ${domain} failed: ${status}`);
    console.log(`created ${domain} (${id})`);
  } else if (current.name !== name || current.domain !== domain) {
    const { status } = await api(`/api/websites/${id}`, {
      token,
      method: "POST",
      body: { name, domain },
    });
    if (status !== 200) throw new Error(`update ${domain} failed: ${status}`);
    console.log(`updated ${domain} (${id})`);
  } else {
    console.log(`unchanged ${domain} (${id})`);
  }
}

// 보기 전용 계정. 비밀번호·역할은 매번 선언값으로 덮는다
const { data: agent } = await api(`/api/users/${AI_AGENT_ID}`, { token });
const agentBody = { password: AI_AGENT_PASSWORD, role: "view-only" };
const { status: agentStatus } = agent
  ? await api(`/api/users/${AI_AGENT_ID}`, {
      token,
      method: "POST",
      body: agentBody,
    })
  : await api("/api/users", {
      token,
      method: "POST",
      body: { id: AI_AGENT_ID, username: "ai-agent", ...agentBody },
    });
if (agentStatus !== 200)
  throw new Error(`ai-agent user failed: ${agentStatus}`);
console.log(`${agent ? "updated" : "created"} ai-agent user`);

async function findTeam() {
  const { data } = await api("/api/teams?pageSize=100", { token });
  return data.data.find((t) => t.name === TEAM_NAME);
}

let team = await findTeam();
if (!team) {
  const { status } = await api("/api/teams", {
    token,
    method: "POST",
    body: { name: TEAM_NAME },
  });
  if (status !== 200) throw new Error(`create team failed: ${status}`);
  team = await findTeam();
  console.log(`created team ${TEAM_NAME}`);
}

if (!team.members.some((m) => m.userId === AI_AGENT_ID)) {
  const { status } = await api(`/api/teams/${team.id}/users`, {
    token,
    method: "POST",
    body: { userId: AI_AGENT_ID, role: "team-view-only" },
  });
  if (status !== 200) throw new Error(`add ai-agent to team failed: ${status}`);
  console.log("added ai-agent to team as team-view-only");
}

for (const { id, domain } of sites) {
  const { data: current } = await api(`/api/websites/${id}`, { token });
  if (current.teamId === team.id) continue;
  const { status } = await api(`/api/websites/${id}/transfer`, {
    token,
    method: "POST",
    body: { teamId: team.id },
  });
  if (status !== 200) throw new Error(`transfer ${domain} failed: ${status}`);
  console.log(`moved ${domain} to team ${TEAM_NAME}`);
}
