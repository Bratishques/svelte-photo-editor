<script lang="ts">
import FilterContext from "./FilterContext.svelte";

import ParamsContext from "./ParamsContext.svelte";

import PhotoEditor from "./PhotoEditor.svelte";
import ThemeSwitcher from "./ThemeSwitcher.svelte";
</script>

<main class="relative dark:text-gray-200 text-gray-900 dark:bg-gray-800">
	<ParamsContext>
		<FilterContext>
      <ThemeSwitcher/>

			<PhotoEditor/>
		</FilterContext>
	</ParamsContext>

</main>

<style global lang="postcss">
  /* purgecss start ignore */
  @tailwind base;
  @tailwind components;
  /* purgecss end ignore */

  @tailwind utilities;

</style>