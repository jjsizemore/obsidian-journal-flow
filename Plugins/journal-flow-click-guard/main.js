const { Plugin } = require("obsidian");
const { shouldBlockCardPointer } = require("./card-click-guard.js");

module.exports = class JournalFlowClickGuardPlugin extends Plugin {
  onload() {
    this.registerDomEvent(
      document,
      "pointerdown",
      (event) => {
        if (!shouldBlockCardPointer(event)) return;
        event.preventDefault();
        event.stopPropagation();
      },
      true,
    );
  }
};
