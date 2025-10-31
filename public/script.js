class PrayerTimesApp {
    constructor() {
        this.currentLanguage = 'uz';
        this.init();
    }

    async init() {
        await this.loadPrayerTimes();
        this.setupEventListeners();
        this.updateDisplay();
    }

    async loadPrayerTimes() {
        try {
            const response = await fetch(`/api/prayer-times?lang=${this.currentLanguage}`);
            const data = await response.json();
            
            this.prayerTimes = data;
            this.translations = data.translations;
            
        } catch (error) {
            console.error('Ma\'lumotlarni yuklashda xatolik:', error);
        }
    }

    setupEventListeners() {
        const languageSelect = document.getElementById('languageSelect');
        languageSelect.addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.loadPrayerTimes().then(() => this.updateDisplay());
        });
    }

    updateDisplay() {
        if (!this.prayerTimes || !this.translations) return;

        // Sarlavhalarni yangilash
        document.getElementById('title').textContent = this.translations.title;
        document.getElementById('subtitle').textContent = this.translations.subtitle;
        document.getElementById('additionalLabel').textContent = this.translations.additional;
        document.getElementById('noteText').textContent = this.translations.note;
        document.getElementById('footerText').textContent = this.translations.footer;

        // Label larni yangilash
        document.getElementById('dateLabel').textContent = this.translations.date;
        document.getElementById('bomdodLabel').textContent = this.translations.bomdod;
        document.getElementById('peshinLabel').textContent = this.translations.peshin;
        document.getElementById('asrLabel').textContent = this.translations.asr;
        document.getElementById('shomLabel').textContent = this.translations.shom;
        document.getElementById('xuftonLabel').textContent = this.translations.xufton;

        // Qiymatlarni yangilash
        document.getElementById('dateValue').textContent = this.prayerTimes.date;
        document.getElementById('bomdodValue').textContent = this.prayerTimes.bomdod;
        document.getElementById('peshinValue').textContent = this.prayerTimes.peshin;
        document.getElementById('asrValue').textContent = this.prayerTimes.asr;
        document.getElementById('shomValue').textContent = this.prayerTimes.shom;
        document.getElementById('xuftonValue').textContent = this.prayerTimes.xufton;

        // Til selectorini yangilash
        document.getElementById('languageSelect').value = this.currentLanguage;
    }
}

// Ilovani ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    new PrayerTimesApp();
});
