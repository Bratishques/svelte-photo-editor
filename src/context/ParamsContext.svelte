<script lang="ts">
import { writable } from "svelte/store";
import { setParamsContext } from "../lib/context";

    //Values for 4 reactive parameters
    setParamsContext({
        fillStyle: writable('#FFFFFF'),
        globalAlpha: writable(0.4),
        circleRadius: writable(50),
        circleCenter: writable({
            x: 0,
            y: 0
        })
    });
</script>

<div>
    <slot></slot>
</div>
