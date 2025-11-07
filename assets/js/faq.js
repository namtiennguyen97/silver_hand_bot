// Hiển thị modal FAQ
const faqBtn = document.getElementById("faqBtn");
const faqModal = document.getElementById("faqModal");
const faqClose = document.getElementById("faqClose");
const faqList = document.getElementById("faqList");

faqBtn.addEventListener("click", () => {
    faqModal.style.display = "flex";
});

faqClose.addEventListener("click", () => {
    faqModal.style.display = "none";
});

faqList.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
        // Xóa trạng thái sáng ở tất cả các li khác
        faqList.querySelectorAll("li").forEach(li => li.classList.remove("active"));

        // Thêm class active vào li được click
        e.target.classList.add("active");

        // Lấy nội dung câu hỏi
        const question = e.target.getAttribute("data-question");

        // Chèn vào ô input chat (nếu có biến promptInput)
        if (typeof promptInput !== "undefined") {
            promptInput.value = question;
            promptInput.focus();
        }

        // Đóng modal sau 300ms (cho người dùng thấy hiệu ứng sáng)
        setTimeout(() => {
            faqModal.style.display = "none";
            e.target.classList.remove("active");
        }, 100);
    }
});


// Đóng modal khi click ra ngoài
window.addEventListener("click", (e) => {
    if (e.target === faqModal) faqModal.style.display = "none";
});