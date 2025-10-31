// Asosiy sahifa uchun JavaScript
class MainApp {
    constructor() {
        this.currentLanguage = 'uz';
        this.init();
    }

    async init() {
        await this.loadPrayerTimes();
        this.startClock();
        this.setupAnimations();
    }

    async loadPrayerTimes() {
        try {
            const response = await fetch('/api/prayer-times');
            const data = await response.json();
            
            if (data.success) {
                this.displayPrayerTimes(data.data);
            }
        } catch (error) {
            console.error('Namoz vaqtlarini yuklashda xatolik:', error);
            this.displayError();
        }
    }

    displayPrayerTimes(times) {
        const container = document.getElementById('prayerTimes');
        const prayers = [
            { name: 'Bomdod', time: times.bomdod, icon: 'fa-sun' },
            { name: 'Peshin', time: times.peshin, icon: 'fa-sun' },
            { name: 'Asr', time: times.asr, icon: 'fa-cloud-sun' },
            { name: 'Shom', time: times.shom, icon: 'fa-sunset' },
            { name: 'Xufton', time: times.xufton, icon: 'fa-moon' }
        ];

        container.innerHTML = prayers.map(prayer => `
            <div class="prayer-item">
                <span class="prayer-name">
                    <i class="fas ${prayer.icon}"></i>
                    ${prayer.name}
                </span>
                <span class="prayer-time">${prayer.time}</span>
            </div>
        `).join('');

        // Animation qo'shamiz
        this.animatePrayerItems();
    }

    animatePrayerItems() {
        const items = document.querySelectorAll('.prayer-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-in');
        });
    }

    displayError() {
        const container = document.getElementById('prayerTimes');
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Namoz vaqtlarini yuklashda xatolik yuz berdi</p>
            </div>
        `;
    }

    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('uz-UZ', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const dateString = now.toLocaleDateString('uz-UZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            const timeElement = document.getElementById('currentTime');
            if (timeElement) {
                timeElement.textContent = timeString;
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    setupAnimations() {
        // Scroll animatsiyalari
        this.setupScrollAnimations();
        
        // Hover effektlari
        this.setupHoverEffects();
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Barcha animatsiya qilinadigan elementlarni kuzatish
        document.querySelectorAll('.prayer-card, .info-card, .admin-btn').forEach(el => {
            observer.observe(el);
        });
    }

    setupHoverEffects() {
        // Admin button hover effekti
        const adminBtn = document.querySelector('.admin-btn');
        if (adminBtn) {
            adminBtn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px) scale(1.02)';
            });
            
            adminBtn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        }
    }
}

// Sahifa yuklanganda ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    new MainApp();
    
    // CSS animatsiyalari
    const style = document.createElement('style');
    style.textContent = `
        .prayer-item {
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.5s ease;
        }
        
        .prayer-item.animate-in {
            opacity: 1;
            transform: translateX(0);
        }
        
        .info-card {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.6s ease;
        }
        
        .info-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .admin-btn {
            opacity: 0;
            transform: scale(0.9);
            transition: all 0.5s ease;
        }
        
        .admin-btn.animate-in {
            opacity: 1;
            transform: scale(1);
        }
        
        .error-message {
            text-align: center;
            padding: 20px;
            color: #ff6b6b;
        }
        
        .error-message i {
            font-size: 2rem;
            margin-bottom: 10px;
        }
    `;
    document.head.appendChild(style);
});
