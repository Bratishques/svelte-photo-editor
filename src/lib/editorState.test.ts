import { describe, expect, it } from "vitest";
import { writable } from "svelte/store";
import { applyState, captureState, clampCircle, deepEqual, fitState, type EditorContexts, type EditorState } from "./editorState";

const state = (overrides: Partial<EditorState> = {}): EditorState => ({
	filters: { grayscale: 0, brightness: 100, sepia: 0, hueRotate: 0, saturate: 100, contrast: 100 },
	overlay: { color: "#FFFFFF", opacity: 0.4 },
	circle: { radius: 50, center: { x: 400, y: 300 } },
	size: { width: 800, height: 600 },
	eyes: null,
	...overrides,
});

const contexts = (): EditorContexts => ({
	params: {
		fillStyle: writable("#FFFFFF"),
		globalAlpha: writable(0.4),
		circleRadius: writable(50),
		circleCenter: writable({ x: 0, y: 0 }),
	},
	filter: {
		grayscale: writable(0),
		brightness: writable(100),
		sepia: writable(0),
		hueRotate: writable(0),
		saturate: writable(100),
		contrast: writable(100),
	},
	face: { enableDetection: writable(false), eyeOverlay: writable(null) },
});

describe("captureState / applyState", () => {
	it("round-trips a state through the stores", () => {
		const ctx = contexts();
		const original = state({
			filters: { grayscale: 10, brightness: 120, sepia: 30, hueRotate: 90, saturate: 50, contrast: 150 },
			overlay: { color: "red", opacity: 0.7 },
			circle: { radius: 80, center: { x: 100, y: 200 } },
			eyes: { style: "stoned", left: [{ x: 0.1, y: 0.2 }], right: [{ x: 0.3, y: 0.2 }] },
		});
		const size = applyState(ctx, original);
		expect(size).toEqual(original.size);
		expect(captureState(ctx, size)).toEqual(original);
	});

	it("copies the circle centre so later store updates do not change a recorded state", () => {
		const ctx = contexts();
		const recorded = captureState(ctx, { width: 800, height: 600 });
		ctx.params.circleCenter.update((center) => {
			center.x = 123;
			return center;
		});
		expect(recorded.circle.center.x).toBe(0);
	});
});

describe("clampCircle", () => {
	it("keeps the centre at least one radius away from the edges", () => {
		expect(clampCircle({ radius: 50, center: { x: 10, y: 590 } }, { width: 800, height: 600 })).toEqual({
			radius: 50,
			center: { x: 50, y: 550 },
		});
	});

	it("shrinks the radius to half of the shorter side", () => {
		expect(clampCircle({ radius: 200, center: { x: 100, y: 100 } }, { width: 400, height: 300 })).toEqual({
			radius: 150,
			center: { x: 150, y: 150 },
		});
	});
});

describe("fitState", () => {
	it("returns the same state when it fits", () => {
		const s = state();
		expect(fitState(s, 800)).toBe(s);
		expect(fitState(s, 1000)).toBe(s);
	});

	it("scales a wider state down to the available width", () => {
		const fitted = fitState(state(), 400);
		expect(fitted.size).toEqual({ width: 400, height: 300 });
		expect(fitted.circle).toEqual({ radius: 50, center: { x: 200, y: 150 } });
	});

	it("keeps the circle inside after scaling", () => {
		const fitted = fitState(state({ circle: { radius: 100, center: { x: 700, y: 100 } } }), 200);
		expect(fitted.size).toEqual({ width: 200, height: 150 });
		expect(fitted.circle).toEqual({ radius: 75, center: { x: 125, y: 75 } });
	});
});

describe("deepEqual", () => {
	it("compares plain data structurally", () => {
		expect(deepEqual(state(), state())).toBe(true);
		expect(deepEqual(state(), state({ overlay: { color: "#FFFFFF", opacity: 0.5 } }))).toBe(false);
		expect(deepEqual({ a: [1, 2] }, { a: [1, 2] })).toBe(true);
		expect(deepEqual({ a: [1, 2] }, { a: [2, 1] })).toBe(false);
		expect(deepEqual({ a: 1 }, { b: 1 })).toBe(false);
		expect(deepEqual({ a: null }, { a: {} })).toBe(false);
		expect(deepEqual([1], { 0: 1 })).toBe(false);
	});
});
