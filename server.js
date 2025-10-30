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
