<script lang="ts">
import { writable } from "svelte/store";
import { setFaceContext } from "../lib/context";
import type { EyeOverlay } from "../lib/eyes";

    setFaceContext({
        enableDetection: writable(false),
        eyeOverlay: writable<EyeOverlay | null>(null)
    });
</script>

<div>
    <slot></slot>
</div>
