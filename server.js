const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const BOT_TOKEN = process.env.BOT_TOKEN || '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const ADMIN_IDS = [7894421569, 5985723887];
const CHANNELS = ['@Islomxon_masjidi']; // ✅ TO'G'RI USERNAME

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

// DEBUG QO'SHILGAN FUNKSIYA
async function sendToChannels(message) {
  const results = [];
  console.log(`\n🔍 DEBUG: ${CHANNELS.length} kanalga xabar yuborilmoqda...`);
  
  for (const channel of CHANNELS) {
    try {
      console.log(`\n📋 DEBUG: Kanal "${channel}" tekshirilmoqda...`);
      
      // Kanal mavjudligini tekshirish
      console.log(`🔍 DEBUG: getChat(${channel}) chaqirilmoqda...`);
      const chat = await bot.getChat(channel);
      console.log(`✅ DEBUG: Kanal topildi: "${chat.title}" (ID: ${chat.id})`);
      
      // Bot huquqlarini tekshirish
      console.log(`🔍 DEBUG: getChatMember chaqirilmoqda...`);
      const chatMember = await bot.getChatMember(channel, bot.options.polling.params ? bot.options.polling.params.id : (await bot.getMe()).id);
      console.log(`✅ DEBUG: Bot holati: ${chatMember.status}`);
      
      if (chatMember.status !== 'administrator' && chatMember.status !== 'creator') {
        throw new Error(`Bot kanalda admin emas! Bot holati: ${chatMember.status}`);
      }
      
      console.log(`✅ DEBUG: Bot kanalda admin`);
      
      // Xabar yuborish
      console.log(`📤 DEBUG: Xabar yuborilmoqda...`);
      const result = await bot.sendMessage(channel, message, { parse_mode: 'HTML' });
      console.log(`🎉 DEBUG: Xabar MUVAFFAQIYATLI yuborildi! Message ID: ${result.message_id}`);
      
      results.push({ channel, success: true, messageId: result.message_id });
      
    } catch (error) {
      console.error(`❌ DEBUG: XATOLIK "${channel}" kanalida:`, error.message);
      console.error(`🔧 DEBUG: Xato tafsilotlari:`, {
        code: error.code,
        response: error.response,
        parameters: error.parameters
      });
      results.push({ channel, success: false, error: error.message });
    }
  }
  
  console.log(`\n📊 DEBUG: Yakuniy natija:`);
  results.forEach(result => {
    if (result.success) {
      console.log(`   ✅ ${result.channel}: MUVAFFAQIYATLI`);
    } else {
      console.log(`   ❌ ${result.channel}: XATO - ${result.error}`);
    }
  });
  
  return results;
}

// /start komandasi
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  console.log(`🔔 /start komandasi: User ${userId}, Chat ${chatId}`);

  if (!isAdmin(userId)) {
    console.log(`❌ Foydalanuvchi ${userId} admin emas`);
    return bot.sendMessage(chatId, '❌ Faqat admin');
  }

  console.log(`✅ Foydalanuvchi ${userId} admin`);

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
  console.log(`🆔 /id komandasi: User ${userId}`);
  bot.sendMessage(chatId, `Sizning ID: ${userId}`);
});

// Web App ma'lumotlarini qabul qilish
app.post('/submit-prayer-times', express.json(), async (req, res) => {
  try {
    console.log('\n📨 DEBUG: Yangi WebApp soʻrov keldi');
    console.log('📝 DEBUG: Soʻrov body:', JSON.stringify(req.body, null, 2));

    const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId } = req.body;

    if (!userId) {
      console.log('❌ DEBUG: User ID yoʻq');
      return res.status(400).json({ success: false, error: 'User ID topilmadi' });
    }

    if (!isAdmin(userId)) {
      console.log(`❌ DEBUG: User ${userId} admin emas`);
      return res.status(403).json({ success: false, error: 'Faqat admin' });
    }

    console.log(`✅ DEBUG: User ${userId} admin`);

    // Ma'lumotlarni tekshirish
    if (!bomdod || !peshin || !asr || !shom || !hufton || !sana) {
      console.log('❌ DEBUG: Barcha maydonlar toʻldirilmagan');
      return res.status(400).json({ success: false, error: 'Barcha maydonlarni toʻldiring' });
    }

    // Formatlash
    const message = `🕌 *Islomxon Jome Masjidi*\n📅 ${sana}\n\n🕒 *Namoz Vaqtlari:*\n\n🌅 *Bomdod:* ${bomdod}\n☀️ *Peshin:* ${peshin}\n🌤️ *Asr:* ${asr}\n🌇 *Shom:* ${shom}\n🌙 *Hufton:* ${hufton}\n\n${izoh ? `💫 *Izoh:* ${izoh}\n\n` : ''}*"Namozni ado etganingizdan so'ng Allohni eslang."* (Niso 103)`;

    console.log('📝 DEBUG: Yuborilayotgan xabar:');
    console.log(message);

    // Kanallarga yuborish
    console.log('\n🚀 DEBUG: Kanallarga yuborish boshlandi...');
    const results = await sendToChannels(message);

    // Natijani hisoblash
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`\n📊 DEBUG: Yakuniy hisobot: ${successCount}/${totalCount} kanalga yuborildi`);

    res.json({
      success: successCount > 0,
      message: `Xabar ${successCount}/${totalCount} kanalga muvaffaqiyatli yuborildi`,
      details: results
    });

  } catch (error) {
    console.error('❌ DEBUG: Umumiy xato:', error);
    console.error('🔧 DEBUG: Xato stack:', error.stack);
    res.status(500).json({ success: false, error: `Xato: ${error.message}` });
  }
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`\n🎉 ==========================================`);
  console.log(`✅ Server ${PORT}-portda ishga tushdi`);
  console.log(`🌐 Asosiy sahifa: https://islomxon-namoz-bot.onrender.com`);
  console.log(`🤖 Web App: https://islomxon-namoz-bot.onrender.com/webapp.html`);
  console.log(`📊 Kanallar: ${CHANNELS.join(', ')}`);
  console.log(`👤 Adminlar: ${ADMIN_IDS.join(', ')}`);
  console.log(`🎉 ==========================================\n`);
});
