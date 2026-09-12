module.exports = {
    play: (bet, choice) => {
        const result = Math.random() < 0.5 ? 'heads' : 'tails';
        const win = result === choice;
        return {
            result: result,
            win: win,
            profit: win ? bet * 2 : -bet
        };
    }
};