<script lang="ts">
import { onMount } from "svelte";


    export let result: HTMLCanvasElement;
    let resultParent: HTMLDivElement;

    onMount(() => {
        resultParent.appendChild(result)
    });

    const saveImage = () => {
        const img =  result.toDataURL("image/png")
        var a  = document.createElement('a');
        a.href = img;
        // e.g. "cut-2021-02-12T18-22-55-000Z.png" (no spaces or colons)
        a.download = `cut-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
         a.click()
    };
</script>

<div
class="flex flex-col items-center"
bind:this={resultParent}
>
    <button 
    class="rounded bg-blue-400 p-2 text-white font-semibold mb-4"
    on:click={saveImage}
    >
        Save this one
    </button>
</div>