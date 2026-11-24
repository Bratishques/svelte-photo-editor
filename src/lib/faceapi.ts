import * as faceapi from "face-api.js";

// Model weights are served from public/models. BASE_URL keeps the path correct
// when the app is deployed under a sub-path (e.g. GitHub Pages).
const modelsUrl = `${import.meta.env.BASE_URL}models`;

let ready: Promise<typeof faceapi> | undefined;

// Loads the detector and landmark networks once and returns face-api
// when they are ready. Subsequent calls reuse the same promise.
export const loadFaceApi = (): Promise<typeof faceapi> => {
	ready ??= Promise.all([
		faceapi.nets.ssdMobilenetv1.loadFromUri(modelsUrl),
		faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsUrl),
	]).then(() => faceapi);
	return ready;
};
