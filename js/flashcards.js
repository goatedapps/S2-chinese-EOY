setActiveNav("flashcards");

const cardInner = document.getElementById("cardInner");
const cardFront = document.getElementById("cardFront");
const cardMeaning = document.getElementById("cardMeaning");
const cardPinyin = document.getElementById("cardPinyin");
const cardExample = document.getElementById("cardExample");
const progressEl = document.getElementById("progress");
const cardArea = document.getElementById("cardArea");
const emptyNote = document.getElementById("emptyNote");

let deck = shuffle(getSelectedVocab());
let idx = 0;
let flipped = false;

if (!deck.length) {
  cardArea.classList.add("hidden");
  emptyNote.classList.remove("hidden");
} else {
  render();
}

function render() {
  const v = deck[idx];
  cardFront.textContent = v.chinese;
  cardMeaning.textContent = v.meaning;
  cardPinyin.textContent = v.pinyin;
  cardExample.textContent = v.examples[0];
  progressEl.textContent = `${idx + 1} / ${deck.length}`;
  cardInner.classList.remove("flipped");
  flipped = false;
}

function flip() {
  flipped = !flipped;
  cardInner.classList.toggle("flipped");
  playSound("flip.mp3");
}

cardInner.addEventListener("click", flip);

document.getElementById("nextBtn").addEventListener("click", () => {
  idx = (idx + 1) % deck.length;
  render();
});

document.getElementById("prevBtn").addEventListener("click", () => {
  idx = (idx - 1 + deck.length) % deck.length;
  render();
});

document.getElementById("shuffleBtn").addEventListener("click", () => {
  deck = shuffle(deck);
  idx = 0;
  render();
});

document.getElementById("speakBtn").addEventListener("click", (e) => {
  e.stopPropagation();
  const v = deck[idx];
  speak(flipped ? v.examples[0] : v.chinese);
});
