<script>
  const currentYear = new Date().getUTCFullYear()
</script>

<style type="text/scss">
  #footer {
    background: var(--bannerGray);
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  p {
    text-align: center;
  }

  .logo-contact-wrapper {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
  }

  .company-contact {
    p:nth-child(1) {
      margin-bottom: 0;
    }
    p:nth-child(2) {
      margin-top: 0.25rem;
    }
  }

  .footer-logo {
    border: black solid 4px;
    padding: 4px;
    width: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 100%;
    }
  }
</style>

<div id="footer">
  <div class="logo-contact-wrapper">
    <div class="footer-logo">
      <img src="../assets/img/NEWNEWLOGO.png" alt="Mims Family Painting" />
    </div>
    <div class="company-contact">
      <p>Mims Family Painting</p>
      <p>
        <a href="tel:+16312815815">631-281-5815</a>
        |
        <a href="mailto:mims@mimspainting.com">mims@mimspainting.com</a>
      </p>
    </div>
  </div>
  <p>
    Copyright © 1868-{currentYear}
    Mims Family Painting All Rights Reserved.
  </p>
  <p>Website designed by Tim Clay.</p>
</div>
