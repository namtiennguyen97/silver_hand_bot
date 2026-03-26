document.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-map-btn");
    if (!btn) return;

    const mapBlock = btn.closest(".map-block");
    const codes = [...mapBlock.querySelectorAll(".code-chip")]
        .map(el => el.textContent.trim())
        .join("-");

    navigator.clipboard.writeText(codes).then(() => {
        btn.textContent = "✓ COPIED";
        btn.classList.add("copied");
        setTimeout(() => {
            btn.textContent = "📋 COPY";
            btn.classList.remove("copied");
        }, 1800);
    }).catch(() => {
        btn.textContent = "✗ FAILED";
        setTimeout(() => {
            btn.textContent = "📋 COPY";
        }, 1500);
    });
});
