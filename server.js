const express = require('express');
const { Telegraf } = require('telegraf');
const moment = require('moment');
const cron = require('node-cron');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Bot konfiguratsiyasi
const BOT_TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const CHANNEL = '@Islomxon_masjidi';
const ADMIN_IDS = [7894421569, 5985723887, 382697989];

const bot = new Telegraf(BOT_TOKEN);

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
        success: "✅ Post muvaffaqiyatli yuborildi!",
        error: "❌ Xatolik yuz berdi!",
        access_denied: "❌ Sizda admin huquqi yo'q!",
        welcome_admin: "👑 Admin panelga xush kelibsiz!",
        login_title: "Admin Panelga kirish",
        login_info: "Faqat adminlar kirishi mumkin"
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
        success: "✅ Пост успешно отправлен!",
        error: "❌ Произошла ошибка!",
        access_denied: "❌ У вас нет прав администратора!",
        welcome_admin: "👑 Добро пожаловать в админ панель!",
        login_title: "Вход в админ панель",
        login_info: "Только для администраторов"
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
        success: "✅ Пост муваффақиятли юборилди!",
        error: "❌ Хатолик юз берди!",
        access_denied: "❌ Сизда админ ҳуқуқи йўқ!",
        welcome_admin: "👑 Админ панелга хуш келибсиз!",
        login_title: "Админ панелга кириш",
        login_info: "Фақат админлар кириши мумкин"
    }
};

// ADMIN TEKSHIRISH
function isAdmin(userId) {
    return ADMIN_IDS.includes(parseInt(userId));
}

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
                    { 
                        text: lang === 'uz' ? "📍 Manzil" : 
                              lang === 'ru' ? "📍 Адрес" : "📍 Манзил", 
                        callback_data: "location" 
                    },
                    { 
                        text: lang === 'uz' ? "📞 Aloqa" : 
                              lang === 'ru' ? "📞 Контакты" : "📞 Алоқа", 
                        callback_data: "contact" 
                    }
                ]]
            }
        });
        
        return { success: true, message: translations[lang].success };
    } catch (error) {
        return { success: false, message: translations[lang].error + ': ' + error.message };
    }
}

// BOT KOMANDALARI
bot.start((ctx) => {
    const user = ctx.from;
    const userName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    
    console.log(`🎯 /start bosildi: ${user.id} (${userName})`);
    
    if (isAdmin(user.id)) {
        console.log(`✅ ${user.id} admin sifatida tanishdi`);
        
        const adminMessage = `👑 *Assalomu alaykum, ${userName}!* ✨

🕌 *Islomxon Jome Masjidi* botiga xush kelibsiz!

Siz *admin* sifatida tanishdingiz.

🌐 *Web Admin Panel:*
https://${process.env.RENDER_URL || 'localhost:3000'}/admin

📋 *Admin imkoniyatlari:*
• Namoz vaqtlarini o'zgartirish
• Kanalga avtomatik post yuborish
• 3 tilda post tayyorlash

🕐 *Joriy namoz vaqtlari:*
Bomdod: ${prayerTimes.bomdod}
Peshin: ${prayerTimes.peshin}
Asr: ${prayerTimes.asr}
Shom: ${prayerTimes.shom}
Xufton: ${prayerTimes.xufton}

*Web panel orqali yangi vaqtlarni kiriting!*`;
        
        ctx.replyWithMarkdown(adminMessage);
    } else {
        const userMessage = `🕌 *Assalomu alaykum, ${userName}!* ✨

*Islomxon Jome Masjidi* botiga xush kelibsiz!

📢 *Yangi namoz vaqtlari:*
@Islomxon_masjidi kanalida e'lon qilinadi.

🕐 *Bugungi namoz vaqtlari:*
Bomdod: ${prayerTimes.bomdod}
Peshin: ${prayerTimes.peshin}
Asr: ${prayerTimes.asr}
Shom: ${prayerTimes.shom}
Xufton: ${prayerTimes.xufton}

🤲 *Alloh har bir ibodatingizni qabul qilsin!*

━━━━━━━━━━━━━━
📍 @Islomxon_masjidi`;
        
        ctx.replyWithMarkdown(userMessage, {
            reply_markup: {
                inline_keyboard: [[
                    { text: "📢 Kanalga obuna bo'lish", url: "https://t.me/Islomxon_masjidi" }
                ]]
            }
        });
    }
});

// NAMOZ VAQTLARI KOMANDASI
bot.command('vaqtlar', (ctx) => {
    const message = createBeautifulPost('uz');
    ctx.replyWithMarkdown(message);
});

// YORDAM KOMANDASI
bot.command('help', (ctx) => {
    ctx.replyWithMarkdown(`🕌 *Islomxon Jome Masjidi Bot*

📋 *Mavjud komandalar:*
/start - Botni ishga tushirish
/vaqtlar - Namoz vaqtlari
/help - Yordam

📢 *Yangiliklar:* @Islomxon_masjidi

🤲 *Alloh qabul qilsin!*`);
});

// AVTOMATIK POSTLAR
cron.schedule('0 6 * * *', () => {
    console.log('🕐 Ertalabki post yuborilmoqda...');
    sendToTelegram('uz');
});

cron.schedule('0 12 * * *', () => {
    console.log('🕐 Peshin vaqti post yuborilmoqda...');
    sendToTelegram('uz');
});

// HAR KUNI SANANI YANGILASH
cron.schedule('0 0 * * *', () => {
    prayerTimes.date = moment().format('DD-MMMM, YYYY yıl');
    console.log('📅 Sana yangilandi:', prayerTimes.date);
});

// API ROUTES
app.get('/api/prayer-times', (req, res) => {
    const lang = req.query.lang || 'uz';
    res.json({
        success: true,
        data: prayerTimes,
        translations: translations[lang]
    });
});

app.post('/api/check-admin', (req, res) => {
    const { userId } = req.body;
    
    if (isAdmin(parseInt(userId))) {
        res.json({ 
            success: true, 
            message: translations.uz.welcome_admin,
            user: { 
                id: userId, 
                isAdmin: true 
            }
        });
    } else {
        res.json({ 
            success: false, 
            message: translations.uz.access_denied,
            user: { isAdmin: false }
        });
    }
});

app.post('/api/prayer-times', async (req, res) => {
    const { date, bomdod, peshin, asr, shom, xufton, lang = 'uz', userId } = req.body;
    
    // ADMIN TEKSHIRISH
    if (!isAdmin(parseInt(userId))) {
        return res.json({ 
            success: false, 
            message: translations[lang].access_denied 
        });
    }
    
    // MA'LUMOTLARNI YANGILASH
    prayerTimes = {
        date: date || prayerTimes.date,
        bomdod: bomdod || prayerTimes.bomdod,
        peshin: peshin || prayerTimes.peshin,
        asr: asr || prayerTimes.asr,
        shom: shom || prayerTimes.shom,
        xufton: xufton || prayerTimes.xufton
    };
    
    console.log('🔄 Namoz vaqtlari yangilandi:', prayerTimes);
    
    // TELEGRAMGA YUBORISH
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

// BOTNI ISHGA TUSHIRISH
bot.launch().then(() => {
    console.log('🤖 Bot muvaffaqiyatli ishga tushdi!');
    console.log('👑 Adminlar:', ADMIN_IDS);
    console.log('📢 Kanal:', CHANNEL);
}).catch(err => {
    console.error('❌ Bot ishga tushirishda xatolik:', err);
});

// SERVERNI ISHGA TUSHIRISH
app.listen(PORT, () => {
    console.log(`🚀 Server ${PORT}-portda ishlamoqda`);
    console.log(`🌐 Asosiy sahifa: http://localhost:${PORT}`);
    console.log(`⚙️ Admin panel: http://localhost:${PORT}/admin`);
});

// GRACEFUL SHUTDOWN
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
