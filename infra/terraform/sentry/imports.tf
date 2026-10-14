# Sentry UI로 만들어져 있던 리소스를 state로 가져온다 (Terraform 1.5+ import 블록).
# 한 번 apply로 state에 들어간 뒤에는 남아 있어도 아무 동작 안 함 — 이력 기록용으로 유지.

import {
  to = sentry_team.amang
  id = "amang-23/amang"
}

import {
  to = sentry_project.web
  id = "amang-23/web"
}

import {
  to = sentry_project.api
  id = "amang-23/api"
}

import {
  to = sentry_uptime_monitor.api_production
  id = "amang-23/7397909"
}
