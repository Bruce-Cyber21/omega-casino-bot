function getCard() {
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const suits = ['♠', '♥', '♦', '♣'];
    return `${values[Math.floor(Math.random() * values.length)]}${suits[Math.floor(Math.random() * suits.length)]}`;
}

function getValue(card) {
    const val = card.slice(0, -1);
    if (val === 'A') return 11;
    if (['J', 'Q', 'K'].includes(val)) return 10;
    return parseInt(val);
}

module.exports = {
    play: (bet) => {
        const playerCards = [getCard(), getCard()];
        const dealerCards = [getCard(), getCard()];
        
        let playerTotal = playerCards.reduce((sum, c) => sum + getValue(c), 0);
        let dealerTotal = dealerCards.reduce((sum, c) => sum + getValue(c), 0);
        
        // Dealer draw until 17+
        while (dealerTotal < 17) {
            const card = getCard();
            dealerCards.push(card);
            dealerTotal += getValue(card);
        }
        
        let win = false;
        let result = '';
        
        if (playerTotal > 21) {
            result = 'Bust!';
        } else if (dealerTotal > 21) {
            win = true;
            result = 'Dealer Bust!';
        } else if (playerTotal > dealerTotal) {
            win = true;
            result = 'You Win!';
        } else if (playerTotal === dealerTotal) {
            result = 'Push!';
        } else {
            result = 'Dealer Wins!';
        }
        
        return {
            playerCards: playerCards,
            dealerCards: dealerCards,
            playerTotal: playerTotal,
            dealerTotal: dealerTotal,
            win: win,
            profit: win ? bet * 2 : (result === 'Push!' ? 0 : -bet),
            result: result
        };
    }
};