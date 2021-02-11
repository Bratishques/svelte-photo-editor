<script lang="ts">
import type { Image } from "canvas";

import { getContext } from "svelte";
import faceapi from "../faceApi/faceapi";
import App from "./App.svelte";

        type CircleCenter = {
            x: number,
            y: number
        }
        export let canvasDimensions = {
        targetWidth: 0,
        targetHeight: 0
        };
        export let editedImage:HTMLImageElement;

        let photoCanvas: HTMLCanvasElement;
        let circleCanvas: HTMLCanvasElement;
        let faceCanvas: HTMLCanvasElement

        const {fillStyle, globalAlpha, circleRadius, circleCenter} = getContext("params");
        const {grayscale, brightness, sepia, hueRotate, saturate, contrast} = getContext("filter")
        const {enableDetection} = getContext('face')


        //Making sure that we don't move the circle out of bounds(OOB)
        const getCircleBounds = (canvas:HTMLCanvasElement, radius:number, cursorX:number, cursorY:number) => {
            let target = {
                x: 0,
                y: 0
            }
            if (cursorX < $circleRadius) {
                target.x = $circleRadius
            }
            else if (cursorX > canvas.width - radius) {
                target.x = canvas.width - radius
            }
            else {
                target.x = cursorX
            }
            if (cursorY < radius) {
                target.y = radius
            }
            else if (cursorY >  canvas.height - radius) {
                target.y = canvas.height - radius
            }
            else {
                target.y = cursorY
            }
            return target
        }
        //

        // Cleaning listeners 
        const removeMoveListners = () => {
            window.removeEventListener("mousemove", handleCircleMovement)
            window.removeEventListener("mouseup", removeMoveListners)
        }
        //

        //Handling the movements of circle on mouse events
        const handleCircleMovement = (e: MouseEvent) => {
            const cursorX = e.clientX - circleCanvas.getBoundingClientRect().x
            const cursorY = e.clientY - circleCanvas.getBoundingClientRect().y
            const target = getCircleBounds(circleCanvas, $circleRadius, cursorX, cursorY)
            $circleCenter = {
                x: target.x,
                y: target.y
            }
        };
        //

        //Positioning the circle in center with every resize/reupload
        $: if (editedImage) {
            $circleCenter = {
                x: canvasDimensions.targetWidth/2,
                y: canvasDimensions.targetHeight/2
            }
        };
        //

        //Making sure that circle never gets OOB with every resize
        $: if ($circleRadius) {
            if ($circleCenter.x + $circleRadius > canvasDimensions.targetWidth) {
                $circleCenter.x = canvasDimensions.targetWidth - $circleRadius
            }
            else if ($circleCenter.x < $circleRadius) {
                $circleCenter.x = $circleRadius
            }
            if ($circleCenter.y + $circleRadius > canvasDimensions.targetHeight) {
                $circleCenter.y = canvasDimensions.targetHeight - $circleRadius
            }
            else if ($circleCenter.y < $circleRadius) {
                $circleCenter.y = $circleRadius
            }
        };
        //



        //Reacting to every change of params and updating the canvas with image
        $:  if (photoCanvas && circleCanvas && editedImage && ($enableDetection || !$enableDetection)) {
            const photoctx = photoCanvas.getContext("2d");
            photoCanvas.width = circleCanvas.width = faceCanvas.width = canvasDimensions.targetWidth;
            photoCanvas.height = circleCanvas.height =  faceCanvas.height = canvasDimensions.targetHeight;
            photoctx.filter = `grayscale(${$grayscale}%) brightness(${$brightness}%) sepia(${$sepia}%) hue-rotate(${$hueRotate}deg) saturate(${$saturate}%) contrast(${$contrast}%)`
            drawImage(photoCanvas, editedImage)
            drawRectWithCircle(circleCanvas, $circleRadius, $fillStyle, $globalAlpha, $circleCenter);
        };
        //

        //Draw the rect with circle inside to ensure comfortable positioning for cutting the circular image
        const drawRectWithCircle = (canvas:HTMLCanvasElement, radius:number, fillStyle:string, globalAlpha: number, $circleCenter:CircleCenter) => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width, canvas.height)
            ctx.fillStyle = fillStyle;
            ctx.globalAlpha = globalAlpha;
            ctx.fillRect(0,0, canvas.width, canvas.height);
            ctx.globalCompositeOperation="destination-out";
            ctx.globalAlpha = 1;
            ctx.arc($circleCenter.x, $circleCenter.y, radius, 0, 2 * Math.PI)
            ctx.fill()
        };
        //

        //Draw image
        const drawImage = (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
            const ctx = canvas.getContext('2d')
            ctx.drawImage(image,0,0, canvas.width, canvas.height)
        }

        //


</script>

<div class="relative">
    <canvas id="photoCanvas" bind:this={photoCanvas} class="absolute"/>
    <canvas id="faceCanvas" class="absolute" bind:this={faceCanvas}/>
    <canvas bind:this={circleCanvas} class="cursor-pointer relative z-20"

    on:mousedown={(e) => {
        handleCircleMovement(e)
        window.addEventListener("mousemove", handleCircleMovement)
        window.addEventListener("mouseup", removeMoveListners)
    }}
    />
</div>