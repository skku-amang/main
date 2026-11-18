-- 이메일을 소문자로 받기 시작하므로(#528) 이미 저장된 주소도 소문자로 맞춘다.
-- 대소문자만 다른 주소가 이미 있으면 unique 충돌이 나므로 그 행은 건드리지 않는다 (배포 전 확인: 0건)
UPDATE "users" AS u
SET "email" = LOWER(u."email")
WHERE u."email" <> LOWER(u."email")
  AND NOT EXISTS (
    SELECT 1 FROM "users" AS o
    WHERE o."id" <> u."id" AND LOWER(o."email") = LOWER(u."email")
  );
