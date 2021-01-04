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
  $: if (el) {
    el.style.cssText = `
    position: relative; 
    ${gridArea ? `grid-area: ${gridArea}` : ""};
    ${styleOverride ? styleOverride : ""};
    `;
  }
</script>

<div bind:this={el}>
  <slot {visible} {hasBeenVisible} />
</div>

<!-- style="position: relative; {gridArea ? `grid-area: ${gridArea}` : ''} {styleOverride ? styleOverride : ''}" -->
