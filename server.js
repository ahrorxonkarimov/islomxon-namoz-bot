const express = require('express');
const { Telegraf } = require('telegraf');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Bot konfiguratsiyasi
const BOT_TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const CHANNEL = '@Islomxon_masjidi';
const bot = new Telegraf(BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Namoz vaqtlari ma'lumotlari
let prayerTimes = {
    date: moment().format('DD-MMMM, YYYY yıl'),
    bomdod: "05:45",
    peshin: "13:15", 
    asr: "16:30",
    shom: "18:45",
    xufton: "20:15"
};

// 3 TILDA TARJIMALAR
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
        send: "📢 Kanalga yuborish",
        footer: "Hududingiz uchun to'gri vaqtda ibodatni ado eting. Alloh har bir qadamingizni savobli qilsin!",
        update: "Yangilash",
        language: "Til",
        success: "Post muvaffaqiyatli yuborildi!",
        error: "Xatolik yuz berdi!"
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
        send: "📢 Отправить в канал",
        footer: "Совершайте поклонение в правильное время для вашего региона. Пусть Аллах вознаградит каждый ваш шаг!",
        update: "Обновить",
        language: "Язык",
        success: "Пост успешно отправлен!",
        error: "Произошла ошибка!"
    },
    kr: {
        title: "Исломхон Жоме Масжиди",
        subtitle: "Намоз вақтларини киритинг",
        date: "Сана",
        bomdod: "Бомдод",
        peshin: "Пешин",
        asr: "Аср",
        shom: "Шом", 
        xufton: "Хуфтон",
        additional: "Қўшимча маълумот",
        note: "Ёки эслатма...",
        optional: "Изоҳ (ихтиёрий)",
        send: "📢 Каналга юбориш",
        footer: "Ҳудудингиз учун тўғри вақтда ибодатни адо этинг. Аллоҳ ҳар бир қадамингизни савобли қилсин!",
        update: "Янгилаш",
        language: "Тил",
        success: "Пост муваффақиятли юборилди!",
        error: "Хатолик юз берди!"
    }
};

// CHIROYLI POST YARATISH
function createBeautifulPost(lang = 'uz') {
    const t = translations[lang];
    
    return `🕌 *${t.title}*

📅 ${t.date}: ${prayerTimes.date}

🕐 *${lang === 'uz' ? 'Namoz vaqtlari' : lang === 'ru' ? 'Время намаза' : 'Намоз вақтлари'}:*

🌅 ${t.bomdod}: ${prayerTimes.bomdod}
☀️ ${t.peshin}: ${prayerTimes.peshin}  
⛅ ${t.asr}: ${prayerTimes.asr}
🌇 ${t.shom}: ${prayerTimes.shom}
🌙 ${t.xufton}: ${prayerTimes.xufton}

${t.footer}

━━━━━━━━━━━━━━
📍 @Islomxon_masjidi`;
}

// TELEGRAMGA POST YUBORISH
async function sendToTelegram(lang = 'uz') {
    try {
        const message = createBeautifulPost(lang);
        
        await bot.telegram.sendMessage(CHANNEL, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: "📍 Manzil", callback_data: "location" },
                    { text: "📞 Aloqa", callback_data: "contact" }
                ]]
            }
        });
        
        return { success: true, message: translations[lang].success };
    } catch (error) {
        return { success: false, message: translations[lang].error };
    }
}

// API ROUTES
app.get('/api/prayer-times', (req, res) => {
    const lang = req.query.lang || 'uz';
    res.json({
        ...prayerTimes,
        translations: translations[lang]
    });
});

app.post('/api/prayer-times', async (req, res) => {
    const { date, bomdod, peshin, asr, shom, xufton, lang = 'uz' } = req.body;
    
    // Yangilash
    prayerTimes = {
        date: date || prayerTimes.date,
        bomdod: bomdod || prayerTimes.bomdod,
        peshin: peshin || prayerTimes.peshin,
        asr: asr || prayerTimes.asr,
        shom: shom || prayerTimes.shom,
        xufton: xufton || prayerTimes.xufton
    };
    
    // Telegramga yuborish
    const result = await sendToTelegram(lang);
    
    res.json({
        success: result.success,
        message: result.message,
        data: prayerTimes
    });
});

// WEB ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT}-portda ishlamoqda`);
    console.log(`🌐 Admin Panel: http://localhost:${PORT}/admin`);
});
