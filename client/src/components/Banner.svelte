<script>
</script>

<style type="text/scss">
  #banner {
    position: relative;
    .banner-bkgd {
      width: 100%;
      min-height: 500px;
      position: relative;
    }
  }

  .banner-text-wrapper {
    position: absolute;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    bottom: 50%;
    transform: translateY(50%);
    width: 100%;
    img {
      width: 100%;
      position: relative;
    }
  }

  .logo-wrapper {
    width: 70%;
    background: rgba(141, 141, 141, 0.7);
    border: black solid 4px;
    max-width: 920px;
    padding: 8px;
    img {
      width: 100%;
    }
  }
</style>

<div id="banner">
  <img
    class="banner-bkgd"
    src="../assets/img/1925new.jpg"
    alt="Mims Family Painting" />
  <div class="banner-text-wrapper">
    <div class="logo-wrapper">
      <img src="../assets/img/NEWNEWLOGO.png" alt="logo" />
    </div>
  </div>
</div>
