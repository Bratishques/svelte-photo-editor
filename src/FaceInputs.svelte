<script lang="ts">
import { getFaceContext, getHistoryContext } from "./lib/context";
import { loadEyeImages, normalizePoints, type EyeOverlay } from "./lib/eyes";

    export let image: HTMLImageElement | undefined

    const {enableDetection, eyeOverlay} = getFaceContext();
    const {commit} = getHistoryContext();

    const eyeStyle = "stoned"
    let detecting = false
    let status = ""

    //Detect the face on the original image (not the filtered canvas) and
    //return the eye landmarks relative to the image size
    const detectEyes = async (source: HTMLImageElement): Promise<EyeOverlay | null> => {
        // face-api.js and its models are loaded lazily, on the first detection
        const { loadFaceApi } = await import("./lib/faceapi")
        const faceapi = await loadFaceApi()
        const detection = await faceapi.detectSingleFace(source).withFaceLandmarks(true)
        if (!detection) return null
        const { naturalWidth: width, naturalHeight: height } = source
        // The overlay enters the state only when its images can be drawn
        await loadEyeImages(eyeStyle)
        return {
            style: eyeStyle,
            left: normalizePoints(detection.landmarks.getLeftEye(), width, height),
            right: normalizePoints(detection.landmarks.getRightEye(), width, height),
        }
    }
    //

    const detect = async () => {
        if (!image || detecting) return
        const source = image
        detecting = true
        status = ""
        try {
            const overlay = await detectEyes(source)
            // A different picture was uploaded while the detector was running
            if (source !== image) return
            if (!overlay) {
                status = "No face found"
                return
            }
            $eyeOverlay = overlay
            commit()
        } catch (error) {
            console.error(error)
            status = "Face detection failed"
        } finally {
            detecting = false
        }
    }

    const removeEyes = () => {
        $eyeOverlay = null
        commit()
    }
</script>

<div>
    <div class="mb-4 text-2xl font-semibold">Face detection
    </div>
    <div >
        <label class="flex items-center  mb-4">
            <input class="mr-3" type="checkbox" checked={$enableDetection} on:click={() => {
                $enableDetection = !$enableDetection
            }}>
            <p>Enable Face Detection</p>     
        </label>
    </div>
    {#if $enableDetection}
    <div class="flex gap-2">
        <button
            class="rounded bg-blue-400 p-2 text-white font-semibold disabled:opacity-50"
            disabled={detecting || !image}
            on:click={detect}>{detecting ? "Detecting..." : "Detect Face"}</button>
        {#if $eyeOverlay}
        <button
            class="rounded bg-blue-400 p-2 text-white font-semibold"
            on:click={removeEyes}>Remove eyes</button>
        {/if}
    </div>
    {#if status}
    <p class="mt-2">{status}</p>
    {/if}
    {/if}

</div>
