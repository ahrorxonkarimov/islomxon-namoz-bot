// Kanalga xabar yuborish
async function sendToChannels(message) {
  const results = [];
  
  for (const channel of CHANNELS) {
    try {
      console.log(`📤 "${channel}" kanaliga xabar yuborilmoqda...`);
      
      // Kanalni tekshirish
      await bot.getChat(channel);
      
      // Xabar yuborish
      const result = await bot.sendMessage(channel, message);
      console.log(`✅ "${channel}" kanaliga xabar yuborildi`);
      
      results.push({ channel, success: true, messageId: result.message_id });
      
    } catch (error) {
      console.error(`❌ "${channel}" kanaliga xabar yuborishda xato:`, error.message);
      results.push({ channel, success: false, error: error.message });
    }
  }
  
  return results;
}
