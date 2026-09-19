setActiveNav("game");

const SESSION_TIME = 40;
const FALL_DURATION = 3800;
const SPAWN_INTERVAL = 700;
const RADIUS = 27;
const CIRC = 2 * Math.PI * RADIUS;

const emptyNote = document.getElementById("emptyNote");
const startArea = document.getElementById("startArea");
const playArea = document.getElementById("playArea");
const summaryArea = document.getElementById("summaryArea");
const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const scoreStat = document.getElementById("scoreStat");
const missStat = document.getElementById("missStat");
const timeNum = document.getElementById("timeNum");
const timerCircle = document.getElementById("timerCircle");
const sentenceBoard = document.getElementById("sentenceBoard");
const fallZone = document.getElementById("fallZone");
const finalScore = document.getElementById("finalScore");
const finalSub = document.getElementById("finalSub");

timerCircle.style.strokeDasharray = CIRC;
timerCircle.style.strokeDashoffset = 0;

const pool = getSelectedVocab();

let wordQueue = [];
let wordQueueIdx = 0;
let currentTarget = null;
let currentCandidates = [];

let sessionActive = false;
let countdownTimer = null;
let spawnTimer = null;
let timeLeft = SESSION_TIME;
let tickerAudio = null;
let score = 0;
let misses = 0;

if (!pool.length) {
  startArea.classList.add("hidden");
  emptyNote.classList.remove("hidden");
}

function nextQueueWord() {
  if (wordQueueIdx >= wordQueue.length) {
    wordQueue = shuffle(pool);
    wordQueueIdx = 0;
  }
  return wordQueue[wordQueueIdx++];
}

function buildCandidates(target) {
  let distractors = shuffle(pool.filter((v) => v.chinese !== target.chinese)).slice(0, 4);
  if (distractors.length < 4) {
    const used = new Set([target.chinese, ...distractors.map((d) => d.chinese)]);
    const extra = shuffle(VOCAB.filter((v) => !used.has(v.chinese)));
    for (const e of extra) {
      if (distractors.length >= 4) break;
      distractors.push(e);
    }
  }
  return shuffle([target, ...distractors]);
}

function setupSentence() {
  currentTarget = nextQueueWord();
  currentCandidates = buildCandidates(currentTarget);
  const example = pickRandom(currentTarget.examples);
  sentenceBoard.innerHTML = blankSentence(example, currentTarget.chinese);
  fallZone.innerHTML = "";
}

function flashBoard(cls) {
  sentenceBoard.classList.remove("flash-good", "flash-bad");
  void sentenceBoard.offsetWidth;
  sentenceBoard.classList.add(cls);
}

function spawnFallingWord() {
  if (!sessionActive) return;
  const cand = pickRandom(currentCandidates);
  const el = document.createElement("div");
  el.className = "falling-word cjk";
  el.textContent = cand.chinese;
  el.style.left = 10 + Math.random() * 74 + "%";
  el.style.transitionDuration = FALL_DURATION + "ms";
  fallZone.appendChild(el);

  let settled = false;
  requestAnimationFrame(() => {
    el.style.top = fallZone.clientHeight + 80 + "px";
  });

  const expireTimer = setTimeout(() => {
    if (settled) return;
    settled = true;
    el.remove();
  }, FALL_DURATION + 50);

  el.addEventListener("click", () => {
    if (settled || !sessionActive) return;
    settled = true;
    clearTimeout(expireTimer);
    el.remove();

    if (cand.chinese === currentTarget.chinese) {
      playSound("correct.mp3");
      recordResult(currentTarget.chinese, true);
      score++;
      scoreStat.textContent = score;
      flashBoard("flash-good");
      setupSentence();
    } else {
      playSound("wrong-answer.mp3");
      recordResult(currentTarget.chinese, false);
      misses++;
      missStat.textContent = misses;
      flashBoard("flash-bad");
    }
  });
}

function updateTimerUI() {
  const clamped = Math.max(timeLeft, 0);
  timeNum.textContent = clamped;
  const ratio = clamped / SESSION_TIME;
  timerCircle.style.strokeDashoffset = CIRC * (1 - ratio);
  timerCircle.classList.toggle("urgent", clamped <= 5);
}

function startSession() {
  sessionActive = true;
  timeLeft = SESSION_TIME;
  score = 0;
  misses = 0;
  scoreStat.textContent = "0";
  missStat.textContent = "0";
  updateTimerUI();

  wordQueue = shuffle(pool);
  wordQueueIdx = 0;
  setupSentence();

  tickerAudio = playSound("ticker.mp3");
  tickerAudio.loop = true;

  countdownTimer = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) endSession();
  }, 1000);

  spawnFallingWord();
  spawnTimer = setInterval(spawnFallingWord, SPAWN_INTERVAL);
}

function endSession() {
  if (!sessionActive) return;
  sessionActive = false;
  clearInterval(countdownTimer);
  clearInterval(spawnTimer);
  if (tickerAudio) {
    tickerAudio.pause();
    tickerAudio = null;
  }
  fallZone.innerHTML = "";
  showSummary();
}

function showSummary() {
  playArea.classList.add("hidden");
  summaryArea.classList.remove("hidden");
  finalScore.textContent = score;
  finalSub.textContent = `words caught (${misses} wrong tap${misses === 1 ? "" : "s"})`;
}

startBtn.addEventListener("click", () => {
  startArea.classList.add("hidden");
  playArea.classList.remove("hidden");
  startSession();
});

playAgainBtn.addEventListener("click", () => {
  summaryArea.classList.add("hidden");
  playArea.classList.remove("hidden");
  startSession();
});
