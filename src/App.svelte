<script lang="ts">
import FaceContext from "./context/FaceContext.svelte";

import FilterContext from "./context/FilterContext.svelte";
import ParamsContext from "./context/ParamsContext.svelte";
import PhotoEditor from "./PhotoEditor.svelte";
import ThemeSwitcher from "./ThemeSwitcher.svelte";
</script>

<main class="relative dark:text-gray-200 text-gray-900 dark:bg-gray-800">
	<ParamsContext>
		<FilterContext>
      <FaceContext>
      <ThemeSwitcher/>
      <PhotoEditor/>
      </FaceContext>
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