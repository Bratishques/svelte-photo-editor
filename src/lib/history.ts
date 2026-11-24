// A small, framework-independent undo/redo history.
//
// The history is an immutable value: every operation returns a new object and
// never mutates its input, which keeps it easy to test and to store in a
// Svelte component variable. `present` is the state currently on screen,
// `past` holds older states (oldest first) and `future` holds states that were
// undone and can be redone (next redo first).

export type History<T> = {
	readonly past: readonly T[];
	readonly present: T;
	readonly future: readonly T[];
};

export type CommitOptions<T> = {
	// Maximum number of undo steps kept; the oldest ones are dropped.
	limit: number;
	// Commits equal to the present state are ignored, so that a gesture that
	// ends where it started does not create an empty step.
	equals?: (a: T, b: T) => boolean;
};

export const createHistory = <T>(present: T): History<T> => ({
	past: [],
	present,
	future: [],
});

// Records `next` as a new step. Any redo branch is discarded, as in most
// editors: after undoing and then making a new change, the undone states are gone.
export const commit = <T>(history: History<T>, next: T, options: CommitOptions<T>): History<T> => {
	const equals = options.equals ?? Object.is;
	if (equals(history.present, next)) return history;
	const limit = Math.max(0, Math.floor(options.limit));
	const past = [...history.past, history.present];
	return {
		past: past.slice(Math.max(0, past.length - limit)),
		present: next,
		future: [],
	};
};

export const canUndo = <T>(history: History<T>): boolean => history.past.length > 0;

export const canRedo = <T>(history: History<T>): boolean => history.future.length > 0;

export const undo = <T>(history: History<T>): History<T> => {
	if (!canUndo(history)) return history;
	return {
		past: history.past.slice(0, -1),
		present: history.past[history.past.length - 1],
		future: [history.present, ...history.future],
	};
};

export const redo = <T>(history: History<T>): History<T> => {
	if (!canRedo(history)) return history;
	return {
		past: [...history.past, history.present],
		present: history.future[0],
		future: history.future.slice(1),
	};
};
