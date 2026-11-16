# Affiliate AutoPilot v1.0

## Chức năng hiện có
- Đăng ký / đăng nhập bằng Supabase Auth.
- Thêm, sửa, xóa và tìm kiếm sản phẩm.
- Lưu link sản phẩm và link Affiliate do nền tảng cấp.
- Lưu giá, hoa hồng dự kiến, đánh giá, danh mục và trạng thái.
- Row Level Security: mỗi tài khoản chỉ truy cập dữ liệu của mình.

## 1. Cấu hình Supabase
1. Tạo project Supabase.
2. Mở SQL Editor và chạy nội dung trong `supabase.sql`.
3. Trong Project Settings > API, lấy Project URL và Publishable key (hoặc anon key cũ).
4. Mở `app.js`, thay hai giá trị mẫu `YOUR_SUPABASE_PROJECT_URL` và `YOUR_SUPABASE_ANON_PUBLIC_KEY`.
5. Không bao giờ đặt `service_role` key trong mã frontend.

## 2. Đưa lên GitHub Pages
1. Tạo repository GitHub.
2. Upload `index.html`, `style.css`, `app.js` ở thư mục gốc.
3. Vào Settings > Pages.
4. Chọn Deploy from a branch, branch `main`, folder `/(root)`, rồi Save.
5. Mở URL GitHub Pages được cấp.

## 3. Cấu hình xác thực
Trong Supabase Authentication > URL Configuration, đặt Site URL là URL GitHub Pages của bạn và thêm URL đó vào Redirect URLs.

## Lưu ý
Đây là MVP quản lý sản phẩm. Chưa tự động thu thập dữ liệu Shopee, tự tạo link Affiliate, đăng bài hàng loạt hoặc truy cập báo cáo hoa hồng. Chỉ dùng API/quyền chính thức khi nền tảng cấp quyền. Hãy kiểm tra điều kiện độ tuổi và điều khoản chương trình Affiliate; nếu chưa đủ tuổi, cần phụ huynh/người giám hộ hỗ trợ hợp lệ.
