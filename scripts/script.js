// Some help by ChatGPT
// USER_MESSAGES comes from lang/messages/en/user.js and holds all labels.

// Turn an ISO string into something readable for the UI.
function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

// Object constructor for a Note (id + text only to keep it simple).
function Note(id, text) {
  this.id = id || (Date.now() + Math.random()).toString();
  this.text = text || "";
}
Note.prototype.toJSON = function () { return { id: this.id, text: this.text }; };

// Read notes array from localStorage (stored as JSON under key "notes").
function loadNotes() {
  const raw = localStorage.getItem("notes");
  return raw ? JSON.parse(raw) : [];
}
// Save notes to localStorage and also remember when we last saved.
function saveNotes(arr) {
  localStorage.setItem("notes", JSON.stringify(arr));
  const t = new Date().toISOString();
  localStorage.setItem("lastSaved", t);
  return t;
}
// Helper getters/setters for timestamps.
function getLastSaved() { return localStorage.getItem("lastSaved"); }
function markRetrieved() {
  const t = new Date().toISOString();
  localStorage.setItem("lastRetrieved", t);
  return t;
}
function getLastRetrieved() { return localStorage.getItem("lastRetrieved"); }

// Index page: fill all texts from USER_MESSAGES.
function onIndex() {
  document.title = USER_MESSAGES.index.title;
  const title = document.getElementById("title");
  const student = document.getElementById("student");
  const intro = document.getElementById("intro");
  const writerLink = document.getElementById("writerLink");
  const readerLink = document.getElementById("readerLink");
  if (title) title.textContent = USER_MESSAGES.index.title;
  if (student) student.textContent = USER_MESSAGES.index.student;
  if (intro) intro.textContent = USER_MESSAGES.index.intro;
  if (writerLink) writerLink.textContent = USER_MESSAGES.index.writer;
  if (readerLink) readerLink.textContent = USER_MESSAGES.index.reader;
}

// Draw all writer note rows (textarea + remove button) and wire events.
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
    ta.placeholder = USER_MESSAGES.common.notePlaceholder;
    ta.value = n.text;
    // When the user types, just update the in-memory note.
    ta.addEventListener("input", function (e) {
      n.text = e.target.value;
    });
    const btn = document.createElement("button");
    btn.className = "btn danger remove-btn";
    btn.type = "button";
    btn.textContent = USER_MESSAGES.common.remove;
    // Remove calls the provided handler so the caller can save and re-render.
    btn.addEventListener("click", function () { onRemove(n); });
    row.appendChild(ta);
    row.appendChild(btn);
    listEl.appendChild(row);
  }
}

// Writer page logic: load, render, allow add/remove, autosave every 2s.
function onWriter() {
  const title = document.getElementById("title");
  const status = document.getElementById("status");
  const hint = document.getElementById("hint");
  const addBtn = document.getElementById("addBtn");
  const notesEl = document.getElementById("notes");
  const emptyEl = document.getElementById("empty");
  const backBtn = document.getElementById("backBtn");

  document.title = USER_MESSAGES.writer.title;
  if (title) title.textContent = USER_MESSAGES.writer.title;
  if (hint) hint.textContent = USER_MESSAGES.writer.hint;
  if (addBtn) addBtn.textContent = USER_MESSAGES.common.addNote;
  if (emptyEl) emptyEl.textContent = USER_MESSAGES.common.noNotes;
  if (backBtn) backBtn.textContent = USER_MESSAGES.common.back;
  if (status) status.textContent = USER_MESSAGES.common.lastSaved + " " + formatTime(getLastSaved());

  // Pull any saved notes and wrap them into Note objects.
  let notes = loadNotes().map(function (n) { return new Note(n.id, n.text); });

  function removeNote(n) {
    notes = notes.filter(function (x) { return x.id !== n.id; });
    renderWriterNotes(notesEl, emptyEl, notes, removeNote);
    saveNow();
  }

  // Save all notes to localStorage and update the timestamp text.
  function saveNow() {
    const plain = notes.map(function (n) { return n.toJSON(); });
    const iso = saveNotes(plain);
    if (status) status.textContent = USER_MESSAGES.common.lastSaved + " " + formatTime(iso);
  }

  renderWriterNotes(notesEl, emptyEl, notes, removeNote);

  // Add a new empty note and save immediately.
  if (addBtn) addBtn.addEventListener("click", function () {
    notes.push(new Note());
    renderWriterNotes(notesEl, emptyEl, notes, removeNote);
    saveNow();
  });

  // Autosave every 2 seconds (simple approach for this lab).
  setInterval(function () { saveNow(); }, 2000);

  // If another tab changes localStorage, update our view.
  window.addEventListener("storage", function (e) {
    if (e.key === "notes") {
      notes = loadNotes().map(function (n) { return new Note(n.id, n.text); });
      renderWriterNotes(notesEl, emptyEl, notes, removeNote);
    }
    if (e.key === "lastSaved") {
      if (status) status.textContent = USER_MESSAGES.common.lastSaved + " " + formatTime(e.newValue);
    }
  });
}

// Reader: show read-only textareas and keep them updated.
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

// Reader page logic: poll every 2s and also react to storage events.
function onReader() {
  const title = document.getElementById("title");
  const status = document.getElementById("status");
  const hint = document.getElementById("hint");
  const backBtn = document.getElementById("backBtn");
  const notesEl = document.getElementById("notes");
  const emptyEl = document.getElementById("empty");

  document.title = USER_MESSAGES.reader.title;
  if (title) title.textContent = USER_MESSAGES.reader.title;
  if (hint) hint.textContent = USER_MESSAGES.reader.hint;
  if (backBtn) backBtn.textContent = USER_MESSAGES.common.back;
  if (emptyEl) emptyEl.textContent = USER_MESSAGES.common.noNotes;
  if (status) status.textContent = USER_MESSAGES.common.lastRetrieved + " " + formatTime(getLastRetrieved());

  // Pull from localStorage, mark the time, and render.
  function refresh() {
    const notes = loadNotes();
    markRetrieved();
    if (status) status.textContent = USER_MESSAGES.common.lastRetrieved + " " + formatTime(getLastRetrieved());
    renderReaderNotes(notesEl, emptyEl, notes);
  }

  refresh();
  // Simple polling (every 2 seconds) so the view stays fresh.
  setInterval(refresh, 2000);

  // Update instantly if writer tab changes storage.
  window.addEventListener("storage", function (e) {
    if (e.key === "notes") refresh();
  });
}

// Tiny router: decide which page we are on and run it.
document.addEventListener("DOMContentLoaded", function () {
  const p = location.pathname;
  if (p.endsWith("writer.html")) onWriter();
  else if (p.endsWith("reader.html")) onReader();
  else onIndex();
});
