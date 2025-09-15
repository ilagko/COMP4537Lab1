/*
  COMP4537 Lab 1 - Writer page script
  - OOP: uses Note class to encapsulate note behavior
  - Autosaves all notes every 2 seconds
  - Updates "Last saved" timestamp continuously

  Disclosure: Parts of this implementation were assisted by ChatGPT.
*/

(() => {
  'use strict';
  const { StorageService, Note } = window.LAB1;
  const M = window.USER_MESSAGES;

  const $ = (id) => document.getElementById(id);

  const formatTime = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  class WriterApp {
    constructor() {
      this.notes = [];
      this.autosaveTimer = null;
      this.saveIntervalMs = 2000;
      this._bindDom();
      this._localize();
      this._loadExisting();
      this._renderAll();
      this._startAutosave();
      this._listenStorageEvents();
    }

    _bindDom() {
      this.titleEl = $('title');
      this.statusEl = $('status');
      this.hintEl = $('hint');
      this.addBtn = $('addBtn');
      this.notesEl = $('notes');
      this.emptyEl = $('empty');
      this.backBtn = $('backBtn');
      this.addBtn.addEventListener('click', () => this.addNote());
    }

    _localize() {
      this.titleEl.textContent = M.writer.title;
      this.hintEl.textContent = M.writer.autosaveOn;
      this.addBtn.textContent = M.common.addNote;
      this.emptyEl.textContent = M.common.noNotes;
      this.backBtn.textContent = M.common.back;
      this._updateStatus(StorageService.getLastSavedISO());
    }

    _updateStatus(lastSavedIso) {
      const label = `${M.common.lastSaved} ${formatTime(lastSavedIso)}`;
      this.statusEl.textContent = label;
    }

    _loadExisting() {
      const rawNotes = StorageService.loadNotes();
      this.notes = rawNotes.map((n) => new Note(n));
    }

    _renderAll() {
      this.notesEl.innerHTML = '';
      if (this.notes.length === 0) {
        this.emptyEl.style.display = 'block';
      } else {
        this.emptyEl.style.display = 'none';
      }
      for (const note of this.notes) {
        const { wrapper } = note.render({
          onRemove: (n) => this.removeNote(n),
          messages: M,
        });
        this.notesEl.appendChild(wrapper);
      }
    }

    addNote() {
      const note = new Note();
      this.notes.push(note);
      const { wrapper } = note.render({
        onRemove: (n) => this.removeNote(n),
        messages: M,
      });
      this.notesEl.appendChild(wrapper);
      this.emptyEl.style.display = 'none';
      // Immediate save to reflect across tabs quickly
      this._saveAll();
    }

    removeNote(note) {
      const idx = this.notes.findIndex((n) => n.id === note.id);
      if (idx !== -1) {
        this.notes.splice(idx, 1);
        note.destroyDom();
        this._saveAll(); // Save instantly on remove as per requirements
      }
      if (this.notes.length === 0) this.emptyEl.style.display = 'block';
    }

    _saveAll() {
      const plain = this.notes.map((n) => n.toJSON());
      const iso = StorageService.saveNotes(plain);
      this._updateStatus(iso);
    }

    _startAutosave() {
      if (this.autosaveTimer) clearInterval(this.autosaveTimer);
      this.autosaveTimer = setInterval(() => {
        this._saveAll();
      }, this.saveIntervalMs);
    }

    _listenStorageEvents() {
      window.addEventListener('storage', (evt) => {
        if (evt.key === window.LAB1.STORAGE_KEYS.notes) {
          // Another tab saved; update our view
          this._loadExisting();
          this._renderAll();
        }
        if (evt.key === window.LAB1.STORAGE_KEYS.lastSavedISO) {
          this._updateStatus(evt.newValue);
        }
      });
    }
  }

  // Bootstrap
  window.addEventListener('DOMContentLoaded', () => new WriterApp());
})();

