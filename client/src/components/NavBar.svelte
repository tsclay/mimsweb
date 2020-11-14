<script>
  export let toggleModal
  export let width
  export let toggleNavButtons
  export let navIsSticky
  export let stickyNav

  const scrollToTarget = (e) => {
    const target = document.querySelector(
      `#${e.target.innerText.toLowerCase()}`
    ).offsetTop
    window.scrollTo({
      left: 0,
      top: target - 100,
      behavior: 'smooth'
    })
  }
</script>

<style type="text/scss">
  #my-nav-bar {
    // position: relative;
    position: sticky;
    position: -webkit-sticky;
    z-index: 10;
    top: 0;
    height: 3.75rem;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: var(--bannerGray);
    > :first-child {
      margin-left: 0.25rem;
    }
    > :last-child {
      margin-right: 0.25rem;
    }
  }

  .button-group {
    display: flex;
    align-items: center;
    button {
      margin: 0;
      text-transform: uppercase;
    }
    @for $i from 1 through 3 {
      :nth-child(#{$i}) {
        margin-right: 0.25rem;
      }
    }
  }

  .sm-modal {
    position: absolute;
    z-index: 2;
    right: 0.5rem;
    top: 0;
    background: gray;
    border-radius: 4px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: start;
    button {
      margin-bottom: 0;
    }
  }

  #modal-toggler {
    margin: 0;
    margin-right: 0.25rem;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  svg {
    padding-top: 2px;
  }
  .burger-bars {
    fill: var(--white);
  }
</style>

<div id="my-nav-bar" style={navIsSticky ? stickyNav : null}>
  <svg
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:cc="http://creativecommons.org/ns#"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns="http://www.w3.org/2000/svg"
    id="svg8"
    version="1.1"
    viewBox="0 0 105.83333 52.916668"
    height="90%"
    width="100">
    <g style="opacity:1" id="layer1">
      <path
        id="path837"
        d="M 0.16378259,0.16366121 0.164,52.818597 H 105.73553 V 0.16323121 Z"
        style="fill:#000000;fill-opacity:1;stroke:#000000;stroke-width:0.26128px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1" />
      <path
        style="fill:none;stroke:#000000;stroke-width:0.241924px;stroke-linecap:butt;stroke-linejoin:miter;stroke-opacity:1"
        d="M 2.7998996,2.7336213 2.8,50.2486 H 103.09936 V 2.7332313 Z"
        id="path865" />
    </g>
    <g id="layer2">
      <path
        id="path870"
        d="m 2.9150973,3.010641 c 0,0 33.6820487,6.0784662 50.7027287,6.0476187 C 70.136622,9.0283218 102.8039,3.010641 102.8039,3.010641 c 0,0 -5.119173,15.960044 -5.0919,23.902181 0.02727,7.942137 5.0919,22.985618 5.0919,22.985618 0,0 -32.671092,-5.923648 -49.186074,-5.953125 -17.016979,-0.03037 -50.7027287,5.953125 -50.7027287,5.953125 0,0 5.0532242,-14.906543 5.092001,-22.985618 C 8.0458751,18.833747 2.9150973,3.010641 2.9150973,3.010641 Z"
        style="opacity:1;fill:#8d8d8d;fill-opacity:1;stroke:#ffffff;stroke-width:0.38562;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
      <g id="g1003" transform="translate(3.0747742,47.622316)">
        <g transform="translate(6.8439438,53.107067)" id="g984">
          <text
            xml:space="preserve"
            style="font-size:10.5833px;line-height:1.25;font-family:'Source Sans Pro';-inkscape-font-specification:'Source Sans Pro';stroke-width:0.264583"
            x="-0.22678363"
            y="-61.685715"
            id="text974">
            <tspan
              id="tspan972"
              x="-0.22678363"
              y="-61.685715"
              style="font-style:normal;font-variant:normal;font-weight:300;font-stretch:normal;font-size:35.2778px;font-family:'Open Sans';-inkscape-font-specification:'Open Sans Light';stroke-width:0.264583">
              M F P
            </tspan>
          </text>
          <text
            id="text978"
            y="-61.685715"
            x="36.814888"
            style="font-size:10.5833px;line-height:1.25;font-family:'Source Sans Pro';-inkscape-font-specification:'Source Sans Pro';stroke-width:0.264583"
            xml:space="preserve">
            <tspan
              style="font-style:normal;font-variant:normal;font-weight:300;font-stretch:normal;font-size:35.2778px;font-family:'Open Sans';-inkscape-font-specification:'Open Sans Light';stroke-width:0.264583"
              y="-61.685715"
              x="36.814888"
              id="tspan976">
              F P
            </tspan>
          </text>
          <text
            id="text988"
            y="-61.680336"
            x="-2.6721652"
            style="font-size:10.5833px;line-height:1.25;font-family:'Source Sans Pro';-inkscape-font-specification:'Source Sans Pro';stroke-width:0.264583"
            xml:space="preserve">
            <tspan
              style="font-style:normal;font-variant:normal;font-weight:300;font-stretch:normal;font-size:35.2778px;font-family:'Open Sans';-inkscape-font-specification:'Open Sans Light';stroke-width:0.264583"
              y="-61.680336"
              x="-2.6721652"
              id="tspan986">
              I
            </tspan>
          </text>
          <text
            xml:space="preserve"
            style="font-size:10.5833px;line-height:1.25;font-family:'Source Sans Pro';-inkscape-font-specification:'Source Sans Pro';stroke-width:0.264583"
            x="23.786171"
            y="-61.680336"
            id="text992">
            <tspan
              id="tspan990"
              x="23.786171"
              y="-61.680336"
              style="font-style:normal;font-variant:normal;font-weight:300;font-stretch:normal;font-size:35.2778px;font-family:'Open Sans';-inkscape-font-specification:'Open Sans Light';stroke-width:0.264583">
              I
            </tspan>
          </text>
        </g>
      </g>
    </g>
    <text
      xml:space="preserve"
      style="font-size:10.5833px;line-height:1.25;font-family:'Source Sans Pro';-inkscape-font-specification:'Source Sans Pro';stroke-width:0.264583"
      x="154.74907"
      y="232.79176"
      id="text846">
      <tspan
        id="tspan844"
        x="154.74907"
        y="232.79176"
        style="stroke-width:0.264583" />
    </text>
  </svg>

  {#if width > 600}
    <div class="button-group">
      <button
        class="active-flash"
        type="button"
        on:click={scrollToTarget}>About</button>
      <button type="button" on:click={scrollToTarget}>Gallery</button>
      <button
        class="active-flash"
        type="button"
        on:click={scrollToTarget}>Testimonials</button>
      <button
        class="active-flash"
        type="button"
        on:click={scrollToTarget}>Contact</button>
    </div>
  {:else}
    <button on:click|stopPropagation={toggleNavButtons} id="modal-toggler">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 135.46666 116.94583">
        <g
          class="burger-wrapper"
          transform="matrix(0.99618808,0,0,0.99997149,-34.076739,-84.989974)">
          <rect
            class="burger-bars"
            ry="15.501632"
            y="86.060791"
            x="35.279579"
            height="18.003263"
            width="134.70384"
            id="rect833"
            style="fill-opacity:1;" />
          <rect
            class="burger-bars"
            style="fill-opacity:1;"
            id="rect835"
            width="134.70384"
            height="18.003263"
            x="35.279579"
            y="128.39412"
            ry="15.501632" />
          <rect
            class="burger-bars"
            ry="15.501632"
            y="170.72749"
            x="35.279579"
            height="18.003263"
            width="134.70384"
            id="rect837"
            style="fill-opacity:1;" />
        </g>
      </svg>
    </button>
    {#if toggleModal}
      <div class="sm-modal">
        <button type="button" on:click={scrollToTarget}>About</button>
        <button type="button" on:click={scrollToTarget}>Gallery</button>
        <button type="button" on:click={scrollToTarget}>Testimonials</button>
        <button type="button" on:click={scrollToTarget}>Contact</button>
      </div>
    {/if}
  {/if}
</div>
