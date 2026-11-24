<script lang="ts">
import { getFilterContext } from "./lib/context";

    //This file separates the inputs from other components
    const {grayscale, brightness, sepia, hueRotate, saturate, contrast} = getFilterContext();

</script>
<div class="flex flex-col md:w-6/12 mb-8">
    <div class="mb-4 text-2xl font-semibold">
        Filters
    </div>
        <label class="mb-4 flex w-60 justify-between">
            <p>Grayscale</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="100" 
            value={$grayscale}
            on:input={(e) => {
                $grayscale = Number(e.currentTarget.value)
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between">
            <p>Brightness</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="200" 
            value={$brightness}
            on:input={(e) => {
                $brightness = Number(e.currentTarget.value)
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between">
            <p>Sepia</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="100" 
            value={$sepia}
            on:input={(e) => {
                $sepia = Number(e.currentTarget.value)
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between">
            <p>Hue Rotation</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="360" 
            value={$hueRotate}
            on:input={(e) => {
                $hueRotate = Number(e.currentTarget.value)
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between">
            <p>Saturation</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="200" 
            value={$saturate}
            on:input={(e) => {
                $saturate = Number(e.currentTarget.value)
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between">
            <p>Contrast</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="200" 
            value={$contrast}
            on:input={(e) => {
                $contrast = Number(e.currentTarget.value)
            }}
            >
        </label>


</div>