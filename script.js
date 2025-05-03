// if('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js').then(() => {
//         console.log('Service Worker registriert');
//     });
// }

let words = ["Fran Kerner", "Engel Lengenfelder", "Jewa Brand", "Okko Brand"];
let currentWord = '';
let score = 0;
let timer = 30;
let timerInterval;
let gameStarted = false;

// fetch('words.json')
//     .then(response => response.json())
//     .then(data => {
//         words = data
//     });

document.getElementById('startBtn').addEventListener('click', () => {
    if(!gameStarted) {
        gameStarted = true;
        startGame();
    }
});

function startGame() {
    score = 0;
    timer = 30;
    document.getElementById('score').innerText = `Punkte: ${score}`
    document.getElementById('timer').innerText = timer;
    nextWord();
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').innerText = timer;
        if(timer === 0) {
            clearInterval(timerInterval);
            alert(`Zeit vorbei! Punkte: ${score}`);
            gameStarted = false;
        }
    }, 1000);
}

function nextWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('word').innerText = currentWord;
}

window.addEventListener('deviceorientation', (event) => {
    
    const beta = Math.round(event.beta);
    const gamma = Math.round(event.gamma);

    document.getElementById('orientation-info').innerText = `Beta: ${beta}, Gamma: ${gamma}`;
    // Drehung Display im Querformat
    if(Math.abs(beta) > 88) {
        document.body.style.transform = 'rotate(90deg)';
    } else {
        document.body.style.transform = 'rotate(0deg)';
    }
    
    if (!gameStarted) {
        return;
    }
    if(event.beta > 80) {
        score++;
        document.getElementById('score').innerText = `Punkte: ${score}`;
        nextWord();
    } else if(event.beta < -60) {
        nextWord();
    }
})