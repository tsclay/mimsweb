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
    const urls = ['/content', '/galleries']
    let content, galleries
    for (let i = 0; i < urls.length; i++) {
      switch (i) {
        case 0:
          content = await fetch(urls[i]).then((r) => r.json())
        default:
          galleries = await fetch(urls[i]).then((r) => r.json())
      }
    }
    resources.galleries = galleries
    resources.content = content
    return resources
  }

  onMount(fetchResources)

  let lowerBound = 400
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

{#if Object.keys(resources).length > 0}
  <div>
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
  </div>
{/if}
