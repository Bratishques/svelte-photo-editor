<script>
import { getContext } from "svelte";


    const {grayscale, brightness, sepia, hueRotate, saturate, contrast} = getContext("filter");

</script>
<div class="flex flex-col md:w-6/12 mb-8">
    <div class="mb-4 text-2xl font-semibold">
        Filters
    </div>
        <label class="mb-4 flex w-60 justify-between" for="">
            <p>Grayscale</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="100" 
            value={$grayscale}
            on:input={(e) => {
                $grayscale = e.target.value
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between" for="">
            <p>Brightness</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="200" 
            value={$brightness}
            on:input={(e) => {
                $brightness = e.target.value
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between" for="">
            <p>Sepia</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="100" 
            value={$sepia}
            on:input={(e) => {
                $sepia = e.target.value
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between" for="">
            <p>Hue Rotation</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="360" 
            value={$hueRotate}
            on:input={(e) => {
                $hueRotate = e.target.value
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between" for="">
            <p>Saturation</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="100" 
            value={$saturate}
            on:input={(e) => {
                $saturate = e.target.value
            }}
            >
        </label>
        <label class="mb-4 flex w-60 justify-between" for="">
            <p>Contrast</p>
            <input 
            class="ml-4"
            type="range" 
            min="0" 
            max="100" 
            value={$contrast}
            on:input={(e) => {
                $contrast = e.target.value
            }}
            >
        </label>


</div>