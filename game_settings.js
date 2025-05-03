function checkOrientation() {
    if(window.matchMedia("(orientation: landscape)").matches) {
        document.getElementById('orientation-warning').style.display = 'none';
        document.getElementById('game-content').style.display = 'block';
    } else {
        document.getElementById('orientation-warning').style.display = 'block';
        document.getElementById('game-content').style.display = 'none';
    }
}

window.addEventListener('orientationchange', checkOrientation);
window.addEventListener('load', checkOrientation);