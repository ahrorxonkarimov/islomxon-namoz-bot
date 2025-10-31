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

// ==================== TRANSLATIONS ====================

const translations = {
    uz: {
        // Lotin
        appTitle: "Islomxon Namoz Vaqti Bot",
        mainTitle: "🕌 Islomxon Namoz Vaqti Bot",
        botWorking: "✅ Bot ishlayapti",
        webAppLink: "📱 Web App - Namoz Vaqtlarini Yuborish",
        adminPanelLink: "🛠️ Admin Panel - Boshqaruv",
        adminsList: "👥 Adminlar",
        welcomeAdmin: "Assalomu alaykum {name}! 👋\n\n🕌 *Islomxon Jome Masjidi* botiga xush kelibsiz!\n\nQuyidagi tugmalardan foydalaning:",
        notAdmin: "🕌 Islomxon Jome Masjidi\n\n❌ Kechirasiz, bu bot faqat adminlar uchun.",
        sendPrayerTimes: "📱 Namoz Vaqtlarini Yuborish",
        adminPanel: "🛠️ Admin Panel",
        botTest: "✅ Bot ishlayapti!\n\nSizning ID: {userId}\nAdminmi: {isAdmin}",
        yourId: "🆔 Sizning Telegram ID: `{userId}`\n\n👤 Ism: {name}",
        postSuccess: "✅ Post kanalga muvaffaqiyatli yuborildi!",
        onlyAdmins: "Faqat adminlar uchun",
        fillAllFields: "Barcha maydonlarni to'ldiring",
        userNotFound: "User ID topilmadi",
        error: "Xato",
        // Namoz vaqtlari
        bomdod: "Bomdod",
        peshin: "Peshin", 
        asr: "Asr",
        shom: "Shom",
        xufton: "Xufton",
        sana: "Sana",
        izoh: "Izoh",
        prayerTimes: "Namoz Vaqtlari",
        todayQuote: "📍 Hududingiz uchun to'g'ri vaqtda ibodatni ado eting. Alloh har bir qadamimizni savobli qilsin!"
    },
    kr: {
        // Kirill
        appTitle: "Исломхон Намоз Вакти Бот",
        mainTitle: "🕌 Исломхон Намоз Вакти Бот",
        botWorking: "✅ Бот ишляямокда",
        webAppLink: "📱 Веб Апп - Намоз Вактларини Юбориш",
        adminPanelLink: "🛠️ Админ Панел - Бошкарув",
        adminsList: "👥 Админлар",
        welcomeAdmin: "Ассалому алайкум {name}! 👋\n\n🕌 *Исломхон Жоме Масжиди* ботига хуш келибсиз!\n\nҚуйидаги тугмалардан фойдаланинг:",
        notAdmin: "🕌 Исломхон Жоме Масжиди\n\n❌ Кечирасиз, бу бот фақат админлар учун.",
        sendPrayerTimes: "📱 Намоз Вактларини Юбориш",
        adminPanel: "🛠️ Админ Панел",
        botTest: "✅ Бот ишляямокда!\n\nСизнинг ID: {userId}\nАдминми: {isAdmin}",
        yourId: "🆔 Сизнинг Telegram ID: `{userId}`\n\n👤 Исм: {name}",
        postSuccess: "✅ Пост каналга муваффақиятли юборилди!",
        onlyAdmins: "Фақат админлар учун",
        fillAllFields: "Барча майдонларни тўлдиринг",
        userNotFound: "User ID топилмади",
        error: "Хато",
        // Namoz vaqtlari
        bomdod: "Бомдод",
        peshin: "Пешин",
        asr: "Аср",
        shom: "Шом",
        xufton: "Хуфтон",
        sana: "Сана",
        izoh: "Изоҳ",
        prayerTimes: "Намоз Вактлари",
        todayQuote: "📍 Ҳудудингиз учун тўғри вактда ибодатни адо этинг. Аллоҳ ҳар бир қадамизни савобли қилсин!"
    }
};

// Tilni aniqlash funksiyasi
function getLanguage(user) {
    if (user && user.language_code === 'uz') {
        return 'uz';
    }
    return 'kr'; // Default Kirill
}

// Matnni olish funksiyasi
function t(lang, key, params = {}) {
    let text = translations[lang][key] || translations['uz'][key] || key;
    
    // Parametrlarni almashtirish
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
}

// ==================== ROUTELAR ====================

// ASOSIY SAHIFA
app.get('/', (req, res) => {
    const lang = req.query.lang || 'uz';
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${t(lang, 'appTitle')}</title>
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
        .lang-switcher {
          margin: 20px 0;
        }
        .lang-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 15px;
          margin: 0 5px;
          border-radius: 5px;
          cursor: pointer;
        }
        .lang-btn.active {
          background: rgba(255,255,255,0.4);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>${t(lang, 'mainTitle')}</h1>
        <p>${t(lang, 'botWorking')}</p>
        
        <div class="lang-switcher">
          <button class="lang-btn ${lang === 'uz' ? 'active' : ''}" onclick="window.location='/?lang=uz'">Lotin</button>
          <button class="lang-btn ${lang === 'kr' ? 'active' : ''}" onclick="window.location='/?lang=kr'">Kirill</button>
        </div>
        
        <div class="links">
          <a href="/webapp.html?lang=${lang}">${t(lang, 'webAppLink')}</a>
          <a href="/admin?lang=${lang}">${t(lang, 'adminPanelLink')}</a>
        </div>
        <p style="margin-top: 20px;">${t(lang, 'adminsList')}: ${ADMIN_IDS.join(', ')}</p>
      </div>
    </body>
    </html>
  `);
});

// WEB APP SAHIFASI
app.get('/webapp.html', (req, res) => {
    const lang = req.query.lang || 'uz';
    res.sendFile(path.join(__dirname, 'webapp.html'));
});

// ADMIN PANEL SAHIFASI
app.get('/admin', (req, res) => {
    const lang = req.query.lang || 'uz';
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
    const lang = getLanguage(msg.from);

    console.log(`🎯 /start bosildi: ${userId} (${userName})`);

    if (isAdmin(userId)) {
        console.log(`✅ ${userId} admin sifatida tanishdi`);
        
        bot.sendMessage(chatId, t(lang, 'welcomeAdmin', { name: userName }), {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: t(lang, 'sendPrayerTimes'),
                            web_app: { url: `https://islomxon-namoz-bot.onrender.com/webapp.html?lang=${lang}` }
                        }
                    ],
                    [
                        {
                            text: t(lang, 'adminPanel'),
                            web_app: { url: `https://islomxon-namoz-bot.onrender.com/admin?lang=${lang}` }
                        }
                    ]
                ]
            },
            parse_mode: 'Markdown'
        });
        
    } else {
        console.log(`❌ ${userId} admin emas`);
        bot.sendMessage(chatId, t(lang, 'notAdmin'));
    }
});

// /test komandasi
bot.onText(/\/test/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const lang = getLanguage(msg.from);
    
    bot.sendMessage(chatId, t(lang, 'botTest', { 
        userId: userId, 
        isAdmin: isAdmin(userId) ? 'HA' : 'YO\'Q' 
    }));
});

// /id komandasi
bot.onText(/\/id/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const lang = getLanguage(msg.from);
    
    bot.sendMessage(chatId, t(lang, 'yourId', { 
        userId: userId, 
        name: msg.from.first_name || 'Noma\'lum' 
    }), {
        parse_mode: 'Markdown'
    });
});

// Web App ma'lumotlarini qabul qilish
app.post('/submit-prayer-times', express.json(), async (req, res) => {
    try {
        console.log('\n📨 WebApp so\'rov keldi');
        
        const { bomdod, peshin, asr, shom, hufton, sana, izoh, userId, lang = 'uz' } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: t(lang, 'userNotFound') });
        }

        if (!isAdmin(userId)) {
            return res.status(403).json({ success: false, error: t(lang, 'onlyAdmins') });
        }

        // Ma'lumotlarni tekshirish
        if (!bomdod || !peshin || !asr || !shom || !hufton || !sana) {
            return res.status(400).json({ success: false, error: t(lang, 'fillAllFields') });
        }

        // Formatlash - faqat Lotin tilida
        const message = `🕌 Islomxon Jome Masjidi\n📅 ${sana}\n\n🕒 Namoz Vaqtlari:\n\n🌅 Bomdod: ${bomdod}\n☀️ Peshin: ${peshin}\n🌤️ Asr: ${asr}\n🌇 Shom: ${shom}\n🌙 Xufton: ${hufton}\n\n${izoh ? `💫 Izoh: ${izoh}\n\n` : ''}📍 Hududingiz uchun to'g'ri vaqtda ibodatni ado eting. Alloh har bir qadamimizni savobli qilsin!`;

        console.log('📤 Kanalga post yuborilmoqda...');
        
        // Kanalga post yuborish - HAR DOIM LOTIN TILIDA
        await bot.sendMessage('@Islomxon_masjidi', message);

        res.json({ 
            success: true, 
            message: t(lang, 'postSuccess')
        });

    } catch (error) {
        console.error('❌ Xato:', error);
        res.status(500).json({ success: false, error: `${t(lang, 'error')}: ${error.message}` });
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
    console.log(`🌍 Tillar: Lotin va Kirill`);
    console.log(`🎉 ==========================================\n`);
});
