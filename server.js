const express = require('express');
const { Telegraf } = require('telegraf');
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

// Namoz vaqtlari
let prayerTimes = {
    date: moment().format('DD-MMMM, YYYY yıl'),
    bomdod: "05:45",
    peshin: "13:15",
    asr: "16:30",
    shom: "18:45",
    xufton: "20:15"
};

// BOT START
bot.start((ctx) => {
    const user = ctx.from;
    const isAdmin = ADMIN_IDS.includes(user.id);
    
    if (isAdmin) {
        ctx.replyWithHTML(
            `🕌 <b>Assalomu alaykum, ${user.first_name}!</b>\n\n` +
            `Siz <b>Islomxon Jome Masjidi</b> botining adminisiz!\n\n` +
            `📋 <b>Vazifangiz:</b> Namoz vaqtlarini kiritish\n\n` +
            `🕐 <b>Joriy vaqtlar:</b>\n` +
            `🌅 Bomdod: <b>${prayerTimes.bomdod}</b>\n` +
            `☀️ Peshin: <b>${prayerTimes.peshin}</b>\n` +
            `⛅ Asr: <b>${prayerTimes.asr}</b>\n` +
            `🌇 Shom: <b>${prayerTimes.shom}</b>\n` +
            `🌙 Xufton: <b>${prayerTimes.xufton}</b>\n\n` +
            `⬇️ <b>Web App orqali yangi vaqtlarni kiriting:</b>`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{
                            text: "📱 Web App da vaqt kiritish",
                            web_app: { url: WEB_APP_URL }
                        }],
                        [
                            { text: "📢 Kanal", url: "https://t.me/Islomxon_masjidi" },
                            { text: "📷 Instagram", url: "https://instagram.com/islomxon_masjidi" }
                        ],
                        [
                            { text: "👑 Admin", url: "https://t.me/Abdulloh_Ummati_Muhammad" }
                        ]
                    ]
                }
            }
        );
    } else {
        ctx.replyWithHTML(
            `❌ <b>Siz admin emassiz!</b>\n\n` +
            `Bu bot faqat adminlar uchun.\n\n` +
            `📢 Namoz vaqtlari: @Islomxon_masjidi`,
            {
                reply_markup: {
                    inline_keyboard: [[
                        { text: "📢 Kanalga obuna bo'lish", url: "https://t.me/Islomxon_masjidi" }
                    ]]
                }
            }
        );
    }
});

// KANALGA POST YUBORISH
async function sendToTelegram() {
    try {
        const message = `🕌 <b>Islomxon Jome Masjidi</b>\n\n` +
                       `📅 Sana: ${prayerTimes.date}\n\n` +
                       `🕐 <b>Namoz Vaqtlari:</b>\n\n` +
                       `🌅 Bomdod: ${prayerTimes.bomdod}\n` +
                       `☀️ Peshin: ${prayerTimes.peshin}\n` +
                       `⛅ Asr: ${prayerTimes.asr}\n` +
                       `🌇 Shom: ${prayerTimes.shom}\n` +
                       `🌙 Xufton: ${prayerTimes.xufton}\n\n` +
                       `🤲 <i>Hududingiz uchun to'g'ri vaqtda ibodatni ado eting. Alloh har bir qadamingizni savobli qilsin!</i>\n\n` +
                       `━━━━━━━━━━━━━━\n` +
                       `📍 @Islomxon_masjidi`;

        await bot.telegram.sendMessage(CHANNEL, message, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "📷 Instagram", url: "https://instagram.com/islomxon_masjidi" },
                        { text: "👑 Admin", url: "https://t.me/Abdulloh_Ummati_Muhammad" }
                    ]
                ]
            }
        });
        
        return true;
    } catch (error) {
        console.error('Xatolik:', error);
        return false;
    }
}

// API ROUTES
app.get('/api/prayer-times', (req, res) => {
    res.json({ success: true, data: prayerTimes });
});

app.post('/api/update-times', async (req, res) => {
    const { bomdod, peshin, asr, shom, xufton } = req.body;
    
    prayerTimes = {
        date: moment().format('DD-MMMM, YYYY yıl'),
        bomdod: bomdod,
        peshin: peshin,
        asr: asr,
        shom: shom,
        xufton: xufton
    };
    
    const sent = await sendToTelegram();
    
    res.json({
        success: sent,
        message: sent ? "✅ Vaqtlar yangilandi va post yuborildi!" : "❌ Xatolik!",
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
