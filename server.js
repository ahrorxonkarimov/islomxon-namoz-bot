const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Bot konfiguratsiyasi
const BOT_TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const CHANNEL = '@Islomxon_masjidi';
const ADMIN_IDS = [7894421569, 5985723887, 382697989];
const WEB_APP_URL = 'https://islomxon-namoz-bot.onrender.com/admin';

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
        adminWelcome: "🕌 *Assalomu alaykum, {name}!*\n\nSiz *Islomxon Jome Masjidi* botining adminisiz!\n\n📋 Namoz vaqtlarini kiritish uchun:",
        notAdmin: "❌ *Siz admin emassiz!*\n\nBu bot faqat adminlar uchun."
    },
    ru: {
        adminWelcome: "🕌 *Ассаламу алейкум, {name}!*\n\nВы администратор бота *Мечеть Исломхон Джаме*!\n\n📋 Для ввода времени намаза:",
        notAdmin: "❌ *Вы не администратор!*\n\nЭтот бот только для администраторов."
    },
    kr: {
        adminWelcome: "🕌 *Ассалому алейкум, {name}!*\n\nСиз *Исломхон Жоме Масжиди* ботининг администраторисиз!\n\n📋 Намоз вақтларини киритиш учун:",
        notAdmin: "❌ *Сиз админ эмассиз!*\n\nБу бот фақат админлар учун."
    }
};

// BOT KOMANDALARI
bot.start((ctx) => {
    const user = ctx.from;
    const isAdmin = ADMIN_IDS.includes(user.id);
    const lang = user.language_code === 'ru' ? 'ru' : 'uz';
    
    if (isAdmin) {
        const message = translations[lang].adminWelcome.replace('{name}', user.first_name);
        
        ctx.replyWithMarkdown(message, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "📱 Vaqtlarni kiritish",
                        web_app: { url: WEB_APP_URL }
                    }],
                    [{
                        text: "📢 Kanal",
                        url: "https://t.me/Islomxon_masjidi"
                    }],
                    [{
                        text: "📷 Instagram", 
                        url: "https://instagram.com/islomxon_masjidi"
                    }],
                    [{
                        text: "👑 Admin",
                        url: "https://t.me/Abdulloh_Ummati_Muhammad"
                    }]
                ]
            }
        });
    } else {
        ctx.replyWithMarkdown(translations[lang].notAdmin, {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "📢 Kanalga obuna bo'lish",
                        url: "https://t.me/Islomxon_masjidi"
                    }
                ]]
            }
        });
    }
});

// KANALGA POST YUBORISH
async function sendToTelegram(lang = 'uz') {
    try {
        const message = `🕌 *Islomxon Jome Masjidi*\n\n` +
                       `📅 Sana: ${prayerTimes.date}\n\n` +
                       `🕐 *Namoz Vaqtlari:*\n\n` +
                       `🌅 Bomdod: ${prayerTimes.bomdod}\n` +
                       `☀️ Peshin: ${prayerTimes.peshin}\n` +
                       `⛅ Asr: ${prayerTimes.asr}\n` +
                       `🌇 Shom: ${prayerTimes.shom}\n` +
                       `🌙 Xufton: ${prayerTimes.xufton}\n\n` +
                       `🤲 Hududingiz uchun to'g'ri vaqtda ibodatni ado eting!\n\n` +
                       `━━━━━━━━━━━━━━\n` +
                       `📍 @Islomxon_masjidi`;

        await bot.telegram.sendMessage(CHANNEL, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "📷 Instagram", 
                        url: "https://instagram.com/islomxon_masjidi"
                    }],
                    [{
                        text: "👑 Admin",
                        url: "https://t.me/Abdulloh_Ummati_Muhammad"
                    }]
                ]
            }
        });
        
        return { success: true, message: "✅ Post yuborildi!" };
    } catch (error) {
        console.error('Xatolik:', error);
        return { success: false, message: "❌ Xatolik!" };
    }
}

// API ROUTES
app.get('/api/prayer-times', (req, res) => {
    const lang = req.query.lang || 'uz';
    res.json({
        success: true,
        data: prayerTimes,
        translations: translations[lang]
    });
});

app.post('/api/update-times', async (req, res) => {
    const { bomdod, peshin, asr, shom, xufton, lang = 'uz' } = req.body;
    
    // Yangilash
    prayerTimes = {
        date: moment().format('DD-MMMM, YYYY yıl'),
        bomdod: bomdod,
        peshin: peshin,
        asr: asr,
        shom: shom,
        xufton: xufton
    };
    
    console.log('Yangi vaqtlar:', prayerTimes);
    
    // Kanalga yuborish
    const result = await sendToTelegram(lang);
    
    res.json({
        success: result.success,
        message: result.message,
        data: prayerTimes
    });
});

// WEB ROUTES
app.get('/', (req, res) => {
    res.send('Islomxon Masjidi Bot Serveri!');
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// SERVER
app.listen(PORT, async () => {
    console.log(`🚀 Server ${PORT}-portda ishlamoqda`);
    
    try {
        await bot.launch();
        console.log('🤖 Bot ishga tushdi!');
        console.log('🌐 Web App:', WEB_APP_URL);
    } catch (error) {
        console.error('❌ Bot xatosi:', error);
    }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
