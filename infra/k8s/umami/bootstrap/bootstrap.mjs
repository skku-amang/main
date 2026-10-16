// Umami 관리자 비밀번호와 사이트 목록을 git 선언에 맞춘다. sync마다 실행되므로 몇 번을 돌려도 결과가 같아야 한다.
// 사이트 삭제는 하지 않는다 (sites.json에서 빼도 통계는 남긴다)
import { readFileSync } from "node:fs";

const BASE = process.env.UMAMI_URL;
const PASSWORD = process.env.UMAMI_ADMIN_PASSWORD;
const DEFAULT_PASSWORD = "umami";
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
