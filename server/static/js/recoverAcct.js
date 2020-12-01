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
  const response = await fetch('/admin/users/recovery', request)
  const json = await response.json()
  console.log(json)
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
        placeholder: 'Username'
      }),
      createElement('input', {
        type: 'text',
        name: 'first_name',
        placeholder: 'First Name'
      }),
      createElement('input', {
        type: 'text',
        name: 'last_name',
        placeholder: 'Last Name'
      }),
      createElement('input', {
        type: 'text',
        name: 'email',
        placeholder: 'Email Address'
      }),
      createElement(
        'button',
        {
          type: 'submit'
        },
        'Confirm'
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
      width: 50%;
      padding: 2rem;
      box-sizing: border-box;
      background: var(--gray)`
    }),
    [
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
