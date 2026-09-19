setActiveNav("home");

const listEl = document.getElementById("vocabList");
const countEl = document.getElementById("selectedCount");
const totalEl = document.getElementById("totalCount");

totalEl.textContent = VOCAB.length + " words";

const stats = loadStats();
const oftenWrong = VOCAB.filter((v) => {
  const s = stats[v.chinese];
  return s && s.wrong > s.right;
}).map((v) => v.chinese);

const oftenWrongBtn = document.getElementById("oftenWrongBtn");
oftenWrongBtn.textContent = `Often wrong (${oftenWrong.length})`;
oftenWrongBtn.disabled = !oftenWrong.length;

const savedSelection = loadSelection();
// First-ever visit: nothing saved yet, so start with everything checked.
let selected = new Set(savedSelection.length ? savedSelection : VOCAB.map((v) => v.chinese));

function persist() {
  saveSelection(Array.from(selected));
  countEl.textContent = selected.size;
}

function renderList() {
  listEl.innerHTML = "";
  VOCAB.forEach((v) => {
    const row = document.createElement("label");
    row.className = "vocab-row";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = selected.has(v.chinese);
    cb.addEventListener("change", () => {
      if (cb.checked) selected.add(v.chinese);
      else selected.delete(v.chinese);
      persist();
    });

    const word = document.createElement("span");
    word.className = "vocab-word";
    word.textContent = v.chinese;

    const pinyin = document.createElement("span");
    pinyin.className = "vocab-pinyin";
    pinyin.textContent = v.pinyin;

    const meaning = document.createElement("span");
    meaning.className = "vocab-meaning";
    meaning.textContent = v.meaning;

    const s = stats[v.chinese];
    if (s) {
      const stat = document.createElement("span");
      stat.className = "vocab-stat";
      stat.innerHTML = `✓ ${s.right} <span class="bad">✗ ${s.wrong}</span>`;
      row.append(cb, word, pinyin, meaning, stat);
    } else {
      row.append(cb, word, pinyin, meaning);
    }
    listEl.appendChild(row);
  });
}

function setSelection(chineseList) {
  selected = new Set(chineseList);
  persist();
  renderList();
}

document.getElementById("quickSelect").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.range) {
    const [start, end] = btn.dataset.range.split("-").map(Number);
    setSelection(VOCAB.slice(start - 1, end).map((v) => v.chinese));
    return;
  }
  if (btn.dataset.action === "random10") {
    setSelection(shuffle(VOCAB).slice(0, 10).map((v) => v.chinese));
    return;
  }
  if (btn.dataset.action === "often-wrong") {
    setSelection(oftenWrong);
    return;
  }
  if (btn.dataset.action === "all") {
    setSelection(VOCAB.map((v) => v.chinese));
    return;
  }
  if (btn.dataset.action === "clear") {
    setSelection([]);
    return;
  }
});

document.getElementById("resetStatsBtn").addEventListener("click", () => {
  if (!confirm("Reset all right/wrong counts?")) return;
  clearStats();
  location.reload();
});

document.getElementById("modeToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".mode-opt");
  if (!btn) return;
  document.querySelectorAll(".mode-opt").forEach((o) => o.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("startLink").href = btn.dataset.page;
});

persist();
renderList();
