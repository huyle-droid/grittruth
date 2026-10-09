# Cài đặt và triển khai

## 1. Chạy thử trước khi kết nối dịch vụ

Cài Node.js 22+, chạy `npm ci`, sao chép `.env.example` thành `.env.local`, rồi `npm run dev`. Để trống khóa dịch vụ sẽ mở demo hoạt động tại localhost:3000.

Giữ `NEXT_PUBLIC_SITE_URL=http://localhost:3000` khi chạy tại máy. Đây là origin được cho phép cho các API ghi dữ liệu; sai origin sẽ bị từ chối có chủ đích.

## 2. Supabase: tài khoản và dữ liệu

1. Tạo project Supabase do bạn quản lý.
2. Mở SQL Editor, chạy lần lượt `supabase/migrations/001_initial.sql` rồi `supabase/migrations/002_field_limits.sql`, mỗi file **một lần** trên project trống. Nếu sử dụng CLI, có thể đưa file này qua `supabase db push`.
3. Trong Project Settings → API, lấy project URL và publishable key:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Bật Email provider và cho phép đăng ký nếu muốn nhận người dùng mới. Xác minh email là bước bắt buộc; app dùng magic link.
5. Trong Authentication → URL Configuration, đặt Site URL theo môi trường. Thêm redirect chính xác:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://grittruth.com/auth/callback`
   - Preview: callback của domain preview mà bạn chủ động cho phép.
6. Trong email templates **Confirm signup** và **Magic Link**, dùng liên kết token hash cho server callback:

```html
<a href="{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email"
  >Sign in to GritTruth</a
>
```

App luôn gửi RedirectTo kết thúc bằng `/auth/callback`. Callback cũng hỗ trợ PKCE `code` nếu bạn giữ template tương thích của Supabase. Không thêm tham số redirect tùy ý do người dùng cung cấp.

7. Cấu hình SMTP đáng tin cậy cho email Auth trước khi mở đăng ký công khai. Kiểm tra giới hạn gửi, thời hạn link và chống lạm dụng trong Supabase.
8. Khởi động lại local hoặc redeploy sau khi thay biến public.
9. Đăng nhập bằng hai email thử riêng biệt. Brand/campaign/draft của A không được xuất hiện trong tài khoản B.

App **không dùng service-role key**. Publishable key được phép xuất hiện ở client vì quyền thực tế được kiểm tra bằng JWT + RLS. Không tắt RLS.

### Dữ liệu và xóa

- Mỗi người có một Brand DNA; có nhiều campaign và draft.
- Foreign key ghép `campaign_id,user_id` ngăn gắn draft vào campaign của người khác.
- Xóa campaign sẽ xóa draft thuộc campaign đó; UI yêu cầu xác nhận.
- Xóa user qua Supabase Auth sẽ cascade dữ liệu ứng dụng và quota của họ. Chỉ thực hiện khi đã xác minh yêu cầu xóa của chủ tài khoản.
- Người dùng có thể xuất TXT. Chưa có trang tự xóa tài khoản; yêu cầu xóa được xử lý qua contact@grittruth.com.
- Bảng quota có thể được dọn các ngày cũ bởi quản trị viên để giảm dung lượng. Không có tác vụ dọn tự động trong MVP.

Tài liệu tham chiếu: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates).

## 3. Claude: tạo nội dung thật

Thêm vào môi trường server:

```dotenv
ANTHROPIC_API_KEY=your-real-key
ANTHROPIC_MODEL=claude-sonnet-4-6
```

Không thêm tiền tố NEXT_PUBLIC_ cho khóa này. Model có thể thay bằng model ID mà tài khoản Anthropic của bạn được phép dùng.

Luồng: xác minh user → đọc Brand DNA của user → kiểm tra input → lấy một suất quota → gọi Claude → trả văn bản. Timeout provider 45 giây, tối đa 1.500 output token, không tự retry gây phát sinh chi phí. Provider lỗi vẫn tiêu thụ một lượt thử quota; giao diện giữ draft hiện tại.

Quota cố định 30 lượt/người/ngày UTC nằm trong hàm SQL `consume_generation`. Thay đổi quota cần migration có chủ đích. Thêm ngân sách ở tài khoản Anthropic theo nhu cầu vận hành. API key không có thì giao diện dùng sample và không nói rằng Claude đã tạo nội dung.

Tài liệu: [Anthropic Messages API](https://platform.claude.com/docs/en/build-with-claude/working-with-messages).

## 4. Email liên hệ

Email nhận cố định là **contact@grittruth.com**.

1. Thiết lập mailbox hoặc forwarding thực tế cho contact@grittruth.com ở nhà cung cấp email của bạn. Gắn domain website không tự tạo mailbox.
2. Tạo Resend API key và xác minh sending domain.
3. Đặt `RESEND_API_KEY` và `CONTACT_FROM=GritTruth <website@grittruth.com>`. Địa chỉ From phải thuộc domain đã xác minh.
4. Tạo Upstash Redis và lấy `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
5. Tạo `RATE_LIMIT_SECRET` ngẫu nhiên, ít nhất 32 ký tự. Ví dụ tự tạo bằng trình quản lý mật khẩu.
6. Form sẽ gửi text thuần tới contact@grittruth.com, đặt reply-to là người gửi. Thử gửi và kiểm tra inbox/spam thực.
7. Giới hạn hiện tại: 3 tin/địa chỉ/giờ, tổng tối đa 30 tin/giờ. Email dùng cho counter được HMAC trước khi lưu, counter tự hết hạn sau 1 giờ. Đây là giới hạn cơ bản cho MVP, không phải hệ thống chống bot toàn diện.

Nếu thiếu cấu hình hoặc provider lỗi, form báo rõ và đưa email liên hệ, không hiển thị thành công giả. Thông báo thành công chỉ có nghĩa provider chấp nhận gửi, không bảo đảm email đã vào inbox.

Tài liệu: [Resend](https://resend.com/docs), [Upstash REST API](https://upstash.com/docs/redis/features/restapi).

## 5. Đưa source lên Git

Thư mục đã có `.gitignore` loại trừ khóa, node_modules và build output. Commit source, package-lock.json, migration và tài liệu. Đừng commit `.env.local`.

Nếu thư mục chưa được khởi tạo Git, bạn có thể thực hiện:

```powershell
git init
git add .
git commit -m "Build GritTruth brand content MVP"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

Thay YOUR_REPOSITORY_URL bằng repository do bạn tạo. Không có lệnh nào ở bước này đã được tự chạy thay bạn.

## 6. Vercel

1. Import Git repository vào Vercel.
2. Framework: Next.js. Root directory: thư mục chứa package.json.
3. Node.js: 22 trở lên, chọn phiên bản được Vercel hỗ trợ. Install: `npm ci`. Build: `npm run build`. Giữ output directory mặc định của Next.js; không chọn static export.
4. Thêm biến môi trường theo `.env.example` vào đúng scope. Production đặt `NEXT_PUBLIC_SITE_URL=https://grittruth.com`. Các biến NEXT_PUBLIC_* được nhúng khi build, nên redeploy sau khi thay.
5. Preview có origin riêng: dùng một domain preview cố định được bạn kiểm soát và đặt URL tương ứng cho scope Preview, đồng thời thêm callback vào Supabase. Không dùng production origin cho request từ preview.
6. Deploy khi bạn sẵn sàng. MVP này có server routes nên không chạy như một static export thuần túy.
7. Trong Project Settings → Domains, thêm grittruth.com và làm theo bản ghi DNS Vercel hiển thị. Nếu thêm www, chuyển hướng www về canonical grittruth.com. Giữ đúng các bản ghi email MX/SPF/DKIM cần dùng.
8. Sau khi HTTPS hoạt động, kiểm tra lại origin, callback Auth và form liên hệ trên chính domain đó.

Tài liệu: [Vercel environment variables](https://vercel.com/docs/environment-variables), [deploying a project](https://vercel.com/docs/projects/deploy-from-cli).

## 7. Checklist kiểm thử có credential

- Email đăng ký mới, magic link người cũ, link hết hạn, sign-out, và refresh session.
- Tạo Brand DNA thật và reload; đảm bảo A/B không xem/sửa dữ liệu nhau.
- Tạo đủ 5 loại nội dung, thay tone, regenerate, sửa và lưu vào campaign.
- Thử provider bị ngắt, quota đạt giới hạn, và mạng lỗi; không mất draft cũ.
- Gửi form và xác nhận thư tới contact@grittruth.com.
- Đổi domain canonical và xác nhận sitemap/robots, redirects.
- Rà lại chính sách với pháp nhân, khu vực dữ liệu, retention, hộp thư hỗ trợ và cấu hình thực tế.

Các bước kiểm thử trên chưa được thực hiện với dịch vụ thật vì source không có credential của bạn. Không cần gửi khóa bí mật vào chat.
