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

// -------- COIN FLIP / BETTING GAME CODE --------
const betLeftBtn = document.getElementById('bet-left');
const betRightBtn = document.getElementById('bet-right');
const resultText = document.getElementById('result');

function flipCoin() {
  // randomly pick left or right as winner
  return Math.random() < 0.5 ? 'left' : 'right';
}

function placeBet(bet) {
  const winner = flipCoin();
  if (bet === winner) {
    resultText.textContent = `🎉 You won! The ${winner} dueler wins!`;
    resultText.style.color = 'green';
  } else {
    resultText.textContent = `😞 You lost. The ${winner} dueler wins. Try again!`;
    resultText.style.color = 'red';
  }
}

betLeftBtn.addEventListener('click', () => placeBet('left'));
betRightBtn.addEventListener('click', () => placeBet('right'));
