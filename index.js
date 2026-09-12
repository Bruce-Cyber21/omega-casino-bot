const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

// ============ KONFIGURASI ============
const CONFIG = {
    BOT_TOKEN: '8894383752:AAHhNCfI7MXlaz0-MdPdMZ8AU5kwIVozB9U', // GANTI!
    STARTING_BALANCE: 1000, // Kredit awal
    MAX_BET: 10000,
    MIN_BET: 10
};

// ============ INISIALISASI ============
const app = express();
const bot = new TelegramBot(CONFIG.BOT_TOKEN);
app.use(express.json());

// Database sederhana (pake Map)
const users = new Map();
const games = {};

// ============ LOAD GAMES ============
const roulette = require('./games/roulette');
const slots = require('./games/slots');
const dice = require('./games/dice');
const coinflip = require('./games/coinflip');
const blackjack = require('./games/blackjack');
const jackpot = require('./games/jackpot');

// ============ FUNGSI UTILITY ============
function getUser(userId) {
    if (!users.has(userId)) {
        users.set(userId, {
            id: userId,
            balance: CONFIG.STARTING_BALANCE,
            totalWon: 0,
            totalLost: 0,
            gamesPlayed: 0,
            joined: Date.now()
        });
    }
    return users.get(userId);
}

function formatBalance(amount) {
    return `💰 $${amount.toLocaleString()}`;
}

function getRandomEmoji() {
    const emojis = ['🎰', '🎲', '🃏', '💎', '🔥', '⭐', '🌈', '💫', '✨', '🎯'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// ============ COMMAND HANDLERS ============

// /start - Menu utama
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    
    const menu = `
🎰 *OMEGA CASINO* 🎰
━━━━━━━━━━━━━━━━━
👤 Player: ${msg.from.first_name}
${formatBalance(user.balance)}
🎮 Games Played: ${user.gamesPlayed}
🏆 Total Win: $${user.totalWon.toLocaleString()}
💀 Total Loss: $${user.totalLost.toLocaleString()}
━━━━━━━━━━━━━━━━━

🎲 *AVAILABLE GAMES:*

/roulette - 🎯 Russian Roulette
/slots - 🎰 Slot Machine
/dice - 🎲 Dice Roll
/coinflip - 🪙 Coin Flip
/blackjack - 🃏 Blackjack
/jackpot - 💎 Progressive Jackpot

━━━━━━━━━━━━━━━━━
/balance - Check balance
/leaderboard - Top players
/daily - Claim daily bonus
/profile - Your stats
/help - Commands list
    `;
    
    bot.sendMessage(chatId, menu, { parse_mode: 'Markdown' });
});

// /balance
bot.onText(/\/balance/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    bot.sendMessage(chatId, 
        `💳 *YOUR BALANCE*\n━━━━━━━━━━━━━━\n${formatBalance(user.balance)}\n━━━━━━━━━━━━━━\n💰 Min Bet: $${CONFIG.MIN_BET}\n💰 Max Bet: $${CONFIG.MAX_BET}`,
        { parse_mode: 'Markdown' }
    );
});

// /daily - Claim daily bonus
bot.onText(/\/daily/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const bonus = Math.floor(Math.random() * 500) + 100;
    user.balance += bonus;
    bot.sendMessage(chatId,
        `🎁 *DAILY BONUS CLAIMED!*\n━━━━━━━━━━━━━━\n💰 +$${bonus}\n💳 New Balance: ${formatBalance(user.balance)}`,
        { parse_mode: 'Markdown' }
    );
});

// /profile
bot.onText(/\/profile/, (msg) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const winRate = user.gamesPlayed > 0 ? 
        Math.round((user.totalWon / (user.totalWon + user.totalLost)) * 100) : 0;
    
    bot.sendMessage(chatId,
        `👤 *PLAYER PROFILE*\n━━━━━━━━━━━━━━\n` +
        `🆔 ID: ${user.id}\n` +
        `💰 Balance: ${formatBalance(user.balance)}\n` +
        `🎮 Games: ${user.gamesPlayed}\n` +
        `🏆 Win Rate: ${winRate}%\n` +
        `💎 Total Win: $${user.totalWon.toLocaleString()}\n` +
        `💀 Total Loss: $${user.totalLost.toLocaleString()}\n` +
        `📅 Joined: ${new Date(user.joined).toLocaleDateString()}`,
        { parse_mode: 'Markdown' }
    );
});

// /leaderboard
bot.onText(/\/leaderboard/, (msg) => {
    const chatId = msg.chat.id;
    let leaderboard = Array.from(users.values())
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10);
    
    let text = '🏆 *TOP 10 RICHEST PLAYERS* 🏆\n━━━━━━━━━━━━━━\n';
    leaderboard.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        text += `${medal} ${formatBalance(user.balance)}\n`;
    });
    text += '━━━━━━━━━━━━━━\n💰 Keep gambling!';
    
    bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

// /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId,
        `📖 *COMMANDS LIST*\n━━━━━━━━━━━━━━\n` +
        `🎯 *GAMES*\n` +
        `/roulette [bet] [color] - Bet on red/black\n` +
        `/slots [bet] - Spin the slots\n` +
        `/dice [bet] [number] - Roll the dice\n` +
        `/coinflip [bet] [heads/tails] - Flip a coin\n` +
        `/blackjack [bet] - Play blackjack\n` +
        `/jackpot [bet] - Win the jackpot!\n` +
        `━━━━━━━━━━━━━━\n` +
        `💳 *ACCOUNT*\n` +
        `/balance - Check balance\n` +
        `/daily - Claim daily bonus\n` +
        `/profile - Your stats\n` +
        `/leaderboard - Top players\n` +
        `/help - This menu`,
        { parse_mode: 'Markdown' }
    );
});

// ============ ROUTE GAMES ============

// ROULETTE
bot.onText(/\/roulette(?:\s+(\d+)\s+(red|black|green|odd|even|1-18|19-36))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const bet = parseInt(match[1]);
    const choice = match[2];
    
    if (!bet || !choice) {
        return bot.sendMessage(chatId,
            `🎯 *ROULETTE*\n━━━━━━━━━━━━━━\n` +
            `Usage: /roulette [bet] [choice]\n\n` +
            `Choices: red, black, green, odd, even, 1-18, 19-36\n` +
            `Example: /roulette 100 red`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet < CONFIG.MIN_BET || bet > CONFIG.MAX_BET) {
        return bot.sendMessage(chatId,
            `❌ Bet must be between $${CONFIG.MIN_BET} - $${CONFIG.MAX_BET}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet > user.balance) {
        return bot.sendMessage(chatId,
            `❌ Insufficient balance! You have ${formatBalance(user.balance)}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    const result = roulette.play(bet, choice);
    user.balance += result.profit;
    user.gamesPlayed++;
    if (result.profit > 0) user.totalWon += result.profit;
    else user.totalLost += Math.abs(result.profit);
    
    const emoji = result.win ? '🎉' : '💀';
    bot.sendMessage(chatId,
        `🎯 *ROULETTE* ${emoji}\n━━━━━━━━━━━━━━\n` +
        `🎰 Ball landed on: *${result.number} ${result.color}*\n` +
        `💰 Bet: $${bet}\n` +
        `📊 Result: ${result.win ? '✅ WIN!' : '❌ LOSE!'}\n` +
        `💵 Profit: ${result.profit > 0 ? '+' : ''}${result.profit}\n` +
        `💳 New Balance: ${formatBalance(user.balance)}\n` +
        `━━━━━━━━━━━━━━\n` +
        `${result.win ? '🎊 CONGRATULATIONS!' : '😢 BETTER LUCK NEXT TIME!'}`,
        { parse_mode: 'Markdown' }
    );
});

// SLOTS
bot.onText(/\/slots(?:\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const bet = parseInt(match[1]);
    
    if (!bet) {
        return bot.sendMessage(chatId,
            `🎰 *SLOTS*\n━━━━━━━━━━━━━━\n` +
            `Usage: /slots [bet]\n` +
            `Example: /slots 100`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet < CONFIG.MIN_BET || bet > CONFIG.MAX_BET) {
        return bot.sendMessage(chatId,
            `❌ Bet must be between $${CONFIG.MIN_BET} - $${CONFIG.MAX_BET}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet > user.balance) {
        return bot.sendMessage(chatId,
            `❌ Insufficient balance! You have ${formatBalance(user.balance)}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    const result = slots.play(bet);
    user.balance += result.profit;
    user.gamesPlayed++;
    if (result.profit > 0) user.totalWon += result.profit;
    else user.totalLost += Math.abs(result.profit);
    
    bot.sendMessage(chatId,
        `🎰 *SLOTS* ${result.win ? '🎉' : '💀'}\n━━━━━━━━━━━━━━\n` +
        `${result.slots.join(' | ')}\n\n` +
        `💰 Bet: $${bet}\n` +
        `🎯 Result: ${result.win ? '✅ JACKPOT!' : '❌ LOSE!'}\n` +
        `💵 Profit: ${result.profit > 0 ? '+' : ''}${result.profit}\n` +
        `💳 New Balance: ${formatBalance(user.balance)}\n` +
        `━━━━━━━━━━━━━━\n` +
        `${result.win ? '🌈 JACKPOT! YOU LUCKY BASTARD!' : '😢 SPIN AGAIN!'}`,
        { parse_mode: 'Markdown' }
    );
});

// DICE
bot.onText(/\/dice(?:\s+(\d+)\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const bet = parseInt(match[1]);
    const guess = parseInt(match[2]);
    
    if (!bet || !guess || guess < 1 || guess > 6) {
        return bot.sendMessage(chatId,
            `🎲 *DICE*\n━━━━━━━━━━━━━━\n` +
            `Usage: /dice [bet] [number 1-6]\n` +
            `Example: /dice 100 4`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet < CONFIG.MIN_BET || bet > CONFIG.MAX_BET) {
        return bot.sendMessage(chatId,
            `❌ Bet must be between $${CONFIG.MIN_BET} - $${CONFIG.MAX_BET}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet > user.balance) {
        return bot.sendMessage(chatId,
            `❌ Insufficient balance! You have ${formatBalance(user.balance)}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    const result = dice.play(bet, guess);
    user.balance += result.profit;
    user.gamesPlayed++;
    if (result.profit > 0) user.totalWon += result.profit;
    else user.totalLost += Math.abs(result.profit);
    
    bot.sendMessage(chatId,
        `🎲 *DICE* ${result.win ? '🎉' : '💀'}\n━━━━━━━━━━━━━━\n` +
        `🎲 Rolled: *${result.roll}*\n` +
        `🔮 Your Guess: *${guess}*\n` +
        `💰 Bet: $${bet}\n` +
        `📊 Result: ${result.win ? '✅ WIN!' : '❌ LOSE!'}\n` +
        `💵 Profit: ${result.profit > 0 ? '+' : ''}${result.profit}\n` +
        `💳 New Balance: ${formatBalance(user.balance)}`,
        { parse_mode: 'Markdown' }
    );
});

// COINFLIP
bot.onText(/\/coinflip(?:\s+(\d+)\s+(heads|tails))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const bet = parseInt(match[1]);
    const choice = match[2];
    
    if (!bet || !choice) {
        return bot.sendMessage(chatId,
            `🪙 *COIN FLIP*\n━━━━━━━━━━━━━━\n` +
            `Usage: /coinflip [bet] [heads/tails]\n` +
            `Example: /coinflip 100 heads`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet < CONFIG.MIN_BET || bet > CONFIG.MAX_BET) {
        return bot.sendMessage(chatId,
            `❌ Bet must be between $${CONFIG.MIN_BET} - $${CONFIG.MAX_BET}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet > user.balance) {
        return bot.sendMessage(chatId,
            `❌ Insufficient balance! You have ${formatBalance(user.balance)}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    const result = coinflip.play(bet, choice);
    user.balance += result.profit;
    user.gamesPlayed++;
    if (result.profit > 0) user.totalWon += result.profit;
    else user.totalLost += Math.abs(result.profit);
    
    bot.sendMessage(chatId,
        `🪙 *COIN FLIP* ${result.win ? '🎉' : '💀'}\n━━━━━━━━━━━━━━\n` +
        `🪙 Result: *${result.result}*\n` +
        `🔮 Your Choice: *${choice}*\n` +
        `💰 Bet: $${bet}\n` +
        `📊 Result: ${result.win ? '✅ WIN!' : '❌ LOSE!'}\n` +
        `💵 Profit: ${result.profit > 0 ? '+' : ''}${result.profit}\n` +
        `💳 New Balance: ${formatBalance(user.balance)}`,
        { parse_mode: 'Markdown' }
    );
});

// BLACKJACK
bot.onText(/\/blackjack(?:\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const bet = parseInt(match[1]);
    
    if (!bet) {
        return bot.sendMessage(chatId,
            `🃏 *BLACKJACK*\n━━━━━━━━━━━━━━\n` +
            `Usage: /blackjack [bet]\n` +
            `Example: /blackjack 100`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet < CONFIG.MIN_BET || bet > CONFIG.MAX_BET) {
        return bot.sendMessage(chatId,
            `❌ Bet must be between $${CONFIG.MIN_BET} - $${CONFIG.MAX_BET}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet > user.balance) {
        return bot.sendMessage(chatId,
            `❌ Insufficient balance! You have ${formatBalance(user.balance)}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    const result = blackjack.play(bet);
    user.balance += result.profit;
    user.gamesPlayed++;
    if (result.profit > 0) user.totalWon += result.profit;
    else user.totalLost += Math.abs(result.profit);
    
    bot.sendMessage(chatId,
        `🃏 *BLACKJACK* ${result.win ? '🎉' : '💀'}\n━━━━━━━━━━━━━━\n` +
        `🃏 Your Cards: ${result.playerCards.join(', ')} = ${result.playerTotal}\n` +
        `🃏 Dealer Cards: ${result.dealerCards.join(', ')} = ${result.dealerTotal}\n` +
        `💰 Bet: $${bet}\n` +
        `📊 Result: ${result.win ? '✅ WIN!' : '❌ LOSE!'}\n` +
        `💵 Profit: ${result.profit > 0 ? '+' : ''}${result.profit}\n` +
        `💳 New Balance: ${formatBalance(user.balance)}`,
        { parse_mode: 'Markdown' }
    );
});

// JACKPOT
bot.onText(/\/jackpot(?:\s+(\d+))?/, async (msg, match) => {
    const chatId = msg.chat.id;
    const user = getUser(msg.from.id);
    const bet = parseInt(match[1]);
    
    if (!bet) {
        return bot.sendMessage(chatId,
            `💎 *JACKPOT*\n━━━━━━━━━━━━━━\n` +
            `Usage: /jackpot [bet]\n` +
            `Example: /jackpot 100\n\n` +
            `🎯 Win conditions:\n` +
            `- 3 matching emojis: 10x\n` +
            `- 2 matching emojis: 3x\n` +
            `- Jackpot (3 🎰): 50x!`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet < CONFIG.MIN_BET || bet > CONFIG.MAX_BET) {
        return bot.sendMessage(chatId,
            `❌ Bet must be between $${CONFIG.MIN_BET} - $${CONFIG.MAX_BET}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    if (bet > user.balance) {
        return bot.sendMessage(chatId,
            `❌ Insufficient balance! You have ${formatBalance(user.balance)}`,
            { parse_mode: 'Markdown' }
        );
    }
    
    const result = jackpot.play(bet);
    user.balance += result.profit;
    user.gamesPlayed++;
    if (result.profit > 0) user.totalWon += result.profit;
    else user.totalLost += Math.abs(result.profit);
    
    bot.sendMessage(chatId,
        `💎 *JACKPOT* ${result.win ? '🎉' : '💀'}\n━━━━━━━━━━━━━━\n` +
        `${result.emojis.join(' | ')}\n\n` +
        `💰 Bet: $${bet}\n` +
        `📊 Result: ${result.win ? '✅ JACKPOT!' : '❌ LOSE!'}\n` +
        `💵 Profit: ${result.profit > 0 ? '+' : ''}${result.profit}\n` +
        `💳 New Balance: ${formatBalance(user.balance)}\n` +
        `━━━━━━━━━━━━━━\n` +
        `${result.win ? '🌈 YOU HIT THE JACKPOT!' : '😢 TRY AGAIN!'}`,
        { parse_mode: 'Markdown' }
    );
});

// ============ WEBHOOK ============
app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('🎰 OMEGA CASINO BOT RUNNING!');
    console.log(`💳 ${users.size} players registered`);
});

// Set webhook
const VERCEL_URL = process.env.VERCEL_URL || '';
if (VERCEL_URL) {
    bot.setWebHook(`${VERCEL_URL}/webhook`)
        .then(() => console.log('✅ Webhook set!'));
}