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
    res.json({ status: 'ok' });
});

// ASOSIY SAHIFA
app.get('/', (req, res) => {
    res.send('Bot ishlamoqda');
});

// WEBHOOK
app.post('/webhook', (req, res) => {
    console.log('📨 Webhook so\'rov keldi');
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// WEB APP
app.get('/webapp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp.html'));
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
            console.log(`📤 Kanal: ${channel} - Xabar yuborilmoqda...`);
            
            // Xabarni yuborish
            const result = await bot.sendMessage(channel, message);
            console.log(`✅ Xabar YUBORILDI! Message ID: ${result.message_id}`);
            
            results.push({ channel, success: true });
            
        } catch (error) {
            console.error(`❌ XATO: ${channel} - ${error.message}`);
            results.push({ channel, success: false, error: error.message });
        }
    }
    
    return results;
}

// /start KOMANDASI
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    console.log(`🔔 /start: ${userId}`);

    if (!isAdmin(userId)) {
        return bot.sendMessage(chatId, '❌ Faqat admin');
    }

    const keyboard = {
        inline_keyboard: [[
            {
                text: '🕌 Namoz Vaqtlarini Kiriting',
                web_app: { url: `https://islomxon-namoz-bot.onrender.com/webapp.html` }
            }
        ]]
    };

    bot.sendMessage(chatId, `Assalomu alaykum! Botga xush kelibsiz!`, {
        reply_markup: keyboard
    });
});

// WEB APP DAN MA'LUMOT QABUL QILISH
app.post('/submit-prayer-times', express.json(), async (req, res) => {
    try {
        console.log('📨 📨 📨 WEBAPP SO\'ROV KELDI!');
        console.log('Ma\'lumotlar:', req.body);

        const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

        // User ID borligini tekshirish
        if (!userId) {
            console.log('❌ User ID yo\'q');
            return res.status(400).json({ success: false, error: 'User ID topilmadi' });
        }

        console.log(`👤 User ID: ${userId}`);

        // Admin tekshirish
        if (!isAdmin(userId)) {
            console.log(`❌ User ${userId} admin emas`);
            return res.status(403).json({ success: false, error: 'Faqat admin' });
        }

        console.log(`✅ User ${userId} admin`);

        // XABAR YARATISH
        const message = `🕌 Islomxon Jome Masjidi
📅 ${sana}

🕒 Namoz Vaqtlari:

🌅 Bomdod: ${bomdod}
☀️ Peshin: ${peshin}
🌤️ Asr: ${asr}
🌇 Shom: ${shom}
🌙 Hufton: ${hufton}

${izoh ? `💫 Izoh: ${izoh}\n\n` : ''}"Namozni ado etganingizdan so'ng Allohni eslang." (Niso 103)`;

        console.log('📝 Xabar tayyor:', message);

        // KANALLARGA YUBORISH
        console.log('🚀 Kanallarga yuborish boshlandi...');
        const results = await sendToChannels(message);

        const successCount = results.filter(r => r.success).length;

        console.log(`📊 Natija: ${successCount} kanalga yuborildi`);

        res.json({
            success: successCount > 0,
            message: `Xabar ${successCount} kanalga yuborildi`
        });

    } catch (error) {
        console.error('❌ Xato:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// SERVER
app.listen(PORT, () => {
    console.log(`✅ Server ${PORT}-portda ishga tushdi`);
    console.log(`👤 Adminlar: ${ADMIN_IDS.join(', ')}`);
});
