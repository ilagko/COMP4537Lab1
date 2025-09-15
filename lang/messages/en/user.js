/*
  COMP4537 Lab 1
  User-facing strings for localization.

  Disclosure: Parts of this implementation were assisted by ChatGPT.
*/

const USER_MESSAGES = {
  index: {
    intro: "Welcome. Choose Writer or Reader.",
    writer: "Open Writer",
    reader: "Open Reader",
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
  writer: {
    title: "Writer",
    autosaveOn: "Autosaving every 2s",
  },
  reader: {
    title: "Reader",
    autoRefreshOn: "Refreshing every 2s",
  },
};
