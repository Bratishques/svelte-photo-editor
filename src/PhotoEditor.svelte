<script lang="ts">
import { getContext, onMount } from "svelte";
import faceapi from "../faceApi/faceapi";
import FaceInputs from "./FaceInputs.svelte";
import FilterInputs from "./FilterInputs.svelte";
import ParamsInputs from "./ParamsInputs.svelte";
import PhotoCanvas from "./PhotoCanvas.svelte";
import ResultCanvas from "./ResultCanvas.svelte";
    
    type CanvasDimensions = {
        targetWidth: number,
        targetHeight: number
    }
    let isResizing: boolean = false
    let canvasParent: HTMLDivElement;
    let editedImage: HTMLImageElement;
    let maxWidth: number;
    let dragStartX: number;
    let dragPositionX: number;
    let canvasDimensions : CanvasDimensions = {
        targetWidth: 0,
        targetHeight: 0
    }
    let results: HTMLCanvasElement[] = [];

    const {circleRadius, circleCenter} = getContext('params')
    

    //onMount resize listener for responsive interface
    onMount(async () => {
        window.addEventListener("resize", () => {
            maxWidth = canvasParent.getBoundingClientRect().width
            if (canvasDimensions.targetWidth > maxWidth) {
             const scale = maxWidth/canvasDimensions.targetWidth;
             resizeCanvasWithImage(scale);
         }
        })
    })
    //

    //Listeners for canvas resize
    const moveRightListener = (e:MouseEvent) => {
        dragStartX = dragPositionX
        dragPositionX = e.pageX
        const deltaX = dragPositionX - dragStartX
        let resultWidth = (deltaX*2) + canvasDimensions.targetWidth;
        if (resultWidth > maxWidth) {
            resultWidth = maxWidth;
        }
        const scale = resultWidth/canvasDimensions.targetWidth;
        resizeCanvasWithImage(scale);
        window.addEventListener("mouseup", removeListeners)
    }

    const moveLeftListener = (e:MouseEvent) => {
        dragStartX = dragPositionX
        dragPositionX = e.pageX
        const deltaX = dragStartX - dragPositionX
        let resultWidth = (deltaX*2) + canvasDimensions.targetWidth
        if (resultWidth > maxWidth) {
            resultWidth = maxWidth
        }
        const scale = resultWidth/canvasDimensions.targetWidth;
        resizeCanvasWithImage(scale);
        window.addEventListener("mouseup", removeListeners)
    }
    //

    //Cleaning listneres
    const removeListeners = () => {
        isResizing = false
        window.removeEventListener("mousemove", moveRightListener)
        window.removeEventListener("mousemove", moveLeftListener)
        window.removeEventListener("mouseup", removeListeners)
    }
    //

    //Click handlers
    const dragRight = (e:MouseEvent) => {
        isResizing = true
        dragStartX = dragPositionX = e.pageX
        window.addEventListener("mousemove", moveRightListener)
    };

    const dragLeft = (e:MouseEvent) => {
        isResizing = true
        dragStartX = dragPositionX = e.pageX
        window.addEventListener("mousemove", moveLeftListener)
    };
    //

    const checkMaxWidth = (initialWidth:number, initialHeight:number, maxWidth:number) => {
        let targetWidth = initialWidth
        let targetHeight = initialHeight
        if (initialWidth > maxWidth) {
            targetWidth = maxWidth
            targetHeight = initialHeight * (maxWidth/initialWidth)
        }
        return {targetWidth, targetHeight}
    };

    //Function to pass the the values to state and start the callback chain to resize the image
    const resizeCanvasWithImage = (scale:number) => {
        const targetWidth = canvasDimensions.targetWidth * scale
        canvasDimensions = {
            targetWidth: targetWidth,
            targetHeight: targetWidth * editedImage.height/editedImage.width
        }
    };
    //

    //Cutting the image from photo with with filters
    const cutImage = () => {
        const photoCanvas = document.getElementById("photoCanvas") as HTMLCanvasElement
        const photoctx = photoCanvas.getContext("2d")
        const result = document.createElement('canvas')
        result.style.marginBottom="20px"
        const resultctx = result.getContext("2d")
        const left = $circleCenter.x - $circleRadius
        const top = $circleCenter.y - $circleRadius
        const resultData = photoctx.getImageData(left, top,
        $circleRadius*2, $circleRadius*2)
        console.log($circleCenter, $circleRadius)
        result.width = result.height = $circleRadius*2
        resultctx.putImageData(resultData, 0 ,0)
        resultctx.globalCompositeOperation="destination-in";
        resultctx.globalAlpha = 1
        resultctx.beginPath()
        resultctx.arc($circleRadius, $circleRadius, $circleRadius,0,2 * Math.PI)
        resultctx.fill()
        results = [...results, result]
    };
    //

    //Adapter to get file url from file
    const URLFromFile = (e) => {
        console.log(e.target.files[0])
        const url = URL.createObjectURL(e.target.files[0])
        uploadImage(url)
        e.target.value = null
    }
    //

    //Adapter to get URL from text input
    
    //

    //Adapter to get image URL from camera

    //

    //Upload image from given url
    const uploadImage = (url: string) => {
        const image = new Image()
        image.src = url
        image.onload = () => {
           maxWidth = canvasParent.getBoundingClientRect().width
           canvasDimensions = checkMaxWidth(image.width, image.height, maxWidth)
           editedImage = image
        }
    };
    //
</script>

<div class="relative md:p-16 p-6">
    <div>

    <div class="mb-4 w-full">
        <div>
            <h1 class="text-3xl font-bold mb-8">Image Editor</h1>
        </div>
            <div class="md:flex">
                <div class="md:w-6/12 mb-8">

                <div class="mb-4 text-2xl font-semibold">Please upload a picture
                </div>
                <button class="rounded bg-blue-400 p-2 text-white font-semibold">
                    <label for="image">
                        Upload
                    </label>
                </button>
                <input class="hidden" type="file" name="image" id="image" on:change={URLFromFile}>
            </div>

        </div>
        <div class="w-full md:flex">
        <FilterInputs/>
        <ParamsInputs canvasDimensions={canvasDimensions}/>   
        </div>
        <div class="w-full md:flex">
        <FaceInputs/>
        </div>
        <div class="flex justify-center w-full">
            <button class="rounded bg-blue-400 p-2 text-white font-semibold"
            disabled="{!editedImage}"
            on:click={cutImage}
            >
                    Cut the Image
                </button>
        </div>

 

    </div>

    </div>
    <div bind:this={canvasParent} class="relative w-full h-full bg-gray-200 flex justify-center mb-8">
        <div class="select-none relative w-auto flex">
            <PhotoCanvas canvasDimensions={canvasDimensions} editedImage={editedImage}
            />
            <div 
            on:touchstart = {(e) => {
                console.log(e)
            }}
            on:mousedown={dragLeft}
            class="rounded cursor-nw z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600  border-2 border-gray-400"></div>
            <div on:mousedown={dragRight}  class="rounded  cursor-ne z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600  border-2 border-gray-400 right-0"></div>
            <div  on:mousedown={dragRight} class="rounded  cursor-nwse z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600   border-2 border-gray-400 right-0 bottom-0"></div>
            <div on:mousedown={dragLeft}  class="rounded cursor-nesw z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600 border-2 border-gray-400 bottom-0"></div>
        </div>
    </div>
    <div>
        {#if results.length}
        <div class="mb-4 text-2xl font-semibold text-center">Results</div>
        <div class="w-full">
            {#each results as result}
            <ResultCanvas result = {result}/>
            {/each}
        </div>
        {/if}
    </div>
</div>