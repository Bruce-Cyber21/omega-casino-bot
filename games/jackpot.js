const emojis = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣', '🎰'];

module.exports = {
    play: (bet) => {
        const result = [
            emojis[Math.floor(Math.random() * emojis.length)],
            emojis[Math.floor(Math.random() * emojis.length)],
            emojis[Math.floor(Math.random() * emojis.length)]
        ];
        
        let win = false;
        let multiplier = 0;
        
        if (result[0] === result[1] && result[1] === result[2]) {
            win = true;
            if (result[0] === '🎰') multiplier = 50;
            else if (result[0] === '7️⃣') multiplier = 30;
            else if (result[0] === '💎') multiplier = 20;
            else if (result[0] === '⭐') multiplier = 15;
            else multiplier = 10;
        }
        
        return {
            emojis: result,
            win: win,
            profit: win ? bet * multiplier : -bet
        };
    }
};