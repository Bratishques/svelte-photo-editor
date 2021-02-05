<script>
import { getContext } from "svelte";


        export let canvasDimensions = {
        targetWidth: 0,
        targetHeight: 0
        };
        export let editedImage = null;
        let photoCanvas;
        let circleCanvas;
        let circleCenter = {
            x: 0,
            y: 0
        }
        const {fillStyle, globalAlpha, circleRadius} = getContext("params");
        const {grayscale, brightness, sepia, hueRotate, saturate, contrast} = getContext("filter")

        const getCircleBounds = (canvas, radius, cursorX, cursorY) => {
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

        const removeMoveListners = () => {
            window.removeEventListener("mousemove", handleCircleMovement)
            window.removeEventListener("mouseup", removeMoveListners)
        }

        const handleCircleMovement = (e) => {
            const cursorX = e.clientX - circleCanvas.getBoundingClientRect().x
            const cursorY = e.clientY - circleCanvas.getBoundingClientRect().y
            const target = getCircleBounds(circleCanvas, $circleRadius, cursorX, cursorY)
            circleCenter = {
                x: target.x,
                y: target.y
            }
        };

        $: if (editedImage) {
            circleCenter = {
                x: canvasDimensions.targetWidth/2,
                y: canvasDimensions.targetHeight/2
            }
        };

        $: if ($circleRadius) {
            if (circleCenter.x + $circleRadius > canvasDimensions.targetWidth) {
                circleCenter.x = canvasDimensions.targetWidth - $circleRadius
            }
            else if (circleCenter.x < $circleRadius) {
                circleCenter.x = $circleRadius
            }
            if (circleCenter.y + $circleRadius > canvasDimensions.targetHeight) {
                circleCenter.y = canvasDimensions.targetHeight - $circleRadius
            }
            else if (circleCenter.y < $circleRadius) {
                circleCenter.y = $circleRadius
            }
        };

        $:  if (photoCanvas && circleCanvas && editedImage) {
            const photoctx = photoCanvas.getContext("2d");
            photoCanvas.width = circleCanvas.width = canvasDimensions.targetWidth;
            photoCanvas.height = circleCanvas.height = canvasDimensions.targetHeight;
            photoctx.filter = `grayscale(${$grayscale}%) brightness(${$brightness}%) sepia(${$sepia}%) hue-rotate(${$hueRotate}deg) saturate(${$saturate}%) contrast(${$contrast}%)`
            photoctx.drawImage(editedImage, 0, 0, photoCanvas.width, photoCanvas.height);
            drawRectWithCircle(circleCanvas, $circleRadius, $fillStyle, $globalAlpha, circleCenter);
        };


        const drawRectWithCircle = (canvas, radius, fillStyle, globalAlpha, circleCenter) => {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0,0,canvas.width, canvas.height)
            ctx.fillStyle = fillStyle;
            ctx.globalAlpha = globalAlpha;
            ctx.fillRect(0,0, canvas.width, canvas.height);
            ctx.globalCompositeOperation="destination-out";
            ctx.globalAlpha = 1;
            ctx.arc(circleCenter.x, circleCenter.y, radius, 0, 2 * Math.PI)
            ctx.fill()
        };

</script>

<div class="relative">
    <canvas bind:this={photoCanvas} class="absolute"/>
    <canvas bind:this={circleCanvas} class="cursor-pointer relative z-20"
    on:mousedown={(e) => {
        handleCircleMovement(e)
        window.addEventListener("mousemove", handleCircleMovement)
        window.addEventListener("mouseup", removeMoveListners)
    }}
    />
</div>