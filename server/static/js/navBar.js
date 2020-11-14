//= ===========================================================
// State variables
//= ===========================================================
let needsModal = false

//= ==========================================================
// Menu button & Modal
//= ==========================================================
// const adminControls = searchForOne('div.admin-controls')
// const navButton = searchForOne('#options-toggle')

// const notification = () => {
//   const closeNotif = (e) => {
//     e.currentTarget.parentElement.remove()
//   }

//   const button = createElement('button', { class: 'n-exit-btn' }, 'X')
//   button.addEventListener('click', closeNotif)

//   return nestElements(createElement('div', { class: 'notification' }), [
//     createElement('div', { class: 'n-status' }, '✅'),
//     createElement('p', { class: 'n-message' }, 'Tester comment'),
//     button
//   ])
// }

// nestElements(searchForOne('.admin-nav'), [notification()])

const logoutUser = async () => {
  const username = searchForOne('#session-username')
  const response = await fetch('/admin/logout', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded', 
      'Accept': 'application/json'
    },
    body: `username=${username}`
  })
  const json = await response.json()
  if (json.message === 'Logout successful') {
    window.location.replace('/admin/login')
  }
}

const modal = nestElements(createElement('div', { class: 'options-modal' }), [
  createElement('a', { href: '/admin', class: 'button modal-btn' }, 'Home'),
  createElement(
    'a',
    { href: '/admin/assets', class: 'button modal-btn' },
    'Images'
  ),
  createElement(
    'a',
    { href: '/admin/content', class: 'button modal-btn' },
    'Content'
  ),
  createElement(
    'a',
    { href: '/admin/blacklist', class: 'button modal-btn' },
    'Blacklist'
  ),
  createElement(
    'a',
    { href: '/admin/settings', class: 'button modal-btn' },
    'Settings'
  ),
  createElement(
    'a',
    {
      class: 'button modal-btn',
      onclick: 'logoutUser()'
    },
    'Logout'
  ) 
])

const showModal = () => {
  if (!needsModal) {
    searchForOne('#options-toggle').classList.add('active')
    nestElements(searchForOne('#options-toggle'), [modal])
    needsModal = true
  } else {
    searchForOne('#options-toggle').classList.remove('active')
    modal.remove()
    needsModal = false
  }
}

let searchTargets 
const search = (e) => {
  e.preventDefault()
  const searchContainer = searchForOne('#search-container')
  let {value} = e.target.elements[0]
  if (!value && searchTargets) {
    empty(searchContainer, () => {
       searchContainer.appendChild(fragmentElements(searchTargets))
    }) 
    return
  }
  if (!value) return
  searchTargets = searchTargets ? searchTargets : [... searchContainer.childNodes]
  const found = []
  const needImages = value.match('>images') && value.match('>images').length > 0
  const regex = needImages ? new RegExp(value.match(/(?<=\>images )\w.+/gi)[0], 'i') : new RegExp(value, "gi")
  searchTargets.forEach(s => {
    if (needImages) {
      const {alt, src} = s.querySelector('img')
      regex.test(alt) ? found.push(s) : (regex.test(src) ? found.push(s) : null)
    } else {
      s.textContent.match(regex) ? found.push(s) : null
    }
  })
  empty(searchContainer)
  searchContainer.appendChild(fragmentElements(found))
  return searchTargets
}

const displaySearchFilters = (e) => {
  const {value} = e.target
  const check = searchForOne('ul.filter-options')
  if (value !== '>' && check) {
    check.remove()
  }
  if (value !== '>') return

  const inputWrapper = e.target.closest('.input-wrapper')

  const handleSelection = (e) => {
    const input = e.currentTarget.parentElement.querySelector('input')
    input.value = e.target.innerText += ' '
    input.focus()
    input.click()
    e.currentTarget.remove()
  }

  const filtersDropdown = nestElements(
    createElement('ul',
    {
      class: 'filter-options'
    }
  ),
  [
    createElement('li', null, '>images')
  ])

  filtersDropdown.addEventListener('click', handleSelection)

  nestElements(inputWrapper, [filtersDropdown])
}