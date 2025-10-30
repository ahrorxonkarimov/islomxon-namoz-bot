// =============================================
// 🕌 ISLOMXON NAMOZ VAQTI BOT
// Professional Version 3.0
// =============================================

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// 🔐 BOT TOKEN - Render Environment dan
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';

// 👥 ADMINLAR
const ADMIN_IDS = [5985723887, 382697989];

// 📢 KANALLAR
const CHANNELS = ['@Islomxon_masjidi'];

// 🤖 BOTNI YARATISH
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// 📊 STATISTIKA
let botStats = {
    totalMessages: 0,
    activeUsers: ADMIN_IDS.length,
    startTime: new Date()
};

// 🛠️ MIDDLEWARE
app.use(express.json());
app.use(express.static('public'));

// =============================================
// 🌐 ROUTELAR
// =============================================

// 🏓 PING ENDPOINT
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'Bot faol',
        uptime: Math.floor((new Date() - botStats.startTime) / 1000),
        version: '3.0'
    });
});

// 🏠 ASOSIY SAHIFA
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="uz">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Islomxon Bot</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }
                
                body {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    color: white;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    max-width: 500px;
                    width: 100%;
                }
                
                .logo {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: float 3s ease-in-out infinite;
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                h1 {
                    font-size: 2.2rem;
                    margin-bottom: 10px;
                    font-weight: 800;
                }
                
                .stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin: 30px 0;
                }
                
                .stat-item {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 15px;
                    border-radius: 12px;
                }
                
                .stat-number {
                    font-size: 1.8rem;
                    font-weight: 800;
                    display: block;
                }
                
                .btn-group {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .btn {
                    background: linear-gradient(135deg, #43AB34, #2D7D32);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }
            </style>
        </head>
        <body>
            <div class="glass-card">
                <div class="logo">🕌</div>
                <h1>Islomxon Namoz Boti</h1>
                <p>Professional bot yechimi v3.0</p>
                
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-number">${ADMIN_IDS.length}</span>
                        <span>Adminlar</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${botStats.totalMessages}</span>
                        <span>Xabarlar</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${CHANNELS.length}</span>
                        <span>Kanallar</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">24/7</span>
                        <span>Ishlash</span>
                    </div>
                </div>
                
                <div class="btn-group">
                    <a href="/webapp.html" class="btn">📱 Web App</a>
                    <a href="/admin.html" class="btn">📊 Admin Panel</a>
                </div>
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

// 📱 WEB APP
app.get('/webapp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp.html'));
});

// 📊 ADMIN PANEL
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// =============================================
// 🔧 YORDAMCHI FUNKSIYALAR
// =============================================

// 🔐 ADMIN TEKSHIRISH
function isAdmin(userId) {
    return ADMIN_IDS.includes(parseInt(userId));
}

// 📤 KANALGA XABAR YUBORISH
async function sendToChannels(message) {
    const results = [];
    
    for (const channel of CHANNELS) {
        try {
            console.log(`🚀 ${channel} kanaliga xabar yuborilmoqda...`);
            const result = await bot.sendMessage(channel, message);
            console.log(`✅ ${channel} kanaliga XABAR MUVAFFAQIYATLI YUBORILDI!`);
            results.push({ channel, success: true });
            botStats.totalMessages++;
        } catch (error) {
            console.error(`❌ ${channel} kanaliga xato:`, error.message);
            results.push({ channel, success: false, error: error.message });
        }
    }
    return results;
}

// =============================================
// 🤖 TELEGRAM KOMANDALARI
// =============================================

// 🎯 /start KOMANDASI
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.first_name || 'Foydalanuvchi';

    console.log(`🔔 /start: ${userName} (${userId})`);

    if (!isAdmin(userId)) {
        return bot.sendMessage(chatId,
            `❌ Kechirasiz, ${userName}!\\n\\n` +
            `Bu bot faqat adminlar uchun.\\n` +
            `Agar admin bo'lsangiz, @Abdulloh_Ummati_Muhammad ga murojaat qiling.`
        );
    }

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '📱 Namoz Vaqtlarini Kiriting',
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

    const welcomeMessage = `
Assalomu alaykum *${userName}*! 🌙

🕌 *Islomxon Jome Masjidi* nomoz vaqtlari botiga xush kelibsiz!

✨ *Bot Imkoniyatlari:*
• 📅 Namoz vaqtlarini osongina kiriting
• 📢 Avtomatik kanallarga tarqating  
• 📊 Batafsil statistika
• 🎨 Professional interfeys

👇 Quyidagi tugmalar orqali foydalaning:
    `;

    bot.sendMessage(chatId, welcomeMessage, {
        reply_markup: keyboard,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
    });
});

// =============================================
// 📨 WEB APP API
// =============================================

app.post('/submit-prayer-times', express.json(), async (req, res) => {
    try {
        console.log('\\n📨 📨 📨 YANGI WEBAPP SO\\'ROV KELDI!');
        console.log('Ma\\'lumotlar:', req.body);

        const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

        // 🔐 TEKSHIRISHLAR
        if (!userId) {
            return res.status(400).json({ success: false, error: 'User ID topilmadi' });
        }

        if (!isAdmin(userId)) {
            return res.status(403).json({ success: false, error: 'Faqat adminlar foydalanishi mumkin' });
        }

        // 📋 MAYDonLARNI TEKSHIRISH
        if (!bomdod || !peshin || !asr || !shom || !hufton || !sana) {
            return res.status(400).json({ success: false, error: 'Barcha maydonlarni to\\'ldiring' });
        }

        // ✨ XABAR FORMATLASH
        const message = `🕌 *Islomxon Jome Masjidi*
📅 ${sana}

🕒 *Namoz Vaqtlari:*

🌅 *Bomdod:* ${bomdod}
☀️ *Peshin:* ${peshin}
🌤️ *Asr:* ${asr}
🌇 *Shom:* ${shom}
🌙 *Hufton:* ${hufton}

${izoh ? `💫 *Izoh:* ${izoh}\\\\n\\\\n` : ''}_"Namozni ado etganingizdan so'ng Allohni eslang."_ 
*(Niso surasi, 103-oyat)*

👨‍💻 @Islomxon_Masjidi_Namoz_Vaqti_Bot`;

        console.log('📝 Xabar tayyor:', message);

        // 🚀 KANALLARGA YUBORISH
        const results = await sendToChannels(message);
        const successCount = results.filter(r => r.success).length;

        res.json({
            success: successCount > 0,
            message: successCount > 0 ? 
                `🎉 Tabriklayman! Xabar ${successCount} ta kanalga muvaffaqiyatli yuborildi!` :
                `❌ Afsuski, xabar hech qanday kanalga yuborilmadi.`,
            details: results
        });

    } catch (error) {
        console.error('❌ Xato:', error);
        res.status(500).json({ 
            success: false, 
            error: `Server xatosi: ${error.message}`
        });
    }
});

// 📊 STATISTIKA API
app.get('/api/stats', (req, res) => {
    res.json({
        ...botStats,
        adminCount: ADMIN_IDS.length,
        channelCount: CHANNELS.length,
        uptime: Math.floor((new Date() - botStats.startTime) / 1000),
        version: '3.0'
    });
});

// =============================================
// 🎉 SERVERNI ISHGA TUSHIRISH
// =============================================

app.listen(PORT, async () => {
    console.log('\\n' +
        '🎉 ==========================================\\n' +
        '✅ ISLOMXON NAMOZ VAQTI BOT ISHGA TUSHDI!\\n' +
        '📍 Port: ' + PORT + '\\n' + 
        '🌐 URL: https://islomxon-namoz-bot.onrender.com\\n' +
        '👤 Adminlar: ' + ADMIN_IDS.join(', ') + '\\n' +
        '📢 Kanallar: ' + CHANNELS.join(', ') + '\\n' +
        '🚀 Versiya: 3.0 - Professional\\n' +
        '🎉 ==========================================\\n'
    );

    // ✅ BOT TOKEN TEKSHIRISH
    try {
        const botInfo = await bot.getMe();
        console.log(`🤖 Bot: @${botInfo.username}`);
        console.log(`✅ Bot token to'g'ri`);
    } catch (error) {
        console.error('❌ Bot token noto\\'g\\'ri:', error.message);
    }
});
