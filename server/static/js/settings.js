const changeSettings = async (e) => {
  e.preventDefault()
  const [
    shownFirstName,
    shownLastName,
    shownUsername,
    shownRole
  ] = searchForAll('[data-id="db_values"]')
  const {
    0: firstName,
    1: lastName,
    2: username,
    3: role,
    4: password
  } = e.target
  const response = await fetch('/admin/settings', {
    body: JSON.stringify({
      first_name: firstName.value,
      last_name: lastName.value,
      username: username.value,
      password: password.value,
      role: role.value
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
  const updatedUser = await response.json()
  shownFirstName.innerText = updatedUser.first_name
  shownLastName.innerText = updatedUser.last_name
  shownRole.innerText = updatedUser.role
  shownUsername.innerText = updatedUser.username
  firstName.value = ''
  lastName.value = ''
  username.value = ''
  password.value = ''
  // role.value = ''
  searchForOne('#session-username').innerText = updatedUser.username
}
