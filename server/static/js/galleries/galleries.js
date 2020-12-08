const galleryGrid = searchForOne('div.gallery-grid')
let multiSelectMode = false
const styleEl = createElement('style')
nestElements(document.head, [styleEl])

const dynamicStyles = styleEl.sheet
dynamicStyles.list = []
let formCount = 0
let activeForms = 0

const showMenu = (e) => {
  searchForOne('.content-toolbar').classList.toggle('hide')
}

// Add dynamic style to create sheet and append form to div.editors
const appendNewForm = (formToAppend) => {
  const existingForms = searchForAll('.editors > .content-editor')
  activeForms = existingForms.length
  dynamicStyles.insertRule(
    `form.form-count${formCount} { transform: matrix(1, 0, 0, 1, -3.37, ${
      activeForms * 35
    }) }`,
    formCount
  )
  dynamicStyles.list.push(formCount)
  console.log('before', dynamicStyles)
  formToAppend.setAttribute('data-form-count', formCount)
  transition(
    'in',
    formToAppend,
    `form-count${formCount}`,
    searchForOne('.editors')
  )
  formCount += 1
  return formCount
}

// Toggle content creator, forms to create or edit content depend on the flag
const showContentEditor = (e, flag) => {
  e.stopPropagation()
  let form
  if (flag === 'create') {
    form = generateCreateForm()
    showMenu()
  } else if (flag === 'edit') {
    const {
      1: galleryName,
      2: galleryDetails,
      3: galleryRow
    } = e.currentTarget.parentElement.parentElement.children
    form = generateEditForm(galleryName, galleryDetails, galleryRow, e)
  }
  appendNewForm(form)
}

// /\d+(?=\)$)/

const selectThisContent = (e) => {
  if (multiSelectMode) return
  if (getSelection().toString().length > 0) return
  e.stopPropagation()
  const div = e.currentTarget
  const parentDiv = div.parentElement
  parentDiv.querySelectorAll('.selected').forEach((d) => {
    if (d !== div) {
      d.classList.toggle('selected')
      d.querySelector('div.btn-group').remove()
    }
  })
  div.classList.toggle('selected')
  if (div.classList[div.classList.length - 1] === 'selected') {
    const controls = generateBtnGroup(div, 'gallery', 'renderGalleries')
    div.prepend(controls)
  } else {
    div.querySelector('div.btn-group').remove()
  }
}

// Fetch content data on page load and insert into DOM
// On refreshes and revisits, use the cached content for quicker load
// After CREATE, re-render the content and re-cache
const renderGalleries = async (fetchedGalleries = null) => {
  let galleries
  let nonLinkedHeader
  let foundNonLinked
  let linkedHeader
  if (searchTargets) {
    empty(galleryGrid, () => {
      searchTargets = null
    })
  }
  const loader = createLoadingSpinner()
  empty(galleryGrid, () => {
    nestElements(galleryGrid, [loader])
  })
  if (fetchedGalleries && fetchedGalleries.length > 0) {
    galleries = fetchedGalleries
  } else {
    const response = await fetch('/galleries').then((r) => r.json())
    galleries = response
  }
  if (galleries[0].resource_id) {
    linkedHeader = await createDividers('Linked')
    nonLinkedHeader = await createDividers('Non-Linked')
  }
  loader.remove()
  if (galleries.length > 0) {
    if (linkedHeader) {
      nestElements(galleryGrid, [linkedHeader])
    }
    galleries.forEach((c) => {
      const galleryRow = createElement('div', { class: 'gallery-row' })
      const galleryFragment = fragmentElements([
        createElement(
          'h2',
          {
            style: `
          margin: 0;
          `
          },
          c.gallery_name
        ),
        createElement(
          'p',
          {
            style: `
          margin: 1rem 0 2rem 0;
          `
          },
          c.description
        ),
        galleryRow
      ])
      c.images.forEach((i) => {
        const galleryImg = createElement('img', {
          'data-image-id': i.id,
          class: 'gallery-img',
          alt: i.alt,
          src: i.src
        })
        nestElements(galleryRow, [galleryImg])
      })
      const renderedGallery = nestElements(
        createElement('div', {
          class: 'rendered-block r-gallery',
          'data-gallery-id': c.id
        }),
        [galleryFragment]
      )
      renderedGallery.addEventListener('click', selectThisContent)
      if (!c.resource_id && !foundNonLinked) {
        nestElements(galleryGrid, [nonLinkedHeader])
        foundNonLinked = true
      }
      nestElements(galleryGrid, [renderedGallery])
    })
  } else {
    const noGalleries = nestElements(
      createElement('div', { class: 'message' }),
      [
        createElement('p', { class: 'message-text' }, 'No galleries!'),
        createElement(
          'a',
          { class: 'message-link', onclick: 'showContentEditor(event)' },
          'Get started by creating a gallery!'
        )
      ]
    )
    nestElements(galleryGrid, [noGalleries])
  }
}

const selectQueue = new Set()

const addToSelectQueue = (e) => {
  e.stopPropagation()
  const { contentId } = e.currentTarget.dataset
  const item = searchForOne(`div[data-content-id="${contentId}"]`)
  const checkBox = e.currentTarget.children[0]
  if (selectQueue.has(item)) {
    selectQueue.delete(item)
    checkBox.style.backgroundColor = ''
  } else {
    selectQueue.add(item)
    checkBox.style.backgroundColor = '#98ffb1'
  }
}

const selectAllMode = () => {
  if (!multiSelectMode) {
    const allContentRows = searchForAll('.rendered-block')
    allContentRows.forEach((r) => {
      const selectBox = nestElements(
        createElement('div', {
          class: 'select-wrapper',
          'data-content-id': r.dataset.contentId,
          onclick: 'addToSelectQueue(event)'
        }),
        [
          createElement('div', {
            class: 'select-box'
          })
        ]
      )
      r.prepend(selectBox)
    })
    multiSelectMode = true
    showMenu()
    return multiSelectMode
  }
  const selectBoxes = searchForAll('.select-wrapper')
  selectBoxes.forEach((s) => {
    s.remove()
  })
  multiSelectMode = false
  showMenu()
  return multiSelectMode
}

renderGalleries()
