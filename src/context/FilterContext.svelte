<script lang="ts">
import { setContext } from "svelte";
import { writable } from "svelte/store";

let grayscale = writable(0);
let contrast = writable(100);
let brightness = writable(100);
let sepia = writable(0);
let hueRotate = writable(0);
let saturate = writable(100);

setContext('filter', {
    grayscale: grayscale,
    contrast: contrast,
    brightness: brightness,
    sepia: sepia,
    hueRotate: hueRotate,
    saturate: saturate,
});
</script>

<div>
    <slot></slot>
</div>