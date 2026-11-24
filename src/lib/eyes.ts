// Eye overlay: geometry, image loading and drawing.
//
// The overlay is stored as eye landmarks normalised to the source image
// (0..1 on both axes), so it is independent of the on-screen canvas size and
// can be redrawn after any filter change, resize, undo or redo.

export type NormalizedPoint = { x: number; y: number };

export type EyeOverlay = {
	// Folder name under public/eyes/
	style: string;
	// Six landmarks per eye, in the 68-point model order
	left: NormalizedPoint[];
	right: NormalizedPoint[];
};

export type EyeRect = {
	startX: number;
	startY: number;
	width: number;
	height: number;
	angle: number;
};

type EyeImages = { left: HTMLImageElement; right: HTMLImageElement };

export const normalizePoints = (
	points: readonly NormalizedPoint[],
	width: number,
	height: number,
): NormalizedPoint[] => points.map((p) => ({ x: p.x / width, y: p.y / height }));

// Rectangle (in canvas pixels) that the eye image is painted into, rotated
// by the eye's tilt. Points are the six landmarks of one eye.
export const getEyeRect = (eye: readonly NormalizedPoint[], canvasWidth: number, canvasHeight: number): EyeRect => {
	const p = eye.map((point) => ({ x: point.x * canvasWidth, y: point.y * canvasHeight }));
	const startX = p[0].x - 15;
	const width = (p[3].x - startX) * 1.5;
	const startY = p[2].y - 15;
	const height = (p[5].y - startY) * 2.2;
	const angle = Math.atan2(p[3].y - p[0].y, p[3].x - p[0].x);
	return { startX, startY, width, height, angle };
};

const loadImage = (src: string) =>
	new Promise<HTMLImageElement>((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error(`Failed to load ${src}`));
		image.src = src;
	});

const loading = new Map<string, Promise<EyeImages>>();
const loaded = new Map<string, EyeImages>();

// Loads the two eye images of a style once. Drawing is synchronous, so an
// overlay is only put into the editor state after its images are loaded.
export const loadEyeImages = (style: string): Promise<EyeImages> => {
	let promise = loading.get(style);
	if (!promise) {
		const base = `${import.meta.env.BASE_URL}eyes/${style}/`;
		promise = Promise.all([loadImage(`${base}left.png`), loadImage(`${base}right.png`)]).then(
			([left, right]) => {
				const images = { left, right };
				loaded.set(style, images);
				return images;
			},
		);
		// Allow a retry after a failed load
		promise.catch(() => loading.delete(style));
		loading.set(style, promise);
	}
	return promise;
};

const paintRotated = (ctx: CanvasRenderingContext2D, rect: EyeRect, image: HTMLImageElement) => {
	const cx = rect.startX + rect.width / 2;
	const cy = rect.startY + rect.height / 2;
	ctx.save();
	ctx.translate(cx, cy);
	ctx.rotate(rect.angle);
	ctx.translate(-cx, -cy);
	ctx.drawImage(image, rect.startX, rect.startY, rect.width, rect.height);
	ctx.restore();
};

export const drawEyeOverlay = (ctx: CanvasRenderingContext2D, overlay: EyeOverlay) => {
	const images = loaded.get(overlay.style);
	if (!images) return;
	const { width, height } = ctx.canvas;
	paintRotated(ctx, getEyeRect(overlay.left, width, height), images.left);
	paintRotated(ctx, getEyeRect(overlay.right, width, height), images.right);
};
