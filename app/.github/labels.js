/**
 * Github에서 사용되는 Label들을 Sync 합니다.
 */
const githubLabelSync = require("github-label-sync")

require('dotenv').config({ path: '../.env.local' });
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
if (!GITHUB_ACCESS_TOKEN) {
  throw new Error(
    `Unable to locate Github access token.
    Please add '.env.local' file and
    add GITHUB_ACCESS_TOKEN = [ACCESS TOKEN]`
  );
}

const labels = [
  {
      "name": "⚙ Setting",
      "color": "e3dede",
      "description": "개발 환경 세팅"
  },
  {
      "name": "✨ Feature",
      "color": "a2eeef",
      "description": "기능 개발"
  },
  {
      "name": "🌏 Deploy",
      "color": "C2E0C6",
      "description": "배포 관련"
  },
  {
      "name": "🎨 Html&css",
      "color": "FEF2C0",
      "description": "마크업 & 스타일링"
  },
  {
      "name": "🐞 BugFix",
      "color": "d73a4a",
      "description": "Something isn't working"
  },
  {
      "name": "💻 CrossBrowsing",
      "color": "C5DEF5",
      "description": "브라우저 호환성"
  },
  {
      "name": "📃 Docs",
      "color": "1D76DB",
      "description": "문서 작성 및 수정 (README.md 등)"
  },
  {
      "name": "📬 API",
      "color": "D4C5F9",
      "description": "서버 API 통신"
  },
  {
      "name": "🔨 Refactor",
      "color": "f29a4e",
      "description": "코드 리팩토링"
  },
  {
      "name": "🙋‍♂️ Question",
      "color": "9ED447",
      "description": "Further information is requested"
  },
  {
      "name": "🥰 Accessibility",
      "color": "facfcf",
      "description": "웹접근성 관련"
  },
  {
      "name": "✅ Test",
      "color": "ccffc4",
      "description": "test 관련(storybook, jest...)"
  }
]

githubLabelSync({
  accessToken: GITHUB_ACCESS_TOKEN,
  repo: "skku-amang/AMANG-Homepage",
  labels,
  dryRun: false,
}).then((diff) => {
  console.log(diff);
});
