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
3.  **Công thức Xóa nền tối ưu (Advanced Transparency)**:
    - **Nền Trắng**: 
        - Ngưỡng: `avg > 210`.
        - Kiểm tra độ trung tính: `max(R,G,B) - min(R,G,B) < 15` (Để tránh làm trong suốt da nhân vật).
        - Alpha: `(255 - avg) * (255 / 45)`.
    - **Nền Đen**: 
        - Ngưỡng: `avg < 55`.
        - Alpha: `avg * (255 / 55)`.
    - **Sharpness**: Sử dụng `Hard Threshold` (avg > 250 => alpha 0) nếu muốn sprite "đặc" hoàn toàn không có gradient biên.

---
*Cập nhật lần cuối: 12/05/2026 - By Antigravity AI*
