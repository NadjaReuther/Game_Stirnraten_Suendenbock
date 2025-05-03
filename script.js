if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
        console.log('Service Worker registriert');
    });
}

let words = [];
let currentWord = '';
let score = 0;
let timer = 30;
let timerInterval;

fetch('words.json')
    .then(response => response.json())
    .then(data => {
        words = data
    });

document.getElementById('startBtn').addEventListener('click', startGame);

function startGame() {
    score = 0;
    timer = 30;
    nextWord();
    timerInterval = setInterval(() => {
        timer--;
        document.getElementById('timer').innerText = timer;
        if(timer === 0) {
            clearInterval(timerInterval);
            alert(`Zeit vorbei! Punkte: ${score}`);
        }
    }, 1000);
}

function nextWord() {
    currentWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('word').innerText = currentWord;
}

window.addEventListener('deviceorientation', (event) => {
    if(event.beta > 60) {
        score++;
        document.getElementById('score').innerText = `Punkte: ${score}`;
        nextWord();
    } else if(event.beta < -60) {
        nextWord();
    }
})