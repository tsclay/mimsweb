const createUser = async (e) => {
  e.preventDefault()
  const { 0: firstName, 1: lastName, 2: email, 3: role } = e.target
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
  const response = await fetch('/admin/create-user', request)
  const json = await response.json()
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  role.value = ''
  renderUsers(json)
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
    ]),
    nestElements(createElement('p', { onclick: 'selectOption(event)' }), [
      createElement('span', { class: 'option-text' }, 'Admin'),
      createElement('span', { class: 'underline' })
    ])
  ]
  nestElements(optionsContainer, options)
}

const renderUsers = async (fetchedUsers = null) => {
  let allUsers
  const target = searchForOne('div.user-list')
  if (!fetchedUsers) {
    const response = await fetch('/admin/users')
    allUsers = await response.json()
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
              ? formatDateTimeString(u.last_logged_in)
              : "Hasn't logged in yet"
          }`
        ),
        createElement(
          'button',
          { value: u.id, type: 'button', onclick: 'confirmDelete(event)' },
          'X'
        )
      ]
    )
    nestElements(target, [existingUser])
  })
}

const deleteUser = async (e) => {
  const userId = e.target.value
  const response = await fetch('/admin/users', {
    body: JSON.stringify({ id: userId }),
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  })
  const json = await response.json()
  renderUsers(json)
}

const confirmDelete = (e) => {
  const popUp = nestElements(
    createElement('div', { style: 'position: absolute' }),
    [
      createElement(
        'p',
        null,
        'This operation will permanently delete this user.\n\nAre you sure about this?'
      ),
      createElement(
        'button',
        { onclick: 'deleteUser(event)', type: 'button', value: e.target.value },
        'Confirm'
      ),
      createElement(
        'button',
        {
          type: 'button',
          style: 'position: absolute; top: 4px; right: 4px;',
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

renderUsers()
