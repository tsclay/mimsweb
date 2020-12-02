const changeSettings = async (e) => {
  e.preventDefault()
  const [shownFirstName, shownLastName, shownUsername] = searchForAll(
    '[data-id="db_values"]'
  )
  const { 0: firstName, 1: lastName, 2: password, 3: submitBtn } = e.target
  empty(submitBtn, () => {
    const loading = loadingSpinner.cloneNode(true)
    loading.style.cssText = `width: 2rem; position: static; transform: translate(0,0);`
    submitBtn.disabled = true
    nestElements(submitBtn, [loading])
  })
  const response = await fetch('/admin/settings', {
    body: JSON.stringify({
      first_name: firstName.value,
      last_name: lastName.value,
      password: password.value
    }),
    headers: {
      'Content-Type': 'application/json'
    },
    method: 'POST'
  })
  const updatedUser = await response.json()
  empty(submitBtn, () => {
    submitBtn.disabled = false
    submitBtn.innerText = 'Confirm'
  })
  shownFirstName.innerText = updatedUser.first_name
  shownLastName.innerText = updatedUser.last_name
  shownUsername.innerText = updatedUser.username
  firstName.value = ''
  lastName.value = ''
  username.value = ''
  password.value = ''
  searchForOne('#session-username').innerText = updatedUser.username
}
