const screens = document.querySelectorAll('.screen');
const codeFragments = [];

function showScreen(id) {
  screens.forEach((screen) => screen.classList.toggle('active', screen.id === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showFragment(digit, nextScreen) {
  codeFragments.push(digit);
  document.getElementById('fragment-digit').textContent = digit;
  document.getElementById('fragment-position').textContent = codeFragments.length;
  const slots = document.getElementById('code-slots');
  slots.replaceChildren(...Array.from({ length: 4 }, (_, index) => {
    const slot = document.createElement('span');
    if (codeFragments[index]) {
      slot.textContent = codeFragments[index];
      slot.classList.add('revealed');
    } else {
      slot.textContent = '•';
    }
    return slot;
  }));
  const next = document.getElementById('fragment-next');
  next.dataset.nextScreen = nextScreen;
  next.innerHTML = nextScreen === 'code-entry' ? 'Naar de kluis <span>→</span>' : 'Naar het volgende spel <span>→</span>';
  showScreen('code-fragment');
}

document.getElementById('fragment-next').addEventListener('click', (event) => showScreen(event.currentTarget.dataset.nextScreen));

document.querySelectorAll('[data-go]').forEach((button) => {
  button.addEventListener('click', () => showScreen(button.dataset.go));
});

document.getElementById('test-go').addEventListener('click', () => {
  showScreen(document.getElementById('test-page').value);
});

const wordGrid = [
  'SVINLPLOPBS', 'CVXMLCSUTRX', 'HRWOERYYAZE', 'ADIPKDOEDJE',
  'TICPKTSPVGF', 'JEFIENBCDMR', 'EUTERDLAIVJ', 'TWCEDYUTBMY',
  'ZJSZIICSKEF', 'AGCUNHEVHEY', 'NUTIGPZGTIP',
];
const words = {
  DOEDJE: [38, 39, 40, 41, 42, 43],
  BABEY: [61, 73, 85, 97, 109],
  SCHATJE: [0, 11, 22, 33, 44, 55, 66],
  MOPPIE: [14, 25, 36, 47, 58, 69],
  DUSHI: [71, 83, 95, 107, 119],
  PRE: [8, 20, 32],
  LEKKERDING: [15, 26, 37, 48, 59, 70, 81, 92, 103, 114],
  DIEUW: [34, 45, 56, 67, 78],
  MITCH: [64, 74, 84, 94, 104],
};
const wordSearch = document.getElementById('word-search');
const wordBank = document.getElementById('word-bank');
const wordFeedback = document.getElementById('word-feedback');
let selectedCells = [];
const foundWords = new Set();

wordGrid.join('').split('').forEach((letter, index) => {
  const cell = document.createElement('button');
  cell.type = 'button'; cell.className = 'word-cell'; cell.textContent = letter; cell.dataset.index = index;
  cell.addEventListener('click', () => {
    if (cell.classList.contains('found')) return;
    const position = selectedCells.indexOf(index);
    if (position >= 0) selectedCells.splice(position, 1); else selectedCells.push(index);
    cell.classList.toggle('selected');
    checkWordSelection();
  });
  wordSearch.appendChild(cell);
});
Object.keys(words).forEach((word) => { const label = document.createElement('span'); label.textContent = word; label.id = `word-${word}`; wordBank.appendChild(label); });
document.getElementById('clear-word').addEventListener('click', () => {
  selectedCells = []; wordSearch.querySelectorAll('.selected').forEach((cell) => cell.classList.remove('selected'));
});
function checkWordSelection(showError = false) {
  const selected = [...selectedCells].sort((a, b) => a - b).join(',');
  const found = Object.entries(words).find(([word, positions]) => !foundWords.has(word) && positions.join(',') === selected);
  if (!found) {
    if (showError) wordFeedback.textContent = 'Je hebt nog niet alles gevonden. Probeer opnieuw.';
    return;
  }
  const [word, positions] = found; foundWords.add(word);
  positions.forEach((index) => { const cell = wordSearch.children[index]; cell.classList.remove('selected'); cell.classList.add('found'); });
  document.getElementById(`word-${word}`).classList.add('found'); selectedCells = [];
  if (foundWords.size === Object.keys(words).length) { wordFeedback.textContent = 'Eerste codefragment gevonden!'; wordFeedback.classList.add('success'); setTimeout(() => showFragment('0', 'challenge-2'), 1050); }
  else wordFeedback.textContent = `Gevonden: ${word}. Nog ${Object.keys(words).length - foundWords.size} te gaan!`;
}
document.getElementById('check-word').addEventListener('click', () => checkWordSelection(true));

const icons = ['doed', 'snoet', 'amo', 'roffa', 'sexy', 'dushi'];
const cards = [...icons, ...icons].sort(() => Math.random() - .5);
const memoryGrid = document.getElementById('memory-grid');
const memoryFeedback = document.getElementById('memory-feedback');
let openCards = []; let pairs = 0; let locked = false;
cards.forEach((icon) => {
  const card = document.createElement('button'); card.type = 'button'; card.className = 'memory-card'; card.dataset.icon = icon; card.textContent = icon;
  card.addEventListener('click', () => {
    if (locked || card.classList.contains('open') || card.classList.contains('matched')) return;
    card.classList.add('open'); openCards.push(card);
    if (openCards.length !== 2) return;
    locked = true;
    const [first, second] = openCards;
    if (first.dataset.icon === second.dataset.icon) {
      setTimeout(() => { first.classList.replace('open', 'matched'); second.classList.replace('open', 'matched'); openCards = []; locked = false; pairs += 1; document.getElementById('memory-count').textContent = `${pairs} van 6 paren gevonden`; if (pairs === 6) { memoryFeedback.textContent = 'Tweede codefragment gevonden!'; memoryFeedback.classList.add('success'); setTimeout(() => showFragment('9', 'challenge-3'), 1050); } }, 350);
    } else {
      setTimeout(() => { first.classList.remove('open'); second.classList.remove('open'); openCards = []; locked = false; }, 750);
    }
  });
  memoryGrid.appendChild(card);
});

document.querySelectorAll('.quiz fieldset').forEach((question) => {
  question.querySelectorAll('button').forEach((option) => option.addEventListener('click', () => {
    question.querySelectorAll('button').forEach((button) => button.classList.remove('selected', 'correct', 'wrong'));
    option.classList.add('selected');
  }));
});
document.getElementById('check-quiz').addEventListener('click', () => {
  const questions = [...document.querySelectorAll('.quiz fieldset')];
  const unanswered = questions.some((question) => !question.querySelector('.selected'));
  const feedback = document.getElementById('quiz-feedback');
  if (unanswered) { feedback.textContent = 'Beantwoord eerst alle drie de vragen.'; return; }
  let correct = true;
  questions.forEach((question) => { const chosen = question.querySelector('.selected'); if (chosen.dataset.correct === 'true') chosen.classList.add('correct'); else { chosen.classList.add('wrong'); question.querySelector('[data-correct="true"]').classList.add('correct'); correct = false; } });
  if (correct) { questions.forEach((question) => question.querySelectorAll('button').forEach((option) => option.disabled = true)); feedback.textContent = 'Perfect. Het derde codefragment is ontgrendeld…'; feedback.classList.add('success'); setTimeout(() => showFragment('0', 'challenge-4'), 1150); }
  else { feedback.textContent = 'Bijna! Kies de groene antwoorden en probeer opnieuw.'; feedback.classList.remove('success'); }
});

document.querySelectorAll('#cipher-options button').forEach((option) => option.addEventListener('click', () => {
  const feedback = document.getElementById('cipher-feedback');
  if (option.dataset.correct === 'true') {
    document.querySelectorAll('#cipher-options button').forEach((button) => button.disabled = true);
    option.classList.add('correct');
    feedback.textContent = 'Juist! Je hebt alle vier codefragmenten.';
    feedback.classList.add('success');
    setTimeout(() => showFragment('9', 'code-entry'), 950);
  } else {
    option.classList.add('wrong');
    feedback.textContent = 'Nog niet helemaal. Kijk goed naar de verdubbeling.';
  }
}));

document.getElementById('code-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const feedback = document.getElementById('code-feedback');
  const value = event.currentTarget.elements['unlock-code'].value.trim();
  if (value === '0909') {
    feedback.textContent = 'De kluis gaat open…';
    feedback.classList.add('success');
    setTimeout(() => showScreen('finale'), 800);
  } else {
    feedback.textContent = 'Deze code opent de kluis niet. Kijk nog eens naar je vier fragmenten.';
    feedback.classList.remove('success');
  }
});

function celebrate() {
  showScreen('celebration');
  const colors = ['#e9597c', '#ffc851', '#84c9b0', '#9587d8', '#ff9d6c'];
  const layer = document.getElementById('confetti');
  for (let index = 0; index < 90; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[index % colors.length];
    piece.style.setProperty('--drift', `${(Math.random() - .5) * 32}vw`);
    piece.style.animationDelay = `${Math.random() * .55}s`;
    layer.appendChild(piece);
    setTimeout(() => piece.remove(), 4600);
  }
}

document.getElementById('yes').addEventListener('click', celebrate);
document.getElementById('no').addEventListener('click', () => document.getElementById('no-dialog').showModal());
