// =============================================
// 🕌 ISLOMXON NAMOZ VAQTI BOT
// Professional Version 2.0
// =============================================

const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

// 🎯 BOT SOZLAMALARI
const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const ADMIN_IDS = [7894421569, 5985723887];
const CHANNELS = ['@Islomxon_masjidi'];

// 🤖 BOTNI YARATISH
const bot = new TelegramBot(BOT_TOKEN);

// 📦 MIDDLEWARE SOZLASH
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// 🌐 ROUTELAR (YO'NALISHLAR)
// =============================================

// 🏓 PING ENDPOINT - BOTNI USHLAB TURISH
app.get('/ping', (req, res) => {
    console.log('✅ Ping qabul qilindi - Bot faol');
    res.json({ 
        status: 'success', 
        message: 'Islomxon Bot ishlamoqda', 
        timestamp: new Date().toLocaleString('uz-UZ'),
        version: '2.0'
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
            <title>Islomxon Namoz Vaqti Bot</title>
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
                    font-size: 3rem;
                    margin-bottom: 20px;
                }
                
                h1 {
                    font-size: 2rem;
                    margin-bottom: 10px;
                    font-weight: 700;
                }
                
                .subtitle {
                    opacity: 0.9;
                    margin-bottom: 30px;
                    font-size: 1.1rem;
                }
                
                .btn-group {
                    display: flex;
                    gap: 15px;
                    justify-content: center;
                    flex-wrap: wrap;
                }
                
                .btn {
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 12px;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                    font-size: 0.95rem;
                }
                
                .btn-primary {
                    background: linear-gradient(135deg, #43AB34, #2D7D32);
                }
                
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
                }
                
                .stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 15px;
                    margin-top: 30px;
                }
                
                .stat-item {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 15px;
                    border-radius: 10px;
                }
                
                .stat-number {
                    font-size: 1.5rem;
                    font-weight: bold;
                    display: block;
                }
                
                .stat-label {
                    font-size: 0.85rem;
                    opacity: 0.8;
                }
            </style>
        </head>
        <body>
            <div class="glass-card">
                <div class="logo">🕌</div>
                <h1>Islomxon Namoz Vaqti Bot</h1>
                <p class="subtitle">Professional bot yechimi - 2.0 versiya</p>
                
                <div class="btn-group">
                    <a href="/webapp.html" class="btn btn-primary">📱 Web App</a>
                    <a href="/admin.html" class="btn">📊 Admin Panel</a>
                </div>
                
                <div class="stats">
                    <div class="stat-item">
                        <span class="stat-number">${ADMIN_IDS.length}</span>
                        <span class="stat-label">Adminlar</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${CHANNELS.length}</span>
                        <span class="stat-label">Kanallar</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">24/7</span>
                        <span class="stat-label">Ishlash</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">v2.0</span>
                        <span class="stat-label">Versiya</span>
                    </div>
                </div>
                
                <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <p style="font-size: 0.9rem; opacity: 0.8;">
                        👨‍💻 <a href="https://t.me/Abdulloh_Ummati_Muhammad" 
                           style="color: #FFD700; text-decoration: none;">
                           Abdulloh Ummati Muhammad
                        </a>
                    </p>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 🌐 WEBHOOK ENDPOINT
app.post('/webhook', (req, res) => {
    console.log('📨 Webhook so\'rov keldi');
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

// 📱 WEB APP SAHIFASI
app.get('/webapp.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'webapp.html'));
});

// 📊 ADMIN PANEL SAHIFASI
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
    console.log(`\n🚀 KANALGA XABAR YUBORISH BOSHlandi...`);
    
    for (const channel of CHANNELS) {
        try {
            console.log(`📤 "${channel}" kanaliga xabar yuborilmoqda...`);
            
            // Kanalni tekshirish
            const chat = await bot.getChat(channel);
            console.log(`✅ Kanal topildi: "${chat.title}"`);
            
            // Xabar yuborish
            const result = await bot.sendMessage(channel, message);
            console.log(`🎉 Xabar MUVAFFAQIYATLI yuborildi! ID: ${result.message_id}`);
            
            results.push({ 
                channel, 
                success: true, 
                messageId: result.message_id,
                channelTitle: chat.title
            });
            
        } catch (error) {
            console.error(`❌ XATOLIK: "${channel}" kanalida:`, error.message);
            results.push({ 
                channel, 
                success: false, 
                error: error.message 
            });
        }
    }
    
    // Natijalarni ko'rsatish
    console.log(`\n📊 YAKUNIY NATIJA:`);
    results.forEach(result => {
        if (result.success) {
            console.log(`   ✅ ${result.channel}: MUVAFFAQIYATLI`);
        } else {
            console.log(`   ❌ ${result.channel}: XATO - ${result.error}`);
        }
    });
    
    return results;
}

// =============================================
// 🤖 TELEGRAM BOT KOMANDALARI
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
                    text: '📊 Admin Panelni Ochish',
                    web_app: { url: `https://islomxon-namoz-bot.onrender.com/admin.html` }
                }
            ],
            [
                {
                    text: '👨‍💻 Yordam Kerakmi?',
                    url: 'https://t.me/Abdulloh_Ummati_Muhammad'
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

// 🆔 /id KOMANDASI
bot.onText(/\/id/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.first_name || 'Foydalanuvchi';
    
    bot.sendMessage(chatId,
        `👤 *Ma'lumotlaringiz:*\\n\\n` +
        `🆔 ID: *${userId}*\\n` +
        `📛 Ism: *${userName}*\\n` +
        `👑 Holat: *${isAdmin(userId) ? 'Admin ✅' : 'Foydalanuvchi'}*\\n\\n` +
        `💡 Bu ID ni admin panelida ko'rasiz.`,
        { parse_mode: 'Markdown' }
    );
});

// ℹ️ /help KOMANDASI
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpMessage = `
🆘 *Yordam Bo'limi*

🎯 *Mavjud Komandalar:*
• /start - Botni ishga tushirish
• /id - Shaxsiy ID ni ko'rish  
• /help - Yordam olish

📱 *Web App:*
• Namoz vaqtlarini kiriting
• Post ko'rinishini ko'ring
• Kanallarga yuboring

📊 *Admin Panel:*
• Statistika ko'ring
• Foydalanuvchilarni boshqaring
• Sozlamalarni o'zgartiring

👨‍💻 *Qo'llab-quvvatlash:*
Agar muammo bo'lsa, @Abdulloh_Ummati_Muhammad ga yozing.
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// =============================================
// 📨 WEB APP API ENDPOINTLARI
// =============================================

// 📝 NAMOZ VAQTLARINI QABUL QILISH
app.post('/submit-prayer-times', express.json(), async (req, res) => {
    try {
        console.log('\n📨 📨 📨 YANGI WEBAPP SO\'ROV KELDI!');
        console.log('📝 Ma\'lumotlar:', JSON.stringify(req.body, null, 2));

        const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

        // 🔐 USER ID TEKSHIRISH
        if (!userId) {
            console.log('❌ User ID topilmadi');
            return res.status(400).json({ 
                success: false, 
                error: 'User ID topilmadi. Iltimos, qaytadan urinib ko\'ring.' 
            });
        }

        // 🔐 ADMIN TEKSHIRISH
        if (!isAdmin(userId)) {
            console.log(`❌ User ${userId} admin emas`);
            return res.status(403).json({ 
                success: false, 
                error: 'Kechirasiz, faqat adminlar namoz vaqtlarini yuborishi mumkin.' 
            });
        }

        console.log(`✅ User ${userId} admin sifatida tanishdi`);

        // 📋 MAYdonlarni tekshirish
        const requiredFields = { bomdod, peshin, asr, shom, hufton, sana };
        const emptyFields = Object.entries(requiredFields)
            .filter(([key, value]) => !value)
            .map(([key]) => key);

        if (emptyFields.length > 0) {
            console.log('❌ Maydonlar to\'ldirilmagan:', emptyFields);
            return res.status(400).json({ 
                success: false, 
                error: `Quyidagi maydonlarni to'ldiring: ${emptyFields.join(', ')}` 
            });
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

${izoh ? `💫 *Izoh:* ${izoh}\\n\\n` : ''}_"Namozni ado etganingizdan so'ng Allohni eslang."_ 
*(Niso surasi, 103-oyat)*

👨‍💻 @Islomxon_Masjidi_Namoz_Vaqti_Bot`;

        console.log('📋 TAYYOR XABAR:');
        console.log(message);

        // 🚀 KANALLARGA YUBORISH
        console.log('\n🚀 KANALLARGA YUBORISH BOSHlandi...');
        const results = await sendToChannels(message);

        // 📊 NATIJALARNI HISOBLASH
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;

        console.log(`\n📊 UMUMIY NATIJA: ${successCount}/${totalCount} kanalga yuborildi`);

        // ✅ JAVOB QAYTARISH
        res.json({
            success: successCount > 0,
            message: successCount > 0 ? 
                `🎉 Tabriklayman! Xabar ${successCount} ta kanalga muvaffaqiyatli yuborildi!` :
                `❌ Afsuski, xabar hech qanday kanalga yuborilmadi.`,
            details: results,
            timestamp: new Date().toLocaleString('uz-UZ')
        });

    } catch (error) {
        console.error('❌ ❌ ❌ UMUMIY XATO:', error);
        console.error('🔧 Xato stack:', error.stack);
        res.status(500).json({ 
            success: false, 
            error: `Server xatosi: ${error.message}`,
            timestamp: new Date().toLocaleString('uz-UZ')
        });
    }
});

// 📊 API - STATISTIKA
app.get('/api/stats', (req, res) => {
    const stats = {
        totalUsers: ADMIN_IDS.length,
        totalMessages: 15, // Bu keyin haqiqiy ma'lumot bilan to'ldiriladi
        activeUsers: ADMIN_IDS.length,
        channels: CHANNELS.length,
        botUptime: Math.floor(process.uptime()),
        lastUpdate: new Date().toLocaleString('uz-UZ'),
        version: '2.0'
    };
    res.json(stats);
});

// 👥 API - FOYDALANUVCHILAR
app.get('/api/users', (req, res) => {
    const users = ADMIN_IDS.map(id => ({
        id: id,
        name: 'Admin',
        status: 'active',
        isAdmin: true,
        lastActive: new Date().toLocaleString('uz-UZ')
    }));
    res.json(users);
});

// =============================================
// 🎉 SERVERNI ISHGA TUSHIRISH
// =============================================

app.listen(PORT, () => {
    console.log('\n' +
        '🎉 ==========================================\\n' +
        '✅ ISLOMXON NAMOZ VAQTI BOT ISHGA TUSHDI!\\n' +
        '📍 Port: ' + PORT + '\\n' +
        '🌐 Asosiy sahifa: https://islomxon-namoz-bot.onrender.com\\n' +
        '📱 Web App: https://islomxon-namoz-bot.onrender.com/webapp.html\\n' +
        '📊 Admin Panel: https://islomxon-namoz-bot.onrender.com/admin.html\\n' +
        '📢 Kanallar: ' + CHANNELS.join(', ') + '\\n' +
        '👤 Adminlar: ' + ADMIN_IDS.join(', ') + '\\n' +
        '🕒 Boshlanish vaqti: ' + new Date().toLocaleString('uz-UZ') + '\\n' +
        '🚀 Versiya: 2.0 - Professional\\n' +
        '🎉 ==========================================\\n'
    );
    
    // 🔄 AVTOMATIK PING - BOTNI USHLAB TURISH
    setInterval(() => {
        console.log('🔄 Avtomatik ping - Bot faol');
    }, 300000); // 5 daqiqa
});

// =============================================
// 🛡️ XATO BOSHQARUVI
// =============================================

process.on('uncaughtException', (error) => {
    console.error('❌ Kutilmagan xato:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Boshqarilmagan rad etish:', reason);
});
