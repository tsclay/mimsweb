<script>
  import VisibilityGuard from "./VisibilityGuard.svelte";
  import { fade } from "svelte/transition";
  import { createEventDispatcher } from "svelte";

  export let imgSrc = "#";
  export let imgSrcTiny = imgSrc;
  export let imgAlt = "Image";
  export let gridArea, styleOverride, isGallery;
  export let hideBtn;

  let isAbsolute = false;
  let isStatic = false;

  const dispatch = createEventDispatcher();

  function setPosToAbsolute() {
    isAbsolute = true;
    isStatic = false;
  }
  function setPosToStatic() {
    isAbsolute = false;
    isStatic = true;
  }

  function forwardImgClick(e) {
    dispatch("openImg", {
      imgSrc,
    });
  }
</script>

<style>
  .isAbsolute {
    position: absolute;
    top: 0;
    left: 0;
  }
  .isStatic {
    position: static;
  }

  .isGallery {
    width: 100%;
    height: auto;
  }

  .img-wrapper {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .maximize {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: 2rem;
    background: rgba(49, 49, 49, 0.7);
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  img {
    width: 100%;
    align-self: stretch;
    height: 100%;
    min-height: 200px;
    border-radius: 4px;
  }
</style>

<VisibilityGuard let:hasBeenVisible {gridArea} {styleOverride}>
  {#if hasBeenVisible}
    <div class="img-wrapper" on:click={forwardImgClick}>
      {#if !hideBtn}
        <button class="maximize">
          <svg
            width="100%"
            height="100%"
            version="1.1"
            viewBox="0 0 64.029 59.267"
            xmlns="http://www.w3.org/2000/svg">
            <g fill="var(--white)">
              <path d="m63.775 0.037775-3.2233 49.618-46.394-46.394z" />
              <path d="m3.4778 9.6112 46.394 46.395-49.618 3.2232z" />
            </g>
          </svg>
        </button>
      {/if}
      <img
        in:fade
        class:isAbsolute
        class:isStatic
        class:isGallery
        src={imgSrc}
        alt={imgAlt} />
    </div>
  {:else}
    <img
      class:isGallery
      out:fade
      on:outrostart={setPosToAbsolute}
      on:outroend={setPosToStatic}
      src={imgSrcTiny}
      alt={imgAlt} />
  {/if}
</VisibilityGuard>
