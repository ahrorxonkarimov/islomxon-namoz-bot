class PrayerTimesApp {
    constructor() {
        this.currentLanguage = 'uz';
        this.prayerTimes = {};
        this.translations = {};
        this.nextPrayer = null;
        this.init();
    }

    async init() {
        await this.loadPrayerTimes();
        this.setupEventListeners();
        this.startClock();
        this.calculateNextPrayer();
        this.startCountdown();
    }

    async loadPrayerTimes() {
        try {
            const response = await fetch(`/api/prayer-times?lang=${this.currentLanguage}`);
            const data = await response.json();
            
            this.prayerTimes = data;
            this.translations = data.translations;
            
            this.updateDisplay();
            this.animateCards();
            
        } catch (error) {
            console.error('Ma\'lumotlarni yuklashda xatolik:', error);
        }
    }

    setupEventListeners() {
        const languageSelect = document.getElementById('languageSelect');
        languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.loadPrayerTimes();
        });

        // Prayer card hover effects
        document.querySelectorAll('.time-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    updateDisplay() {
        if (!this.prayerTimes || !this.translations) return;

        // Update all text content
        document.getElementById('title').textContent = this.translations.title;
        document.getElementById('subtitle').textContent = this.translations.subtitle;
        document.getElementById('additionalLabel').textContent = this.translations.additional;
        document.getElementById('noteText').textContent = this.translations.note;
        document.getElementById('footerText').textContent = this.translations.footer;
        document.getElementById('locationText').innerHTML = `<i class="fas fa-map-marker-alt"></i> ${this.translations.location}`;
        document.getElementById('nextPrayerLabel').textContent = this.translations.nextPrayer;
        document.getElementById('timeLeftLabel').textContent = this.translations.timeLeft;

        // Update prayer labels
        document.getElementById('bomdodLabel').textContent = this.translations.bomdod;
        document.getElementById('quyoshLabel').textContent = this.translations.quyosh;
        document.getElementById('peshinLabel').textContent = this.translations.peshin;
        document.getElementById('asrLabel').textContent = this.translations.asr;
        document.getElementById('shomLabel').textContent = this.translations.shom;
        document.getElementById('xuftonLabel').textContent = this.translations.xufton;

        // Update prayer times
        document.getElementById('bomdodValue').textContent = this.prayerTimes.bomdod;
        document.getElementById('quyoshValue').textContent = this.prayerTimes.quyosh;
        document.getElementById('peshinValue').textContent = this.prayerTimes.peshin;
        document.getElementById('asrValue').textContent = this.prayerTimes.asr;
        document.getElementById('shomValue').textContent = this.prayerTimes.shom;
        document.getElementById('xuftonValue').textContent = this.prayerTimes.xufton;

        // Update language selector
        document.getElementById('languageSelect').value = this.currentLanguage;
    }

    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString(this.currentLanguage === 'uz' ? 'uz-UZ' : 
                                                     this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US');
            document.getElementById('currentTime').textContent = timeString;
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    calculateNextPrayer() {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const prayers = [
            { name: 'bomdod', time: this.prayerTimes.bomdod, label: this.translations.bomdod },
            { name: 'quyosh', time: this.prayerTimes.quyosh, label: this.translations.quyosh },
            { name: 'peshin', time: this.prayerTimes.peshin, label: this.translations.peshin },
            { name: 'asr', time: this.prayerTimes.asr, label: this.translations.asr },
            { name: 'shom', time: this.prayerTimes.shom, label: this.translations.shom },
            { name: 'xufton', time: this.prayerTimes.xufton, label: this.translations.xufton }
        ];

        for (let prayer of prayers) {
            const [hours, minutes] = prayer.time.split(':').map(Number);
            const prayerTime = hours * 60 + minutes;

            if (prayerTime > currentTime) {
                this.nextPrayer = { ...prayer, minutes: prayerTime - currentTime };
                break;
            }
        }

        // If no prayer found for today, show first prayer of next day
        if (!this.nextPrayer) {
            this.nextPrayer = { 
                ...prayers[0], 
                minutes: (24 * 60 - currentTime) + this.timeToMinutes(prayers[0].time)
            };
        }

        this.updateNextPrayerDisplay();
    }

    timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    updateNextPrayerDisplay() {
        if (!this.nextPrayer) return;

        document.getElementById('nextPrayerName').textContent = this.nextPrayer.label;
        document.getElementById('nextPrayerTime').textContent = this.nextPrayer.time;

        // Update active prayer card
        document.querySelectorAll('.time-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.prayer === this.nextPrayer.name) {
                card.classList.add('active');
            }
        });
    }

    startCountdown() {
        setInterval(() => {
            if (this.nextPrayer) {
                if (this.nextPrayer.minutes > 0) {
                    this.nextPrayer.minutes--;
                    
                    const hours = Math.floor(this.nextPrayer.minutes / 60);
                    const minutes = this.nextPrayer.minutes % 60;
                    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
                    
                    document.getElementById('timeLeft').textContent = timeString;
                } else {
                    this.calculateNextPrayer();
                }
            }
        }, 60000); // Update every minute
    }

    animateCards() {
        const cards = document.querySelectorAll('.time-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrayerTimesApp();
    
    // Add admin link
    const adminLink = document.createElement('a');
    adminLink.href = '/admin';
    adminLink.className = 'admin-link';
    adminLink.innerHTML = '<i class="fas fa-cog"></i>';
    adminLink.title = 'Admin Panel';
    document.body.appendChild(adminLink);
});
