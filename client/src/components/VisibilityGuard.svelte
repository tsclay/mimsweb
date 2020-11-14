<script>
  import { onMount } from "svelte";

  export let gridArea, styleOverride;

  let el = null;
  let visible = false;
  let hasBeenVisible = false;
  let observer = null;

  onMount(() => {
    observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        hasBeenVisible = hasBeenVisible || visible;
      },
      { rootMargin: "0px 0px 50px 0px" }
    );
    observer.observe(el);

    return () => {
      if (!hasBeenVisible) {
        observer.unobserve(el);
      }
    };
  });

  $: if (hasBeenVisible) {
    observer.unobserve(el);
  }
</script>

<div
  bind:this={el}
  style="position: relative; {gridArea ? `grid-area: ${gridArea}` : ''} {styleOverride ? styleOverride : ''}">
  <slot {visible} {hasBeenVisible} />
</div>
