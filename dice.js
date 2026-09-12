module.exports = {
    play: (bet, guess) => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const win = roll === guess;
        return {
            roll: roll,
            win: win,
            profit: win ? bet * 5 : -bet
        };
    }
};