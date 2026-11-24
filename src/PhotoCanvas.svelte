<script lang="ts">
import { getFaceContext, getFilterContext, getHistoryContext, getParamsContext, type CircleCenter } from "./lib/context";
import { drawEyeOverlay } from "./lib/eyes";

        export let canvasDimensions = {
        targetWidth: 0,
        targetHeight: 0
        };
        export let editedImage: HTMLImageElement | undefined;

        let photoCanvas: HTMLCanvasElement;
        let circleCanvas: HTMLCanvasElement;

        const {fillStyle, globalAlpha, circleRadius, circleCenter} = getParamsContext();
        const {grayscale, brightness, sepia, hueRotate, saturate, contrast} = getFilterContext()
        const {eyeOverlay} = getFaceContext()
        const {commit} = getHistoryContext()


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
            // The whole drag is one undo step
            commit()
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



        //Reacting to every change of params and redrawing the canvas from the image.
        //The eye overlay is part of the state, so it is redrawn as well (with the same filters).
        $:  if (photoCanvas && circleCanvas && editedImage) {
            const photoctx = photoCanvas.getContext("2d")!;
            photoCanvas.width = circleCanvas.width = canvasDimensions.targetWidth;
            photoCanvas.height = circleCanvas.height = canvasDimensions.targetHeight;
            photoctx.filter = `grayscale(${$grayscale}%) brightness(${$brightness}%) sepia(${$sepia}%) hue-rotate(${$hueRotate}deg) saturate(${$saturate}%) contrast(${$contrast}%)`
            drawImage(photoCanvas, editedImage)
            if ($eyeOverlay) {
                drawEyeOverlay(photoctx, $eyeOverlay)
            }
            drawRectWithCircle(circleCanvas, $circleRadius, $fillStyle, $globalAlpha, $circleCenter);
        };
        //

        //Draw the rect with circle inside to ensure comfortable positioning for cutting the circular image
        const drawRectWithCircle = (canvas:HTMLCanvasElement, radius:number, fillStyle:string, globalAlpha: number, $circleCenter:CircleCenter) => {
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0,0,canvas.width, canvas.height)
            ctx.fillStyle = fillStyle;
            ctx.globalAlpha = globalAlpha;
            ctx.fillRect(0,0, canvas.width, canvas.height);
            ctx.globalCompositeOperation="destination-out";
            ctx.globalAlpha = 1;
            ctx.beginPath()
            ctx.arc($circleCenter.x, $circleCenter.y, radius, 0, 2 * Math.PI)
            ctx.fill()
        };
        //

        //Draw image
        const drawImage = (canvas: HTMLCanvasElement, image: HTMLImageElement) => {
            const ctx = canvas.getContext('2d')!
            ctx.drawImage(image,0,0, canvas.width, canvas.height)
        }

        //


</script>

<div class="relative">
    <canvas id="photoCanvas" bind:this={photoCanvas} class="absolute"></canvas>
    <canvas bind:this={circleCanvas} class="cursor-pointer relative z-20"

    on:mousedown={(e) => {
        handleCircleMovement(e)
        window.addEventListener("mousemove", handleCircleMovement)
        window.addEventListener("mouseup", removeMoveListners)
    }}
    ></canvas>
</div>