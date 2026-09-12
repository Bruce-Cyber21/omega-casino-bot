const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣', '🎰'];

module.exports = {
    play: (bet) => {
        const slots = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        
        let win = false;
        let multiplier = 0;
        
        // Cek 3 match
        if (slots[0] === slots[1] && slots[1] === slots[2]) {
            win = true;
            if (slots[0] === '🎰') multiplier = 50;
            else if (slots[0] === '7️⃣') multiplier = 20;
            else if (slots[0] === '💎') multiplier = 15;
            else if (slots[0] === '⭐') multiplier = 10;
            else multiplier = 5;
        } 
        // Cek 2 match
        else if (slots[0] === slots[1] || slots[1] === slots[2] || slots[0] === slots[2]) {
            win = true;
            multiplier = 2;
        }
        
        const profit = win ? bet * multiplier : -bet;
        return { slots, win, profit };
    }
};