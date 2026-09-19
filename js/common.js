const STORAGE_KEY = "s2zh_selection_v1";
const STATS_KEY = "s2zh_stats_v1";

function loadSelection() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveSelection(chineseArr) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chineseArr));
  } catch (e) {
    /* storage unavailable, ignore */
  }
}

// Falls back to the full list when nothing has been selected yet,
// so the practice pages are usable before a first visit to the homepage.
function getSelectedVocab() {
  const sel = loadSelection();
  if (!sel.length) return VOCAB.slice();
  const set = new Set(sel);
  const filtered = VOCAB.filter((v) => set.has(v.chinese));
  return filtered.length ? filtered : VOCAB.slice();
}

// { [chinese]: { right, wrong } }, shared by every practice mode.
function loadStats() {
  try {
    const stats = JSON.parse(localStorage.getItem(STATS_KEY));
    return stats && typeof stats === "object" ? stats : {};
  } catch (e) {
    return {};
  }
}

function clearStats() {
  try {
    localStorage.removeItem(STATS_KEY);
  } catch (e) {
    /* storage unavailable, ignore */
  }
}

function recordResult(chinese, correct) {
  const stats = loadStats();
  const entry = stats[chinese] || { right: 0, wrong: 0 };
  entry[correct ? "right" : "wrong"]++;
  stats[chinese] = entry;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    /* storage unavailable, ignore */
  }
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function playSound(path) {
  const audio = new Audio(path);
  audio.play().catch(() => {});
  return audio;
}

let cachedZhVoice = null;
let voicesReady = false;

function primeVoices() {
  if (!("speechSynthesis" in window)) return;
  const pick = () => {
    const voices = window.speechSynthesis.getVoices();
    cachedZhVoice =
      voices.find((v) => /zh-CN|zh_CN/i.test(v.lang)) ||
      voices.find((v) => /^zh/i.test(v.lang)) ||
      null;
    voicesReady = true;
  };
  pick();
  window.speechSynthesis.onvoiceschanged = pick;
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "zh-CN";
  if (cachedZhVoice) utter.voice = cachedZhVoice;
  window.speechSynthesis.speak(utter);
}

primeVoices();

function blankSentence(sentence, word) {
  return sentence.split(word).join('<span class="blank">&nbsp;</span>');
}

function wrongWordSentence(sentence, word, wrongWord) {
  return sentence.split(word).join(`<u class="wrong-word">${wrongWord}</u>`);
}

function setActiveNav(id) {
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.toggle("active", a.dataset.nav === id);
  });
}
