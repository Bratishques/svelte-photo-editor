import { describe, expect, it } from "vitest";
import { getHistoryShortcut } from "./keyboard";

const key = (key: string, modifiers: Partial<Record<"ctrlKey" | "metaKey" | "shiftKey" | "altKey", boolean>> = {}, code = "") => ({
	key,
	code,
	ctrlKey: false,
	metaKey: false,
	shiftKey: false,
	altKey: false,
	...modifiers,
});

describe("getHistoryShortcut", () => {
	it("maps Ctrl/Cmd+Z to undo", () => {
		expect(getHistoryShortcut(key("z", { ctrlKey: true }))).toBe("undo");
		expect(getHistoryShortcut(key("z", { metaKey: true }))).toBe("undo");
	});

	it("maps Ctrl/Cmd+Shift+Z and Ctrl+Y to redo", () => {
		expect(getHistoryShortcut(key("Z", { ctrlKey: true, shiftKey: true }))).toBe("redo");
		expect(getHistoryShortcut(key("Z", { metaKey: true, shiftKey: true }))).toBe("redo");
		expect(getHistoryShortcut(key("y", { ctrlKey: true }))).toBe("redo");
	});

	it("ignores keys without Ctrl/Cmd or with Alt", () => {
		expect(getHistoryShortcut(key("z"))).toBeNull();
		expect(getHistoryShortcut(key("z", { shiftKey: true }))).toBeNull();
		expect(getHistoryShortcut(key("z", { ctrlKey: true, altKey: true }))).toBeNull();
		expect(getHistoryShortcut(key("y", { ctrlKey: true, shiftKey: true }))).toBeNull();
		expect(getHistoryShortcut(key("x", { ctrlKey: true }))).toBeNull();
	});

	it("falls back to the physical key on non-Latin layouts", () => {
		expect(getHistoryShortcut(key("я", { ctrlKey: true }, "KeyZ"))).toBe("undo");
		expect(getHistoryShortcut(key("Я", { ctrlKey: true, shiftKey: true }, "KeyZ"))).toBe("redo");
		expect(getHistoryShortcut(key("н", { ctrlKey: true }, "KeyY"))).toBe("redo");
	});

	it("follows the layout for Latin letters", () => {
		// AZERTY: the key labelled Z sits where QWERTY has W
		expect(getHistoryShortcut(key("z", { ctrlKey: true }, "KeyW"))).toBe("undo");
		expect(getHistoryShortcut(key("w", { ctrlKey: true }, "KeyZ"))).toBeNull();
	});
});

