const sendRecoveryEmail = async (e) => {
  e.preventDefault()
  const { 0: username, 1: firstName, 2: lastName, 3: email } = e.target
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: username.value,
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value
    })
  }
  const response = await fetch('/admin/users/recovery', request).then((r) => r.json())
  
  console.log(response)
}

const toggleRecoveryForm = (e) => {
  const main = searchForOne('div.login-page')
  const recoveryForm = nestElements(
    createElement('form', {
      style: `
      display: block;
      width: 100%;
      height: auto;`,
      onsubmit: 'sendRecoveryEmail(event)'
    }),
    [
      createElement('input', {
        type: 'text',
        name: 'username',
        placeholder: 'Username',
        style: `
        width: 100%;
        box-sizing: border-box;`
      }),
      createElement('input', {
        type: 'text',
        name: 'first_name',
        placeholder: 'First Name',
        style: `
        width: 100%;
        box-sizing: border-box;`
      }),
      createElement('input', {
        type: 'text',
        name: 'last_name',
        placeholder: 'Last Name',
        style: `
        width: 100%;
        box-sizing: border-box;`
      }),
      createElement('input', {
        type: 'text',
        name: 'email',
        placeholder: 'Email Address',
        style: `
        width: 100%;
        box-sizing: border-box;`
      }),
      createElement(
        'button',
        {
          type: 'submit',
          style: `
          margin-top: 2rem;
          width: 100%;`
        },
        'Confirm'
      )
    ]
  )
  const explanation = nestElements(
    createElement('div', {
      style: `
      width: 100%;`
    }),
    [
      createElement('h4', null, 'Account Recovery'),
      createElement(
        'p',
        null,
        `Fill all of the following fields with your information. You'll receive an email with a reset link.
      `
      )
    ]
  )
  const menu = nestElements(
    createElement('div', {
      style: `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: clamp(320px, 75%, 400px);
      height: 75%;
      padding: 2rem;
      box-sizing: border-box;
      background: var(--gray)`
    }),
    [
      explanation,
      recoveryForm,
      createElement(
        'button',
        {
          type: 'button',
          style: `position: absolute;
        top: 4px;
        right: 4px;
        height: 20px;
        width: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        padding: 0;`,
          onclick: `((e) => {
          e.target.parentElement.remove()
        })(event)`
        },
        'X'
      )
    ]
  )

  nestElements(main, [menu])
}
