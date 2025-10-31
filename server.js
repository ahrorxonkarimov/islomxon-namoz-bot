const express = require('express');
const { Telegraf } = require('telegraf');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Bot konfiguratsiyasi
const BOT_TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const CHANNEL = '@Islomxon_masjidi';
const ADMIN_IDS = [7894421569, 5985723887, 382697989]; // FAQAT ADMINLAR

const bot = new Telegraf(BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ADMIN TEKSHIRISH FUNKSIYASI
function isAdmin(userId) {
    return ADMIN_IDS.includes(parseInt(userId));
}

// Middleware: FAQAT ADMINLAR KIRISHI MUMKIN
app.use('/admin', (req, res, next) => {
    // Bu yerda Telegram ID ni tekshirish kerak
    // Oddiy holatda hamma kirishiga ruxsat beramiz
    // Keyin qattiq himoya qilamiz
    next();
});

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
        error: "Xatolik yuz berdi!",
        access_denied: "❌ Sizda admin huquqi yo'q!",
        welcome_admin: "👑 Admin panelga xush kelibsiz!"
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
        error: "Произошла ошибка!",
        access_denied: "❌ У вас нет прав администратора!",
        welcome_admin: "👑 Добро пожаловать в админ панель!"
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
        error: "Хатолик юз берди!",
        access_denied: "❌ Сизда админ ҳуқуқи йўқ!",
        welcome_admin: "👑 Админ панелга хуш келибсиз!"
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
        return { success: false, message: translations[lang].error + ': ' + error.message };
    }
}

// BOT KOMANDALARI - FAQAT ADMINLAR UCHUN
bot.start((ctx) => {
    const user = ctx.from;
    
    if (isAdmin(user.id)) {
        ctx.replyWithHTML(
            `👑 <b>Assalomu alaykum, ${user.first_name}!</b>\n\n` +
            `Siz <b>Islomxon Jome Masjidi</b> botining adminisiz!\n\n` +
            `🌐 <b>Web Admin Panel:</b>\n` +
            `https://${process.env.RENDER_URL || 'localhost:3000'}/admin\n\n` +
            `<i>Namoz vaqtlarini o'zgartirish va kanalga post yuborish uchun web paneldan foydalaning.</i>`
        );
    } else {
        ctx.replyWithHTML(
            `🕌 <b>Assalomu alaykum, ${user.first_name}!</b>\n\n` +
            `Xush kelibsiz <b>Islomxon Jome Masjidi</b> botiga!\n\n` +
            `📢 Yangi namoz vaqtlari:\n` +
            `<a href="https://t.me/Islomxon_masjidi">@Islomxon_masjidi</a> kanalida e'lon qilinadi.\n\n` +
            `<i>Bu bot faqat adminlar uchun!</i>`
        );
    }
});

// API ROUTES - FAQAT ADMINLAR UCHUN
app.post('/api/prayer-times', async (req, res) => {
    const { date, bomdod, peshin, asr, shom, xufton, lang = 'uz', userId } = req.body;
    
    // ADMIN TEKSHIRISH
    if (!isAdmin(userId)) {
        return res.json({ 
            success: false, 
            message: translations[lang].access_denied 
        });
    }
    
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

app.get('/api/prayer-times', (req, res) => {
    const lang = req.query.lang || 'uz';
    res.json({
        ...prayerTimes,
        translations: translations[lang]
    });
});

// WEB ROUTES
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// LOGIN ROUTE - TELEGRAM ID NI TEKSHIRISH
app.post('/api/check-admin', (req, res) => {
    const { userId } = req.body;
    
    if (isAdmin(parseInt(userId))) {
        res.json({ 
            success: true, 
            message: translations.uz.welcome_admin,
            user: { isAdmin: true }
        });
    } else {
        res.json({ 
            success: false, 
            message: translations.uz.access_denied,
            user: { isAdmin: false }
        });
    }
});

// SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT}-portda ishlamoqda`);
    console.log(`🌐 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`👑 Adminlar: ${ADMIN_IDS.join(', ')}`);
});

// BOTNI ISHGA TUSHIRISH
bot.launch().then(() => {
    console.log('🤖 Bot ishga tushdi!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
