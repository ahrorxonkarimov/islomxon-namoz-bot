const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const ADMIN_IDS = [7894421569, 5985723887];
const CHANNELS = ['@Islomxon_masjidi'];

// Botni yaratish
const bot = new TelegramBot(BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ PING ENDPOINT
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
        <p><a href="/webapp.html" style="color: #ffd700;">Web App ni ochish</a></p>
        <p><a href="/admin.html" style="color: #ffd700;">Admin Paneli</a></p>
      </div>
    </body>
    </html>
  `);
});

// Webhook endpoint
app.post('/webhook', (req, res) => {
  console.log('📨 Webhook so\'rov keldi');
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Web App sahifasi
app.get('/webapp.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp.html'));
});

// Admin sahifasi
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Admin statistikasi API
app.get('/api/stats', (req, res) => {
  res.json({
    totalUsers: 1,
    totalMessages: 1,
    activeUsers: 1,
    channels: CHANNELS.length,
    lastUpdate: new Date().toLocaleString('uz-UZ')
  });
});

// Foydalanuvchilar API
app.get('/api/users', (req, res) => {
  res.json([
    { id: 5985723887, name: 'Admin', status: 'active', isAdmin: true }
  ]);
});

// Admin tekshiruvi
function isAdmin(userId) {
  return ADMIN_IDS.includes(parseInt(userId));
}

// Kanalga xabar yuborish
async function sendToChannels(message) {
  const results = [];
  
  for (const channel of CHANNELS) {
    try {
      console.log(`📤 "${channel}" kanaliga xabar yuborilmoqda...`);
      
      // Kanalni tekshirish
      await bot.getChat(channel);
      
      // Xabar yuborish
      const result = await bot.sendMessage(channel, message);
      console.log(`✅ "${channel}" kanaliga xabar yuborildi`);
      
      results.push({ channel, success: true, messageId: result.message_id });
      
    } catch (error) {
      console.error(`❌ "${channel}" kanaliga xabar yuborishda xato:`, error.message);
      results.push({ channel, success: false, error: error.message });
    }
  }
  
  return results;
}

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  console.log(`🔔 /start: ${userId}`);

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
          text: '📊 Admin Paneli',
          web_app: { url: `https://islomxon-namoz-bot.onrender.com/admin.html` }
        }
      ]
    ]
  };

  bot.sendMessage(chatId, `Assalomu alaykum! *Islomxon Namoz Vaqti Bot* ga xush kelibsiz!\\n\\nBotni boshqarish uchun quyidagi tugmalardan foydalaning:`, {
    reply_markup: keyboard,
    parse_mode: 'Markdown'
  });
});

// /id komandasi
bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  bot.sendMessage(chatId, `Sizning ID: ${userId}`);
});

// Web App ma'lumotlarini qabul qilish
app.post('/submit-prayer-times', express.json(), async (req, res) => {
  try {
    console.log('📨 WebApp so\'rov keldi:', req.body);

    const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

    // User ID ni tekshirish
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID topilmadi' });
    }

    // Admin tekshiruvi
    if (!isAdmin(userId)) {
      return res.status(403).json({ success: false, error: 'Faqat admin' });
    }

    // Maydonlarni tekshirish
    if (!bomdod || !peshin || !asr || !shom || !hufton || !sana) {
      return res.status(400).json({ success: false, error: 'Barcha maydonlarni to\'ldiring' });
    }

    // Xabar formatlash
    const message = `🕌 Islomxon Jome Masjidi
📅 ${sana}

🕒 Namoz Vaqtlari:

🌅 Bomdod: ${bomdod}
☀️ Peshin: ${peshin}
🌤️ Asr: ${asr}
🌇 Shom: ${shom}
🌙 Hufton: ${hufton}

${izoh ? `💫 Izoh: ${izoh}\\n\\n` : ''}"⏳Namozni ado etganingizdan so‘ng, Allohni turgan, o‘tirgan va yonboshlagan holingizda eslang. Xotirjam bo‘lganingizda namozni to‘liq ado eting. Albatta, namoz mo‘minlarga vaqtida farz qilingandir. (Niso surasi 103-oyat)`;

    console.log('📝 Xabar tayyor:', message);

    // Kanallarga yuborish
    const results = await sendToChannels(message);

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    res.json({
      success: successCount > 0,
      message: `Xabar ${successCount}/${totalCount} kanalga yuborildi`,
      details: results
    });

  } catch (error) {
    console.error('❌ Xato:', error);
    res.status(500).json({ success: false, error: `Server xatosi: ${error.message}` });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`\\n🎉 ==========================================`);
  console.log(`✅ Server ${PORT}-portda ishga tushdi`);
  console.log(`🌐 Asosiy: https://islomxon-namoz-bot.onrender.com`);
  console.log(`📱 WebApp: https://islomxon-namoz-bot.onrender.com/webapp.html`);
  console.log(`📊 Admin: https://islomxon-namoz-bot.onrender.com/admin.html`);
  console.log(`📢 Kanallar: ${CHANNELS.join(', ')}`);
  console.log(`👤 Adminlar: ${ADMIN_IDS.join(', ')}`);
  console.log(`🎉 ==========================================\\n`);
});
