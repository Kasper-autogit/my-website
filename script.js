document.addEventListener('DOMContentLoaded', () => {
  // ===== Helpers =====
  function hexToRgba(hex, alpha = 0.45) {
    if (!hex || hex[0] !== '#' || hex.length < 7) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  // ===== Color Pickers =====
  const bgColorPicker = document.getElementById('bgColorPicker');
  const textColorPicker = document.getElementById('textColorPicker');

  const asciiArt   = document.getElementById('ascii-art');
  const mainHeader = document.getElementById('main-header');
  const introText  = document.getElementById('intro-text');

  // Only present on GIF pages
  const bgTintEl = document.getElementById('bgTint');

  if (bgColorPicker) {
    bgColorPicker.addEventListener('input', () => {
      const color = bgColorPicker.value;

      if (bgTintEl) {
        // GIF page: keep GIF visible; tint overlay
        bgTintEl.style.backgroundColor = hexToRgba(color, 0.45);
        if (asciiArt) asciiArt.style.backgroundColor = hexToRgba(color, 0.25);
      } else {
        // Non-GIF pages: set full background
        document.body.style.backgroundColor = color;
        if (asciiArt) asciiArt.style.backgroundColor = color;
      }
    });
  }

  if (textColorPicker) {
    textColorPicker.addEventListener('input', () => {
      const textColor = textColorPicker.value;

      document.body.style.color = textColor;
      if (asciiArt) asciiArt.style.color = textColor;
      if (mainHeader) mainHeader.style.color = textColor;
      if (introText) introText.style.color = textColor;

      const allText = document.querySelectorAll(
        'main h2, main h3, main p, main li, main label, main a, main span, main strong'
      );
      allText.forEach(el => { el.style.color = textColor; });
    });
  }

  // ===== Duel Game + Leaderboard =====
  const betLeftBtn     = document.getElementById('bet-left');
  const betRightBtn    = document.getElementById('bet-right');
  const resultText     = document.getElementById('result');
  const winStreakText  = document.getElementById('win-streak');
  const leaderboardList= document.getElementById('leaderboard-list');
  const highScoreText  = document.getElementById('high-score-text');
  const nameEntry      = document.getElementById('name-entry');
  const nameInput      = document.getElementById('player-name');
  const submitNameBtn  = document.getElementById('submit-name');

  let winStreak = 0;
  let topScores = [];
  try {
    topScores = JSON.parse(localStorage.getItem('topScores')) || [];
  } catch { topScores = []; }

  function updateLeaderboard() {
    if (!leaderboardList) return;
    leaderboardList.innerHTML = '';
    topScores.forEach((entry, i) => {
      const li = document.createElement('li');
      li.textContent = `${i + 1}. ${entry.name} — ${entry.score}`;
      leaderboardList.appendChild(li);
    });
  }

  function flipCoin() {
    return Math.random() < 0.5 ? 'left' : 'right';
  }

  function placeBet(bet) {
    if (!resultText) return;
    const winner = flipCoin();

    if (bet === winner) {
      winStreak++;
      resultText.textContent = `🎉 You won! The ${winner} dueler wins!`;
      resultText.style.color = 'green';
      if (winStreakText) winStreakText.textContent = `Current Win Streak: ${winStreak}`;

      const lowestScore = topScores[2]?.score ?? 0;
      if (winStreak > lowestScore && nameEntry) {
        nameEntry.style.display = 'block';
      }
    } else {
      resultText.textContent = `😞 You lost. The ${winner} dueler wins. Try again!`;
      resultText.style.color = 'red';
      if (winStreakText) winStreakText.textContent = '';
      winStreak = 0;
    }
  }

  if (betLeftBtn)  betLeftBtn.addEventListener('click',  () => placeBet('left'));
  if (betRightBtn) betRightBtn.addEventListener('click', () => placeBet('right'));

  if (submitNameBtn) {
    submitNameBtn.addEventListener('click', () => {
      if (!nameInput) return;
      const name = nameInput.value.trim();
      if (!name) return;

      topScores.push({ name, score: winStreak });
      topScores.sort((a, b) => b.score - a.score);
      topScores = topScores.slice(0, 3);
      try { localStorage.setItem('topScores', JSON.stringify(topScores)); } catch {}

      updateLeaderboard();
      if (highScoreText) highScoreText.textContent = `🎯 New High Score: ${winStreak}`;
      if (nameEntry) nameEntry.style.display = 'none';
      nameInput.value = '';
      winStreak = 0;
    });
  }

  updateLeaderboard();
});
