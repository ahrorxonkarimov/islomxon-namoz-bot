// Admin panel uchun JavaScript
class AdminApp {
    constructor() {
        this.currentUser = null;
        this.currentLanguage = 'uz';
        this.isLoading = false;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupAnimations();
        
        // LocalStorage dan saqlangan ma'lumotlarni tekshirish
        this.checkStoredAuth();
    }

    setupEventListeners() {
        // Til o'zgartirish
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.changeLanguage(e.target.value);
        });

        // Form yuborish
        document.getElementById('prayerForm').addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Inputlarni kuzatish (preview yangilash uchun)
        document.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                this.updatePreview();
            });
        });

        // Enter bosilganda form yuborish
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
            }
        });
    }

    setupAnimations() {
        // Input hover animatsiyalari
        this.setupInputAnimations();
        
        // Button loading animatsiyalari
        this.setupButtonAnimations();
    }

    setupInputAnimations() {
        const inputs = document.querySelectorAll('.form-input, .time-input, .form-textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', function() {
                if (!this.value) {
                    this.parentElement.classList.remove('focused');
                }
            });
        });
    }

    setupButtonAnimations() {
        const buttons = document.querySelectorAll('.submit-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                if (!this.disabled) {
                    // Ripple effekti
                    const ripple = document.createElement('span');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    const x = e.clientX - rect.left - size / 2;
                    const y = e.clientY - rect.top - size / 2;
                    
                    ripple.style.cssText = `
                        width: ${size}px;
                        height: ${size}px;
                        left: ${x}px;
                        top: ${y}px;
                        background: rgba(255, 255, 255, 0.5);
                        border-radius: 50%;
                        position: absolute;
                        transform: scale(0);
                        animation: ripple 0.6s linear;
                    `;
                    
                    this.appendChild(ripple);
                    
                    setTimeout(() => {
                        ripple.remove();
                    }, 600);
                }
            });
        });

        // Ripple animation qo'shamiz
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            
            .submit-btn {
                position: relative;
                overflow: hidden;
            }
            
            .form-group.focused .form-input,
            .form-group.focused .form-textarea {
                border-color: var(--accent);
                box-shadow: 0 0 0 3px rgba(87, 197, 182, 0.1);
            }
            
            .prayer-input.focused {
                border-color: var(--accent);
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);
    }

    async checkAdmin() {
        const userId = document.getElementById('userId').value.trim();
        
        if (!userId) {
            this.showResult('Iltimos, Telegram ID ni kiriting!', 'error');
            return;
        }

        this.setLoading(true, 'loginLoader');

        try {
            const response = await fetch('/api/check-admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: parseInt(userId) })
            });

            const result = await response.json();

            if (result.success) {
                this.currentUser = result.user;
                this.showAdminPanel();
                this.showResult(result.message, 'success');
                this.saveAuthToStorage();
            } else {
                this.showResult(result.message, 'error');
            }
        } catch (error) {
            this.showResult('Server bilan aloqa xatosi!', 'error');
            console.error('Auth error:', error);
        } finally {
            this.setLoading(false, 'loginLoader');
        }
    }

    showAdminPanel() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('userWelcome').textContent = `Admin: ${this.currentUser.id}`;
        
        // Ma'lumotlarni yuklash
        this.loadPrayerTimes();
        this.updatePreview();
        
        // Animatsiya
        this.animateAdminPanel();
    }

    animateAdminPanel() {
        const elements = document.querySelectorAll('.stat-card, .form-section, .preview-section');
        elements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('animate-in');
        });
    }

    logout() {
        this.currentUser = null;
        document.getElementById('adminPanel').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('userId').value = '';
        this.clearAuthFromStorage();
        
        // Login screen animatsiyasi
        document.querySelector('.login-container').classList.add('animate-in');
    }

    async loadPrayerTimes() {
        try {
            const response = await fetch('/api/prayer-times?lang=' + this.currentLanguage);
            const data = await response.json();
            
            if (data.success) {
                this.populateForm(data.data);
                this.updateTranslations(data.translations);
            }
        } catch (error) {
            console.error('Namoz vaqtlarini yuklashda xatolik:', error);
        }
    }

    populateForm(times) {
        document.getElementById('date').value = times.date;
        document.getElementById('bomdod').value = times.bomdod;
        document.getElementById('peshin').value = times.peshin;
        document.getElementById('asr').value = times.asr;
        document.getElementById('shom').value = times.shom;
        document.getElementById('xufton').value = times.xufton;
        
        // Sana ko'rsatish
        document.getElementById('currentDate').textContent = times.date;
    }

    async changeLanguage(lang) {
        this.currentLanguage = lang;
        await this.loadPrayerTimes();
        this.updatePreview();
    }

    updateTranslations(translations) {
        // Sarlavhalarni yangilash
        document.getElementById('adminTitle').textContent = translations.title;
        document.getElementById('adminSubtitle').textContent = translations.subtitle;
        document.getElementById('formTitle').textContent = translations.subtitle;
        
        // Label larni yangilash
        document.getElementById('dateLabel').innerHTML = `<i class="fas fa-calendar"></i> ${translations.date}`;
        document.getElementById('bomdodLabel').textContent = translations.bomdod;
        document.getElementById('peshinLabel').textContent = translations.peshin;
        document.getElementById('asrLabel').textContent = translations.asr;
        document.getElementById('shomLabel').textContent = translations.shom;
        document.getElementById('xuftonLabel').textContent = translations.xufton;
        document.getElementById('optionalLabel').innerHTML = `<i class="fas fa-comment"></i> ${translations.optional}`;
        document.getElementById('sendText').textContent = translations.send;
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.currentUser || !this.currentUser.isAdmin) {
            this.showResult('Sizda admin huquqi yoʻq!', 'error');
            return;
        }

        this.setLoading(true, 'submitLoader');

        const formData = {
            date: document.getElementById('date').value,
            bomdod: document.getElementById('bomdod').value,
            peshin: document.getElementById('peshin').value,
            asr: document.getElementById('asr').value,
            shom: document.getElementById('shom').value,
            xufton: document.getElementById('xufton').value,
            lang: this.currentLanguage,
            userId: parseInt(this.currentUser.id)
        };

        try {
            const response = await fetch('/api/prayer-times', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (result.success) {
                this.showResult(result.message, 'success');
                // Yangilangan ma'lumotlarni ko'rsatish
                this.populateForm(result.data);
                this.updatePreview();
            } else {
                this.showResult(result.message, 'error');
            }
        } catch (error) {
            this.showResult('Server bilan aloqa xatosi!', 'error');
            console.error('Submit error:', error);
        } finally {
            this.setLoading(false, 'submitLoader');
        }
    }

    updatePreview() {
        const previewCard = document.getElementById('previewCard');
        const formData = {
            date: document.getElementById('date').value,
            bomdod: document.getElementById('bomdod').value,
            peshin: document.getElementById('peshin').value,
            asr: document.getElementById('asr').value,
            shom: document.getElementById('shom').value,
            xufton: document.getElementById('xufton').value
        };

        const previewText = this.generatePreview(formData, this.currentLanguage);
        previewCard.textContent = previewText;
    }

    generatePreview(data, lang) {
        const titles = {
            uz: { title: "Islomxon Jome Masjidi", date: "Sana", times: "Namoz vaqtlari" },
            ru: { title: "Мечеть Исломхон Джаме", date: "Дата", times: "Время намаза" },
            kr: { title: "Исломхон Жоме Масжиди", date: "Сана", times: "Намоз вақтлари" }
        };

        const t = titles[lang];
        
        return `🕌 ${t.title}

📅 ${t.date}: ${data.date}

🕐 ${t.times}:

🌅 ${lang === 'uz' ? 'Bomdod' : lang === 'ru' ? 'Фаджр' : 'Бомдод'}: ${data.bomdod}
☀️ ${lang === 'uz' ? 'Peshin' : lang === 'ru' ? 'Зухр' : 'Пешин'}: ${data.peshin}
⛅ ${lang === 'uz' ? 'Asr' : lang === 'ru' ? 'Аср' : 'Аср'}: ${data.asr}
🌇 ${lang === 'uz' ? 'Shom' : lang === 'ru' ? 'Магриб' : 'Шом'}: ${data.shom}
🌙 ${lang === 'uz' ? 'Xufton' : lang === 'ru' ? 'Иша' : 'Хуфтон'}: ${data.xufton}

${lang === 'uz' ? 'Hududingiz uchun to\'gri vaqtda ibodatni ado eting. Alloh har bir qadamingizni savobli qilsin!' : 
  lang === 'ru' ? 'Совершайте поклонение в правильное время для вашего региона. Пусть Аллах вознаградит каждый ваш шаг!' :
  'Ҳудудингиз учун тўғри вақтда ибодатни адо этинг. Аллоҳ ҳар бир қадамингизни савобли қилсин!'}

━━━━━━━━━━━━━━
📍 @Islomxon_masjidi`;
    }

    resetForm() {
        document.getElementById('prayerForm').reset();
        this.updatePreview();
        this.showResult('Form tozalandi!', 'success');
    }

    setLoading(loading, loaderId) {
        this.isLoading = loading;
        const loader = document.getElementById(loaderId);
        const button = loader ? loader.closest('.submit-btn') : null;
        
        if (button) {
            button.disabled = loading;
            loader.style.display = loading ? 'block' : 'none';
        }
    }

    showResult(message, type) {
        const resultElement = document.getElementById('resultMessage');
        resultElement.textContent = message;
        resultElement.className = `result-message ${type}`;
        
        // Avtomatik yashirish
        setTimeout(() => {
            resultElement.textContent = '';
            resultElement.className = 'result-message';
        }, 5000);
    }

    // LocalStorage funksiyalari
    saveAuthToStorage() {
        if (this.currentUser) {
            localStorage.setItem('adminAuth', JSON.stringify({
                userId: this.currentUser.id,
                timestamp: Date.now()
            }));
        }
    }

    clearAuthFromStorage() {
        localStorage.removeItem('adminAuth');
    }

    checkStoredAuth() {
        const stored = localStorage.getItem('adminAuth');
        if (stored) {
            try {
                const auth = JSON.parse(stored);
                // 1 soat ichida saqlangan auth ni tekshirish
                if (Date.now() - auth.timestamp < 3600000) {
                    document.getElementById('userId').value = auth.userId;
                    // Avtomatik login qilish
                    setTimeout(() => this.checkAdmin(), 1000);
                } else {
                    this.clearAuthFromStorage();
                }
            } catch (error) {
                this.clearAuthFromStorage();
            }
        }
    }
}

// Global funksiyalar
let adminApp;

function checkAdmin() {
    if (!adminApp) adminApp = new AdminApp();
    adminApp.checkAdmin();
}

function logout() {
    if (adminApp) adminApp.logout();
}

function resetForm() {
    if (adminApp) adminApp.resetForm();
}

// Sahifa yuklanganda ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    adminApp = new AdminApp();
    
    // CSS animatsiyalari qo'shamiz
    const style = document.createElement('style');
    style.textContent = `
        .stat-card,
        .form-section,
        .preview-section {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease;
        }
        
        .stat-card.animate-in,
        .form-section.animate-in,
        .preview-section.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .login-container {
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.5s ease;
        }
        
        .login-container.animate-in {
            opacity: 1;
            transform: scale(1);
        }
        
        .prayer-input {
            transition: all 0.3s ease;
        }
        
        .prayer-input:hover {
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);
});
