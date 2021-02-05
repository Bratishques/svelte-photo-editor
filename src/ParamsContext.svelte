<script>
import { setContext } from "svelte";
import { writable } from "svelte/store";

    let globalAlpha = writable(0.4);
    let fillStyle = writable('#FFFFFF');
    let circleRadius = writable(50);
    let circleCenter = writable({
        x: 0,
        y: 0
    })
    setContext("params", {
        fillStyle: fillStyle,
        globalAlpha: globalAlpha,
        circleRadius: circleRadius,
        circleCenter: circleCenter
    });


</script>

<div>
    <slot></slot>
</div>