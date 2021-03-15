<script>
  import { onMount } from 'svelte'
  import NavBar from './components/NavBar.svelte'
  import ContactForm from './components/ContactForm.svelte'
  import Banner from './components/Banner.svelte'
  import About from './components/About.svelte'
  import Testimonials from './components/Testimonials.svelte'
  import Gallery from './components/Gallery.svelte'
  import Footer from './components/Footer.svelte'
  import { windowWidth, needModal } from './stores.js'

  export let toggleModal
  export let width
  let resources = {}

  const fetchResources = async () => {
    const url = '/resources'
    resources = await fetch(url).then((r) => r.json())
    return resources
  }

  onMount(fetchResources)

  let navIsSticky = false
  const stickyNav = `position: sticky;
    position: -webkit-sticky;
    z-index: 99;
    top: 0;
    left: 0;`

  const unsubscribeWidth = windowWidth.subscribe((value) => (width = value))
  const unsubscribeModal = needModal.subscribe((value) => {
    toggleModal = value
  })

  const toggleNavButtons = () => {
    needModal.set(!toggleModal)
  }
</script>

<style type="text/scss">
  main {
    margin: 0 auto;
    width: 90%;
    max-width: 1298px;
  }
  .loading-wrapper {
    position: fixed;
    width: clamp(125px, 50%, 365px);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .loader-icon {
    animation: rotateLoader 0.5s linear 0s infinite forwards;
    width: 100%;
    height: auto;
  }
  .loader-path {
    animation: changeLoaderColor 4s linear infinite alternate-reverse;
  }
  @keyframes rotateLoader {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes changeLoaderColor {
    from {
      stroke: rgb(255, 60, 106);
    }
    to {
      stroke: rgb(107, 28, 47);
    }
  }
</style>

<svelte:body
  on:click={(e) => {
    if (e.target.id !== 'modal-toggler') {
      needModal.set(false)
    }
  }} />

<svelte:window
  on:resize={() => {
    windowWidth.set(window.innerWidth)
  }} />

<div>
  {#if Object.keys(resources).length > 0}
    <Banner />
    <NavBar
      {width}
      {toggleModal}
      {toggleNavButtons}
      {navIsSticky}
      {stickyNav} />
    <main>
      <About {width} {resources} />
      <Gallery {resources} />
      <Testimonials {resources} />
      <ContactForm {width} />
    </main>
    <Footer />
  {:else}
    <div class="loading-wrapper">
      <svg
        class="loader-icon"
        xmlns="http://www.w3.org/2000/svg"
        width="500"
        height="500"
        viewBox="0 0 132.29166 132.29167">
        <g>
          <path
            class="loader-path"
            d="m 66.573613,126.66219 9.9e-4,-8e-5 c 33.183731,-6e-5 60.084447,-27.034831 60.084487,-60.38394 l 7e-5,-0.0029"
            style="fill:none;fill-rule:evenodd;stroke:#00ffff;stroke-width:10.7299;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1" />
        </g>
      </svg>
    </div>
  {/if}
</div>
