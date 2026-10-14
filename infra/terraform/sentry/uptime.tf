resource "sentry_uptime_monitor" "api_production" {
  organization       = local.organization
  project            = sentry_project.api.slug
  name               = "AMANG API · production"
  environment        = "production"
  url                = "https://api.amang.json-server.win/health"
  method             = "GET"
  headers            = {}
  interval_seconds   = 60
  timeout_ms         = 10000
  downtime_threshold = 3
  recovery_threshold = 1

  # 2xx 응답만 정상
  assertion_json = jsonencode({
    root = {
      id = "5557e556-c429-277c-709c-50ab7a8e6620"
      op = "and"
      children = [
        {
          id       = "5ceb4ad8-e536-70f2-8caa-86a519366fcf"
          op       = "status_code_check"
          operator = { cmp = "greater_than" }
          value    = 199
        },
        {
          id       = "67df22a5-1205-fb7a-9000-e6066d109b9b"
          op       = "status_code_check"
          operator = { cmp = "less_than" }
          value    = 300
        },
      ]
    }
  })

  owner = {
    user_id = "4289260"
  }

  # provider가 import 시 project를 읽어오지 못해 state가 null → 그대로 두면 교체(삭제 후 재생성)가 계획됨.
  # 교체되면 ID가 바뀌어 UI 관리 중인 "API 에러" 알림의 모니터 연결이 끊기므로 차이를 무시한다.
  lifecycle {
    ignore_changes = [project]
  }
}
