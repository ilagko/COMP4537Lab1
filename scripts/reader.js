/*
  COMP4537 Lab 1 - Reader page script
  - Polls localStorage every 2 seconds
  - Updates "Last retrieved" timestamp
  - Also listens for storage events to update instantly across tabs

  Disclosure: Parts of this implementation were assisted by ChatGPT.
*/

(() => {
  'use strict';
  const { StorageService } = window.LAB1;
  const M = window.USER_MESSAGES;
  const $ = (id) => document.getElementById(id);

  const formatTime = (iso) => {
    if (!iso) return '—';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  };

  class ReaderApp {
    constructor() {
      this.refreshTimer = null;
      this.intervalMs = 2000;
      this._bindDom();
      this._localize();
      this.refresh();
      this._startPolling();
      this._listenStorageEvents();
    }

    _bindDom() {
      this.titleEl = $('title');
      this.statusEl = $('status');
      this.hintEl = $('hint');
      this.notesEl = $('notes');
      this.emptyEl = $('empty');
      this.backBtn = $('backBtn');
    }

    _localize() {
      this.titleEl.textContent = M.reader.title;
      this.hintEl.textContent = M.reader.autoRefreshOn;
      this.emptyEl.textContent = M.common.noNotes;
      this.backBtn.textContent = M.common.back;
      this._updateStatus(StorageService.getLastRetrievedISO());
    }

    _updateStatus(lastRetrievedIso) {
      const label = `${M.common.lastRetrieved} ${formatTime(lastRetrievedIso)}`;
      this.statusEl.textContent = label;
    }

    refresh() {
      const notes = StorageService.loadNotes();
      StorageService.markRetrieved();
      this._updateStatus(StorageService.getLastRetrievedISO());

      this.notesEl.innerHTML = '';
      if (notes.length === 0) {
        this.emptyEl.style.display = 'block';
        return;
      }
      this.emptyEl.style.display = 'none';
      for (const n of notes) {
        const row = document.createElement('div');
        row.className = 'note';
        const ta = document.createElement('textarea');
        ta.value = n.text || '';
        ta.readOnly = true;
        row.appendChild(ta);
        // spacer to align with writer layout
        const spacer = document.createElement('div');
        spacer.style.width = '100px';
        row.appendChild(spacer);
        this.notesEl.appendChild(row);
      }
    }

    _startPolling() {
      if (this.refreshTimer) clearInterval(this.refreshTimer);
      this.refreshTimer = setInterval(() => this.refresh(), this.intervalMs);
    }

    _listenStorageEvents() {
      window.addEventListener('storage', (evt) => {
        if (evt.key === window.LAB1.STORAGE_KEYS.notes) {
          this.refresh();
        }
      });
    }
  }

  window.addEventListener('DOMContentLoaded', () => new ReaderApp());
})();

