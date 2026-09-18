setActiveNav("home");

const listEl = document.getElementById("vocabList");
const countEl = document.getElementById("selectedCount");
const totalEl = document.getElementById("totalCount");

totalEl.textContent = VOCAB.length + " words";

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

    row.append(cb, word, pinyin, meaning);
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
  if (btn.dataset.action === "all") {
    setSelection(VOCAB.map((v) => v.chinese));
    return;
  }
  if (btn.dataset.action === "clear") {
    setSelection([]);
    return;
  }
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
