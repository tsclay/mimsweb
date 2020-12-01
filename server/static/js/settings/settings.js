const changeSettings = async (e) => {
  e.preventDefault()
  const [shownFirstName, shownLastName, shownUsername] = searchForAll(
    '[data-id="db_values"]'
  )
  const { 0: firstName, 1: lastName, 2: username, 4: password } = e.target
  const response = await fetch('/admin/settings', {
    body: JSON.stringify({
      first_name: firstName.value,
      last_name: lastName.value,
      username: username.value,
      password: password.value
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
  const updatedUser = await response.json()
  shownFirstName.innerText = updatedUser.first_name
  shownLastName.innerText = updatedUser.last_name
  shownUsername.innerText = updatedUser.username
  firstName.value = ''
  lastName.value = ''
  username.value = ''
  password.value = ''
  searchForOne('#session-username').innerText = updatedUser.username
}
