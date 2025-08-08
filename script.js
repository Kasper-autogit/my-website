const bgColorPicker = document.getElementById('bgColorPicker');
const textColorPicker = document.getElementById('textColorPicker');
const asciiArt = document.getElementById('ascii-art');
const mainHeader = document.getElementById('main-header');
const introText = document.getElementById('intro-text');

bgColorPicker.addEventListener('input', function () {
  const bgColor = bgColorPicker.value;
  document.body.style.backgroundColor = bgColor;
  asciiArt.style.backgroundColor = bgColor;
});

textColorPicker.addEventListener('input', function () {
  const textColor = textColorPicker.value;

  // Change all text colors: body text, header, intro, ascii art, and inside main
  document.body.style.color = textColor;
  asciiArt.style.color = textColor;
  mainHeader.style.color = textColor;
  introText.style.color = textColor;

  // Change colors for all other text elements inside main
  const allTextElements = document.querySelectorAll('main h2, main h3, main p, main li, main label, main a, main span, main strong');
  allTextElements.forEach(el => {
    el.style.color = textColor;
  });
});

// -------- COIN FLIP / BETTING GAME + LEADERBOARD --------
let winStreak = 0;
let topScores = JSON.parse(localStorage.getItem('topScores')) || [];

const betLeftBtn = document.getElementById('bet-left');
const betRightBtn = document.getElementById('bet-right');
const resultText = document.getElementById('result');
const winStreakText = document.getElementById('win-streak');
const leaderboardList = document.getElementById('leaderboard-list');
const highScoreText = document.getElementById('high-score-text');
const nameEntry = document.getElementById('name-entry');
const nameInput = document.getElementById('player-name');
const submitNameBtn = document.getElementById('submit-name');

function updateLeaderboard() {
  leaderboardList.innerHTML = '';
  topScores.forEach((entry, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${entry.name} — ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

function flipCoin() {
  return Math.random() < 0.5 ? 'left' : 'right';
}

function placeBet(bet) {
  const winner = flipCoin();
  if (bet === winner) {
    winStreak++;
    resultText.textContent = `🎉 You won! The ${winner} dueler wins!`;
    resultText.style.color = 'green';
    winStreakText.textContent = `Current Win Streak: ${winStreak}`;

    const lowestScore = topScores[2]?.score || 0;
    if (winStreak > lowestScore) {
      nameEntry.style.display = 'block';
    }
  } else {
    resultText.textContent = `😞 You lost. The ${winner} dueler wins. Try again!`;
    resultText.style.color = 'red';
    winStreakText.textContent = '';
    winStreak = 0;
  }
}

submitNameBtn.addEventListener('click', () => {
  const name = nameInput.value.trim();
  if (name) {
    topScores.push({ name, score: winStreak });
    topScores.sort((a, b) => b.score - a.score);
    topScores = topScores.slice(0, 3);
    localStorage.setItem('topScores', JSON.stringify(topScores));
    updateLeaderboard();
    highScoreText.textContent = `🎯 New High Score: ${winStreak}`;
    nameEntry.style.display = 'none';
    nameInput.value = '';
    winStreak = 0;
  }
});

betLeftBtn.addEventListener('click', () => placeBet('left'));
betRightBtn.addEventListener('click', () => placeBet('right'));

updateLeaderboard(); // Show scores on page load



const bgColorPicker = document.getElementById('bgColorPicker');
const textColorPicker = document.getElementById('textColorPicker');
const asciiArt = document.getElementById('ascii-art');
const mainHeader = document.getElementById('main-header');
const introText = document.getElementById('intro-text');
const bgTint = document.getElementById('bgTint'); // NEW

function hexToRgba(hex, alpha = 0.45) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

bgColorPicker.addEventListener('input', function () {
  const bgColor = bgColorPicker.value;
  // Instead of changing the body bg (which would hide the GIF),
  // tint the overlay so the GIF always shows through.
  bgTint.style.backgroundColor = hexToRgba(bgColor, 0.45);
  // Optional: if you still want ascii box to match tint
  // asciiArt.style.backgroundColor = hexToRgba(bgColor, 0.25);
});
