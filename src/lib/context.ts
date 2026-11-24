import { getContext, setContext } from "svelte";
import type { Writable } from "svelte/store";
import type { EyeOverlay } from "./eyes";

// Typed wrappers around Svelte's context API so that components get
// proper store types instead of `unknown`.

export type CircleCenter = { x: number; y: number };

export type ParamsContext = {
	fillStyle: Writable<string>;
	globalAlpha: Writable<number>;
	circleRadius: Writable<number>;
	circleCenter: Writable<CircleCenter>;
};

export type FilterContext = {
	grayscale: Writable<number>;
	contrast: Writable<number>;
	brightness: Writable<number>;
	sepia: Writable<number>;
	hueRotate: Writable<number>;
	saturate: Writable<number>;
};

export type FaceContext = {
	enableDetection: Writable<boolean>;
	eyeOverlay: Writable<EyeOverlay | null>;
};

export type HistoryContext = {
	// Records the current editor state as an undo step. Called when a user
	// action is finished (slider released, drag ended, face detected...).
	commit: () => void;
};

const PARAMS = "params";
const FILTER = "filter";
const FACE = "face";
const HISTORY = "history";

export const setParamsContext = (value: ParamsContext) => setContext(PARAMS, value);
export const getParamsContext = () => getContext<ParamsContext>(PARAMS);

export const setFilterContext = (value: FilterContext) => setContext(FILTER, value);
export const getFilterContext = () => getContext<FilterContext>(FILTER);

export const setFaceContext = (value: FaceContext) => setContext(FACE, value);
export const getFaceContext = () => getContext<FaceContext>(FACE);

export const setHistoryContext = (value: HistoryContext) => setContext(HISTORY, value);
export const getHistoryContext = () => getContext<HistoryContext>(HISTORY);
