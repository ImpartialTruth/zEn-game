# Zen - Balance Your Fortune 🧘

თამაშების პლატფორმა Telegram Web App-ში.

## 📱 პროექტის აღწერა

**Zen** არის ინოვაციური თამაშების პლატფორმა, რომელიც შექმნილია Telegram Web App-ისთვის. აპლიკაცია აერთიანებს სიმშვიდეს და ინტერაქტიული თამაშების ელემენტებს.

### ✨ ძირითადი ფუნქციები

- **🧘 My Zen** - პირადი პროფილი და Zen Coins ბალანსი
- **🎮 Zen Games** - 3 სხვადასხვა თამაში (Crash, Coin Flip, Lucky Wheel)
- **✨ Daily Harmony** - ყოველდღიური დავალებები
- **🏆 Zen Masters** - გლობალური რეიტინგი

### 🎨 დიზაინის პრინციპები

- **სიმშვიდისმოყვარე**: მშვიდი და ჰარმონიული UI/UX
- **ფუტურისტული**: სუფთა, მინიმალისტური დიზაინი
- **რესპონსიული**: იდეალურად მუშაობს ყველა ეკრანზე
- **ანიმირებული**: გლუვი გადასვლები და ეფექტები

### 🎨 ფერთა პალიტრა

```css
/* ძირითადი ფერები */
--primary-deep-blue: #1A237E;
--primary-dark-gray: #263238;
--primary-light-gray: #ECEFF1;

/* აქცენტის ფერები */
--accent-turquoise: #00BCD4;
--accent-lavender: #BA68C8;
--accent-gold: #FFC107;
```

## 🚀 გაშვება

### წინაპირობები

- Node.js >= 16.0.0
- npm >= 8.0.0

### ინსტალაცია

```bash
# რეპოზიტორიის კლონირება
git clone https://github.com/ImpartialTruth/zen-game.git

# დირექტორიაში გადასვლა
cd zen-game

# დამოკიდებულებების ინსტალაცია
npm install

# განვითარების რეჟიმში გაშვება
npm start
```

### ხელმისაწვდომი ბრძანებები

```bash
npm start          # განვითარების სერვერის გაშვება
npm build          # პროდუქციისთვის ბილდი
npm test           # ტესტების გაშვება
npm run lint       # კოდის ლინტინგი
npm run format     # კოდის ფორმატირება
npm run deploy     # დეპლოიმენტისთვის მომზადება
```

## 📁 პროექტის სტრუქტურა

```
src/
├── components/
│   ├── common/           # საერთო კომპონენტები
│   │   ├── LoadingScreen.js
│   │   └── MainLayout.js
│   ├── profile/          # პროფილის კომპონენტები
│   │   ├── ProfileDisplay.js
│   │   └── ZenCoinBalance.js
│   ├── leaderboard/      # რეიტინგის კომპონენტები
│   │   └── Leaderboard.js
│   ├── quests/           # დავალებების კომპონენტები
│   │   └── DailyQuests.js
│   └── games/            # თამაშების კომპონენტები
│       ├── GamesSection.js
│       ├── CrashGame.js
│       ├── CoinFlipGame.js
│       └── LuckyWheelGame.js
├── pages/
│   └── HomePage.js       # მთავარი გვერდი
├── styles/
│   └── globals.css       # გლობალური სტილები
├── utils/
│   └── constants.js      # კონსტანტები
├── App.js                # მთავარი აპლიკაცია
└── index.js              # Entry point
```

## 🎮 თამაშები

### 1. Crash Game 📈
- მულტიპლაიერის ზრდა რეალურ დროში
- ავტომატური Cash Out ფუნქცია
- ისტორიის ტრეკინგი

### 2. Coin Flip 🪙
- კლასიკური "Heads or Tails"
- 50/50 შანსი
- ანიმირებული მონეტის აგდება

### 3. Lucky Wheel 🎡
- 8-სექციური ბორბალი
- 0x-დან 10x-მდე მულტიპლაიერები
- ვიზუალური ეფექტები

## 🔧 ტექნოლოგიები

- **Frontend**: React 18, CSS3, HTML5
- **Platform**: Telegram Web App
- **Build Tool**: Create React App
- **Styling**: CSS Variables, Flexbox, Grid
- **Icons**: Unicode Emojis
- **Fonts**: Google Fonts (Montserrat, Poppins, Roboto Mono)

## 📱 Telegram Web App ინტეგრაცია

აპლიკაცია მთლიანად ინტეგრირებულია Telegram Web App API-თან:

- ავტომატური თემის მორგება
- Telegram მომხმარებლის მონაცემების წვდომა
- ნატიური ნავიგაციის მხარდაჭერა
- PWA ფუნქციონალი

## 🌐 PWA მხარდაჭერა

- Offline მუშაობა
- App Installation
- Push Notifications მზადყოფნა
- Mobile-First დიზაინი

## 🔒 უსაფრთხოება

- არა-ავტორიზებული მომხმარებლების დაცვა
- Secure API კომუნიკაცია
- Client-side ვალიდაცია

## 🚀 დეპლოიმენტი

### Vercel-ზე დეპლოიმენტი

```bash
# Vercel CLI-ის ინსტალაცია
npm i -g vercel

# დეპლოიმენტი
vercel --prod
```

### GitHub Pages-ზე დეპლოიმენტი

```bash
# gh-pages-ის ინსტალაცია
npm install --save-dev gh-pages

# package.json-ში დამატება
"homepage": "https://yourusername.github.io/zen-meditation-game"

# დეპლოიმენტი
npm run deploy
```

## 🤝 კონტრიბუცია

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 ლიცენზია

ეს პროექტი ლიცენზირებულია MIT ლიცენზიით - იხილეთ [LICENSE](LICENSE) ფაილი დეტალებისთვის.

## 📞 კონტაქტი

- **Email**: zen.dev.team@gmail.com
- **Telegram**: [@zen_game_bot](https://t.me/zen_game_bot)
- **Website**: [zen-game.vercel.app](https://zen-game.vercel.app)

---

**Zen - Balance Your Fortune** 🧘✨

*იპოვეთ თქვენი ბალანსი.*