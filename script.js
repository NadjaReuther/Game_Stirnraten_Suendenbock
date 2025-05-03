if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(() => {
    console.log('Service Worker registriert');
    });
}

const words = ["Fran Kerner", "Engel Lengenfelder", "Jewa Brand", "Okko Brand"];

let remainigWords = [];
let score = 0;
let timer = 60;
let timerInterval = null;
let gameStarted = false;
let detector = null;
// DOM-Elemente
const wordDisplay = document.getElementById('word-display');
const header = document.getElementById('header');
const startBtn = document.getElementById('startBtn');
const anleitungBtn = document.getElementById('anleitung');
const tutorial = document.getElementById('tutorial');
const closeTutorialBtn = document.getElementById('closeTutorial');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const loadingScreen = document.getElementById('loading-screen');

 // Event Listeners
 document.addEventListener('DOMContentLoaded', () => {
    // Ladebildschirm ausblenden, wenn die Seite vollständig geladen ist
    // Ladebildschirm ausblenden nach kurzer Verzögerung
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
          loadingScreen.style.display = 'none';
        }, 300);
      }, 1000);
     // Event Listener für Buttons
     startBtn.addEventListener('click', startGame);
     anleitungBtn.addEventListener('click', showTutorial);
     closeTutorialBtn.addEventListener('click', () => {
       tutorial.style.display = 'none';
    });


    // Stirn-Detektor initialisieren
    detector = new ForeheadDetector({
        onForeheadPosition: () => {
            if (gameStarted) {
                wordDisplay.style.display = 'block';
            }
        },
        onNormalPosition: () => {
            if (gameStarted) {
                wordDisplay.style.display = 'none';
                // Automatisch nächstes Wort, wenn Gerät zurück in normale Position gebracht wird
                nextWord();
                incrementScore(); // Punkte erhöhen
            }
        }
    });
 });    
function startGame() {
    if (!gameStarted) {
        // Timer anzeigen
        timerElement.style.visibility = 'visible';
        header.style.display = 'none';
        startBtn.style.display = 'none';
        // Wörterliste erstellen und mischen
        loadWords(); // Wörter laden
    
        gameStarted = true;
        
        detector.start(); // Stirn-Detektor starten
        nextWord();
        startTimer();
    } else {
        // Pause
        gameStarted = false;
        wordDisplay.style.display = 'none';
        clearInterval(timerInterval);
    }
}

function loadWords() {
    remainigWords = [...words];
    shuffleArray(remainigWords);

     // API-Funktion für später:
      /*
      async function holeWoerterVonAPI() {
        try {
          const response = await fetch('https://deine-api-url.com/woerter');
          const data = await response.json();
          return data.woerter || [];
        } catch (error) {
          console.error('Fehler beim Laden der Wörter:', error);
          return testWoerter; // Fallback zur lokalen Liste
        }
      }
      */
}

function nextWord() {
    if (remainigWords.length === 0) {
        loadWords(); // Wörter neu laden, wenn alle Wörter gespielt wurden
    }
    
    const currentWord = remainigWords.pop(); // Nächstes Wort holen
    wordDisplay.textContent = currentWord || "Kein Wort verfügbar";
}

function incrementScore() {
    score++; // Punkte erhöhen
    scoreElement.textContent = `Punkte: ${score}`; // Punkte anzeigen
}

function startTimer() {
    timer = 60; // Timer auf 30 Sekunden setzen
    timerElement.textContent = `Zeit: ${timer}`;

    //Timerinterval starten
    clearInterval(timerInterval); // Vorherige Intervalle löschen
    timerInterval = setInterval(() => {
        timer--;
        timerElement.textContent = `Zeit: ${timer}`;
        if (timer <= 0) {
            // Timer abgelaufen
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameStarted = false;
    detector.stop(); // Stirn-Detektor stoppen
    wordDisplay.style.display = 'none';
    timerElement.style.visibility = 'hidden'; // Timer ausblenden
    header.style.display = 'block';
    scoreElement.textContent = `Spiel beendet! Deine Punktzahl: ${score}`;
    score = 0; // Punkte zurücksetzen
    startBtn.textContent = 'Neu starten';
}

function showTutorial() {
    tutorial.style.display = 'flex';
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Stirn-Detektor initialisieren
class ForeheadDetector {
    constructor(options = {}) {
        this.options = {
            onForeheadPosition: () => console.log('Stirn erkannt!'),
            onNormalPosition: () => console.log('Gerät in normaler Position!'),        

            //Schwellenwerte für die Erkennung
            alphaThreshold: 30, // Grad
            betaThreshold: 20, // Grad
            gammaThreshold: 60, // Grad
            stabilityTime: 400, // Millisekunden, wie lange die Position stabil sein muss
            ...options
        };
        this.isInForeheadPosition = false;
        this.positionTimer = null;
        this.hasPermission = false;

        //Methoden an die Klasse binden
        this.handleOrientation = this.handleOrientation.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    handleOrientation(event) {
        const { alpha, beta, gamma } = event;

        //Querformat-Position
        const isLandscape = gamma !== null && Math.abs(gamma) > this.options.gammaThreshold;

        //nahezu horizontal gehalten (beta nahe 0°)
        const isAlmostHorizontal = beta !== null && (Math.abs(beta) < this.options.betaThreshold);

        //Alpha-Wert für die Ausrichtung
        const isPointingForward = alpha !== null;
        const isForeheadPositionNow = isLandscape && isAlmostHorizontal && isPointingForward;
        //Statuswechsel mit Verzögerung für Stabilität
        if(isForeheadPositionNow !== this.isInForeheadPosition) {
            clearTimeout(this.positionTimer);
         
            this.positionTimer = setTimeout(() => {
                this.isInForeheadPosition = isForeheadPositionNow;
         
                if (this.isInForeheadPosition) {
                    this.options.onForeheadPosition();
                } else {
                    this.options.onNormalPosition();
                }
            }, this.options.stabilityTime);
        }
    }

    async start() {
        if(!window.DeviceOrientationEvent) {
            console.error('DeviceOrientationEvent wird nicht unterstützt.');
            return false;
        }

         // Bei iOS 13+ Berechtigungen einholen
         if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
              const permissionState = await DeviceOrientationEvent.requestPermission();
              this.hasPermission = (permissionState === 'granted');
              
              if (!this.hasPermission) {
                console.error("Berechtigungen für Geräteorientierung abgelehnt");
                return false;
              }
            } catch (error) {
              console.error("Fehler beim Anfordern der Berechtigung:", error);
              return false;
            }
          }
          
          window.addEventListener('deviceorientation', this.handleOrientation);
          return true;
        }

    stop() {
        window.removeEventListener('deviceorientation', this.handleOrientation);
        clearTimeout(this.positionTimer);
    }    
}

// Bildschirm im Querformat sperren, wenn möglich
if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('landscape').catch(function(error) {
        console.log('Bildschirmorientierung konnte nicht gesperrt werden: ', error);
    });
    }
