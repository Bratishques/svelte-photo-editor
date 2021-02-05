<script>
import { setContext } from "svelte";
import { writable } from "svelte/store";

    let globalAlpha = writable(0.4);
    let fillStyle = writable('#FFFFFF');
    let circleRadius = writable(50);
    setContext("params", {
        fillStyle: fillStyle,
        globalAlpha: globalAlpha,
        circleRadius: circleRadius,
    });


</script>

<div>
    <slot></slot>
</div>