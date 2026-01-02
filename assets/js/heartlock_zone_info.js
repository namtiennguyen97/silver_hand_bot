document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-map-btn");
    if (!btn) return;

    const mapBlock = btn.closest(".map-block");
    const codes = [...mapBlock.querySelectorAll(".code-chip")]
        .map(el => el.textContent.trim())
        .join("-");

    navigator.clipboard.writeText(codes).then(() => {
        btn.textContent = "✅ Đã copy";
        setTimeout(() => {
            btn.textContent = "📋 Copy";
        }, 1500);
    });
});

