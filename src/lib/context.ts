import { getContext, setContext } from "svelte";
import type { Writable } from "svelte/store";

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
};

const PARAMS = "params";
const FILTER = "filter";
const FACE = "face";

export const setParamsContext = (value: ParamsContext) => setContext(PARAMS, value);
export const getParamsContext = () => getContext<ParamsContext>(PARAMS);

export const setFilterContext = (value: FilterContext) => setContext(FILTER, value);
export const getFilterContext = () => getContext<FilterContext>(FILTER);

export const setFaceContext = (value: FaceContext) => setContext(FACE, value);
export const getFaceContext = () => getContext<FaceContext>(FACE);
