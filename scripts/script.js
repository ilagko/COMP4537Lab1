// Some help by ChatGPT

const MSG = {
  index: {
    title: "Lab 1: JSON, Object Constructor, localStorage",
    student: "Student name",
    intro: "Choose a page:",
    writer: "Writer",
    reader: "Reader",
  },
  common: {
    back: "Back to Home",
    lastSaved: "Last saved:",
    lastRetrieved: "Last retrieved:",
    noNotes: "No notes yet.",
    notePlaceholder: "Type your note here...",
    remove: "Remove",
    addNote: "Add Note",
  },
  writer: { title: "Writer", hint: "Autosaving every 2s" },
  reader: { title: "Reader", hint: "Refreshing every 2s" },
};

function formatTime(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
}

function Note(id, text) {
  this.id = id || (Date.now() + Math.random()).toString();
  this.text = text || "";
}
Note.prototype.toJSON = function () { return { id: this.id, text: this.text }; };

function loadNotes() {
  try {
    const x = JSON.parse(localStorage.getItem("notes"));
    return Array.isArray(x) ? x : [];
  } catch (e) { return []; }
}
function saveNotes(arr) {
  localStorage.setItem("notes", JSON.stringify(arr));
  const t = new Date().toISOString();
  localStorage.setItem("lastSaved", t);
  return t;
}
function getLastSaved() { return localStorage.getItem("lastSaved"); }
function markRetrieved() {
  const t = new Date().toISOString();
  localStorage.setItem("lastRetrieved", t);
  return t;
}
function getLastRetrieved() { return localStorage.getItem("lastRetrieved"); }

function onIndex() {
  document.title = MSG.index.title;
  const title = document.getElementById("title");
  const student = document.getElementById("student");
  const intro = document.getElementById("intro");
  const writerLink = document.getElementById("writerLink");
  const readerLink = document.getElementById("readerLink");
  if (title) title.textContent = MSG.index.title;
  if (student) student.textContent = MSG.index.student;
  if (intro) intro.textContent = MSG.index.intro;
  if (writerLink) writerLink.textContent = MSG.index.writer;
  if (readerLink) readerLink.textContent = MSG.index.reader;
}

function renderWriterNotes(listEl, emptyEl, notes, onRemove) {
  listEl.innerHTML = "";
  if (notes.length === 0) {
    emptyEl.style.display = "block";
  } else {
    emptyEl.style.display = "none";
  }
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    const row = document.createElement("div");
    row.className = "note";
    const ta = document.createElement("textarea");
    ta.placeholder = MSG.common.notePlaceholder;
    ta.value = n.text;
    ta.addEventListener("input", function (e) {
      n.text = e.target.value;
    });
    const btn = document.createElement("button");
    btn.className = "btn danger remove-btn";
    btn.type = "button";
    btn.textContent = MSG.common.remove;
    btn.addEventListener("click", function () { onRemove(n); });
    row.appendChild(ta);
    row.appendChild(btn);
    listEl.appendChild(row);
  }
}

function onWriter() {
  const title = document.getElementById("title");
  const status = document.getElementById("status");
  const hint = document.getElementById("hint");
  const addBtn = document.getElementById("addBtn");
  const notesEl = document.getElementById("notes");
  const emptyEl = document.getElementById("empty");
  const backBtn = document.getElementById("backBtn");

  document.title = MSG.writer.title;
  if (title) title.textContent = MSG.writer.title;
  if (hint) hint.textContent = MSG.writer.hint;
  if (addBtn) addBtn.textContent = MSG.common.addNote;
  if (emptyEl) emptyEl.textContent = MSG.common.noNotes;
  if (backBtn) backBtn.textContent = MSG.common.back;
  if (status) status.textContent = MSG.common.lastSaved + " " + formatTime(getLastSaved());

  let notes = loadNotes().map(function (n) { return new Note(n.id, n.text); });

  function removeNote(n) {
    notes = notes.filter(function (x) { return x.id !== n.id; });
    renderWriterNotes(notesEl, emptyEl, notes, removeNote);
    saveNow();
  }

  function saveNow() {
    const plain = notes.map(function (n) { return n.toJSON(); });
    const iso = saveNotes(plain);
    if (status) status.textContent = MSG.common.lastSaved + " " + formatTime(iso);
  }

  renderWriterNotes(notesEl, emptyEl, notes, removeNote);

  if (addBtn) addBtn.addEventListener("click", function () {
    notes.push(new Note());
    renderWriterNotes(notesEl, emptyEl, notes, removeNote);
    saveNow();
  });

  setInterval(function () { saveNow(); }, 2000);

  window.addEventListener("storage", function (e) {
    if (e.key === "notes") {
      notes = loadNotes().map(function (n) { return new Note(n.id, n.text); });
      renderWriterNotes(notesEl, emptyEl, notes, removeNote);
    }
    if (e.key === "lastSaved") {
      if (status) status.textContent = MSG.common.lastSaved + " " + formatTime(e.newValue);
    }
  });
}

function renderReaderNotes(listEl, emptyEl, notes) {
  listEl.innerHTML = "";
  if (notes.length === 0) {
    emptyEl.style.display = "block";
    return;
  }
  emptyEl.style.display = "none";
  for (let i = 0; i < notes.length; i++) {
    const n = notes[i];
    const row = document.createElement("div");
    row.className = "note";
    const ta = document.createElement("textarea");
    ta.value = n.text || "";
    ta.readOnly = true;
    row.appendChild(ta);
    const spacer = document.createElement("div");
    spacer.style.width = "100px";
    row.appendChild(spacer);
    listEl.appendChild(row);
  }
}

function onReader() {
  const title = document.getElementById("title");
  const status = document.getElementById("status");
  const hint = document.getElementById("hint");
  const backBtn = document.getElementById("backBtn");
  const notesEl = document.getElementById("notes");
  const emptyEl = document.getElementById("empty");

  document.title = MSG.reader.title;
  if (title) title.textContent = MSG.reader.title;
  if (hint) hint.textContent = MSG.reader.hint;
  if (backBtn) backBtn.textContent = MSG.common.back;
  if (emptyEl) emptyEl.textContent = MSG.common.noNotes;
  if (status) status.textContent = MSG.common.lastRetrieved + " " + formatTime(getLastRetrieved());

  function refresh() {
    const notes = loadNotes();
    markRetrieved();
    if (status) status.textContent = MSG.common.lastRetrieved + " " + formatTime(getLastRetrieved());
    renderReaderNotes(notesEl, emptyEl, notes);
  }

  refresh();
  setInterval(refresh, 2000);

  window.addEventListener("storage", function (e) {
    if (e.key === "notes") refresh();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const p = location.pathname;
  if (p.endsWith("writer.html")) onWriter();
  else if (p.endsWith("reader.html")) onReader();
  else onIndex();
});

