;(() => {
  let messageTimer

  const handleMessageRemoval = () => {
    messageTimer = setTimeout(() => {
      const allMessages = searchForAll('.messages > *')
      allMessages.forEach((m) => {
        m.addEventListener('transitionend', (e) => {
          m.remove()
        })
        m.classList.toggle('fade-out')
      })
    }, 3000)
  }

  const showClientMessage = (message) => {
    const div = searchForOne('div.messages')
    div.innerHTML = ''
    if (messageTimer) clearTimeout(messageTimer)
    nestElements(div, [
      createElement(
        'p',
        {
          class: `${'error' in message ? 'error-msg' : 'success-msg'}`
        },
        `${'error' in message ? message.error : message.message}`
      )
    ])
    return handleMessageRemoval()
  }

  const attemptLogin = async (e) => {
    e.preventDefault()
    const payload = {
      username: e.target[1].value,
      password: e.target[2].value
    }
    const response = await fetch('/admin/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': e.target[0].value
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    })
    if (response.status === 200) {
      return window.location.replace('/admin')
    }
    const message = await response.json()
    return showClientMessage(message)
  }

  searchForOne('form').addEventListener('submit', attemptLogin)
})()
