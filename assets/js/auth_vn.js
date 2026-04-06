/**
 * AUTH_VN.JS - Identity System with Visual Novel Intro
 * Reuses VNEngine for the onboarding flow.
 */

const VN_AUTH_SCRIPT = {
    'start': {
        speaker: 'MAYOR AI',
        side: 'right',
        image: 'assets/img/mayor_dialogue_1.png',
        text: '... Đang quét sinh trắc học. Nhận diện Tactician mới trong khu vực Node Hope 101.',
        next: 'guest_1'
    },
    'guest_1': {
        speaker: 'SYSTEM',
        side: 'left',
        image: 'assets/img/system.png',
        effect: 'shake',
        text: 'Chờ đã... Đây là đâu? Ai đang nói vậy?',
        next: 'line2'
    },
    'line2': {
        speaker: 'MAYOR AI',
        side: 'right',
        effect: 'flash',
        text: 'Chào mừng bạn. Tôi là MAYOR AI, người quản lý giao diện trung tâm này. Dữ liệu của bạn chưa có trong bản lưu trữ vĩnh viễn.',
        next: 'guest_2'
    },
    'guest_2': {
        speaker: 'SYSTEM',
        side: 'left',
        text: 'Dữ liệu chưa có? Ý cô là tôi cần phải đăng ký danh tính để truy cập hệ thống?',
        next: 'line3'
    },
    'line3': {
        speaker: 'MAYOR AI',
        side: 'right',
        image: 'assets/img/mayor_dialogue_2.png',
        text: 'Đúng vậy. Để tránh việc mất dữ liệu quá trình tham chiến, bạn có muốn thiết lập một Identity ID riêng cho mình không?',
        next: 'choice_auth'
    },
    'choice_auth': {
        choices: [
            { text: 'CHỈ TRẢI NGHIỆM GUEST MODE', next: 'path_guest' },
            { text: 'XÁC LẬP DANH TÍNH TACTICIAN', next: 'path_register' }
        ]
    },
    'path_guest': {
        speaker: 'SYSTEM',
        side: 'left',
        text: 'Tôi chỉ muốn trải nghiệm xem qua hệ thống này trước thôi.',
        next: 'path_guest_resp'
    },
    'path_guest_resp': {
        speaker: 'MAYOR AI',
        side: 'right',
        image: 'assets/img/mayor_dialogue_1.png',
        text: 'Đã rõ. Chế độ Khách (Guest) đã được ghi nhận. Bạn có thể thiết lập danh tính sau này trong mục SETTING của HUD.',
        next: 'finalize_guest'
    },
    'path_register': {
        speaker: 'SYSTEM',
        side: 'left',
        text: 'Được thôi, tôi sẽ tiến hành xác lập danh tính Tactician ngay.',
        next: 'path_register_resp'
    },
    'path_register_resp': {
        speaker: 'MAYOR AI',
        side: 'right',
        effect: 'shake',
        text: 'Quyết định sáng suốt. Khởi tạo quy trình thiết lập Identity Protocol... Vui lòng upload ảnh đại diện và nhập mã passcode.',
        next: 'trigger_register'
    },
    'finalize_guest': {
        speaker: 'SYSTEM',
        text: 'SYSTEM: GUEST MODE ACTIVE. Chúc bạn một ngày tốt lành.',
        image: 'assets/img/mayor_dialogue_3.png',
    },
    'trigger_register': {
        speaker: 'SYSTEM',
        text: 'SYSTEM: IDENTITY PROTOCOL INITIALIZING...'
    }
};

const VN_THANKS_SCRIPT = {
    'start': {
        speaker: 'MAYOR AI',
        side: 'right',
        image: 'assets/img/mayor_dialogue_2.png',
        text: 'Cám ơn Tactician. Mật mã thiết lập thành công. Hệ thống đã mã hóa lớp bảo mật cấp cao nhất.',
        next: 'ask_name'
    },
    'ask_name': {
        speaker: 'MAYOR AI',
        side: 'right',
        text: 'Trước khi hoàn tất, hãy cho tôi biết biệt danh (Nickname) của bạn. Hệ thống cần định danh để phục vụ các giao thức tương lai.',
        next: null
    }
};

class AuthVN {
    constructor() {
        this.userData = {
            username: '',
            avatar: 'assets/img/mayor_avatar.jpg',
            passcode: '',
        };
        this.currentInput = '';
        this.inputMode = 'passcode';

        this.modal = document.getElementById('authModal');
        this.authStep1 = document.getElementById('authStep1');
        this.authStep2 = document.getElementById('authStep2');
        this.nicknameInput = document.getElementById('nicknameInput');

        this.passDots = document.querySelectorAll('.pass-dot');
        this.numBtns = document.querySelectorAll('.num-btn');
        this.submitBtn = document.getElementById('mainSubmitBtn');
        this.avatarPreview = document.getElementById('avatarPreview');
        this.avatarInput = document.getElementById('avatarInput');
        this.authStatus = document.getElementById('authStatus');

        // Reuse a single engine instance to avoid multiple listeners
        this.engine = new VNEngine();

        this.initEvents();
        window.openAuthRegistration = () => this.openRegistration();
    }

    initEvents() {
        if (!this.modal) return;

        this.numBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const val = btn.dataset.val;
                if (val === 'clear') {
                    this.currentInput = '';
                } else if (val === 'back') {
                    this.currentInput = this.currentInput.slice(0, -1);
                } else if (this.currentInput.length < 8) {
                    this.currentInput += val;
                }
                this.updateDisplay();
            });
        });

        if (this.avatarInput) {
            this.avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        this.userData.avatar = re.target.result;
                        if (this.avatarPreview) this.avatarPreview.src = re.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        if (this.nicknameInput) {
            this.nicknameInput.addEventListener('input', () => {
                this.updateDisplay();
            });
        }

        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleSubmit();
            });
        }
    }

    updateDisplay() {
        if (this.inputMode === 'nickname') {
            this.submitBtn.disabled = this.nicknameInput.value.trim().length === 0;
            return;
        }

        this.passDots.forEach((dot, i) => {
            dot.classList.toggle('active', i < this.currentInput.length);
        });
        if (this.submitBtn) {
            this.submitBtn.disabled = this.currentInput.length !== 8;
        }
    }

    openRegistration() {
        this.currentInput = '';
        this.inputMode = 'passcode';
        this.userData.passcode = '';
        this.authStep1.style.display = 'block';
        this.authStep2.style.display = 'none';
        this.updateDisplay();
        this.authStatus.textContent = 'SET YOUR 8-DIGIT PASSCODE';
        this.submitBtn.textContent = 'FINALIZE REGISTRATION';
        this.modal.style.display = 'flex';
    }

    async handleSubmit() {
        if (this.inputMode === 'passcode') {
            if (this.currentInput.length !== 8) return;
            this.userData.passcode = this.currentInput;
            this.currentInput = '';
            this.inputMode = 'confirm';
            this.authStatus.textContent = 'CONFIRM YOUR 8-DIGIT PASSCODE';
            this.updateDisplay();
            return;
        }

        if (this.inputMode === 'confirm') {
            if (this.currentInput !== this.userData.passcode) {
                this.authStatus.textContent = 'PASSCODE MISMATCH! RETRY CONFIRMATION.';
                this.currentInput = '';
                this.updateDisplay();
                return;
            }

            // Passcode Confirmed!
            this.modal.style.display = 'none';
            // Use setTimeout to ensure the click event propagation is finished
            setTimeout(() => {
                this.engine.start(VN_THANKS_SCRIPT, 'start', () => {
                    // After Thanks VN, show Nickname input
                    this.inputMode = 'nickname';
                    this.authStep1.style.display = 'none';
                    this.authStep2.style.display = 'block';
                    this.submitBtn.textContent = 'FINALIZE REGISTRATION';
                    this.submitBtn.disabled = true;
                    this.modal.style.display = 'flex';
                    if (window.toggleHUD) window.toggleHUD(false);
                });
            }, 300);
            return;
        }

        if (this.inputMode === 'nickname') {
            const nickname = this.nicknameInput.value.trim();
            if (!nickname) return;

            this.submitBtn.textContent = 'SYNCHRONIZING...';
            this.submitBtn.disabled = true;

            try {
                const resp = await fetch('/api/accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'register',
                        username: nickname,
                        passcode: this.userData.passcode,
                        avatar: this.userData.avatar
                    })
                });

                const res = await resp.json();
                if (res.ok) {
                    this.submitBtn.textContent = 'ID ESTABLISHED.';
                    localStorage.setItem('silverhand_user', JSON.stringify(res.user));
                    setTimeout(() => {
                        this.modal.style.display = 'none';
                        window.location.reload();
                    }, 1000);
                } else {
                    alert('ERROR: ' + (res.error || 'FAILED'));
                    this.submitBtn.disabled = false;
                    this.submitBtn.textContent = 'FINALIZE REGISTRATION';
                }
            } catch (err) {
                alert('NODE ERROR. PLEASE RETRY.');
                this.submitBtn.disabled = false;
                this.submitBtn.textContent = 'FINALIZE REGISTRATION';
            }
        }
    }

    startAuthFlow() {
        if (window.toggleHUD) window.toggleHUD(false);
        this.engine.start(VN_AUTH_SCRIPT, 'start', () => {
            if (this.engine.currentId === 'finalize_guest') {
                localStorage.setItem('silverhand_user', JSON.stringify({ guest: true }));
                if (window.toggleHUD) window.toggleHUD(true);
            } else if (this.engine.currentId === 'trigger_register') {
                this.openRegistration();
            }
        });
    }
}

function initAuth() {
    const auth = new AuthVN();
    const storedUser = localStorage.getItem('silverhand_user');

    if (!storedUser) {
        setTimeout(() => {
            auth.startAuthFlow();
        }, 1200);
    } else {
        const user = JSON.parse(storedUser);
        if (user.username && !user.guest) {
            const profileName = document.querySelector('.hud-profile-name');
            if (profileName) profileName.textContent = user.username;
        }
    }
}

// if (document.readyState === 'complete') {
//     initAuth();
// } else {
//     window.addEventListener('load', initAuth);
// }
