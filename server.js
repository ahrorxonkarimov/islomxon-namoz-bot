const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const PORT = process.env.PORT || 3000;

// Bot token
const TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const bot = new TelegramBot(TOKEN, { polling: false });

// Adminlar ro'yxati
const ADMINS = [5985723887, 382697989];

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Webhook endpoint
app.post(`/webhook/${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// WebApp uchun endpoint
app.post('/submit-prayer-times', async (req, res) => {
  try {
    const { userId, bomdod, quyosh, peshin, asr, shom, xufton } = req.body;
    
    // Admin tekshirish
    if (!ADMINS.includes(parseInt(userId))) {
      return res.status(403).json({ error: 'Faqat adminlar kirishi mumkin' });
    }

    // Kanalga post yuborish
    const message = `🕌 ISLOMXON JOME MASJIDI\n\n🕐 Namoz Vaqtlari:\n\n🌄 Bomdod: ${bomdod}\n☀️ Quyosh: ${quyosh}\n🏙 Peshin: ${peshin}\n🌅 Asr: ${asr}\n🌇 Shom: ${shom}\n🌙 Xufton: ${xufton}\n\n⏳ Namozni ado etganingizdan so'ng, Allohni turgan, o'tirgan va yonboshlagan holingizda eslang. Xotirjam bo'lganingizda namozni to'liq ado eting. Albatta, namoz mo'minlarga vaqtida farz qilingandir. (Niso surasi 103-oyat)\n\n📍 Hududingiz uchun to'g'ri vaqtda ibodatni ado eting. Alloh har bir qadamimizni savobli qilsin!`;

    await bot.sendMessage('@Islomxon_masjidi', message);
    
    res.json({ success: true, message: 'Namoz vaqtlari kanalga joylandi!' });
  } catch (error) {
    res.status(500).json({ error: 'Xatolik yuz berdi' });
  }
});

// Bot komandalari
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  if (ADMINS.includes(msg.from.id)) {
    const webAppUrl = `https://your-app-url.onrender.com/webapp.html`;
    bot.sendMessage(chatId, `👋 Admin, xush kelibsiz!\n\nNamoz vaqtlarini kiritish uchun:`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "📱 Namoz Vaqtlarini Kiritish", web_app: { url: webAppUrl } }]
        ]
      }
    });
  } else {
    bot.sendMessage(chatId, `🕌 ISLOMXON JOME MASJIDI\n\nKanalimiz: @Islomxon_masjidi\n\nBot faqat adminlar uchun`);
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda`);
});
