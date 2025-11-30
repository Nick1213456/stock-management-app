-- 檢查是否有使用者存在
SELECT id, email, email_confirmed_at, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
