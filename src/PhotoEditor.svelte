<script>
import { getContext, onMount } from "svelte";
import FilterInputs from "./FilterInputs.svelte";
import ParamsInputs from "./ParamsInputs.svelte";
import PhotoCanvas from "./PhotoCanvas.svelte";

    let canvasParent;
    let editedImage = null;
    let maxWidth = null;
    let dragStartX = null;
    let dragPositionX = null;
    let canvasDimensions = {
        targetWidth: 0,
        targetHeight: 0
    }


    onMount( async () => {
        window.addEventListener("resize", () => {

            maxWidth = canvasParent.getBoundingClientRect().width
            if (canvasDimensions.targetWidth > maxWidth) {
             const scale = maxWidth/canvasDimensions.targetWidth;
             resizeCanvasWithImage(scale);
         }
        })
    })

    const moveRightListener = (e) => {
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

    const moveLeftListener = (e) => {
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

    const removeListeners = () => {
        window.removeEventListener("mousemove", moveRightListener)
        window.removeEventListener("mousemove", moveLeftListener)
        window.removeEventListener("mouseup", removeListeners)
    }

    const dragRight = (e) => {
        dragStartX = dragPositionX = e.pageX
        window.addEventListener("mousemove", moveRightListener)
    }

    const dragLeft = (e) => {
        dragStartX = dragPositionX = e.pageX
        window.addEventListener("mousemove", moveLeftListener)
    }

    const checkMaxWidth = (initialWidth, initialHeight, maxWidth) => {
        let targetWidth = initialWidth
        let targetHeight = initialHeight
        if (initialWidth > maxWidth) {
            targetWidth = maxWidth
            targetHeight = initialHeight * (maxWidth/initialWidth)
        }
        return {targetWidth, targetHeight}
    }

    const resizeCanvasWithImage = (scale) => {
        const targetWidth = canvasDimensions.targetWidth * scale
        canvasDimensions = {
            targetWidth: targetWidth,
            targetHeight: targetWidth * editedImage.height/editedImage.width
        }
    }

    const uploadImage = (e) => {
        console.log(e.target.files[0])
        const image = new Image()
        image.src = URL.createObjectURL(e.target.files[0])
        image.onload = () => {
           maxWidth = canvasParent.getBoundingClientRect().width
           canvasDimensions = checkMaxWidth(image.width, image.height, maxWidth)
           editedImage = image
           e.target.value = null
        }
    }
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
                <input class="hidden" type="file" name="image" id="image" on:change={uploadImage}>
            </div>

        </div>
        <div class="w-full md:flex">
        <FilterInputs/>
        <ParamsInputs canvasDimensions={canvasDimensions}/>   
        </div>

 

    </div>

    </div>
    <div bind:this={canvasParent} class="relative w-full h-full bg-gray-200 flex justify-center">
        <div class="select-none relative w-auto flex">
            <PhotoCanvas canvasDimensions={canvasDimensions} editedImage={editedImage}/>
            <div on:mousedown={dragLeft}
            class="rounded cursor-nw z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600  border-2 border-gray-400"></div>
            <div on:mousedown={dragRight}  class="rounded  cursor-ne z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600  border-2 border-gray-400 right-0"></div>
            <div  on:mousedown={dragRight} class="rounded  cursor-nwse z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600   border-2 border-gray-400 right-0 bottom-0"></div>
            <div on:mousedown={dragLeft}  class="rounded cursor-nesw z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600 border-2 border-gray-400 bottom-0"></div>
        </div>
    </div>
</div>