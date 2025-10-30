const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const ADMIN_IDS = [7894421569, 5985723887];
const CHANNELS = ['@Islomxon_masjidi'];

const bot = new TelegramBot(BOT_TOKEN);

app.use(express.json());

// ✅ PING ENDPOINT - BOTNI USHLAB TURISH UCHUN
app.get('/ping', (req, res) => {
  console.log('🏓 Ping qabul qilindi - Bot faol');
  res.json({ 
    status: 'ok', 
    message: 'Bot faol', 
    time: new Date().toLocaleString('uz-UZ')
  });
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
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// Web App sahifasi
app.get('/webapp.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp.html'));
});

// ✅ YANGI: Admin sahifasi
app.get('/admin.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ✅ YANGI: Admin statistikasi API
app.get('/api/stats', (req, res) => {
  res.json({
    totalUsers: 125,
    totalMessages: 47,
    activeUsers: 89,
    channels: 1,
    lastUpdate: new Date().toLocaleString('uz-UZ')
  });
});

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

async function sendToChannels(message) {
  const results = [];
  console.log(`\n🔍 DEBUG: ${CHANNELS.length} kanalga xabar yuborilmoqda...`);
  
  for (const channel of CHANNELS) {
    try {
      console.log(`\n📋 DEBUG: Kanal "${channel}" tekshirilmoqda...`);
      
      const chat = await bot.getChat(channel);
      console.log(`✅ DEBUG: Kanal topildi: "${chat.title}"`);
      
      console.log(`📤 DEBUG: Xabar yuborilmoqda...`);
      const result = await bot.sendMessage(channel, message);
      console.log(`🎉 DEBUG: Xabar MUVAFFAQIYATLI yuborildi!`);
      
      results.push({ channel, success: true, messageId: result.message_id });
      
    } catch (error) {
      console.error(`❌ DEBUG: XATOLIK "${channel}" kanalida:`, error.message);
      results.push({ channel, success: false, error: error.message });
    }
  }
  
  return results;
}

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  console.log(`🔔 /start komandasi: User ${userId}`);

  if (!isAdmin(userId)) {
    console.log(`❌ Foydalanuvchi ${userId} admin emas`);
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

  bot.sendMessage(chatId, `Assalomu alaykum! *Islomxon Namoz Vaqti Bot* ga xush kelibsiz!\n\nBotni boshqarish uchun quyidagi tugmalardan foydalaning:`, {
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
    console.log('\n📨 DEBUG: Yangi WebApp soʻrov keldi');

    const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

    if (!isAdmin(userId)) {
      return res.status(403).json({ success: false, error: 'Faqat admin' });
    }

    if (!bomdod || !peshin || !asr || !shom || !hufton || !sana) {
      return res.status(400).json({ success: false, error: 'Barcha maydonlarni toʻldiring' });
    }

    // POST FORMATI
    const message = `🕌 Islomxon Jome Masjidi
📅 ${sana}

🕒 Namoz Vaqtlari:

🌅 Bomdod: ${bomdod}
☀️ Peshin: ${peshin}
🌤️ Asr: ${asr}
🌇 Shom: ${shom}
🌙 Hufton: ${hufton}

${izoh ? `💫 Izoh: ${izoh}\n\n` : ''}"Namozni ado etganingizdan so'ng Allohni eslang." (Niso 103)`;

    console.log('🚀 DEBUG: Kanallarga yuborish boshlandi...');
    const results = await sendToChannels(message);

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    res.json({
      success: successCount > 0,
      message: `Xabar ${successCount}/${totalCount} kanalga muvaffaqiyatli yuborildi`,
      details: results
    });

  } catch (error) {
    console.error('❌ DEBUG: Umumiy xato:', error);
    res.status(500).json({ success: false, error: `Xato: ${error.message}` });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`\n🎉 ==========================================`);
  console.log(`✅ Server ${PORT}-portda ishga tushdi`);
  console.log(`🌐 Asosiy sahifa: https://islomxon-namoz-bot.onrender.com`);
  console.log(`🤖 Web App: https://islomxon-namoz-bot.onrender.com/webapp.html`);
  console.log(`📊 Admin Panel: https://islomxon-namoz-bot.onrender.com/admin.html`);
  console.log(`📊 Kanallar: ${CHANNELS.join(', ')}`);
  console.log(`👤 Adminlar: ${ADMIN_IDS.join(', ')}`);
  console.log(`🎉 ==========================================\n`);
});
