const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';

const ADMIN_IDS = [7894421569, 5985723887, 382697989];
const CHANNELS = ['@Islomxon_masjidi'];

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

app.use(express.json());

// ==================== ROUTELAR ====================

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
        .links a {
          display: block;
          margin: 10px 0;
          padding: 15px;
          background: rgba(255,255,255,0.2);
          border-radius: 8px;
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .links a:hover {
          background: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🕌 Islomxon Namoz Vaqti Bot</h1>
        <p>✅ Bot ishlayapti</p>
        <div class="links">
          <a href="/webapp.html">📱 Web App - Namoz Vaqtlarini Yuborish</a>
          <a href="/admin">🛠️ Admin Panel - Boshqaruv</a>
        </div>
        <p style="margin-top: 20px;">👥 Adminlar: ${ADMIN_IDS.join(', ')}</p>
      </div>
    </body>
    </html>
  `);
});

// WEB APP SAHIFASI
app.get('/webapp.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'webapp.html'));
});

// ADMIN PANEL SAHIFASI
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ==================== BOT FUNKSIYALARI ====================

function isAdmin(userId) {
  return ADMIN_IDS.includes(Number(userId));
}

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const userName = msg.from.first_name || 'Foydalanuvchi';

  console.log(`🎯 /start bosildi: ${userId} (${userName})`);

  if (isAdmin(userId)) {
    console.log(`✅ ${userId} admin sifatida tanishdi`);
    
    bot.sendMessage(chatId, `Assalomu alaykum ${userName}! 👋\n\n🕌 *Islomxon Jome Masjidi* botiga xush kelibsiz!\n\nQuyidagi tugmalardan foydalaning:`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '📱 Namoz Vaqtlarini Yuborish',
              web_app: { url: 'https://islomxon-namoz-bot.onrender.com/webapp.html' }
            }
          ],
          [
            {
              text: '🛠️ Admin Panel',
              web_app: { url: 'https://islomxon-namoz-bot.onrender.com/admin' }
            }
          ]
        ]
      },
      parse_mode: 'Markdown'
    });
    
  } else {
    console.log(`❌ ${userId} admin emas`);
    bot.sendMessage(chatId, `🕌 Islomxon Jome Masjidi\n\n❌ Kechirasiz, bu bot faqat adminlar uchun.\n\n👥 Adminlar: ${ADMIN_IDS.join(', ')}`);
  }
});

// /test komandasi
bot.onText(/\/test/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  
  bot.sendMessage(chatId, `✅ Bot ishlayapti!\n\nSizning ID: ${userId}\nAdminmi: ${isAdmin(userId) ? 'HA' : 'YO\'Q'}`);
});

// /id komandasi
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
    if (!bomdod || !peshin || !asr || !shom || !xufton || !sana) {
      return res.status(400).json({ success: false, error: 'Barcha maydonlarni to\'ldiring' });
    }

    // Formatlash
    const message = `🕌 Islomxon Jome Masjidi\n📅 ${sana}\n\n🕒 Namoz Vaqtlari:\n\n🌅 Bomdod: ${bomdod}\n☀️ Peshin: ${peshin}\n🌤️ Asr: ${asr}\n🌇 Shom: ${shom}\n🌙 Xufton: ${hufton}\n\n${izoh ? `💫 Izoh: ${izoh}\n\n` : ''}📍 Hududingiz uchun to'g'ri vaqtda ibodatni ado eting. Alloh har bir qadamimizni savobli qilsin!`;

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
  console.log(`🌐 Asosiy sahifa: https://islomxon-namoz-bot.onrender.com`);
  console.log(`📱 WebApp: https://islomxon-namoz-bot.onrender.com/webapp.html`);
  console.log(`🛠️ Admin Panel: https://islomxon-namoz-bot.onrender.com/admin`);
  console.log(`👥 Adminlar: ${ADMIN_IDS.join(', ')}`);
  console.log(`🎉 ==========================================\n`);
});
