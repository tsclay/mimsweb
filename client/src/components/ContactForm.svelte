<script>
  import { fly, fade } from "svelte/transition";
  let example;
  let errors = {};
  let selected = "Both";
  let showOptions = false;
  let messageData = {
    name: null,
    email: null,
    message: null,
    phone: null,
    preferredContact: "both",
  };

  const validateEmail = (e) => {
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!e.target.value && errors.hasOwnProperty("InvalidEmail")) {
      delete errors["InvalidEmail"];
      errors = errors;
      return;
    }
    if (!e.target.value) return;
    if (!emailRegEx.test(e.target.value)) {
      errors["InvalidEmail"] = "Please enter a valid email address.";
    } else if (errors.hasOwnProperty("InvalidEmail")) {
      delete errors["InvalidEmail"];
      errors = errors;
    }
  };

  const validatePhone = (e) => {
    const digitsWithDashes = /[0-9]{3}-[0-9]{3}-[0-9]{4}/;
    const digitsOnly = /[0-9]{10}/;
    if (!e.target.value && errors.hasOwnProperty("InvalidPhone")) {
      delete errors["InvalidPhone"];
      errors = errors;
      return;
    }
    if (!e.target.value) return;
    if (
      !digitsWithDashes.test(e.target.value) &&
      !digitsOnly.test(e.target.value)
    ) {
      errors["InvalidPhone"] = "Please enter a valid phone number.";
    } else if (errors.hasOwnProperty("InvalidPhone")) {
      delete errors["InvalidPhone"];
      errors = errors;
    }
  };

  const handleContactPref = (e) => {
    selected = e.target.innerText;
    messageData.preferredContact = selected.toLowerCase();
    showOptions = false;
  };

  const handleSubmit = async (e) => {
    const { name, email, message } = messageData;
    if (!name || !email || !message) {
      errors["EmptyFields"] = "Please fill all fields.";
      return;
    }
    messageData.preferredContact = selected;
    const response = await JSON.stringify(messageData);
    example = response;
  };
</script>

<style type="text/scss">
  form {
    width: 90%;
    margin: 0 auto;
    color: var(--darkAmber);

    input,
    textarea,
    button {
      width: 100%;
      border-radius: 4px;
    }
    textarea {
      resize: none;
    }

    div[name="pref-contact"] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1rem 0;
      .sel-options {
        position: relative;
        z-index: 4;
        display: flex;
        justify-content: space-between;
        cursor: pointer;
      }
      .sel-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 75px;
        height: 100%;
        padding: 4px;
        border-radius: 4px;
        background: var(--darkAmber);
        color: var(--white);
        button {
          border: none;
          padding: 0.25rem 0;
          margin: 0;
          width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
      .dropdown-menu {
        position: absolute;
        background: var(--white);
        color: var(--darkAmber);
        box-sizing: border-box;
        width: 80px;
        bottom: 0;
        transform: translateY(100%);
        left: 0;
        border-radius: 4px;
        div {
          padding: 4px;
          cursor: pointer;
        }
      }
    }
  }
  #form-wrapper {
    width: clamp(300px, 90%, 465px);
    padding: 1rem;
    background: var(--lightGray);
    border-radius: 4px;
    margin: 0 auto;
  }

  .error-wrapper {
    max-height: 32px;
    margin: 0.5rem 0;
    transition: max-height 150ms linear;
  }
  .error-wrapper:empty {
    max-height: 0;
    margin: 0;
  }

  .error-containers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(204, 88, 88, 0.623);
    padding: 4px;
    border-radius: 4px;
    button {
      width: auto;
      height: auto;
      margin: 0;
      padding: 1px 4px 1px 4px;
    }
  }

  // For the selection toggle
  .rest {
    transition: all 0.2s linear;
    transform-origin: center;
  }

  .active {
    transition: transform 0.2s linear;
    transform-origin: center;
    transform: rotate(90deg);
  }
</style>

<svelte:body
  on:click={(e) => {
    if (e.target.classList[0] === 'sel-text') {
      console.log(e.target.classList);
      return;
    } else {
      showOptions = false;
    }
  }} />

<div class="component" id="contact">
  <h1>Contact us</h1>
  <p>
    Estimates are provided quickly and at no cost. Painting one door, painting
    an entire house; you name it, we'll quote it.
  </p>
  <div id="form-wrapper">
    <form on:submit|preventDefault={handleSubmit}>
      <label for="clientName">Name</label>
      <input
        bind:value={messageData.name}
        name="clientName"
        type="text"
        placeholder="Name" />
      <label for="email">Email Address</label>
      <input
        bind:value={messageData.email}
        on:change={validateEmail}
        name="email"
        type="text"
        placeholder="Email" />
      <div class="error-wrapper">
        {#if errors.hasOwnProperty('InvalidEmail')}
          <div
            in:fade={{ duration: 100 }}
            out:fly={{ x: -60, duration: 500 }}
            class="error-containers">
            <span>{errors['InvalidEmail']}</span>
            <button
              type="button"
              on:click={() => {
                delete errors['InvalidEmail'];
                errors = errors;
              }}>X</button>
          </div>
        {/if}
      </div>
      <label for="phone">Phone Number</label>
      <input
        bind:value={messageData.phone}
        on:change={validatePhone}
        type="tel"
        placeholder="123-456-7890" />
      <div class="error-wrapper">
        {#if errors.hasOwnProperty('InvalidPhone')}
          <div
            in:fade={{ duration: 100 }}
            out:fly={{ x: -60, duration: 500 }}
            class="error-containers">
            <span>{errors['InvalidPhone']}</span>
            <button
              type="button"
              on:click={() => {
                delete errors['InvalidPhone'];
                errors = errors;
              }}>X</button>
          </div>
        {/if}
      </div>
      <label for="message">Message</label>
      <textarea
        bind:value={messageData.message}
        name="message"
        id="message-field"
        cols="30"
        rows="10" />
      <div name="pref-contact">
        <span>Preferred Contact Method</span>
        <div class="sel-options">
          <div
            class="sel-text"
            on:click={(e) => {
              showOptions = !showOptions;
            }}>
            <button
              type="button"
              on:click|stopPropagation={(e) => {
                showOptions = !showOptions;
              }}
              class="svg-wrapper">
              <svg
                xmlns:dc="http://purl.org/dc/elements/1.1/"
                xmlns:cc="http://creativecommons.org/ns#"
                xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
                xmlns:svg="http://www.w3.org/2000/svg"
                xmlns="http://www.w3.org/2000/svg"
                width="100"
                height="15"
                viewBox="0 0 158.75 158.75"
                version="1.1"
                class="dropArrow">
                <g class="drop-group">
                  <path
                    d="M 155.46289,78.494058 42.636336,144.00382 42.636333,13.648303 Z"
                    style="fill:white;stroke:#000000;stroke-width:0.634805;stroke-opacity:1"
                    class={showOptions ? 'active' : 'rest'} />
                </g>
              </svg>
            </button>
            {selected}
          </div>
          {#if showOptions}
            <div class="dropdown-menu">
              <div value="email" on:click={handleContactPref}>Email</div>
              <div value="phone" on:click={handleContactPref}>Phone</div>
              <div value="both" on:click={handleContactPref}>Both</div>
            </div>
          {/if}
        </div>
      </div>
      <div class="error-wrapper">
        {#if errors.hasOwnProperty('EmptyFields')}
          <div
            in:fade={{ duration: 150 }}
            out:fly={{ x: -60, duration: 500 }}
            class="error-containers">
            <span>{errors['EmptyFields']}</span>
            <button
              type="button"
              on:click={() => {
                delete errors['EmptyFields'];
                errors = errors;
              }}>X</button>
          </div>
        {/if}
      </div>
      <button type="submit">Send</button>
    </form>
  </div>
  {#if example}
    <p>{example}</p>
  {/if}
</div>
