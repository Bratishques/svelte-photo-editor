<script>
import { setContext } from "svelte";

import { writable } from "svelte/store";


    const enableDetection = writable(false)

    setContext("face", {
        enableDetection: enableDetection
    });
    
</script>

<div>
    <slot></slot>
</div>