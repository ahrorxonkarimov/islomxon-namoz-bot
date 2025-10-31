const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Namoz vaqtlari ma'lumotlari
let prayerTimes = {
    date: moment().format('DD-MMMM, YYYY yıl'),
    bomdod: "05:45",
    peshin: "13:15",
    asr: "16:30",
    shom: "18:45",
    xufton: "20:15",
    quyosh: "07:30"
};

// Til sozlamalari
const translations = {
    uz: {
        title: "Islomxon Jome Masjidi",
        subtitle: "Namoz vaqtlari",
        date: "Bugun",
        bomdod: "Bomdod",
        peshin: "Peshin",
        asr: "Asr",
        shom: "Shom",
        xufton: "Xufton",
        quyosh: "Quyosh",
        additional: "Ma'lumot",
        note: "Masjidimiz har kuni 5 vaqt namoz o'qiladi",
        footer: "Vaqtni Alloh yo'lida sarflang. Har bir namozingiz qabul bo'lsin!",
        location: "Manzil: Toshkent shahar, Yunusobod tumani",
        nextPrayer: "Keyingi namoz",
        timeLeft: "qoldi",
        currentTime: "Joriy vaqt"
    },
    ru: {
        title: "Мечеть Исломхон Джаме",
        subtitle: "Время намаза",
        date: "Сегодня",
        bomdod: "Фаджр",
        peshin: "Зухр",
        asr: "Аср",
        shom: "Магриб",
        xufton: "Иша",
        quyosh: "Восход",
        additional: "Информация",
        note: "В нашей мечети совершается 5 ежедневных намазов",
        footer: "Проводите время на пути Аллаха. Пусть каждый ваш намаз будет принят!",
        location: "Адрес: Ташкент, Юнусабадский район",
        nextPrayer: "Следующий намаз",
        timeLeft: "осталось",
        currentTime: "Текущее время"
    },
    en: {
        title: "Islomxon Jome Mosque",
        subtitle: "Prayer Times",
        date: "Today",
        bomdod: "Fajr",
        peshin: "Dhuhr",
        asr: "Asr",
        shom: "Maghrib",
        xufton: "Isha",
        quyosh: "Sunrise",
        additional: "Information",
        note: "5 daily prayers are performed in our mosque",
        footer: "Spend time in the way of Allah. May every prayer be accepted!",
        location: "Address: Tashkent, Yunusabad district",
        nextPrayer: "Next prayer",
        timeLeft: "left",
        currentTime: "Current time"
    }
};

// API Routes
app.get('/api/prayer-times', (req, res) => {
    const lang = req.query.lang || 'uz';
    const response = {
        ...prayerTimes,
        translations: translations[lang],
        timestamp: new Date().toISOString()
    };
    res.json(response);
});

app.post('/api/prayer-times', (req, res) => {
    const { date, bomdod, peshin, asr, shom, xufton, quyosh } = req.body;
    
    prayerTimes = {
        date: date || prayerTimes.date,
        bomdod: bomdod || prayerTimes.bomdod,
        peshin: peshin || prayerTimes.peshin,
        asr: asr || prayerTimes.asr,
        shom: shom || prayerTimes.shom,
        xufton: xufton || prayerTimes.xufton,
        quyosh: quyosh || prayerTimes.quyosh
    };
    
    res.json({ 
        success: true, 
        message: "Namoz vaqtlari muvaffaqiyatli yangilandi!", 
        data: prayerTimes 
    });
});

// HTML Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`🕌 Islomxon Masjidi web sayti ${PORT}-portda ishlamoqda`);
    console.log(`🌐 Asosiy sahifa: http://localhost:${PORT}`);
    console.log(`⚙️ Admin panel: http://localhost:${PORT}/admin`);
});
