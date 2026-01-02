function updateClock() {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    document.getElementById('clock').textContent = formatter.format(now);
}

// chạy ngay khi load
updateClock();

// cập nhật mỗi giây
setInterval(updateClock, 1000);