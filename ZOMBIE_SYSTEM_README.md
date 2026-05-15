# 🧟 SAO-ĐÊM Defender: Zombie Animation & Asset Pipeline

*Đây là file ghi chú kỹ thuật để đồng bộ giữa USER và AI trợ lý.*

## 1. Cấu trúc Sprite Sheet (Grid)
- **Zombie Nhỏ (`zombie.png`)**: 
  - Thực tế: **10 Cột x 8 Hàng** (Kích thước ảnh 1024x1024px).
  - Một ô frame chuẩn: **102.4px x 128px**.
- **Zombie Tanker (`zombie_tank.png`)**: 
  - Thực tế: **8 Cột x 7 Hàng**.

## 2. Thuật toán Cắt ảnh Nguyên khối (Contiguous Slicing)
Để tránh bị "trượt" hoặc "lấn frame" khi kích thước không chia hết cho số nguyên:
```javascript
sx = Math.floor(frameIdx * (totalWidth / totalCols))
sy = Math.floor(rowIdx * (totalHeight / totalRows))
sw = Math.floor((frameIdx + 1) * (totalWidth / totalCols)) - sx
sh = Math.floor((rowIdx + 1) * (totalHeight / totalRows)) - sy
```
**Lưu ý**: Không dùng biến `fw/fh` cố định, phải tính trực tiếp trong vòng lặp `draw`.

## 3. Quy trình Xóa nền & Khử Halo (Optimized Pipeline)
- **Mục tiêu**: Xóa nền (Trắng/Đen) và triệt tiêu viền mờ (Halo).
- **Lệnh thực hiện**: `node remove_bg.js` (Chạy lệnh này mỗi khi có ảnh sprite mới).
- **Kỹ thuật Sharp Rendering**: Luôn áp dụng `image-rendering: pixelated;` trong CSS canvas để sprite sắc nét khi scale lớn.

## 4. Căn chỉnh Grounding & Tỉ lệ
- **Vị trí chân**: Dùng `yOffset: 0.95` để chân bám đất chính xác.
- **Kích thước**: `drawScale: 5.0` là chuẩn tỉ lệ cho zombie hướng thẳng.

## 5. Công cụ & Lệnh vận hành (Dependencies & CLI)

### Thư viện bắt buộc:
- **Jimp**: Thư viện xử lý ảnh chính. 
  - Cài đặt: `npm install jimp`
  - *Lưu ý*: Sử dụng cú pháp `const { Jimp } = require('jimp');` để tương thích với phiên bản mới.

### Câu lệnh thực thi:
1.  **Phân tích lưới**: `node analyze_grid.js`
    - Dùng để tìm số cột thực tế mà AI vẽ (thường bị lệch so với prompt).
2.  **Xóa nền & Mịn biên**: `node remove_bg.js`
    - Chạy lệnh này ngay sau khi tải ảnh Sprite mới về.

## 6. Thuật toán Truy vết Pixel (Pixel Tracking Logic)
Để ghi nhớ cho AI lần sau, đây là cách chúng ta tìm tọa độ chuẩn:

1.  **Cluster Detection**: 
    - Quét hàng ngang tại `y = 64` (giữa hàng đầu tiên).
    - Đánh dấu pixel `X` nếu `alpha > 30` hoặc `brightness < 240` (với nền trắng).
2.  **Grouping**: 
    - Nhóm các cụm `X` gần nhau (khoảng cách < 15px) thành 1 nhân vật.
    - Trung tâm của mỗi nhóm chính là tâm của Frame.
3.  **Thuật toán Xóa nền SOLID (Cập nhật 15/05/2026)**:
    Để tránh tình trạng Sprite bị mờ hoặc trong suốt (semi-transparent), luôn ưu tiên sử dụng chế độ **SOLID MODE** thay vì Gradient Alpha.

    - **Nguyên tắc SOLID**: Tuyệt đối không dùng công thức tính Alpha dựa trên độ sáng (ví dụ: `(255-avg) * ratio`). Điều này sẽ làm mờ cả nhân vật nếu nhân vật có màu sáng.
    - **Hard Threshold (Ngưỡng cứng)**:
        - **Nền Trắng**: Chỉ xóa khi `avg > 248` AND `diff < 10` (R, G, B cực kỳ gần nhau).
        - **Nền Đen**: Chỉ xóa khi `avg < 8` AND `diff < 8`.
    - **Sharpness**: Pixel bị xóa sẽ có `alpha = 0`, các pixel còn lại giữ nguyên `alpha = 255`.

---
*Cập nhật lần cuối: 15/05/2026 - By Antigravity AI (SOLID MODE Standard)*
