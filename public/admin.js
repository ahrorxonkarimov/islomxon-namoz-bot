class AdminPanel {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadCurrentTimes();
        this.setupEventListeners();
    }

    async loadCurrentTimes() {
        try {
            const response = await fetch('/api/prayer-times');
            const data = await response.json();
            this.displayCurrentTimes(data);
        } catch (error) {
            console.error('Joriy vaqtlarni yuklashda xatolik:', error);
        }
    }

    displayCurrentTimes(data) {
        const container = document.getElementById('currentTimes');
        container.innerHTML = `
            <div class="time-display">
                <strong>Sana:</strong> ${data.date}<br>
                <strong>Bomdod:</strong> ${data.bomdod}<br>
                <strong>Peshin:</strong> ${data.peshin}<br>
                <strong>Asr:</strong> ${data.asr}<br>
                <strong>Shom:</strong> ${data.shom}<br>
                <strong>Xufton:</strong> ${data.xufton}
            </div>
        `;
    }

    setupEventListeners() {
        const form = document.getElementById('prayerForm');
        const resetBtn = document.getElementById('resetBtn');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.updatePrayerTimes();
        });

        resetBtn.addEventListener('click', () => {
            this.loadCurrentTimes();
            this.resetForm();
        });
    }

    async updatePrayerTimes() {
        const formData = {
            date: document.getElementById('date').value,
            bomdod: document.getElementById('bomdod').value,
            peshin: document.getElementById('peshin').value,
            asr: document.getElementById('asr').value,
            shom: document.getElementById('shom').value,
            xufton: document.getElementById('xufton').value
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
                alert('Namoz vaqtlari muvaffaqiyatli yangilandi!');
                this.loadCurrentTimes();
            } else {
                alert('Xatolik yuz berdi: ' + result.message);
            }
        } catch (error) {
            console.error('Yangilashda xatolik:', error);
            alert('Server bilan aloqa xatosi');
        }
    }

    resetForm() {
        document.getElementById('comment').value = '';
    }
}

// Admin panelni ishga tushirish
document.addEventListener('DOMContentLoaded', () => {
    new AdminPanel();
});
