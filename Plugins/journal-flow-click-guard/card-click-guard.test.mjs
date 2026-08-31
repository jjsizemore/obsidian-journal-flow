import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import { shouldBlockCardPointer } from "./card-click-guard.js";

const mainSource = readFileSync(new URL("./main.js", import.meta.url), "utf8");

function loadPlugin() {
  let registration;
  class Plugin {
    registerDomEvent(...args) {
      registration = args;
    }
  }

  const module = { exports: {} };
  vm.runInNewContext(mainSource, {
    document: {},
    module,
    require: (name) => (name === "obsidian" ? { Plugin } : { shouldBlockCardPointer }),
  });
  const plugin = new module.exports();
  plugin.onload();
  return registration;
}
const card = { closest: (selector) => (selector === ".markdown-source-view" ? sourceView : null) };
const sourceView = {};

function target({ interactive = false, label = false, fold = false, inCard = true } = {}) {
  return {
    nodeType: 1,
    parentElement: null,
    closest(selector) {
      if (selector === ".journal-flow .callout") return inCard ? card : null;
      if (selector === 'input, label, a, button, textarea, select, summary, [role="button"], .callout-fold') return interactive || label || fold ? {} : null;
      return null;
    },
  };
}

function pointer(overrides = {}) {
  return { button: 0, detail: 1, target: target(), ...overrides };
}

test("blocks primary pointer presses on card background in Live Preview", () => {
  assert.equal(shouldBlockCardPointer(pointer()), true);
});

test("allows controls and links inside cards", () => {
  assert.equal(shouldBlockCardPointer(pointer({ target: target({ interactive: true }) })), false);
});

test("allows collapsible callout controls", () => {
  assert.equal(shouldBlockCardPointer(pointer({ target: target({ fold: true }) })), false);
});

test("allows clicks on radio-card labels", () => {
  assert.equal(shouldBlockCardPointer(pointer({ target: target({ label: true }) })), false);
});

test("allows intentional editing modifiers and double-clicks", () => {
  for (const override of [{ ctrlKey: true }, { metaKey: true }, { altKey: true }, { detail: 2 }]) {
    assert.equal(shouldBlockCardPointer(pointer(override)), false);
  }
});

test("registers a capture-phase pointer guard that prevents editor focus", () => {
  const [element, type, listener, capture] = loadPlugin();
  let prevented = false;
  let stopped = false;

  listener({
    ...pointer(),
    preventDefault: () => {
      prevented = true;
    },
    stopPropagation: () => {
      stopped = true;
    },
  });

  assert.deepEqual(element, {});
  assert.equal(type, "pointerdown");
  assert.equal(capture, true);
  assert.equal(prevented, true);
  assert.equal(stopped, true);
});

test("allows cards outside a Markdown source view", () => {
  assert.equal(shouldBlockCardPointer(pointer({ target: target({ inCard: false }) })), false);
});

test("allows non-primary pointer presses", () => {
  assert.equal(shouldBlockCardPointer(pointer({ button: 2 })), false);
});
