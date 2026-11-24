<script lang="ts">
import { writable } from "svelte/store";
import { setFilterContext } from "../lib/context";

// Values are percentages (hue rotation is in degrees), matching CSS filter functions
setFilterContext({
    grayscale: writable(0),
    contrast: writable(100),
    brightness: writable(100),
    sepia: writable(0),
    hueRotate: writable(0),
    saturate: writable(100),
});
</script>

<div>
    <slot></slot>
</div>
