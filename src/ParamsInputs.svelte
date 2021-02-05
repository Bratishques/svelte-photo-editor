<script>
import { getContext } from "svelte";

    export let canvasDimensions = {
        targetWidth: 0,
        targetHeight: 0
        };
    let maxCircleRad = 50;
    const {fillStyle, globalAlpha, circleRadius} = getContext("params");

    $: if (canvasDimensions.targetWidth) {
        maxCircleRad  = getMaxCircleRadius(canvasDimensions);
    };

    $: if ($circleRadius > maxCircleRad) {
            $circleRadius = maxCircleRad
        }

    const getMaxCircleRadius = (canvasDimensions) => {
        const min = Math.min(canvasDimensions.targetWidth, canvasDimensions.targetHeight)
        return min/2
    };
    
</script>

<div class="md:w-6/12 mb-8">
    <div class="mb-4 text-2xl font-semibold">
        Edit parameters
    </div>
    <div class="flex flex-col">
        <label class="mb-4 flex w-72 justify-between">
            Overlay opacity
            <input class="ml-4" type="range" min="0" max="100" value={$globalAlpha * 100}
            on:input={(e) => {
                $globalAlpha = e.target.value/100
            }}
            >
            </label>
        <label class="mb-4 flex w-72 justify-between">
            Cut circle radius
            <input class="ml-4" type="range" min="25" max={maxCircleRad}
            on:input={(e) => {
                $circleRadius = Number(e.target.value)
            }}
            >
            </label>
        <label class="mb-4 flex w-72 justify-between">
            Overlay Color Hex
            <input class="ml-4" type="text" value={$fillStyle}>
        </label>
    </div>
</div>