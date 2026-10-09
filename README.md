# GritTruth — AI Brand Content Studio

Source MVP dùng Next.js, TypeScript, Supabase và Claude, chuẩn bị cho Git + Vercel. Email liên hệ: **contact@grittruth.com**.

## Chạy local

Yêu cầu Node.js 22 hoặc mới hơn và npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Không cần điền API key để dùng demo. Để chạy bản production tại máy:

```powershell
npm run build
npm run start
```

## Đã xây

- Homepage, Product, How It Works, About, Contact, Privacy, Terms; giao diện desktop/mobile và menu bàn phím.
- Brand DNA gồm đủ 8 nhóm thông tin trong brief.
- Content Studio: caption, mô tả sản phẩm, quảng cáo, ý tưởng video, ý tưởng campaign; chỉnh tone, regenerate, chỉnh sửa, copy, xuất TXT.
- Campaign: tạo, xem bản nháp, phát triển ý tưởng, lọc, xuất TXT, xóa kèm bản nháp.
- Đăng nhập/đăng ký bằng email magic link; không tự quản lý mật khẩu.
- Tài khoản kết nối lưu dữ liệu trong Supabase, phân quyền bằng RLS và quan hệ khóa ngoại cùng chủ sở hữu.
- Claude được gọi từ server và dùng Brand DNA đã lưu; quota 30 lượt thử/người/ngày UTC.
- Form liên hệ gửi qua Resend, giới hạn tần suất lưu bền vững bằng Upstash.
- Demo có dữ liệu mẫu Fieldwork, lưu tại trình duyệt; không giả vờ gọi AI.
- Validation, giới hạn kích thước request, kiểm tra origin, security headers, sitemap, robots và font tự host.

## Hai chế độ

| Chế độ                                | Dữ liệu                       | Nội dung                                                           |
| ------------------------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `/workspace?demo=1`                   | Local storage của trình duyệt | Template ghi rõ sample; chỉ thay tên brand, không xử lý brief/tone |
| `/workspace` khi đã cấu hình Supabase | Database riêng theo tài khoản | Claude khi có API key; nếu chưa có thì vẫn ghi rõ sample           |

Demo không được tự động nhập vào tài khoản. Nếu không cấu hình Supabase, `/workspace` mở demo. Khi đã cấu hình Supabase, người chưa đăng nhập sẽ được chuyển tới trang đăng nhập.

## Các bước bạn cần làm tiếp

1. Đọc [hướng dẫn triển khai](docs/DEPLOYMENT.md).
2. Tạo Supabase, chạy [migration](supabase/migrations/001_initial.sql), cấu hình email Auth.
3. Điền các biến trong [.env.example](.env.example); thêm chúng vào Vercel khi deploy.
4. Push source lên repository của bạn, import project vào Vercel, gắn grittruth.com.
5. Kiểm tra thật luồng email đăng nhập, tạo nội dung Claude và nhận email liên hệ sau khi thêm khóa.
6. Xác minh pháp nhân và duyệt chính sách trước khi ra mắt công khai. QuantumVibe LLC chưa được đưa vào như pháp nhân đã xác minh.

## Kiểm tra

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm audit --omit=dev
```

Bộ E2E chạy trên bản production tại port 3000 và tự mở server nếu chưa có. Chạy với các khóa dịch vụ để trống; các ca này chủ động kiểm tra chế độ demo và trường hợp chưa cấu hình. Không chạy vào tài khoản production của bạn.

Bộ SQL dùng PGlite (Postgres nhúng) để chạy migration và kiểm thử RLS thực; không cần Supabase cho bài test local.

## Tài liệu bàn giao

- [Audit và quyết định](docs/AUDIT.md)
- [Cấu hình database, email, Claude và Vercel](docs/DEPLOYMENT.md)
- [Báo cáo kiểm thử](docs/TEST-REPORT.md)
- [Hoàn thành và phần còn lại](docs/STATUS.md)
- [Ảnh giao diện](docs/screenshots/)

## Cấu trúc source

```text
src/app/(marketing)/   Website và các trang chính sách
src/app/workspace/     Trang tài khoản/demo
src/app/api/           API bảo vệ dữ liệu, gọi Claude, gửi liên hệ
src/app/auth/          Xác thực email callback
src/components/       Giao diện và workspace tương tác
src/lib/              Schema, prompt, auth, Supabase và demo
supabase/migrations/  Database, RLS, quota
tests/                Unit/API, SQL và trình duyệt
docs/                 Hướng dẫn, báo cáo, screenshot
```

Repository public: https://github.com/huyle-droid/grittruth. Xem hướng dẫn deploy demo không cần API key tại [PUBLIC-DEMO.md](docs/PUBLIC-DEMO.md). Không có khóa dịch vụ thật trong repository.
