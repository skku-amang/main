`web/hooks/api`

# 용도

Web 어플리케이션에서 API를 호출하는 기능을 구현하기 위한 코드입니다. 이 코드는 API 클라이언트와 관련된 메서드를 정의하고, API 요청을 처리합니다.
굳이 이 API Client를 사용하는 이유는 다음과 같습니다.

- **일관성**: 모든 API 호출을 동일한 방식으로 처리하여 코드의 일관성을 유지합니다.
- **에러 처리**: API 호출 시 발생할 수 있는 에러를 JsDoc 주석으로 문서화하고, 이를 통해 개발자가 API 호출 시 어떤 에러가 발생할 수 있는지 명확히 이해할 수 있도록 합니다.

# 주요 기능

- API 클라이언트 인스턴스 생성 및 관리
- API 응답에 대한 에러 처리 및 변환
