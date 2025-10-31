const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const moment = require('moment');
const cron = require('node-cron');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Namoz vaqtlari ma'lumotlari
let prayerTimes = {
    date: "15-dekabr, 2024 yıl",
    bomdod: "06:00",
    peshin: "12:30",
    asr: "15:45",
    shom: "18:20",
    xufton: "19:45"
};

// Til sozlamalari
const translations = {
    uz: {
        title: "Islomxon Jome Masjidi",
        subtitle: "Namoz vaqtlarini kiriting",
        date: "Sana",
        bomdod: "Bomdod",
        peshin: "Peshin",
        asr: "Asr",
        shom: "Shom",
        xufton: "Xufton",
        additional: "Qo'shimcha ma'lumot",
        note: "Yoki eslatma...",
        optional: "Izoh (ixtiyoriy)",
        send: "Kanalga yuborish",
        footer: "Hududingiz uchun to'gri vaqtda ibodatni ado eting. Alloh har bir qadamingizni savobli qilsin!",
        update: "Yangilash",
        language: "Til"
    },
    ru: {
        title: "Мечеть Исломхон Джаме",
        subtitle: "Введите время намаза",
        date: "Дата",
        bomdod: "Фаджр",
        peshin: "Зухр",
        asr: "Аср",
        shom: "Магриб",
        xufton: "Иша",
        additional: "Дополнительная информация",
        note: "Или заметка...",
        optional: "Комментарий (необязательно)",
        send: "Отправить в канал",
        footer: "Совершайте поклонение в правильное время для вашего региона. Пусть Аллах вознаградит каждый ваш шаг!",
        update: "Обновить",
        language: "Язык"
    },
    en: {
        title: "Islomxon Jome Mosque",
        subtitle: "Enter prayer times",
        date: "Date",
        bomdod: "Fajr",
        peshin: "Dhuhr",
        asr: "Asr",
        shom: "Maghrib",
        xufton: "Isha",
        additional: "Additional information",
        note: "Or note...",
        optional: "Comment (optional)",
        send: "Send to channel",
        footer: "Perform worship at the correct time for your region. May Allah reward every step you take!",
        update: "Update",
        language: "Language"
    }
};

// API Routes
app.get('/api/prayer-times', (req, res) => {
    const lang = req.query.lang || 'uz';
    const response = {
        ...prayerTimes,
        translations: translations[lang]
    };
    res.json(response);
});

app.post('/api/prayer-times', (req, res) => {
    const { date, bomdod, peshin, asr, shom, xufton } = req.body;
    
    prayerTimes = {
        date: date || prayerTimes.date,
        bomdod: bomdod || prayerTimes.bomdod,
        peshin: peshin || prayerTimes.peshin,
        asr: asr || prayerTimes.asr,
        shom: shom || prayerTimes.shom,
        xufton: xufton || prayerTimes.xufton
    };
    
    res.json({ success: true, message: "Namoz vaqtlari yangilandi", data: prayerTimes });
});

app.get('/api/translations', (req, res) => {
    const lang = req.query.lang || 'uz';
    res.json(translations[lang]);
});

// Admin route
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Vaqtni avtomatik yangilash
cron.schedule('0 0 * * *', () => {
    const tomorrow = moment().add(1, 'days');
    prayerTimes.date = tomorrow.format('DD-MMMM, YYYY yıl');
    console.log('Namoz vaqtlari yangilandi:', prayerTimes.date);
});

// Serverni ishga tushirish
app.listen(PORT, () => {
    console.log(`Server ${PORT}-portda ishlamoqda`);
    console.log(`Asosiy sahifa: http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});
