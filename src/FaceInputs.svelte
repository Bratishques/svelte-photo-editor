<script lang="ts">
import type { Point } from "face-api.js";

import { getContext } from "svelte";
import faceapi from "../faceApi/faceapi";
const {enableDetection} = getContext('face');

    let landmarks:object[]
    let eyeFilter:string = "stoned"

    interface FacePartRect {
        startX: number,
        startY: number,
        angle: number,
        width: number,
        height: number
    }

    const rotateAndPaint = (ctx:CanvasRenderingContext2D, startX:number, startY:number, width:number, height:number, angle:number, image:HTMLImageElement) => {
        console.log(startX+ width/2)
        ctx.translate(startX + width/2, startY + height/2)
        ctx.rotate(angle)
        ctx.translate(-(startX + width/2), - (startY + height/2))
        ctx.drawImage(image, startX, startY, width, height)
        ctx.setTransform(1,0,0,1,0,0)
    }

    $: if (landmarks) {
        console.log(landmarks)
    }

    const getEyeRect = (eye: Point[]) => {
        let partRect: FacePartRect
        const startX = eye[0].x - 15
        const width = (eye[3].x - startX) * 1.5
        const startY = eye[2].y - 15
        const height = (eye[5].y - startY) * 2.2
        const angle = Math.asin((eye[3].y - eye[0].y)/(eye[3].x - eye[0].x))
        console.log(angle)
        return partRect = {startX, startY, width, height, angle}
        
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
                rotateAndPaint(
                photoctx,
                leftEye.startX,
                leftEye.startY,
                leftEye.width,
                leftEye.height,
                leftEye.angle,
                leftEyeImg
                )
                // photoctx.translate(leftEye.startX + leftEye.width/2, leftEye.startY + leftEye.height/2)
                // photoctx.rotate(leftEye.angle)
                // photoctx.drawImage(leftEyeImg, leftEye.startX, leftEye.startY, leftEye.width, leftEye.height)
                // photoctx.restore()
            }

            //Getting the image for right eye
            const rightEye = getEyeRect(detections.landmarks.getRightEye())
            const rightEyeImg = new Image()
            rightEyeImg.src = eyeImgPath + "right.png"
            rightEyeImg.onload = () => {

                rotateAndPaint(
                    photoctx,
                    rightEye.startX,
                    rightEye.startY,
                    rightEye.width,
                    rightEye.height,
                    rightEye.angle,
                    rightEyeImg
                )
                // photoctx.translate(rightEye.startX + rightEye.width/2, rightEye.startY + rightEye.height/2)
                // photoctx.rotate(rightEye.angle)
                // photoctx.drawImage(rightEyeImg, rightEye.startX, rightEye.startY, rightEye.width, rightEye.height)
                // photoctx.restore()
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