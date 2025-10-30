const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express(); // ⬅️ BU YERDA APP ANIQLANADI
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const ADMIN_IDS = [7894421569, 5985723887];
const CHANNELS = ['@Islomxon_masjidi'];

const bot = new TelegramBot(BOT_TOKEN);

app.use(express.json());

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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        <p>Bot muvaffaqiyatli ishlamoqda!</p>
        <p><a href="/webapp.html" style="color: #ffd700;">Web App ni ochish</a></p>
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

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

async function sendToChannels(message) {
  const results = [];
  for (const channel of CHANNELS) {
    try {
      console.log(`📤 ${channel} kanaliga xabar yuborilmoqda...`);
      const result = await bot.sendMessage(channel, message, { parse_mode: 'HTML' });
      console.log(`✅ ${channel} kanaliga xabar yuborildi`);
      results.push({ channel, success: true, messageId: result.message_id });
    } catch (error) {
      console.error(`❌ ${channel} kanaliga xabar yuborishda xatolik:`, error.message);
      results.push({ channel, success: false, error: error.message });
    }
  }
  return results;
}

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    return bot.sendMessage(chatId, '❌ Faqat admin');
  }

  const keyboard = {
    inline_keyboard: [[
      {
        text: '🕌 Namoz vaqtlarini yuborish',
        web_app: { url: `https://islomxon-namoz-bot.onrender.com/webapp.html` }
      }
    ]]
  };

  bot.sendMessage(chatId, `Assalomu alaykum! *Islomxon Namoz Vaqti Bot* ga xush kelibsiz!\n\nNamoz vaqtlarini yuborish uchun quyidagi tugmani bosing:`, {
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
    console.log('📨 Yangi soʻrov keldi:', req.body);

    const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

    if (!isAdmin(userId)) {
      console.log('❌ Admin emas:', userId);
      return res.status(403).json({ success: false, error: 'Faqat admin' });
    }

    // Ma'lumotlarni tekshirish
    if (!bomdod || !peshin || !asr || !shom || !hufton || !sana) {
      return res.status(400).json({ success: false, error: 'Barcha maydonlarni toʻldiring' });
    }

    // Formatlash
    const message = `🕌 *Islomxon Jome Masjidi*\n📅 ${sana}\n\n🕒 *Namoz Vaqtlari:*\n\n🌅 *Bomdod:* ${bomdod}\n☀️ *Peshin:* ${peshin}\n🌤️ *Asr:* ${asr}\n🌇 *Shom:* ${shom}\n🌙 *Hufton:* ${hufton}\n\n${izoh ? `💫 *Izoh:* ${izoh}\n\n` : ''}*"Namozni ado etganingizdan so'ng Allohni eslang."* (Niso 103)`;

    console.log('📝 Yuborilayotgan xabar:', message);

    // Kanallarga yuborish
    const results = await sendToChannels(message);

    // Natijani hisoblash
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`📊 Natija: ${successCount}/${totalCount} kanalga yuborildi`);

    res.json({
      success: true,
      message: `Xabar ${successCount}/${totalCount} kanalga muvaffaqiyatli yuborildi`,
      details: results
    });

  } catch (error) {
    console.error('❌ Umumiy xato:', error);
    res.status(500).json({ success: false, error: `Xato: ${error.message}` });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`✅ Server ${PORT}-portda ishga tushdi`);
  console.log(`🌐 Asosiy sahifa: https://islomxon-namoz-bot.onrender.com`);
  console.log(`🤖 Web App: https://islomxon-namoz-bot.onrender.com/webapp.html`);
});
