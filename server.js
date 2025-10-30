const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';

// ✅ YANGILANGAN ADMINLAR RO'YXATI
const ADMIN_IDS = [7894421569, 5985723887, 382697989];
const CHANNELS = ['@Islomxon_masjidi'];

// ✅ POLLING YOQILGAN HOLATDA
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

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
        <p>✅ Bot ishlayapti</p>
        <p>👥 Adminlar: ${ADMIN_IDS.join(', ')}</p>
        <p><a href="/webapp.html" style="color: #ffd700;">📱 Web App ni ochish</a></p>
      </div>
    </body>
    </html>
  `);
});

function isAdmin(userId) {
  return ADMIN_IDS.includes(Number(userId));
}

// ✅ SODDA /start KOMANDASI
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'Foydalanuvchi';

  console.log(`🎯 /start bosildi: ${userId} (${userName})`);

  if (isAdmin(userId)) {
    console.log(`✅ ${userId} admin sifatida tanishdi`);
    
    bot.sendMessage(chatId, `Assalomu alaykum ${userName}! 👋\n\n🕌 Islomxon Jome Masjidi botiga xush kelibsiz!\n\n📱 Namoz vaqtlarini yuborish uchun quyidagi tugmani bosing:`, {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '🕌 Namoz Vaqtlarini Yuborish',
            web_app: { url: 'https://islomxon-namoz-bot.onrender.com/webapp.html' }
          }
        ]]
      },
      parse_mode: 'Markdown'
    });
    
  } else {
    console.log(`❌ ${userId} admin emas`);
    bot.sendMessage(chatId, `🕌 Islomxon Jome Masjidi\n\n❌ Kechirasiz, bu bot faqat adminlar uchun.\n\n👥 Adminlar: ${ADMIN_IDS.join(', ')}`);
  }
});

// ✅ TEST KOMANDASI
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  bot.sendMessage(chatId, `✅ Bot ishlayapti!\n\nSizning ID: ${userId}\nAdminmi: ${isAdmin(userId) ? 'HA' : 'YO\'Q'}`);
});

// ✅ /id KOMANDASI
bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  bot.sendMessage(chatId, `🆔 Sizning Telegram ID: \`${userId}\`\n\n👤 Ism: ${msg.from.first_name || 'Noma\'lum'}`, {
    parse_mode: 'Markdown'
  });
});

// Web App ma'lumotlarini qabul qilish
app.post('/submit-prayer-times', express.json(), async (req, res) => {
  try {
    console.log('\n📨 WebApp so\'rov keldi');
    
    const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID topilmadi' });
    }

    if (!isAdmin(userId)) {
      return res.status(403).json({ success: false, error: 'Faqat adminlar uchun' });
    }

    // Ma'lumotlarni tekshirish
    if (!bomdod || !peshin || !asr || !shom || !hufton || !sana) {
      return res.status(400).json({ success: false, error: 'Barcha maydonlarni to\'ldiring' });
    }

    // Formatlash
    const message = `🕌 Islomxon Jome Masjidi\n📅 ${sana}\n\n🕒 Namoz Vaqtlari:\n\n🌅 Bomdod: ${bomdod}\n☀️ Peshin: ${peshin}\n🌤️ Asr: ${asr}\n🌇 Shom: ${shom}\n🌙 Hufton: ${hufton}\n\n${izoh ? `💫 Izoh: ${izoh}\n\n` : ''}📍 Hududingiz uchun to'g'ri vaqtda ibodatni ado eting. Alloh har bir qadamimizni savobli qilsin!`;

    console.log('📤 Kanalga post yuborilmoqda...');
    
    // Kanalga post yuborish
    await bot.sendMessage('@Islomxon_masjidi', message);

    res.json({ 
      success: true, 
      message: '✅ Post kanalga muvaffaqiyatli yuborildi!' 
    });

  } catch (error) {
    console.error('❌ Xato:', error);
    res.status(500).json({ success: false, error: `Xato: ${error.message}` });
  }
});

// Web App sahifasi
app.get('/webapp.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp.html'));
});

// Xato boshqaruvi
bot.on('polling_error', (error) => {
  console.log('❌ Polling xatosi:', error.message);
});

bot.on('error', (error) => {
  console.log('❌ Bot xatosi:', error);
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`\n🎉 ==========================================`);
  console.log(`✅ Server ${PORT}-portda ishga tushdi`);
  console.log(`🤖 Bot polling rejimida ishlayapti`);
  console.log(`🌐 WebApp: https://islomxon-namoz-bot.onrender.com/webapp.html`);
  console.log(`👥 Adminlar: ${ADMIN_IDS.join(', ')}`);
  console.log(`🎉 ==========================================\n`);
});
