// ChatGPT 5 authored the formatTime function in its entirety
// ChatGPT 5 was used for documentation and comments for scripts/script.js

// Turn an ISO string into something readable for the UI.
function formatTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

// Simple Note class (id + text only).
class Note {
  constructor(id, text) {
    if (id) {
      this.id = id;
    } else {
      this.id = (Date.now() + Math.random()).toString();
    }
    if (typeof text === "string") {
      this.text = text;
    } else {
      this.text = "";
    }
  }
  toJSON() {
    return { id: this.id, text: this.text };
  }
}

// Read notes array from localStorage (stored as JSON under key "notes").
function loadNotes() {
  const raw = localStorage.getItem("notes");
  if (raw) {
    return JSON.parse(raw);
  } else {
    return [];
  }
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

// Index page as a tiny class.
class IndexPage {
  init() {
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
}

class WriterApp {
  constructor() {
    this.title = document.getElementById("title");
    this.status = document.getElementById("status");
    this.hint = document.getElementById("hint");
    this.addBtn = document.getElementById("addBtn");
    this.notesEl = document.getElementById("notes");
    this.emptyEl = document.getElementById("empty");
    this.backBtn = document.getElementById("backBtn");

    document.title = USER_MESSAGES.writer.title;
    if (this.title) this.title.textContent = USER_MESSAGES.writer.title;
    if (this.hint) this.hint.textContent = USER_MESSAGES.writer.hint;
    if (this.addBtn) this.addBtn.textContent = USER_MESSAGES.common.addNote;
    if (this.emptyEl) this.emptyEl.textContent = USER_MESSAGES.common.noNotes;
    if (this.backBtn) this.backBtn.textContent = USER_MESSAGES.common.back;
    if (this.status) this.status.textContent = USER_MESSAGES.common.lastSaved + " " + formatTime(getLastSaved());

    // Load any existing notes from storage into Note objects.
    this.notes = loadNotes().map(function (n) { return new Note(n.id, n.text); });
    this.render();

    // Add button creates a fresh empty note.
    if (this.addBtn) this.addBtn.addEventListener("click", () => this.addNote());

    // Very simple autosave loop every 2 seconds.
    setInterval(() => this.saveNow(), 2000);

    // Keep this page updated if another tab changes localStorage.
    window.addEventListener("storage", (e) => {
      if (e.key === "notes") {
        this.notes = loadNotes().map(function (n) { return new Note(n.id, n.text); });
        this.render();
      }
      if (e.key === "lastSaved") {
        if (this.status) this.status.textContent = USER_MESSAGES.common.lastSaved + " " + formatTime(e.newValue);
      }
    });
  }

  render() {
    const listEl = this.notesEl;
    const emptyEl = this.emptyEl;
    listEl.innerHTML = "";
    if (this.notes.length === 0) {
      emptyEl.style.display = "block";
    } else {
      emptyEl.style.display = "none";
    }
    // Build rows for each note in order.
    for (let i = 0; i < this.notes.length; i++) {
      const n = this.notes[i];
      const row = document.createElement("div");
      row.className = "note";
      const ta = document.createElement("textarea");
      ta.placeholder = USER_MESSAGES.common.notePlaceholder;
      ta.value = n.text;
      ta.addEventListener("input", function (e) { n.text = e.target.value; });
      const btn = document.createElement("button");
      btn.className = "btn danger remove-btn";
      btn.type = "button";
      btn.textContent = USER_MESSAGES.common.remove;
      btn.addEventListener("click", () => this.removeNote(n));
      row.appendChild(ta);
      row.appendChild(btn);
      listEl.appendChild(row);
    }
  }

  addNote() {
    this.notes.push(new Note());
    this.render();
    this.saveNow();
  }

  removeNote(n) {
    this.notes = this.notes.filter((x) => x.id !== n.id);
    this.render();
    this.saveNow();
  }

  // Save to localStorage and update the header timestamp.
  saveNow() {
    const plain = this.notes.map((n) => n.toJSON());
    const iso = saveNotes(plain);
    if (this.status) this.status.textContent = USER_MESSAGES.common.lastSaved + " " + formatTime(iso);
  }
}

class ReaderApp {
  constructor() {
    this.title = document.getElementById("title");
    this.status = document.getElementById("status");
    this.hint = document.getElementById("hint");
    this.backBtn = document.getElementById("backBtn");
    this.notesEl = document.getElementById("notes");
    this.emptyEl = document.getElementById("empty");

    document.title = USER_MESSAGES.reader.title;
    if (this.title) this.title.textContent = USER_MESSAGES.reader.title;
    if (this.hint) this.hint.textContent = USER_MESSAGES.reader.hint;
    if (this.backBtn) this.backBtn.textContent = USER_MESSAGES.common.back;
    if (this.emptyEl) this.emptyEl.textContent = USER_MESSAGES.common.noNotes;
    if (this.status) this.status.textContent = USER_MESSAGES.common.lastRetrieved + " " + formatTime(getLastRetrieved());

    this.refresh();
    setInterval(() => this.refresh(), 2000);
    window.addEventListener("storage", (e) => { if (e.key === "notes") this.refresh(); });
  }

  refresh() {
    const notes = loadNotes();
    markRetrieved();
    if (this.status) this.status.textContent = USER_MESSAGES.common.lastRetrieved + " " + formatTime(getLastRetrieved());
    this.render(notes);
  }

  render(notes) {
    const listEl = this.notesEl;
    const emptyEl = this.emptyEl;
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
      // No shorthand fallback; set value explicitly.
      if (n.text) {
        ta.value = n.text;
      } else {
        ta.value = "";
      }
      ta.readOnly = true;
      row.appendChild(ta);
      const spacer = document.createElement("div");
      spacer.style.width = "100px";
      row.appendChild(spacer);
      listEl.appendChild(row);
    }
  }
}

// Tiny router: decide which page we are on and run it.
document.addEventListener("DOMContentLoaded", function () {
  const p = location.pathname;
  if (p.endsWith("writer.html")) new WriterApp();
  else if (p.endsWith("reader.html")) new ReaderApp();
  else new IndexPage().init();
});
