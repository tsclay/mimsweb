const createUser = async (e) => {
  e.preventDefault()
  const {
    0: firstName,
    1: lastName,
    2: email,
    3: role,
    4: submitBtn
  } = e.target
  empty(submitBtn, () => {
    const loading = createLoadingSpinner()
    loading.style.cssText = `width: 2rem; position: static; transform: translate(0,0);`
    submitBtn.disabled = true
    nestElements(submitBtn, [loading])
  })
  const request = {
    method: 'POST',
    body: JSON.stringify({
      first_name: firstName.value,
      last_name: lastName.value,
      email: email.value,
      role: role.value
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch('/admin/create-user', request).then((r) =>
    r.json()
  )

  empty(submitBtn, () => {
    submitBtn.disabled = false
    submitBtn.innerText = 'Create User'
  })
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  role.value = ''
  renderUsers(response)
}

const selectOption = (e) => {
  e.stopPropagation()
  const optionsContainer = e.currentTarget.parentElement
  const selectRoleWrapper = optionsContainer.parentElement
  const { 0: selectionTag } = selectRoleWrapper.children
  const selected = e.currentTarget.innerText
  searchForOne(
    'input[form="new-user-form"][name="role"]'
  ).value = selected.toLowerCase()
  selectionTag.innerText = selected
  empty(optionsContainer)
}

const showRoleOptions = (e) => {
  const { 1: optionsContainer } = e.currentTarget.children
  if (Object.keys(optionsContainer.children).length > 0) {
    empty(optionsContainer)
    return
  }
  const options = [
    nestElements(createElement('p', { onclick: 'selectOption(event)' }), [
      createElement('span', { class: 'option-text' }, 'Curator'),
      createElement('span', { class: 'underline' })
    ]),
    nestElements(createElement('p', { onclick: 'selectOption(event)' }), [
      createElement('span', { class: 'option-text' }, 'Writer'),
      createElement('span', { class: 'underline' })
    ]),
    nestElements(createElement('p', { onclick: 'selectOption(event)' }), [
      createElement('span', { class: 'option-text' }, 'Manager'),
      createElement('span', { class: 'underline' })
    ])
  ]
  if (userRole === 'admin') {
    options.push(
      nestElements(createElement('p', { onclick: 'selectOption(event)' }), [
        createElement('span', { class: 'option-text' }, 'Admin'),
        createElement('span', { class: 'underline' })
      ])
    )
  }
  nestElements(optionsContainer, options)
}

const renderUsers = async (fetchedUsers = null) => {
  let allUsers
  const target = searchForOne('div.user-list')
  if (!fetchedUsers) {
    const response = await fetch('/admin/users').then((r) => r.json())
    allUsers = response
  } else {
    allUsers = fetchedUsers
    empty(target)
  }
  allUsers.forEach((u) => {
    const existingUser = nestElements(
      createElement('div', {
        class: 'existing-user',
        style: `position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;`,
        'data-user-id': u.id
      }),
      [
        createElement(
          'p',
          null,
          `${u.username}\n${u.role}\n${
            u.last_logged_in
              ? `Last login: ${formatDateTimeString(u.last_logged_in)}`
              : "Hasn't logged in yet"
          }`
        )
      ]
    )
    if (userRole === 'admin')
      nestElements(existingUser, [
        createElement(
          'button',
          { value: u.id, type: 'button', onclick: 'confirmDelete(event)' },
          'X'
        )
      ])
    nestElements(target, [existingUser])
  })
}

let deleteUser
let confirmDelete

if (userRole === 'admin') {
  deleteUser = async (e) => {
    const userId = e.target.value
    const request = {
      body: JSON.stringify({ id: userId }),
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }
    const response = await fetch('/admin/users', request).then((r) => r.json())

    renderUsers(response)
  }

  confirmDelete = (e) => {
    const popUp = nestElements(
      createElement('div', {
        style: `position: fixed;
      background: var(--gray);
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
      width: 50%;
      height: 200px;
      padding: 2rem;
      box-sizing: border-box;
      display: flex;
      flex-flow: column nowrap;`
      }),
      [
        createElement(
          'p',
          {
            style: `text-align: center;
        margin-bottom: 2rem;`
          },
          'This operation will permanently delete this user.\n\nAre you sure about this?'
        ),
        createElement(
          'button',
          {
            onclick: 'deleteUser(event)',
            type: 'button',
            value: e.target.value
          },
          'Confirm'
        ),
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
    nestElements(e.target.parentElement, [popUp])
  }
}

renderUsers()
