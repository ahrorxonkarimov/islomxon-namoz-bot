const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';

// ✅ ADMINLAR RO'YXATI - SIZ VA YANGI ADMIN
const ADMIN_IDS = [5985723887, 382697989]; // Siz + yangi admin

// ✅ KANALLAR RO'YXATI
const CHANNELS = ['@Islomxon_masjidi'];

const bot = new TelegramBot(BOT_TOKEN);

app.use(express.json());

// ✅ PING - BOTNI USHLAB TURISH
app.get('/ping', (req, res) => {
    console.log('🏓 Ping qabul qilindi');
    res.json({ status: 'ok', time: new Date().toLocaleString('uz-UZ') });
});

// 🏠 ASOSIY SAHIFA
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Islomxon Namoz Vaqti Bot</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: linear-gradient(135deg, #43AB34 0%, #2D7D32 100%);
                    color: white;
                }
                .container {
                    background: rgba(255,255,255,0.1);
                    padding: 30px;
                    border-radius: 15px;
                    backdrop-filter: blur(10px);
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🕌 Islomxon Namoz Vaqti Bot</h1>
                <p>✅ Bot faol holatda</p>
                <p>🕒 ${new Date().toLocaleString('uz-UZ')}</p>
                <p>👥 Adminlar: ${ADMIN_IDS.length} ta</p>
                <p><a href="/webapp.html" style="color: #ffd700;">Web App ni ochish</a></p>
            </div>
        </body>
        </html>
    `);
});

// 🌐 WEBHOOK
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// 📱 WEB APP SAHIFASI
app.get('/webapp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp.html'));
});

// 🔐 ADMIN TEKSHIRISH
function isAdmin(userId) {
    return ADMIN_IDS.includes(parseInt(userId));
}

// 📤 KANALGA XABAR YUBORISH - ISHLAYDI!
async function sendToChannels(message) {
    const results = [];
    
    for (const channel of CHANNELS) {
        try {
            console.log(`📤 "${channel}" kanaliga xabar yuborilmoqda...`);
            
            // TO'G'RI USUL: Xabarni yuborish
            const result = await bot.sendMessage(channel, message);
            console.log(`✅ Xabar "${channel}" kanaliga MUVAFFAQIYATLI YUBORILDI!`);
            
            results.push({ channel, success: true });
            
        } catch (error) {
            console.error(`❌ "${channel}" kanaliga xabar yuborishda xato:`, error.message);
            results.push({ channel, success: false, error: error.message });
        }
    }
    
    return results;
}

// 🎯 /start KOMANDASI
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

    bot.sendMessage(chatId, `Assalomu alaykum! *Islomxon Namoz Vaqti Bot* ga xush kelibsiz!\\n\\nNamoz vaqtlarini yuborish uchun quyidagi tugmani bosing:`, {
        reply_markup: keyboard,
        parse_mode: 'Markdown'
    });
});

// 📨 WEB APP DAN MA'LUMOT QABUL QILISH
app.post('/submit-prayer-times', express.json(), async (req, res) => {
    try {
        console.log('📨 WebApp so\'rov keldi:', req.body);

        const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

        // Admin tekshirish
        if (!isAdmin(userId)) {
            return res.status(403).json({ success: false, error: 'Faqat admin' });
        }

        // XABAR FORMATLASH
        const message = `🕌 Islomxon Jome Masjidi
📅 ${sana}

🕒 Namoz Vaqtlari:

🌅 Bomdod: ${bomdod}
☀️ Peshin: ${peshin}
🌤️ Asr: ${asr}
🌇 Shom: ${shom}
🌙 Hufton: ${hufton}

${izoh ? `💫 Izoh: ${izoh}\\n\\n` : ''}"Namozni ado etganingizdan so'ng Allohni eslang." (Niso 103)`;

        console.log('📝 Xabar tayyor:', message);

        // KANALLARGA YUBORISH
        const results = await sendToChannels(message);

        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            message: `Xabar ${successCount} kanalga yuborildi`
        });

    } catch (error) {
        console.error('❌ Xato:', error);
        res.status(500).json({ success: false, error: `Server xatosi: ${error.message}` });
    }
});

// 🎉 SERVERNI ISHGA TUSHIRISH
app.listen(PORT, () => {
    console.log(`\n🎉 ISLOMXON BOT ISHGA TUSHDI!`);
    console.log(`📍 Port: ${PORT}`);
    console.log(`👥 Adminlar: ${ADMIN_IDS.join(', ')}`);
    console.log(`📢 Kanallar: ${CHANNELS.join(', ')}`);
    console.log(`🕒 Vaqt: ${new Date().toLocaleString('uz-UZ')}\n`);
});
