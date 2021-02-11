<script lang="ts">
import { getContext } from "svelte";
import faceapi from "../faceApi/faceapi";
import PhotoCanvas from "./PhotoCanvas.svelte";
const {enableDetection} = getContext('face');

    let landmarks:object[]
    let eyeFilter:string = "stoned"


    $: if (landmarks) {
        console.log(landmarks)
    }

    const getEyeRect = (eye) => {
        const startX = eye[0].x - 15
        const width = (eye[3].x - startX) * 1.5
        const startY = eye[2].y - 15
        const height = (eye[5].y - startY) * 2.2
        return {startX, startY, width, height}
    }


  //Get face data
  const getFace = async (canvas: HTMLCanvasElement ,targetCanvas: HTMLCanvasElement) => {
            const detections = await faceapi.detectSingleFace(canvas).withFaceLandmarks(true)
            const photoctx = canvas.getContext("2d")
            const ctx = targetCanvas.getContext("2d")

            if (detections) {
                const box = detections.detection.box

                ctx.clearRect(0,0, targetCanvas.width, targetCanvas.height)
                const landmarks = detections.landmarks.positions
                landmarks.map((a,i) => {
                    //ctx.fillStyle = "blue"
                    //ctx.beginPath()
                    //ctx.fillText(`${i}`, a.x, a.y)
                    //ctx.arc(a.x, a.y, 3, 0, 2* Math.PI)
                    //ctx.fill()
                 })

            
            //Getting the Image for left eye
            const leftEye = getEyeRect(detections.landmarks.getLeftEye())
            const eyeImgPath = `/eyes/${eyeFilter}/`
            const leftEyeImg = new Image()
            leftEyeImg.src = eyeImgPath + "left.png"
            leftEyeImg.onload = () => {
                photoctx.drawImage(leftEyeImg, leftEye.startX, leftEye.startY, leftEye.width, leftEye.height)
            }

            //Getting the image for right eye
            const rightEye = getEyeRect(detections.landmarks.getRightEye())
            const rightEyeImg = new Image()
            rightEyeImg.src = eyeImgPath + "right.png"
            rightEyeImg.onload = () => {
                photoctx.drawImage(rightEyeImg, rightEye.startX, rightEye.startY, rightEye.width, rightEye.height)
            }

            // ctx.fillStyle = "blue"
            // ctx.rect(leftEye.startX, leftEye.startY, leftEye.width, leftEye.height)
            // ctx.fill()
            // ctx.rect(rightEye.startX, rightEye.startY, rightEye.width, rightEye.height)
            // ctx.fill()

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
            class="rounded bg-blue-400 p-2 text-white font-semibold"
            on:click={async () => {
                if($enableDetection) {
                    const photoCanvas = document.getElementById('photoCanvas')
                    const faceCanvas = document.getElementById('faceCanvas') 
                    landmarks = await getFace(photoCanvas, faceCanvas)
                }
                }}>Detect Face</button>
    {/if}

</div>