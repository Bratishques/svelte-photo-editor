// Keyboard shortcuts for the undo history.

export type HistoryShortcut = "undo" | "redo";

type ShortcutEvent = Pick<KeyboardEvent, "key" | "code" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">;

// Letter of the pressed key. `key` respects the keyboard layout (Z on AZERTY
// is where W is on QWERTY); `code` is the fallback for non-Latin layouts,
// where `key` is e.g. a Cyrillic letter.
const letter = (event: ShortcutEvent) => {
	if (/^[a-z]$/i.test(event.key)) return event.key.toLowerCase();
	const match = /^Key([A-Z])$/.exec(event.code);
	return match ? match[1].toLowerCase() : "";
};

// Ctrl/Cmd+Z undoes; Ctrl/Cmd+Shift+Z and Ctrl/Cmd+Y redo.
export const getHistoryShortcut = (event: ShortcutEvent): HistoryShortcut | null => {
	if (!(event.ctrlKey || event.metaKey) || event.altKey) return null;
	const key = letter(event);
	if (key === "z") return event.shiftKey ? "redo" : "undo";
	if (key === "y" && !event.shiftKey) return "redo";
	return null;
};

const NON_TEXT_INPUT_TYPES = new Set([
	"button",
	"checkbox",
	"color",
	"file",
	"image",
	"radio",
	"range",
	"reset",
	"submit",
]);

// Text fields have their own undo for the typed text, so editor shortcuts
// must not take it away from them.
export const isTextEditingTarget = (target: EventTarget | null): boolean => {
	if (typeof HTMLElement === "undefined" || !(target instanceof HTMLElement)) return false;
	if (target.isContentEditable) return true;
	if (target instanceof HTMLTextAreaElement) return true;
	return target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(target.type);
};
