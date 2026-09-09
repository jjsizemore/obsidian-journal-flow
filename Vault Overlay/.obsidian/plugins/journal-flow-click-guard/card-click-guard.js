const CARD_SELECTOR = ".journal-flow .callout";
const INTERACTIVE_SELECTOR = 'input, label, a, button, textarea, select, summary, [role="button"], .callout-fold';

function shouldBlockCardPointer(event) {
  if (event?.button !== 0) return false;
  if (event?.ctrlKey || event?.metaKey || event?.altKey || event?.detail === 2) return false;

  const target = event?.target?.nodeType === 1 ? event.target : event?.target?.parentElement;
  if (!target?.closest) return false;

  const card = target.closest(CARD_SELECTOR);
  if (!card || !card.closest(".markdown-source-view")) return false;
  return !target.closest(INTERACTIVE_SELECTOR);
}

module.exports = { shouldBlockCardPointer };
