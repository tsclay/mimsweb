<script>
  import Image from './Image.svelte'
  let images = [
    '../assets/testimonials/testimonial2014-02-27-at-9-14-30-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-16-21-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-18-24-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-19-30-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-20-49-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-21-54-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-22-55-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-24-01-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-26-25-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-27-30-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-28-45-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-29-43-am.png',
    '../assets/testimonials/testimonial2014-02-27-at-9-31-08-am.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-43-00-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-44-51-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-45-19-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-46-33-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-46-50-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-47-01-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-49-50-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-50-17-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-50-58-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-51-30-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-51-52-pm.png',
    '../assets/testimonials/testimonial2014-03-04-at-12-55-08-pm.png'
  ]

  let modalImgSrc

  const openImgModal = (e) => {
    modalImgSrc = e.detail.imgSrc
    return modalImgSrc
  }
</script>

<style type="text/scss">
  .carousel-wrapper {
    position: relative;
    width: 100%;
    height: 200px;
    display: flex;
    justify-content: center;
  }
  .carousel-container {
    position: absolute;
    top: 0;
    display: flex;
    flex-flow: row nowrap;
    overflow-y: hidden;
    height: 200px;
    width: 100%;
    overflow-x: auto;
  }
  .img-modal-wrapper {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 11;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(99, 98, 98, 0.568);
  }

  .img-modal-container {
    position: relative;
    width: 95%;
    max-width: 615px;
    max-height: 580px;
    img {
      width: 100%;
      height: 75%;
      display: block;
      margin: 0 auto;
    }
    button {
      font-size: 0.8rem;
      position: absolute;
      top: 0;
      right: 0;
      border-radius: 2rem;
      background: rgba(49, 49, 49, 0.7);
    }
  }
</style>

<div class="component" id="testimonials">
  <h1>Recognized in the community</h1>
  <p>
    Many of our clients and collaborators have expressed their gratitude for our
    hard work. Check them out below!
  </p>
  <div class="carousel-wrapper">
    <div class="carousel-container">
      {#each images as image, i}
        <Image
          on:openImg={openImgModal}
          styleOverride="margin-right: 1rem; width: 200px; height: 200px; flex-shrink: 0;"
          imgSrc={image}
          imgSrcTiny={'./assets/img-blurry/1925blurred.jpg'}
          imgAlt="Testimonial-{i}" />
      {/each}
    </div>
    {#if modalImgSrc}
      <div class="img-modal-wrapper">
        <div class="img-modal-container">
          <img src={modalImgSrc} alt="Whoops" />
          <button on:click={() => (modalImgSrc = null)}>Close</button>
        </div>
      </div>
    {/if}
  </div>
</div>
