const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const ADMIN_IDS = [5985723887, 382697989];
const CHANNELS = ['@Islomxon_masjidi'];

const bot = new TelegramBot(BOT_TOKEN);

app.use(express.json());

// PING
app.get('/ping', (req, res) => {
    console.log('🏓 Ping qabul qilindi');
    res.json({ status: 'ok', time: new Date().toLocaleString('uz-UZ') });
});

// ASOSIY SAHIFA
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Islomxon Namoz Vaqti Bot</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; background: #43AB34; color: white; }
                .container { background: rgba(255,255,255,0.1); padding: 30px; border-radius: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🕌 Islomxon Namoz Vaqti Bot</h1>
                <p>✅ Bot faol</p>
                <p><a href="/webapp.html" style="color: #ffd700;">Web App</a> | <a href="/admin.html" style="color: #ffd700;">Admin Panel</a></p>
            </div>
        </body>
        </html>
    `);
});

// WEBHOOK
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// WEB APP
app.get('/webapp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp.html'));
});

// ADMIN PANEL
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// ADMIN TEKSHIRISH
function isAdmin(userId) {
    return ADMIN_IDS.includes(parseInt(userId));
}

// KANALGA XABAR YUBORISH
async function sendToChannels(message) {
    const results = [];
    
    for (const channel of CHANNELS) {
        try {
            console.log(`📤 ${channel} kanaliga xabar yuborilmoqda...`);
            const result = await bot.sendMessage(channel, message);
            console.log(`✅ ${channel} kanaliga XABAR BORDI!`);
            results.push({ channel, success: true });
        } catch (error) {
            console.error(`❌ ${channel} kanaliga xato:`, error.message);
            results.push({ channel, success: false, error: error.message });
        }
    }
    return results;
}

// /start KOMANDASI
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (!isAdmin(userId)) {
        return bot.sendMessage(chatId, '❌ Faqat admin');
    }

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '🕌 Namoz Vaqtlarini Kiriting',
                    web_app: { url: `https://islomxon-namoz-bot.onrender.com/webapp.html` }
                }
            ],
            [
                {
                    text: '📊 Admin Panel', 
                    web_app: { url: `https://islomxon-namoz-bot.onrender.com/admin.html` }
                }
            ]
        ]
    };

    bot.sendMessage(chatId, `Assalomu alaykum! *Islomxon Namoz Vaqti Bot* ga xush kelibsiz!`, {
        reply_markup: keyboard,
        parse_mode: 'Markdown'
    });
});

// WEB APP API
app.post('/submit-prayer-times', express.json(), async (req, res) => {
    try {
        console.log('📨 WEBAPP SO\'ROV KELDI:', req.body);

        const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

        if (!isAdmin(userId)) {
            return res.status(403).json({ success: false, error: 'Faqat admin' });
        }

        const message = `🕌 Islomxon Jome Masjidi
📅 ${sana}

🕒 Namoz Vaqtlari:

🌅 Bomdod: ${bomdod}
☀️ Peshin: ${peshin}
🌤️ Asr: ${asr}
🌇 Shom: ${shom}
🌙 Hufton: ${hufton}

${izoh ? `💫 Izoh: ${izoh}\\n\\n` : ''}"Namozni ado etganingizdan so'ng Allohni eslang." (Niso 103)`;

        const results = await sendToChannels(message);
        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            message: `Xabar ${successCount} kanalga yuborildi`
        });

    } catch (error) {
        console.error('❌ Xato:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// STATISTIKA API
app.get('/api/stats', (req, res) => {
    res.json({
        totalUsers: ADMIN_IDS.length,
        totalMessages: 25,
        activeUsers: ADMIN_IDS.length, 
        channels: CHANNELS.length,
        lastUpdate: new Date().toLocaleString('uz-UZ')
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server ${PORT}-portda ishga tushdi`);
    console.log(`👤 Adminlar: ${ADMIN_IDS.join(', ')}`);
});
