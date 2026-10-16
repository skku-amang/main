# infra/

AMANG 인프라 매니페스트 디렉토리. K8s 매니페스트(Kustomize)와 Terraform IaC가 SSOT.

## 디렉토리 구조

```
infra/
├── k8s/
│   └── {component}/                    # api, web, db, redis, umami, ...
│       ├── base/                       # 공통 매니페스트 (deployment, service, pvc, configmap)
│       └── overlays/
│           ├── staging/                # 환경별 namespace, ingress, NetworkPolicy, SealedSecret
│           └── production/
├── kargo/                              # staging → production 승격 파이프라인 (Kargo Project amang)
└── terraform/
    └── {provider}/                     # sentry, ...
```

ArgoCD Application 정의는 **별도 레포**([homelab](https://github.com/manamana32321/homelab/tree/main/k8s/argocd/applications/apps/amang))에 있다. 신규 컴포넌트 추가 시 homelab repo에도 PR 필요.

## Namespace 컨벤션

**`amang-{component}-{env}`** 패턴. 컴포넌트별로 namespace를 분리한다.

| Namespace                          | 용도                          |
| ---------------------------------- | ----------------------------- |
| `amang-api-{staging,production}`   | NestJS API + migrate/seed Job |
| `amang-db-{staging,production}`    | PostgreSQL                    |
| `amang-redis-{staging,production}` | Redis                         |

> **web도 K8s로 배포한다** ([#749](https://github.com/skku-amang/main/issues/749)) — `NEXT_PUBLIC_*`가 빌드 때 박혀서 환경별 이미지(`amang-web-staging`/`-production`)를 따로 만든다. 공개값은 [apps/web/env/](../apps/web/env/), 런타임 시크릿은 없음.

**왜 컴포넌트별 분리인가**: NetworkPolicy의 `namespaceSelector` cross-namespace 참조를 명시적으로 만들어 권한 경계를 ns 단위로 관리. 단일 ns에 모두 두면 모든 pod가 모든 Service에 접근 가능해짐.

### Namespace SSOT는 ArgoCD `destination.namespace`

Kustomize overlay의 `kustomization.yaml`에 `namespace:` 필드를 **명시하지 않는다**. namespace 결정은 ArgoCD Application의 `destination.namespace`가 SSOT이며, ArgoCD가 sync 시 모든 namespaced 리소스에 자동 적용한다 (`syncOptions: CreateNamespace=true`로 ns 자체도 자동 생성).

이렇게 하면:

- "어디 배포되는지"를 한 곳(homelab repo의 ArgoCD Application)에서만 변경 가능
- amang repo의 Kustomize는 컴포넌트가 어떤 ns에 가는지 모름 — 재사용성 ↑
- ApplicationSet generator로 staging/production 환경 매트릭스 깔끔

**예외 — SealedSecret은 sealing 시 metadata.namespace가 cert에 박힘**: sealed-secrets controller가 strict scope로 동작하므로 sealing 시 명시한 namespace에서만 복호화. 따라서 SealedSecret YAML에는 namespace가 박혀있고, **ArgoCD destination.namespace와 일치해야 함** (불일치 시 controller가 reject). 환경별로 별도 sealing 필요.

> **현재 상태**: redis는 이 룰을 따른다. db/api는 아직 `kustomization.yaml`에 `namespace:` 필드 명시 + `namespace.yaml` 별도 — 후속 리팩토링 필요 ([infra/k8s/db/](k8s/db/), [infra/k8s/api/](k8s/api/) overlays).

## 이미지 버전 정책

### 자체 빌드 이미지 (api, web)

- 레지스트리: **GHCR** (`ghcr.io/skku-amang/amang-{component}`)
- 태그: `<커밋시각 UTC>-<짧은 SHA>` (예: `20261014093012-9424f62`). [build-image.yml](../.github/workflows/build-image.yml)이 붙이고, 문자열 정렬이 곧 시간순
- 배포는 아래 [환경 승격 (Kargo)](#환경-승격-kargo) 참조. base의 `:kargo-managed`는 승격 시 Kargo가 stage overlay의 `images:`로 덮어쓰는 자리표시 (실재하지 않는 태그라 overlay에 빠지면 바로 실패). `:latest`는 push하지 않음

## 환경 승격 (Kargo)

staging과 production은 **같은 커밋의 API·web을 시차를 두고** 받는다 ([#603](https://github.com/skku-amang/main/issues/603), [#700](https://github.com/skku-amang/main/issues/700)). 정의는 [infra/kargo/](kargo/), UI는 https://kargo.json-server.win.

```
main 머지 (커밋 C)
 └─ GHA: 이미지 amang-api / amang-web-staging / amang-web-production <시각>-C
      → Warehouse: 커밋 C와 이미지 3개 *-C가 모두 짝이 맞으면 Freight 생성
  → staging 자동 승격:    promote-k8s(env/staging)
  → production 수동 승격: promote-k8s(env/production)
     (promote-k8s: api·web 매니페스트를 env 브랜치에 쓰고 api 먼저 sync, 그다음 web)
```

- Freight = main 커밋 하나. CI가 실패해 이미지가 없는 커밋은 Freight가 안 생겨 배포되지 않는다
- web은 `NEXT_PUBLIC_*`가 빌드 때 박혀 환경별 이미지가 따로다 ([apps/web/env/](../apps/web/env/)). 같은 커밋의 두 이미지를 한 Freight로 묶어 staging에서 검증한 커밋이 그대로 production에 간다
- 순서는 API → web. API 변경은 옛 web과도 호환되게 짤 것
- ArgoCD api·web 앱은 `main`이 아니라 **`env/<stage>` 브랜치의 `infra/k8s/<app>/overlays/<stage>`**를 바라본다. 디렉토리 구조는 main과 같고, 그 stage overlay에 이미지 태그만 고정돼 있다. 실제 배포 상태 = 해당 브랜치 내용
- `env/*` 브랜치는 Kargo만 쓴다. GitHub ruleset `env branches (Kargo only)`로 GitHub App `amang-kargo` 외 생성·push·삭제 금지 (레포 설정에서 수동 생성, Terraform 밖)
- overlay 설정 변경도 Freight에 포함되므로 production에는 승격을 거쳐야 반영된다
- 롤백: Kargo UI에서 이전 Freight를 production에 다시 승격 (API·web 함께 그 커밋으로)

### Public 이미지 (postgres, redis 등)

- **마이너 버전까지 핀**, alpine 변형 선호 (예: `postgres:16.10-alpine`, `redis:8.4-alpine`)
- `:latest` 태그 절대 금지
- Image Updater 사용 안 함 — 메이저/마이너 업그레이드는 사람이 의식적으로 PR

### 버전 선택 규칙

1. **공식 LTS가 있으면 LTS 채택** (예: Node, Postgres major)
2. **공식 LTS가 없으면 직전 minor의 stable**(latest minor − 1) 채택
   - 이유: latest minor는 곧 fully-supported 자리에서 밀려나 EOL 가까움. 직전 minor는 안정성 검증 끝났고 보안 패치 보장
   - 예: Redis는 공식 LTS 없음 → latest=8.6이면 **8.4 핀**
3. **EOL 확인 필수**: 신규 컴포넌트 추가 또는 메이저 업그레이드 시 [endoflife.date](https://endoflife.date/)에서 종료일 확인. EOL 6개월 이내 버전 채택 금지
4. Docker Hub의 태그 alive ≠ upstream 보안 패치 alive. 항상 **upstream 프로젝트** 기준 EOL 확인

## SealedSecret

핵심 규칙:

- **AMANG은 homelab cluster에 배포된다** (ArgoCD `destination.server: https://kubernetes.default.svc` — ArgoCD가 운영되는 cluster 자기 자신). staging/production은 같은 cluster의 namespace 분리
- 따라서 **모든 환경의 SealedSecret은 homelab cluster의 sealed-secrets controller로 sealing**해야 함. 다른 cluster cert로 sealing하면 복호화 실패 → 배포 장애
- 본인 로컬 kubeconfig에서 homelab cluster를 어떤 파일/context로 등록했는지는 자유. KUBECONFIG 환경변수로 명시 prefix:

  ```bash
  KUBECONFIG=<your-homelab-kubeconfig> kubeseal --raw \
    --namespace=amang-<component>-<env> --name=<secret-name>
  ```

- 잘못된 cluster cert로 sealing 방지: kubeseal 실행 전 `kubectl config current-context`로 cluster 확인. cluster 식별이 헷갈리면 ArgoCD UI의 amang Application `destination.server`로 확인 (homelab cluster)
- 평문 Secret 또는 "나중에 SealedSecret으로 전환" TODO 주석 패턴 금지 — 첫 커밋부터 SealedSecret으로
- SealedSecret 전환 시 **기존 평문 Secret 수동 삭제** 필수 (controller는 평문을 자동 삭제하지 않음)

## NetworkPolicy

- **base에 두지 않고 overlay에 둔다**: `namespaceSelector` cross-ns 참조 값(`amang-api-staging` vs `amang-api-production`)이 환경마다 다르고, 환경별 허용 클라이언트 차이(예: production만 Grafana ro 허용)가 있을 수 있음
- 패턴: 컴포넌트 ns에 ingress default-deny → 명시적 namespaceSelector + podSelector + port로 허용
- 예시: [infra/k8s/db/overlays/production/network-policy.yaml](k8s/db/overlays/production/network-policy.yaml)

## Probe / Resources / 환경 변수

### Liveness / Readiness Probe

- **자체 앱**: liveness와 readiness 엔드포인트를 분리
- **공식 이미지**: 이미지가 제공하는 헬스체크 활용. 없으면 스킵 (Postgres `pg_isready`, Redis `redis-cli ping` 등 exec probe 가능하나 필수 아님)

### Resources

- 작은 동아리 규모 기준 default: `requests 256Mi/250m`, `limits 512Mi/500m`
- 메모리 부담 큰 컴포넌트(DB)는 별도 산정. PVC 별도 관리

### 환경 변수 주입

- **공통값**: `base/configmap.yaml` + `envFrom: configMapRef`
- **환경별 값**: `overlays/{env}/kustomization.yaml`의 `patches`로 ConfigMap에 add
- **시크릿**: SealedSecret → Secret → `envFrom: secretRef`

## ArgoCD Application

별도 레포 [homelab `k8s/argocd/applications/apps/amang/`](https://github.com/manamana32321/homelab/tree/main/k8s/argocd/applications/apps/amang)에 컴포넌트별 yaml 파일.

신규 컴포넌트 추가 시 필수 항목:

- `repoURL`: amang repo
- `path`: `infra/k8s/{component}/overlays/{env}`
- `destination.namespace`: `amang-{component}-{env}`
- `syncPolicy.automated`: `prune: true`, `selfHeal: true`
- `syncPolicy.syncOptions`: 신규 namespace면 `CreateNamespace=true`
- 자체 빌드 이미지면 [image-updater.yaml](https://github.com/manamana32321/homelab/blob/main/k8s/argocd/applications/apps/amang/image-updater.yaml)에 등록
