<script lang="ts">
import { onMount, tick } from "svelte";
import { getFaceContext, getFilterContext, getParamsContext, setHistoryContext } from "./lib/context";
import { applyState, captureState, deepEqual, fitState, HISTORY_LIMIT, type EditorContexts, type EditorState } from "./lib/editorState";
import { canRedo, canUndo, commit, createHistory, redo, undo, type History } from "./lib/history";
import { getHistoryShortcut, isTextEditingTarget } from "./lib/keyboard";
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
    let editedImage: HTMLImageElement | undefined;
    let maxWidth: number;
    let dragStartX: number;
    let dragPositionX: number;
    let canvasDimensions : CanvasDimensions = {
        targetWidth: 0,
        targetHeight: 0
    }
    let results: HTMLCanvasElement[] = [];

    const contexts: EditorContexts = {
        params: getParamsContext(),
        filter: getFilterContext(),
        face: getFaceContext(),
    }
    const {circleRadius, circleCenter} = contexts.params

    //Undo/redo history of the current image (see lib/history.ts)
    let history: History<EditorState> | undefined

    const recordStep = async () => {
        const image = editedImage
        // Let reactive statements (e.g. the radius clamp) settle first
        await tick()
        // No history before the first upload; skip a step that belongs to a replaced picture
        if (!history || image !== editedImage) return
        history = commit(history, captureState(contexts, toSize(canvasDimensions)), {
            limit: HISTORY_LIMIT,
            equals: deepEqual,
        })
    }
    setHistoryContext({ commit: recordStep })

    const restore = (state: EditorState) => {
        maxWidth = canvasParent.getBoundingClientRect().width
        const size = applyState(contexts, fitState(state, maxWidth))
        canvasDimensions = { targetWidth: size.width, targetHeight: size.height }
    }

    const undoStep = () => {
        if (!history || !canUndo(history)) return
        history = undo(history)
        restore(history.present)
    }

    const redoStep = () => {
        if (!history || !canRedo(history)) return
        history = redo(history)
        restore(history.present)
    }

    const handleKeydown = (e: KeyboardEvent) => {
        const action = getHistoryShortcut(e)
        if (!action || isTextEditingTarget(e.target)) return
        e.preventDefault()
        if (action === "undo") undoStep()
        else redoStep()
    }

    const toSize = (dimensions: CanvasDimensions) => ({
        width: dimensions.targetWidth,
        height: dimensions.targetHeight,
    })

    const centerCircle = () => {
        $circleCenter = {
            x: canvasDimensions.targetWidth/2,
            y: canvasDimensions.targetHeight/2
        }
    }
    //


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
        // The whole resize drag is one undo step
        recordStep()
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
        if (!editedImage) return
        const targetWidth = canvasDimensions.targetWidth * scale
        canvasDimensions = {
            targetWidth: targetWidth,
            targetHeight: targetWidth * editedImage.height/editedImage.width
        }
        centerCircle()
    };
    //

    //Cutting the image from photo with with filters
    const cutImage = () => {
        const photoCanvas = document.getElementById("photoCanvas") as HTMLCanvasElement
        const photoctx = photoCanvas.getContext("2d")!
        const result = document.createElement('canvas')
        result.style.marginBottom="20px"
        const resultctx = result.getContext("2d")!
        const left = $circleCenter.x - $circleRadius
        const top = $circleCenter.y - $circleRadius
        const resultData = photoctx.getImageData(left, top,
        $circleRadius*2, $circleRadius*2)
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
    const URLFromFile = (e: Event & { currentTarget: HTMLInputElement }) => {
        const file = e.currentTarget.files?.[0]
        if (!file) return
        uploadImage(URL.createObjectURL(file))
        // Reset the input so the same file can be selected again
        e.currentTarget.value = ""
    }
    //

    //Adapter to get URL from text input
    
    //

    //Adapter to get image URL from camera

    //

    //Upload image from given url
    let pendingImage: HTMLImageElement | undefined
    const uploadImage = (url: string) => {
        const image = new Image()
        pendingImage = image
        image.src = url
        image.onload = () => {
           // Only the most recently selected file is shown
           if (pendingImage !== image) return
           maxWidth = canvasParent.getBoundingClientRect().width
           canvasDimensions = checkMaxWidth(image.width, image.height, maxWidth)
           editedImage = image
           centerCircle()
           // A new picture starts a new history. Filters and overlay settings
           // carry over as before, the eye overlay belongs to the old picture.
           contexts.face.eyeOverlay.set(null)
           history = undefined
           tick().then(() => {
               if (editedImage === image) {
                   history = createHistory(captureState(contexts, toSize(canvasDimensions)))
               }
           })
        }
    };
    //
</script>

<svelte:window on:keydown={handleKeydown}/>

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
        <FaceInputs image={editedImage}/>
        </div>
        <div class="flex justify-center gap-2 w-full">
            <button class="rounded bg-blue-400 p-2 text-white font-semibold disabled:opacity-50"
            disabled={!history || !canUndo(history)}
            title="Undo (Ctrl+Z)"
            on:click={undoStep}
            >
                    Undo
                </button>
            <button class="rounded bg-blue-400 p-2 text-white font-semibold disabled:opacity-50"
            disabled={!history || !canRedo(history)}
            title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
            on:click={redoStep}
            >
                    Redo
                </button>
            <button class="rounded bg-blue-400 p-2 text-white font-semibold disabled:opacity-50"
            disabled="{!editedImage}"
            on:click={cutImage}
            >
                    Cut the Image
                </button>
        </div>

 

    </div>

    </div>
    <div bind:this={canvasParent} class="relative w-full h-full bg-gray-200 dark:bg-gray-700 flex justify-center mb-8">
        <div class="select-none relative w-auto flex">
            <PhotoCanvas canvasDimensions={canvasDimensions} editedImage={editedImage}
            />
            <!-- Corner handles for mouse-driven resizing (no touch/keyboard support yet) -->
            <div aria-hidden="true"
            on:mousedown={dragLeft}
            class="rounded cursor-nw z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600  border-2 border-gray-400"></div>
            <div aria-hidden="true" on:mousedown={dragRight}  class="rounded  cursor-ne z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600  border-2 border-gray-400 right-0"></div>
            <div aria-hidden="true" on:mousedown={dragRight} class="rounded  cursor-nwse z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600   border-2 border-gray-400 right-0 bottom-0"></div>
            <div aria-hidden="true" on:mousedown={dragLeft}  class="rounded cursor-nesw z-30 {editedImage ? 'absolute' : 'hidden'} w-4 h-4 bg-red-600 border-2 border-gray-400 bottom-0"></div>
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