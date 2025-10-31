const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const moment = require('moment');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Bot konfiguratsiyasi
const BOT_TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const CHANNEL = '@Islomxon_masjidi';
const ADMIN_IDS = [7894421569, 5985723887, 382697989];
const WEB_APP_URL = 'https://your-app-name.onrender.com/admin'; // O'Z URL NI QO'YING

const bot = new Telegraf(BOT_TOKEN);

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Namoz vaqtlari ma'lumotlari
let prayerTimes = {
    date: moment().format('DD-MMMM, YYYY yıl'),
    bomdod: "05:45",
    peshin: "13:15", 
    asr: "16:30",
    shom: "18:45",
    xufton: "20:15"
};

// 3 TILDA TARJIMALAR
const translations = {
    uz: {
        title: "Islomxon Jome Masjidi",
        adminWelcome: "🕌 *Assalomu alaykum, {name}!*\n\nSiz *Islomxon Jome Masjidi* botining adminisiz!\n\n📋 *Vazifangiz:* Namoz vaqtlarini kiritish va kanalga post yuborish\n\n⬇️ *Web App orqali yangi vaqtlarni kiriting:*",
        userWelcome: "🕌 *Assalomu alaykum, {name}!*\n\n*Islomxon Jome Masjidi* botiga xush kelibsiz!\n\n📢 Yangi namoz vaqtlari kanalda e'lon qilinadi:\n@Islomxon_masjidi\n\n🤲 *Alloh ibodatingizni qabul qilsin!*",
        notAdmin: "❌ *Siz admin emassiz!*\n\nBu bot faqat adminlar uchun. Namoz vaqtlarini @Islomxon_masjidi kanalida kuzating.",
        currentTimes: "🕐 *Joriy namoz vaqtlari:*"
    },
    ru: {
        title: "Мечеть Исломхон Джаме", 
        adminWelcome: "🕌 *Ассаламу алейкум, {name}!*\n\nВы администратор бота *Мечеть Исломхон Джаме*!\n\n📋 *Ваша задача:* Вводить время намаза и отправлять посты в канал\n\n⬇️ *Введите новое время через Web App:*",
        userWelcome: "🕌 *Ассаламу алейкум, {name}!*\n\nДобро пожаловать в бот *Мечеть Исломхон Джаме*!\n\n📢 Новое время намаза объявляется в канале:\n@Islomxon_masjidi\n\n🤲 *Пусть Аллах примет ваш намаз!*",
        notAdmin: "❌ *Вы не администратор!*\n\nЭтот бот только для администраторов. Следите за временем намаза в канале @Islomxon_masjidi.",
        currentTimes: "🕐 *Текущее время намаза:*"
    },
    kr: {
        title: "Исломхон Жоме Масжиди",
        adminWelcome: "🕌 *Ассалому алейкум, {name}!*\n\nСиз *Исломхон Жоме Масжиди* ботининг администраторисиз!\n\n📋 *Вазифангиз:* Намоз вақтларини киритиш ва каналга пост юбориш\n\n⬇️ *Web App орқали янги вақтларни киритинг:*",
        userWelcome: "🕌 *Ассалому алейкум, {name}!*\n\n*Исломхон Жоме Масжиди* ботига хуш келибсиз!\n\n📢 Янги намоз вақтлари каналда эьлон қилинади:\n@Islomxon_masjidi\n\n🤲 *Аллоҳ ибодатингизни қабул қилсин!*", 
        notAdmin: "❌ *Сиз админ эмассиз!*\n\nБу бот фақат админлар учун. Намоз вақтларини @Islomxon_masjidi каналида кузатинг.",
        currentTimes: "🕐 *Жорий намоз вақтлари:*"
    }
};

// BOT KOMANDALARI
bot.start((ctx) => {
    const user = ctx.from;
    const isAdmin = ADMIN_IDS.includes(user.id);
    const lang = user.language_code === 'ru' ? 'ru' : 'uz'; // Tilni aniqlash
    
    if (isAdmin) {
        // ADMINLAR UCHUN
        const message = translations[lang].adminWelcome.replace('{name}', user.first_name) + 
                       `\n\n${translations[lang].currentTimes}\n` +
                       `🌅 ${lang === 'uz' ? 'Bomdod' : lang === 'ru' ? 'Фаджр' : 'Бомдод'}: ${prayerTimes.bomdod}\n` +
                       `☀️ ${lang === 'uz' ? 'Peshin' : lang === 'ru' ? 'Зухр' : 'Пешин'}: ${prayerTimes.peshin}\n` +
                       `⛅ ${lang === 'uz' ? 'Asr' : lang === 'ru' ? 'Аср' : 'Аср'}: ${prayerTimes.asr}\n` +
                       `🌇 ${lang === 'uz' ? 'Shom' : lang === 'ru' ? 'Магриб' : 'Шом'}: ${prayerTimes.shom}\n` +
                       `🌙 ${lang === 'uz' ? 'Xufton' : lang === 'ru' ? 'Иша' : 'Хуфтон'}: ${prayerTimes.xufton}`;

        ctx.replyWithMarkdown(message, {
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "📱 Vaqtlarni kiritish",
                        web_app: { url: WEB_APP_URL }
                    }],
                    [{
                        text: "📢 Bizning kanal",
                        url: "https://t.me/Islomxon_masjidi"
                    }],
                    [{
                        text: "📷 Instagram", 
                        url: "https://instagram.com/islomxon_masjidi"
                    }],
                    [{
                        text: "👑 Admin",
                        url: "https://t.me/Abdulloh_Ummati_Muhammad"
                    }]
                ]
            }
        });
    } else {
        // ODDIY FOYDALANUVCHILAR UCHUN
        const message = translations[lang].notAdmin;

        ctx.replyWithMarkdown(message, {
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: "📢 Kanalga obuna bo'lish",
                        url: "https://t.me/Islomxon_masjidi"
                    }
                ]]
            }
        });
    }
});

// TELEGRAMGA POST YUBORISH
async function sendToTelegram(lang = 'uz') {
    try {
        const titles = {
            uz: { title: "Islomxon Jome Masjidi", times: "Namoz Vaqtlari" },
            ru: { title: "Мечеть Исломхон Джаме", times: "Время Намаза" },
            kr: { title: "Исломхон Жоме Масжиди", times: "Намоз Вақтлари" }
        };
        
        const t = titles[lang];
        const message = `🕌 *${t.title}*\n\n` +
                       `📅 ${lang === 'uz' ? 'Sana' : lang === 'ru' ? 'Дата' : 'Сана'}: ${prayerTimes.date}\n\n` +
                       `🕐 *${t.times}:*\n\n` +
                       `🌅 ${lang === 'uz' ? 'Bomdod' : lang === 'ru' ? 'Фаджр' : 'Бомдод'}: ${prayerTimes.bomdod}\n` +
                       `☀️ ${lang === 'uz' ? 'Peshin' : lang === 'ru' ? 'Зухр' : 'Пешин'}: ${prayerTimes.peshin}\n` +
                       `⛅ ${lang === 'uz' ? 'Asr' : lang === 'ru' ? 'Аср' : 'Аср'}: ${prayerTimes.asr}\n` +
                       `🌇 ${lang === 'uz' ? 'Shom' : lang === 'ru' ? 'Магриб' : 'Шом'}: ${prayerTimes.shom}\n` +
                       `🌙 ${lang === 'uz' ? 'Xufton' : lang === 'ru' ? 'Иша' : 'Хуфтон'}: ${prayerTimes.xufton}\n\n` +
                       `🤲 ${lang === 'uz' ? 
                           "Hududingiz uchun to'g'ri vaqtda ibodatni ado eting. Alloh har bir qadamingizni savobli qilsin!" :
                           lang === 'ru' ?
                           "Совершайте поклонение в правильное время для вашего региона. Пусть Аллах вознаградит каждый ваш шаг!" :
                           "Ҳудудингиз учун тўғри вақтда ибодатни адо этинг. Аллоҳ ҳар бир қадамингизни савобли қилсин!"}\n\n` +
                       `━━━━━━━━━━━━━━\n` +
                       `📍 @Islomxon_masjidi`;

        await bot.telegram.sendMessage(CHANNEL, message, {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{
                        text: "📷 Instagram", 
                        url: "https://instagram.com/islomxon_masjidi"
                    }],
                    [{
                        text: "👑 Admin",
                        url: "https://t.me/Abdulloh_Ummati_Muhammad"
                    }]
                ]
            }
        });
        
        return { success: true, message: "✅ Post muvaffaqiyatli yuborildi!" };
    } catch (error) {
        console.error('Post yuborishda xatolik:', error);
        return { success: false, message: "❌ Post yuborishda xatolik!" };
    }
}

// WEB API ROUTES
app.get('/api/prayer-times', (req, res) => {
    const lang = req.query.lang || 'uz';
    res.json({
        success: true,
        data: prayerTimes,
        translations: translations[lang]
    });
});

app.post('/api/update-times', async (req, res) => {
    const { bomdod, peshin, asr, shom, xufton, lang = 'uz' } = req.body;
    
    // Yangilash
    prayerTimes = {
        date: moment().format('DD-MMMM, YYYY yıl'),
        bomdod: bomdod,
        peshin: peshin,
        asr: asr,
        shom: shom,
        xufton: xufton
    };
    
    console.log('Yangi namoz vaqtlari:', prayerTimes);
    
    // Telegramga post yuborish
    const result = await sendToTelegram(lang);
    
    res.json({
        success: result.success,
        message: result.message,
        data: prayerTimes
    });
});

// WEB ROUTES
app.get('/', (req, res) => {
    res.send('Islomxon Masjidi Bot Serveri ishlamoqda!');
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// SERVER VA BOTNI ISHGA TUSHIRISH
app.listen(PORT, async () => {
    console.log(`🚀 Server ${PORT}-portda ishlamoqda`);
    
    try {
        await bot.launch();
        console.log('🤖 Bot muvaffaqiyatli ishga tushdi!');
        console.log('👑 Adminlar:', ADMIN_IDS);
        console.log('📢 Kanal:', CHANNEL);
        console.log('🌐 Web App:', WEB_APP_URL);
    } catch (error) {
        console.error('❌ Bot ishga tushirishda xatolik:', error);
    }
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
