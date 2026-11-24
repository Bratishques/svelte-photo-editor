import { get } from "svelte/store";
import type { CircleCenter, FaceContext, FilterContext, ParamsContext } from "./context";
import type { EyeOverlay } from "./eyes";

// Everything that affects the picture on the canvas (and therefore the cut),
// as plain data. The undo history stores these descriptions and the canvas is
// redrawn from them; no pixels are stored.

export type FilterValues = {
	grayscale: number;
	brightness: number;
	sepia: number;
	hueRotate: number;
	saturate: number;
	contrast: number;
};

export type CanvasSize = { width: number; height: number };

export type EditorState = {
	filters: FilterValues;
	overlay: { color: string; opacity: number };
	circle: { radius: number; center: CircleCenter };
	size: CanvasSize;
	eyes: EyeOverlay | null;
};

export type EditorContexts = {
	params: ParamsContext;
	filter: FilterContext;
	face: FaceContext;
};

export const captureState = ({ params, filter, face }: EditorContexts, size: CanvasSize): EditorState => ({
	filters: {
		grayscale: get(filter.grayscale),
		brightness: get(filter.brightness),
		sepia: get(filter.sepia),
		hueRotate: get(filter.hueRotate),
		saturate: get(filter.saturate),
		contrast: get(filter.contrast),
	},
	overlay: { color: get(params.fillStyle), opacity: get(params.globalAlpha) },
	circle: { radius: get(params.circleRadius), center: { ...get(params.circleCenter) } },
	size: { ...size },
	eyes: get(face.eyeOverlay),
});

// Writes a state back into the stores. The canvas size is not a store, so it
// is returned for the caller to apply.
export const applyState = ({ params, filter, face }: EditorContexts, state: EditorState): CanvasSize => {
	const { filters } = state;
	filter.grayscale.set(filters.grayscale);
	filter.brightness.set(filters.brightness);
	filter.sepia.set(filters.sepia);
	filter.hueRotate.set(filters.hueRotate);
	filter.saturate.set(filters.saturate);
	filter.contrast.set(filters.contrast);
	params.fillStyle.set(state.overlay.color);
	params.globalAlpha.set(state.overlay.opacity);
	params.circleRadius.set(state.circle.radius);
	params.circleCenter.set({ ...state.circle.center });
	face.eyeOverlay.set(state.eyes);
	return { ...state.size };
};

// Keeps the circle inside the canvas: the radius is at most half of the
// shorter side and the centre is at least one radius away from every edge.
export const clampCircle = (
	circle: EditorState["circle"],
	size: CanvasSize,
): EditorState["circle"] => {
	const radius = Math.min(circle.radius, Math.min(size.width, size.height) / 2);
	const clamp = (value: number, max: number) => Math.min(Math.max(value, radius), max - radius);
	return {
		radius,
		center: { x: clamp(circle.center.x, size.width), y: clamp(circle.center.y, size.height) },
	};
};

// A state recorded on a wider window may not fit the editor area any more.
// Scale it down proportionally (eye landmarks are already relative).
export const fitState = (state: EditorState, maxWidth: number): EditorState => {
	if (!(maxWidth > 0) || state.size.width <= maxWidth) return state;
	const scale = maxWidth / state.size.width;
	const size = { width: maxWidth, height: state.size.height * scale };
	const center = { x: state.circle.center.x * scale, y: state.circle.center.y * scale };
	return { ...state, size, circle: clampCircle({ radius: state.circle.radius, center }, size) };
};

// Structural equality for plain JSON-like data (objects, arrays, primitives).
export const deepEqual = (a: unknown, b: unknown): boolean => {
	if (Object.is(a, b)) return true;
	if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	const keysA = Object.keys(a);
	const keysB = Object.keys(b);
	if (keysA.length !== keysB.length) return false;
	return keysA.every(
		(key) =>
			Object.prototype.hasOwnProperty.call(b, key) &&
			deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
	);
};

// Number of undo steps kept per image. A step is a few hundred bytes of
// numbers, so this bounds memory at well under a megabyte.
export const HISTORY_LIMIT = 100;
