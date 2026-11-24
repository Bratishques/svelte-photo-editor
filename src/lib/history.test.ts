import { describe, expect, it } from "vitest";
import { canRedo, canUndo, commit, createHistory, redo, undo, type History } from "./history";

const options = { limit: 100 };

const commitAll = (history: History<number>, values: number[], limit = 100) =>
	values.reduce((h, value) => commit(h, value, { limit }), history);

describe("history", () => {
	it("starts with nothing to undo or redo", () => {
		const history = createHistory(0);
		expect(history.present).toBe(0);
		expect(canUndo(history)).toBe(false);
		expect(canRedo(history)).toBe(false);
	});

	it("undoes and redoes step by step", () => {
		let history = commitAll(createHistory(0), [1, 2, 3]);
		expect(history.present).toBe(3);

		history = undo(history);
		expect(history.present).toBe(2);
		history = undo(history);
		expect(history.present).toBe(1);
		expect(canRedo(history)).toBe(true);

		history = redo(history);
		expect(history.present).toBe(2);
		history = redo(history);
		expect(history.present).toBe(3);
		expect(canRedo(history)).toBe(false);
	});

	it("returns the same object when there is nothing to undo or redo", () => {
		const history = createHistory("a");
		expect(undo(history)).toBe(history);
		expect(redo(history)).toBe(history);
	});

	it("can undo back to the initial state and no further", () => {
		let history = commitAll(createHistory(0), [1, 2]);
		history = undo(undo(undo(undo(history))));
		expect(history.present).toBe(0);
		expect(canUndo(history)).toBe(false);
		expect(history.future).toEqual([1, 2]);
	});

	it("drops the redo branch when a new step is committed after undo", () => {
		let history = commitAll(createHistory(0), [1, 2, 3]);
		history = undo(undo(history));
		expect(history.present).toBe(1);

		history = commit(history, 10, options);
		expect(history.present).toBe(10);
		expect(canRedo(history)).toBe(false);
		expect(history.past).toEqual([0, 1]);
		expect(undo(history).present).toBe(1);
	});

	it("ignores a commit equal to the present state", () => {
		const history = commitAll(createHistory(0), [1]);
		expect(commit(history, 1, options)).toBe(history);
	});

	it("ignores an equal commit without dropping the redo branch", () => {
		const history = undo(commitAll(createHistory(0), [1, 2]));
		expect(commit(history, 1, options)).toBe(history);
		expect(canRedo(history)).toBe(true);
	});

	it("uses the custom equality function", () => {
		const equals = (a: { v: number }, b: { v: number }) => a.v === b.v;
		const history = createHistory({ v: 1 });
		expect(commit(history, { v: 1 }, { limit: 10, equals })).toBe(history);
		expect(commit(history, { v: 2 }, { limit: 10, equals }).present).toEqual({ v: 2 });
	});

	it("keeps at most `limit` undo steps, dropping the oldest", () => {
		let history = commitAll(createHistory(0), [1, 2, 3, 4, 5], 3);
		expect(history.past).toEqual([2, 3, 4]);
		expect(history.present).toBe(5);

		history = undo(undo(undo(history)));
		expect(history.present).toBe(2);
		expect(canUndo(history)).toBe(false);
	});

	it("does not count redo states towards the limit", () => {
		let history = commitAll(createHistory(0), [1, 2, 3], 2);
		history = undo(undo(history));
		expect(history.past).toEqual([]);
		expect(history.future).toEqual([2, 3]);
		history = redo(redo(history));
		expect(history.present).toBe(3);
		expect(history.past).toEqual([1, 2]);
	});

	it("does not mutate the previous history", () => {
		const first = commitAll(createHistory(0), [1, 2]);
		const snapshot = structuredClone(first);
		commit(undo(first), 5, options);
		redo(undo(first));
		expect(first).toEqual(snapshot);
	});
});
