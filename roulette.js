module.exports = {
    play: (bet, choice) => {
        const numbers = [
            { num: 0, color: 'green' },
            { num: 1, color: 'red' }, { num: 2, color: 'black' },
            { num: 3, color: 'red' }, { num: 4, color: 'black' },
            // ... semua angka 1-36
        ];
        
        const result = numbers[Math.floor(Math.random() * numbers.length)];
        let win = false;
        
        if (choice === 'red' && result.color === 'red') win = true;
        else if (choice === 'black' && result.color === 'black') win = true;
        else if (choice === 'green' && result.num === 0) win = true;
        else if (choice === 'odd' && result.num % 2 !== 0 && result.num !== 0) win = true;
        else if (choice === 'even' && result.num % 2 === 0 && result.num !== 0) win = true;
        else if (choice === '1-18' && result.num >= 1 && result.num <= 18) win = true;
        else if (choice === '19-36' && result.num >= 19 && result.num <= 36) win = true;
        
        return {
            number: result.num,
            color: result.color,
            win: win,
            profit: win ? bet * 2 : -bet
        };
    }
};