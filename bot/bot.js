// Telegram Bot for Zen Game
const TelegramBot = require('node-telegram-bot-api');

// Bot Token from @BotFather
const token = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const webAppUrl = 'https://zen-game.vercel.app';

const bot = new TelegramBot(token, { polling: true });

// Welcome message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🧘 *Welcome to Zen - Balance Your Fortune!*

თამაშების პლატფორმა, სადაც შეგიძლია:

🎮 *თამაშები:*
• Crash Game - მულტიპლაიერის თამაში
• Coin Flip - მონეტის აგდება  
• Lucky Wheel - ბედნიერი ბორბალი

✨ *ფუნქციები:*
• ყოველდღიური ბონუსები
• გლობალური რეიტინგი
• დავალებები და ჯილდოები

დაიწყე თამაში ქვემოთ მოცემული ღილაკით! 👇
  `;

  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🧘 Play Zen Game',
            web_app: { url: webAppUrl }
          }
        ],
        [
          {
            text: '📊 Statistics',
            callback_data: 'stats'
          },
          {
            text: '🏆 Leaderboard',
            callback_data: 'leaderboard'
          }
        ]
      ]
    }
  };

  bot.sendMessage(chatId, welcomeMessage, options);
});

// Handle button clicks
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  
  switch (query.data) {
    case 'stats':
      bot.sendMessage(chatId, '📊 Your Statistics:\n\n🪙 Zen Coins: 1,250\n🎮 Games Played: 47\n🏆 Rank: #24');
      break;
      
    case 'leaderboard':
      const leaderboard = `
🏆 *Top Zen Masters:*

1️⃣ ZenMaster2024 - 15,420 🪙
2️⃣ MeditationPro - 12,350 🪙  
3️⃣ BalanceSeeker - 9,870 🪙
4️⃣ You - 8,650 🪙
5️⃣ CalmMind - 7,430 🪙
      `;
      bot.sendMessage(chatId, leaderboard, { parse_mode: 'Markdown' });
      break;
  }
  
  bot.answerCallbackQuery(query.id);
});

// Handle web app data
bot.on('web_app_data', (msg) => {
  const chatId = msg.chat.id;
  const data = JSON.parse(msg.web_app_data.data);
  
  // Handle game results, coin transfers, etc.
  console.log('Web App Data:', data);
  
  bot.sendMessage(chatId, `🎉 Game completed! You earned ${data.coins} Zen Coins!`);
});

console.log('🤖 Zen Game Bot is running...');