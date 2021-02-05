<script>
import FilterContext from "./FilterContext.svelte";

import ParamsContext from "./ParamsContext.svelte";

	import PhotoEditor from "./PhotoEditor.svelte";
</script>

<main>
	<ParamsContext>
		<FilterContext>
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