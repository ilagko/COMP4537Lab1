/*
  COMP4537 Lab 1 - Common utilities and classes
  - StorageService: JSON localStorage wrapper
  - Note: OOP model for a note with DOM rendering helpers

  Disclosure: Parts of this implementation were assisted by ChatGPT.
*/

(() => {
  'use strict';

  const STORAGE_KEYS = Object.freeze({
    notes: 'lab1_notes_v1',
    lastSavedISO: 'lab1_last_saved_iso',
    lastRetrievedISO: 'lab1_last_retrieved_iso',
  });

  class StorageService {
    static loadNotes() {
      const raw = localStorage.getItem(STORAGE_KEYS.notes);
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    static saveNotes(notesArray) {
      const safe = Array.isArray(notesArray) ? notesArray : [];
      localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(safe));
      const nowIso = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.lastSavedISO, nowIso);
      return nowIso;
    }

    static markRetrieved() {
      const nowIso = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.lastRetrievedISO, nowIso);
      return nowIso;
    }

    static getLastSavedISO() {
      return localStorage.getItem(STORAGE_KEYS.lastSavedISO);
    }

    static getLastRetrievedISO() {
      return localStorage.getItem(STORAGE_KEYS.lastRetrievedISO);
    }
  }

  let nextId = Date.now();
  const generateId = () => `${Date.now()}-${nextId++}`;

  class Note {
    constructor({ id = generateId(), text = '', createdAt = new Date().toISOString(), updatedAt = createdAt } = {}) {
      this.id = id;
      this.text = text;
      this.createdAt = createdAt;
      this.updatedAt = updatedAt;
      this._elements = null; // lazily created DOM elements
    }

    updateText(value) {
      this.text = value;
      this.updatedAt = new Date().toISOString();
    }

    toJSON() {
      return {
        id: this.id,
        text: this.text,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
      };
    }

    // Render a note row: textarea + remove button
    render({ onRemove, messages }) {
      if (this._elements) return this._elements;

      const wrapper = document.createElement('div');
      wrapper.className = 'note';

      const textarea = document.createElement('textarea');
      textarea.placeholder = messages.common.notePlaceholder;
      textarea.value = this.text;

      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn danger remove-btn';
      removeBtn.textContent = messages.common.remove;

      textarea.addEventListener('input', (e) => {
        this.updateText(e.target.value);
      });

      removeBtn.addEventListener('click', () => {
        if (typeof onRemove === 'function') onRemove(this);
      });

      wrapper.appendChild(textarea);
      wrapper.appendChild(removeBtn);

      this._elements = { wrapper, textarea, removeBtn };
      return this._elements;
    }

    destroyDom() {
      if (this._elements?.wrapper?.parentElement) {
        this._elements.wrapper.parentElement.removeChild(this._elements.wrapper);
      }
      this._elements = null;
    }
  }

  // Expose to global namespace under LAB1 to avoid polluting window
  window.LAB1 = Object.freeze({ STORAGE_KEYS, StorageService, Note });
})();

