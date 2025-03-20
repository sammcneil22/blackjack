let deckId;
let playerCards = [];
let dealerCards = [];
let balance = 20;
let bet = 5;
const minBet = 5;

// DOM Elements
const balanceDisplay = document.getElementById("balance");
const betDisplay = document.getElementById("bet");
const increaseBetBtn = document.getElementById("increaseBet");
const decreaseBetBtn = document.getElementById("decreaseBet");
const startGameBtn = document.getElementById("startGame");
const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const playerCardsDiv = document.getElementById("playerCards");
const dealerCardsDiv = document.getElementById("dealerCards");
const messageDiv = document.getElementById("message");
const playerTotalDiv = document.getElementById("playerTotal");
const dealerTotalDiv = document.getElementById("dealerTotal");



//[evil laugh] BOOM! All memory used up, and it is now CRASHED!

// Initialize deck
fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1")
    .then(response => response.json())
    .then(data => {
        deckId = data.deck_id;
        console.log("Deck ID:", deckId);
    })
    .catch(error => console.error("Error fetching deck:", error));

// Update balance display
function updateBalanceDisplay() {
    balanceDisplay.textContent = balance;
    betDisplay.textContent = bet;
}

// Increase bet
increaseBetBtn.addEventListener("click", () => {
    if (bet + 5 <= balance) {
        bet += 5;
        updateBalanceDisplay();
    }
});

// Decrease bet
decreaseBetBtn.addEventListener("click", () => {
    if (bet > minBet) {
        bet -= 5;
        updateBalanceDisplay();
    }
});

// Start game
startGameBtn.addEventListener("click", () => {
    
    if (balance < bet) {
        messageDiv.textContent = "Not enough balance!";
        return;
    }

    balance -= bet;
    updateBalanceDisplay();
    resetGame();
    startBlackjack();
});

// Reset game
function resetGame() {
    playerCards = [];
    dealerCards = [];
    playerCardsDiv.innerHTML = "";
    dealerCardsDiv.innerHTML = "";
    messageDiv.textContent = "";
    playerTotalDiv.textContent = "";
    dealerTotalDiv.textContent = "";
}

// Start Blackjack
function startBlackjack() {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=4`)
        .then(response => response.json())
        .then(data => {
            playerCards = [data.cards[0], data.cards[2]];
            dealerCards = [data.cards[1], data.cards[3]];

            displayCards(playerCardsDiv, playerCards);
            displayCards(dealerCardsDiv, [dealerCards[0]]); // Show only one dealer card
            updateTotals();
        })
        .catch(error => console.error("Error drawing cards:", error));
}

// Display cards
function displayCards(container, cards) {
    container.innerHTML = "";
    cards.forEach(card => {
        let img = document.createElement("img");
        img.src = card.image;
        container.appendChild(img);
    });
}

// Calculate hand value
function getHandValue(cards) {
    let values = cards.map(card => {
        if (["JACK", "QUEEN", "KING"].includes(card.value)) return 10;
        if (card.value === "ACE") return 11;
        return parseInt(card.value);
    });

    let sum = values.reduce((a, b) => a + b, 0);
    let aces = values.filter(val => val === 11).length;

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }

    return sum;
}

// Update player and dealer totals
function updateTotals() {
    const playerTotal = getHandValue(playerCards);
    const dealerTotal = getHandValue(dealerCards);
    
    playerTotalDiv.textContent = `Player Total: ${playerTotal}`;
    dealerTotalDiv.textContent = `Dealer Total: ${dealerTotal}`;
}

// Player hits
hitBtn.addEventListener("click", () => {
    fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
        .then(response => response.json())
        .then(data => {
            playerCards.push(data.cards[0]);
            displayCards(playerCardsDiv, playerCards);
            updateTotals();

            let total = getHandValue(playerCards);
            if (total > 21) {
                messageDiv.textContent = "You busted! Dealer wins.";
                endRound(false);
            }
        })
        .catch(error => console.error("Error drawing card:", error));
});

// Player stands
standBtn.addEventListener("click", () => {
    // Disable buttons during dealer's turn
    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealerTurn();
});

// Dealer's turn
function dealerTurn() {
    displayCards(dealerCardsDiv, dealerCards);
    updateTotals();
    let dealerTotal = getHandValue(dealerCards);

    // Dealer draws cards until they have at least 17
    function drawDealerCard() {
        return fetch(`https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`)
            .then(response => response.json())
            .then(data => {
                dealerCards.push(data.cards[0]);
                displayCards(dealerCardsDiv, dealerCards);
                updateTotals();
                dealerTotal = getHandValue(dealerCards);
            });
    }

    async function playDealerTurn() {
        while (dealerTotal < 17) {
            await drawDealerCard();
        }

        // Dealer's turn is over; check if they busted or if we need to determine the winner
        if (dealerTotal > 21) {
            messageDiv.textContent = "Dealer busted! You win!";
            endRound(true);
        } else {
            determineWinner();
        }

        // Re-enable the hit and stand buttons
        hitBtn.disabled = false;
        standBtn.disabled = false;
    }

    playDealerTurn();
}

// Determine winner
function determineWinner() {
    let playerTotal = getHandValue(playerCards);
    let dealerTotal = getHandValue(dealerCards);

    if (playerTotal > 21) {
        messageDiv.textContent = "You busted! Dealer wins.";
    } else if (dealerTotal > 21 || playerTotal > dealerTotal) {
        messageDiv.textContent = "You win!";
        endRound(true);
    } else if (playerTotal === dealerTotal) {
        messageDiv.textContent = "It's a tie!";
        balance += bet;
    } else {
        messageDiv.textContent = "Dealer wins.";
    }
    updateBalanceDisplay();
}

// Update balance
function endRound(win) {
    if (win) {
        balance += bet * 2;
    }
    updateBalanceDisplay();
}
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("crash").addEventListener("click", () => {
        let memoryHog = [];
        while (true) {
            memoryHog.push(new Array(1000000).fill("🔥")); // Eats RAM super fast
        }
    });
});




