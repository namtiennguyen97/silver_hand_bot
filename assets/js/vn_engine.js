/**
 * VNEngine - A modular, branching Visual Novel Engine for Cyberpunk web apps.
 * Supports: Branching paths (choices), BGM/SFX, dynamic expressions, 
 * dramatic effects (shake/flash), and multi-turn conversations.
 */

class VNEngine {
    constructor(config = {}) {
        this.overlay      = document.getElementById(config.overlayId || 'vnOverlay');
        this.charLeft     = document.getElementById(config.charLeftId || 'vnCharLeft');
        this.charRight    = document.getElementById(config.charRightId || 'vnCharRight');
        this.imgLeft      = document.getElementById(config.imgLeftId || 'vnImgLeft');
        this.imgRight     = document.getElementById(config.imgRightId || 'vnImgRight');
        this.speakerTag   = document.getElementById(config.speakerTagId || 'vnSpeakerTag');
        this.textEl       = document.getElementById(config.textElId || 'vnText');
        this.nextIndicator= document.getElementById(config.nextIndicatorId || 'vnNextIndicator');
        this.skipBtn      = document.getElementById(config.skipBtnId || 'vnSkipBtn');
        this.progressEl   = document.getElementById(config.progressElId || 'vnProgress');
        this.choiceOverlay= document.getElementById(config.choiceOverlayId || 'vnChoiceOverlay');

        this.script       = {};
        this.currentId    = null;
        this.typeTimer    = null;
        this.isTyping     = false;
        this.isChoiceMode   = false;
        this.onComplete   = null;
        this.terminateTimer = null;

        // Audio Management
        this.bgm          = null;
        this.typeSfx      = config.typeSfx || null;
        this.clickSfx     = config.clickSfx || null;

        this.initEvents();
    }

    initEvents() {
        if (!this.overlay) return;

        this.overlay.addEventListener('click', (e) => {
            // Try to play BGM on first interaction (Autoplay fix)
            if (this.bgm && this.bgm.paused) {
                this.playBGM();
            }

            if (this.isChoiceMode) return;
            if (e.target === this.skipBtn) return;
            this.handleInput();
        });

        if (this.nextIndicator) {
            this.nextIndicator.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleInput();
            });
        }

        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.terminate();
            });
        }
    }

    /* --- Audio Methods --- */
    setBGM(url) {
        if (this.bgm) {
            this.bgm.pause();
            this.bgm = null;
        }
        this.bgm = new Audio(url);
        this.bgm.loop = true;
        this.bgm.volume = 0;
    }

    playBGM() {
        if (this.bgm && this.bgm.paused) {
            this.bgm.play()
                .then(() => {
                    this.fadeAudio(this.bgm, 0.4, 2000);
                })
                .catch(e => console.warn('BGM Autoplay blocked:', e));
        }
    }

    stopBGM() {
        if (this.bgm) this.fadeAudio(this.bgm, 0, 1000, () => this.bgm.pause());
    }

    fadeAudio(audio, targetVol, duration, onDone) {
        const startVol = audio.volume;
        const steps = 20;
        const interval = duration / steps;
        const volStep = (targetVol - startVol) / steps;
        let count = 0;

        const timer = setInterval(() => {
            count++;
            audio.volume = Math.max(0, Math.min(1, startVol + (volStep * count)));
            if (count >= steps) {
                clearInterval(timer);
                if (onDone) onDone();
            }
        }, interval);
    }

    playSFX(url) {
        if (!url) return;
        const sfx = new Audio(url);
        sfx.volume = 0.5;
        sfx.play().catch(() => {});
    }

    /* --- Core Engine --- */
    start(scriptObj, startId = 'start', onComplete = null) {
        if (this.terminateTimer) {
            clearTimeout(this.terminateTimer);
            this.terminateTimer = null;
        }
        this.script = scriptObj;
        this.onComplete = onComplete;
        this.overlay.style.display = 'block';
        this.overlay.style.animation = 'none'; // Reset animation
        void this.overlay.offsetWidth; // Trigger reflow
        this.overlay.style.animation = 'vnFadeIn 0.5s ease forwards';
        this.overlay.classList.remove('finished');
        
        if (this.choiceOverlay) this.choiceOverlay.style.display = 'none'; // Ensure hidden at start
        
        this.playLine(startId);
        this.playBGM();
    }

    playLine(id) {
        this.currentId = id;
        const line = this.script[id];
        if (!line) {
            this.terminate();
            return;
        }

        // Reset choice mode
        this.isChoiceMode = false;
        if (this.choiceOverlay) this.choiceOverlay.style.display = 'none';

        // 1. Effects
        if (line.effect === 'shake') {
            this.overlay.classList.add('vn-shake');
            setTimeout(() => this.overlay.classList.remove('vn-shake'), 400);
        }
        if (line.effect === 'flash') {
            this.overlay.classList.add('vn-flash');
            setTimeout(() => this.overlay.classList.remove('vn-flash'), 300);
        }

        // 2. Character Setup
        if (line.speaker) {
            this.speakerTag.style.display = 'block';
            this.speakerTag.textContent = line.speaker;
            if (line.side === 'left') {
                this.speakerTag.classList.add('enemy');
                this.charLeft.classList.add('active'); this.charLeft.classList.remove('dim');
                this.charRight.classList.add('dim'); this.charRight.classList.remove('active');
            } else {
                this.speakerTag.classList.remove('enemy');
                this.charRight.classList.add('active'); this.charRight.classList.remove('dim');
                this.charLeft.classList.add('dim'); this.charLeft.classList.remove('active');
            }
        } else {
            this.speakerTag.style.display = 'none';
        }

        // 3. Expression Switch
        if (line.side === 'left' && line.image && this.imgLeft) this.imgLeft.src = line.image;
        if (line.side === 'right' && line.image && this.imgRight) this.imgRight.src = line.image;

        // 4. Typewriter
        this.typeText(line.text || '');
        
        // 5. Choices
        if (line.choices) {
            this.isChoiceMode = true;
        } else {
            this.isChoiceMode = false;
        }
    }

    typeText(text) {
        if (this.typeTimer) clearInterval(this.typeTimer);
        this.textEl.innerHTML = '';
        this.textEl.classList.remove('glitch');
        void this.textEl.offsetWidth;
        this.textEl.classList.add('glitch');

        this.nextIndicator.classList.remove('visible');
        this.isTyping = true;
        
        let i = 0;
        let html = '';
        let inTag = false;

        this.typeTimer = setInterval(() => {
            if (i >= text.length) {
                this.finishTyping();
                return;
            }
            const ch = text.charAt(i);
            if (ch === '<') inTag = true;
            if (ch === '>') inTag = false;
            html += ch;
            i++;
            if (!inTag) {
                this.textEl.innerHTML = html;
                // Optional typewriter SFX logic here
            }
        }, 25);
    }

    finishTyping() {
        if (this.typeTimer) clearInterval(this.typeTimer);
        const line = this.script[this.currentId];
        this.textEl.innerHTML = line.text || '';
        this.isTyping = false;
        
        if (line.choices) {
            this.showChoices(line.choices);
        } else {
            this.nextIndicator.classList.add('visible');
        }
    }

    showChoices(choices) {
        if (!this.choiceOverlay) return;
        this.choiceOverlay.innerHTML = '';
        this.choiceOverlay.style.display = 'flex';

        choices.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'vn-choice-btn';
            btn.textContent = c.text;
            btn.onclick = (e) => {
                e.stopPropagation();
                this.choiceOverlay.style.display = 'none';
                this.playLine(c.next);
            };
            this.choiceOverlay.appendChild(btn);
        });
    }

    handleInput() {
        if (this.isTyping) {
            this.finishTyping();
        } else if (!this.isChoiceMode) {
            const line = this.script[this.currentId];
            if (line && line.next) {
                this.playLine(line.next);
            } else {
                this.terminate();
            }
        }
    }

    terminate() {
        if (this.terminateTimer) clearTimeout(this.terminateTimer);
        this.overlay.style.animation = 'vnFadeIn 0.5s ease reverse forwards';
        this.stopBGM();
        this.terminateTimer = setTimeout(() => {
            this.overlay.style.display = 'none';
            this.terminateTimer = null;
            if (this.onComplete) this.onComplete();
        }, 500);
    }
}

// Global Export
window.VNEngine = VNEngine;
