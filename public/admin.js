class AdminApp {
    constructor() {
        this.currentLanguage = 'uz';
        this.isLoading = false;
        this.init();
    }

    async init() {
        await this.loadPrayerTimes();
        this.setupEventListeners();
        this.setCurrentDate();
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
            console.error('Ma\'lumotlarni yuklashda xatolik:', error);
            this.showResult('Ma\'lumotlarni yuklashda xatolik!', 'error');
        }
    }

    populateForm(times) {
        document.getElementById('date').value = times.date;
        document.getElementById('bomdod').value = times.bomdod;
        document.getElementById('peshin').value = times.peshin;
        document.getElementById('asr').value = times.asr;
        document.getElementById('shom').value = times.shom;
        document.getElementById('xufton').value = times.xufton;
    }

    setCurrentDate() {
        const now = new Date();
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const dateString = now.toLocaleDateString('uz-UZ', options) + ' yıl';
        document.getElementById('date').value = dateString;
    }

    async changeLanguage(lang) {
        this.currentLanguage = lang;
        await this.loadPrayerTimes();
    }

    updateTranslations(translations) {
        document.getElementById('adminTitle').textContent = translations.title;
        document.getElementById('adminSubtitle').textContent = 'Namoz vaqtlarini kiriting';
        document.getElementById('dateLabel').innerHTML = `<i class="fas fa-calendar"></i> Sana`;
        document.getElementById('bomdodLabel').textContent = 'Bomdod';
        document.getElementById('peshinLabel').textContent = 'Peshin';
        document.getElementById('asrLabel').textContent = 'Asr';
        document.getElementById('shomLabel').textContent = 'Shom';
        document.getElementById('xuftonLabel').textContent = 'Xufton';
        document.getElementById('sendText').textContent = 'Kanalga yuborish';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        if (this.isLoading) return;
        
        this.setLoading(true);

        const formData = {
            date: document.getElementById('date').value,
            bomdod: document.getElementById('bomdod').value,
            peshin: document.getElementById('peshin').value,
            asr: document.getElementById('asr').value,
            shom: document.getElementById('shom').value,
            xufton: document.getElementById('xufton').value,
            lang: this.currentLanguage
        };

        try {
            const response = await fetch('/api/update-times', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            this.showResult(result.message, result.success ? 'success' : 'error');
            
        } catch (error) {
            console.error('Xatolik:', error);
            this.showResult('Server bilan aloqa xatosi!', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.isLoading = loading;
        const button = document.getElementById('sendBtn');
        const loader = document.getElementById('submitLoader');
        
        button.disabled = loading;
        loader.style.display = loading ? 'block' : 'none';
        
        if (loading) {
            button.style.opacity = '0.7';
        } else {
            button.style.opacity = '1';
        }
    }

    showResult(message, type) {
        const resultElement = document.getElementById('resultMessage');
        resultElement.textContent = message;
        resultElement.className = `result-message ${type}`;
        
        setTimeout(() => {
            resultElement.textContent = '';
            resultElement.className = 'result-message';
        }, 5000);
    }
}

// Sahifa yuklanganda ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    new AdminApp();
});
