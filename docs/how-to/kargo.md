# Kargo로 배포 확인·승격하기

> **For**: production 배포·롤백을 하는 사람.
> **You'll be able to**: Kargo UI/CLI로 지금 배포 상태를 보고, production에 승격하거나 이전 버전으로 되돌린다.

배포 구조(Freight·Stage·env 브랜치)는 [infra/AGENTS.md "환경 승격 (Kargo)"](../../infra/AGENTS.md#환경-승격-kargo), 도구 주소는 [reference/tools.md](../reference/tools.md).

main에 머지하면 staging(API·web)까지는 자동으로 나간다. production은 아래처럼 직접 승격한다.

## UI로 승격

1. [kargo.json-server.win](https://kargo.json-server.win) → Authentik 로그인 → `amang` 프로젝트
2. staging Stage 카드의 **Links**로 staging 웹·API를 확인
3. production Stage → staging을 통과한 Freight 선택 → **Promote**
4. production Stage의 **Links** → 웹 사이트·API health로 확인

되돌리기: 3번에서 이전 Freight를 골라 Promote (API·web이 함께 그 커밋으로 돌아감).

## CLI 설치

클러스터와 같은 버전(현재 v1.12.4)의 바이너리를 받아 서명을 확인하고 설치한다.

```bash
gh release download v1.12.4 -R akuity/kargo -p kargo-linux-amd64 -p kargo-cli.intoto.jsonl
gh attestation verify kargo-linux-amd64 --bundle kargo-cli.intoto.jsonl --repo akuity/kargo \
  --predicate-type https://slsa.dev/provenance/v0.2 --signer-repo slsa-framework/slsa-github-generator
install -m 0755 kargo-linux-amd64 ~/.local/bin/kargo
```

## CLI 로그인

```bash
kargo login https://kargo.json-server.win --sso
```

브라우저에서 Authentik 로그인 → `http://localhost:<port>/auth/callback`으로 돌아오면 끝. refresh 토큰으로 최대 30일 유지된다.

### WSL에서 브라우저가 WSL 쪽으로 열릴 때

`xdg-open`이 WSLg의 Linux 브라우저를 열고, 그 브라우저가 닫힐 때까지 CLI가 멈춰 콜백을 못 받는다. 이 명령에만 `xdg-open`을 Windows 브라우저로 바꿔 쓴다.

```bash
mkdir -p ~/.local/share/win-open
printf '#!/bin/sh\nrundll32.exe url.dll,FileProtocolHandler "$1" >/dev/null 2>&1\nexit 0\n' > ~/.local/share/win-open/xdg-open
chmod +x ~/.local/share/win-open/xdg-open
PATH=$HOME/.local/share/win-open:$PATH kargo login https://kargo.json-server.win --sso
```

- `BROWSER` 환경변수는 `xdg-open`이 데스크톱 환경을 감지하면 무시돼서 효과가 없다
- `explorer.exe`는 `?`·`&`가 든 긴 URL을 못 알아보고 탐색기를 연다
- 콜백은 `.wslconfig`의 `networkingMode=mirrored`일 때 Windows 브라우저에서 WSL로 바로 닿는다

## CLI로 확인·승격

```bash
kargo get stages --project amang          # Stage별 현재 Freight·상태
kargo get freight --project amang         # Freight 목록 (alias, 출처)
kargo get promotions --project amang      # 승격 기록

kargo promote --project amang --freight <이름|alias> --stage production
```

지금 stage에 연결된 web 배포(커밋·Vercel URL·대시보드 링크):

```bash
kubectl -n amang get stage production -o jsonpath='{.status.metadata.web}'
```

## 긴급 핫픽스

staging을 기다릴 수 없을 때, 특정 Freight를 staging 없이 production에 올릴 수 있게 허용한 뒤 승격한다.

```bash
kargo approve --project amang --freight <이름|alias> --stage production
kargo promote --project amang --freight <이름|alias> --stage production
```
