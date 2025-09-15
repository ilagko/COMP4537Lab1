/*
  COMP4537 Lab 1
  This file sets localized labels on the index page.

  Disclosure: Parts of this implementation were assisted by ChatGPT.
*/

(() => {
  'use strict';
  if (!window.USER_MESSAGES) return;
  const $ = (id) => document.getElementById(id);
  const msgs = window.USER_MESSAGES;
  const introEl = $('intro');
  const writerLink = $('writerLink');
  const readerLink = $('readerLink');
  if (introEl) introEl.textContent = msgs.index.intro;
  if (writerLink) writerLink.textContent = msgs.index.writer;
  if (readerLink) readerLink.textContent = msgs.index.reader;
})();

