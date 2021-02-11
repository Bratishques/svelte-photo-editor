<script lang="ts">
import { onMount } from "svelte";



    let dark: boolean;

    $: if (dark) {
            document.documentElement.classList.add("dark")
        }
        else {
            document.documentElement.classList.remove("dark")
        };
    

    onMount(() => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            dark = true
        }
        else {
            dark = false
        }

    })
    
    const switchTheme = () => {
        if (dark) {
            dark = false
        }
        else {
            dark = true
        }
    }



</script>

<div class="">
    <button 
    class="rounded bg-blue-400 p-2 text-white font-semibold"
    on:click={switchTheme}
    >
        Switch theme
    </button>
</div>