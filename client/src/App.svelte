<script>
  import NavBar from "./components/NavBar.svelte";
  import ContactForm from "./components/ContactForm.svelte";
  import Banner from "./components/Banner.svelte";
  import About from "./components/About.svelte";
  import Testimonials from "./components/Testimonials.svelte";
  import Gallery from "./components/Gallery.svelte";
  import Footer from "./components/Footer.svelte";
  import { windowWidth, needModal } from "./stores.js";

  export let toggleModal;
  export let width;

  let lowerBound = 400;
  let navIsSticky = false;
  const stickyNav = `position: sticky;
    position: -webkit-sticky;
    z-index: 99;
    top: 0;
    left: 0;`;

  const getStickyNavTrigger = () => {
    const banner = document.getElementById("banner");
    const bannerDims = banner.getBoundingClientRect();
    const bannerLowerBound = bannerDims.bottom;
    lowerBound = bannerLowerBound;
  };

  // onMount(() => {
  //   getStickyNavTrigger();
  // });

  const unsubscribeWidth = windowWidth.subscribe((value) => (width = value));
  const unsubscribeModal = needModal.subscribe((value) => {
    toggleModal = value;
  });

  const toggleNavButtons = () => {
    needModal.set(!toggleModal);
  };

  const toggleStickyNav = () => {
    // if (navIsSticky) return;
    window.scrollY >= lowerBound ? (navIsSticky = true) : (navIsSticky = false);
  };

  $: lowerBound;
  // getStickyNavTrigger(); // on:scroll={toggleStickyNav}
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
      needModal.set(false);
    }
  }} />

<svelte:window
  on:resize={() => {
    windowWidth.set(window.innerWidth);
  }} />

<div>
  <Banner />
  <NavBar {width} {toggleModal} {toggleNavButtons} {navIsSticky} {stickyNav} />
  <main>
    <About {width} />
    <Gallery />
    <Testimonials />
    <ContactForm {width} />
  </main>
  <Footer />
</div>
