const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
const TOKEN = '8353179858:AAFMgCR5KLWOh7-4Tid-A4x1RAwPd3-Y9xE';
const bot = new Telegraf(TOKEN);

// ==== O'ZGARTIRING ====
const ADMIN_ID = 5985723887; // <--- ADMIN ID NI BU YERGA QO'YING
const DOMAIN = 'https://islomxon-telegram-bot-1.onrender.com';
const CHANNEL = '@Islomxon_masjidi';

// ==== Web App faylini server qilish (ildiz papkadan) ====
app.get('/webapp.html', (req, res) => {
  res.sendFile(__dirname + '/webapp.html');
});

// Bot webhook
app.use(bot.webhookCallback('/bot-webhook'));

// ==== /start komandasi ====
bot.command('start', (ctx) => {
  console.log('User ID:', ctx.from.id);

  if (ctx.from.id !== ADMIN_ID) {
    return ctx.reply('❌ Siz admin emassiz.');
  }

  ctx.reply('🕌 *Islomxon jome masjidi*\n\nNamoz vaqtlarini yuborish uchun tugmani bosing:', {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        { text: 'Web App ochish', web_app: { url: `${DOMAIN}/webapp.html` } }
      ]]
    }
  });
});

// ==== /id komandasi ====
bot.command('id', (ctx) => {
  ctx.reply(`Sizning ID: \`${ctx.from.id}\``, { parse_mode: 'Markdown' });
});

// ==== Web App ma'lumotlari ====
bot.on('web_app_data', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;

  try {
    const data = JSON.parse(ctx.webAppData.data);

    const text = `
*Islomxon jome masjidi*

*Sana:* ${data.date}

*Bomdod:* ${data.bomdod}
*Peshin:* ${data.peshin}
*Asr:* ${data.asr}
*Shom:* ${data.shom}
*Hufton:* ${data.hufton}

_${data.izoh}_

https://t.me/Islomxon_masjidi
`.trim();

    await bot.telegram.sendMessage(CHANNEL, text, { parse_mode: 'Markdown' });
    ctx.reply('✅ Post kanalga yuborildi!');
  } catch (err) {
    console.error('Xato:', err);
    ctx.reply('❌ Xato: Maʼlumotlar notoʻgʻri.');
  }
});

// ==== Webhook o'rnatish ====
(async () => {
  try {
    await bot.telegram.setWebhook(`${DOMAIN}/bot-webhook`);
    console.log('Webhook oʻrnatildi:', `${DOMAIN}/bot-webhook`);
  } catch (err) {
    console.error('Webhook xatosi:', err.message);
  }
})();

// ==== Server ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda`);
  console.log(`Web App: ${DOMAIN}/webapp.html`);
});
