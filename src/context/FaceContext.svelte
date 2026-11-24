<script lang="ts">
import { writable } from "svelte/store";
import { setFaceContext } from "../lib/context";

    setFaceContext({
        enableDetection: writable(false)
    });
</script>

<div>
    <slot></slot>
</div>
