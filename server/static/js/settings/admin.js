const createUser = (e) => {
  e.preventDefault()
  console.log(e.target)
}

const showRoleOptions = (e) => {
  const { 1: optionsContainer } = e.currentTarget.children
  if (Object.keys(optionsContainer.children).length > 0) {
    empty(optionsContainer)
    return
  }
  const options = [
    createElement('p', null, 'Curator'),
    createElement('p', null, 'Writer'),
    createElement('p', null, 'Manager'),
    createElement('p', null, 'Admin')
  ]
  nestElements(optionsContainer, options)
}
