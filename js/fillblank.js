setActiveNav("fillblank");

const emptyNote = document.getElementById("emptyNote");
const quizArea = document.getElementById("quizArea");
const summaryArea = document.getElementById("summaryArea");
const progressStat = document.getElementById("progressStat");
const scoreStat = document.getElementById("scoreStat");
const sentenceEl = document.getElementById("sentenceEl");
const answerBox = document.getElementById("answerBox");
const answerZh = document.getElementById("answerZh");
const answerPy = document.getElementById("answerPy");
const answerEn = document.getElementById("answerEn");
const showAnswerBtn = document.getElementById("showAnswerBtn");
const judgeRow = document.getElementById("judgeRow");
const rightBtn = document.getElementById("rightBtn");
const wrongBtn = document.getElementById("wrongBtn");
const restartBtn = document.getElementById("restartBtn");
const finalScore = document.getElementById("finalScore");
const finalTotal = document.getElementById("finalTotal");

let queue = shuffle(getSelectedVocab());
let idx = 0;
let score = 0;

if (!queue.length) {
  quizArea.classList.add("hidden");
  emptyNote.classList.remove("hidden");
} else {
  loadCard();
}

function loadCard() {
  const word = queue[idx];
  const example = pickRandom(word.examples);
  sentenceEl.innerHTML = blankSentence(example, word.chinese);
  answerBox.classList.add("hidden");
  showAnswerBtn.classList.remove("hidden");
  judgeRow.classList.add("hidden");
  progressStat.textContent = `${idx + 1} / ${queue.length}`;
}

showAnswerBtn.addEventListener("click", () => {
  const word = queue[idx];
  answerZh.textContent = word.chinese;
  answerPy.textContent = word.pinyin;
  answerEn.textContent = word.meaning;
  answerBox.classList.remove("hidden");
  showAnswerBtn.classList.add("hidden");
  judgeRow.classList.remove("hidden");
});

function next() {
  idx++;
  if (idx >= queue.length) showSummary();
  else loadCard();
}

rightBtn.addEventListener("click", () => {
  score++;
  scoreStat.textContent = score;
  next();
});

wrongBtn.addEventListener("click", () => {
  next();
});

function showSummary() {
  quizArea.classList.add("hidden");
  summaryArea.classList.remove("hidden");
  finalScore.textContent = score;
  finalTotal.textContent = queue.length;
}

restartBtn.addEventListener("click", () => {
  queue = shuffle(getSelectedVocab());
  idx = 0;
  score = 0;
  scoreStat.textContent = "0";
  summaryArea.classList.add("hidden");
  quizArea.classList.remove("hidden");
  loadCard();
});
