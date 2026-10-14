terraform {
  required_providers {
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.15.8"
    }
  }

  # S3 backend - credentials via AWS_PROFILE=homelab (.envrc)
  backend "s3" {
    bucket = "homelab-tfstate-361769566809"
    key    = "amang/sentry/terraform.tfstate"
    region = "ap-northeast-2"
  }
}

# 토큰은 SENTRY_AUTH_TOKEN 환경변수에서 읽음 (.envrc → .envrc.local)
provider "sentry" {}

locals {
  organization = "amang-23"
  # Sentry GroupCategory.FEEDBACK — 사용자 피드백(버그 제보 버튼, /suggestions)이 이 카테고리로 저장됨
  feedback_issue_category = 6
}

data "sentry_organization_integration" "slack" {
  organization = local.organization
  provider_key = "slack"
  name         = "Amang-Homepage"
}

# 프로젝트마다 자동 생성되는 기본 모니터 (새 이슈 전체를 추적)
data "sentry_project_issue_stream_monitor" "web" {
  organization = local.organization
  project      = sentry_project.web.slug
}

# 기존 "Web 에러"/"API 에러" 알림은 우선순위 high 조건(new/existing_high_priority_issue)을 쓰는데,
# provider가 아직 이 조건을 지원하지 않아 Terraform 밖(Sentry UI)에 남아 있다.
# 피드백 이슈는 우선순위가 medium이라 그 알림에 걸리지 않음 → 별도 알림으로 보낸다.
resource "sentry_alert" "web_feedback" {
  organization      = local.organization
  name              = "Web 사용자 의견"
  environment       = "production"
  monitor_ids       = [data.sentry_project_issue_stream_monitor.web.id]
  frequency_minutes = 5

  trigger_conditions = [
    { first_seen_event = {} },
  ]

  action_filters = [
    {
      logic_type = "all"
      conditions = [
        # include를 생략하면 provider가 false("같지 않음")로 보냄 (문서상 기본값 true와 다름) → 반드시 명시
        { issue_category = { value = local.feedback_issue_category, include = true } },
      ]
      actions = [
        {
          slack = {
            integration_id = data.sentry_organization_integration.slack.id
            channel_name   = "#모니터링"
            channel_id     = "C0AR4KGH9FA"
            tags           = "suggestion_kind, url"
          }
        },
      ]
    },
  ]
}
