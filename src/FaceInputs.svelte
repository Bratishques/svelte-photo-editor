<script lang="ts">
import type { Point } from "face-api.js";

import { getFaceContext } from "./lib/context";
const {enableDetection} = getFaceContext();

    let landmarks: Point[] | undefined
    let eyeFilter:string = "stoned"
    let detecting = false
    let status = ""

    interface FacePartRect {
        startX: number,
        startY: number,
        angle: number,
        width: number,
        height: number
    }

    const rotateAndPaint = (ctx:CanvasRenderingContext2D, startX:number, startY:number, width:number, height:number, angle:number, image:HTMLImageElement) => {
        ctx.translate(startX + width/2, startY + height/2)
        ctx.rotate(angle)
        ctx.translate(-(startX + width/2), - (startY + height/2))
        ctx.drawImage(image, startX, startY, width, height)
        ctx.setTransform(1,0,0,1,0,0)
    }


    const getEyeRect = (eye: Point[]) => {
        let partRect: FacePartRect
        const startX = eye[0].x - 15
        const width = (eye[3].x - startX) * 1.5
        const startY = eye[2].y - 15
        const height = (eye[5].y - startY) * 2.2
        const angle = Math.asin((eye[3].y - eye[0].y)/(eye[3].x - eye[0].x))
        return partRect = {startX, startY, width, height, angle}
        
    }


  //Get face data
  const getFace = async (canvas: HTMLCanvasElement ,targetCanvas: HTMLCanvasElement) => {
            // face-api.js and its models are loaded lazily, on the first detection
            const { loadFaceApi } = await import("./lib/faceapi")
            const faceapi = await loadFaceApi()
            const detections = await faceapi.detectSingleFace(canvas).withFaceLandmarks(true)
            const photoctx = canvas.getContext("2d")!
            const ctx = targetCanvas.getContext("2d")!

            if (detections) {
                ctx.clearRect(0,0, targetCanvas.width, targetCanvas.height)
                const landmarks = detections.landmarks.positions
                const eyeImgPath = `${import.meta.env.BASE_URL}eyes/${eyeFilter}/`

                //Paint an overlay image over each eye, rotated to match the eye's tilt
                const paintEye = (eye: Point[], fileName: string) => {
                    const rect = getEyeRect(eye)
                    const eyeImg = new Image()
                    eyeImg.onload = () => {
                        rotateAndPaint(photoctx, rect.startX, rect.startY, rect.width, rect.height, rect.angle, eyeImg)
                    }
                    eyeImg.src = eyeImgPath + fileName
                }
                paintEye(detections.landmarks.getLeftEye(), "left.png")
                paintEye(detections.landmarks.getRightEye(), "right.png")

                return landmarks
            }
        }
        //
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
    <button 
            class="rounded bg-blue-400 p-2 text-white font-semibold disabled:opacity-50"
            disabled={detecting}
            on:click={async () => {
                if($enableDetection) {
                    const photoCanvas = document.getElementById('photoCanvas') as HTMLCanvasElement
                    const faceCanvas = document.getElementById('faceCanvas') as HTMLCanvasElement
                    detecting = true
                    status = ""
                    try {
                        landmarks = await getFace(photoCanvas, faceCanvas)
                        status = landmarks ? "" : "No face found"
                    } catch (error) {
                        console.error(error)
                        status = "Face detection failed"
                    } finally {
                        detecting = false
                    }
                }
                }}>{detecting ? "Detecting..." : "Detect Face"}</button>
    {#if status}
    <p class="mt-2">{status}</p>
    {/if}
    {/if}

</div>