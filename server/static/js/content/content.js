const contentGrid = searchForOne('div.content-grid')
const styleEl = createElement('style')
nestElements(document.head, [styleEl])

const dynamicStyles = styleEl.sheet
dynamicStyles.list = []
let formCount = 0
let activeForms
activeForms = 0
let multiSelectMode = false

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
      1: content,
      2: image
    } = e.currentTarget.parentElement.parentElement.children
    const { 0: header, 1: paragraph } = content.children
    const { 0: pairedImage } = image.children
    form = generateEditForm(header, paragraph, pairedImage, e)
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
    console.log(div)
    const controls = generateBtnGroup(div, 'content', 'renderContent')
    div.prepend(controls)
  } else {
    div.querySelector('div.btn-group').remove()
  }
}

// Fetch content data on page load and insert into DOM
// On refreshes and revisits, use the cached content for quicker load
// After CREATE, re-render the content and re-cache
const renderContent = async (preResponse = null) => {
  let content = null
  let nonLinkedHeader
  let foundNonLinked
  let linkedHeader
  if (searchTargets) {
    empty(searchForOne('.content-grid'), () => {
      searchTargets = null
    })
  }
  nestElements(searchForOne('.content-grid'), [createLoadingSpinner()])
  if (preResponse === null) {
    const response = await fetch('/content/admin/all').then((r) => r.json())
    content = response
  } else {
    content = preResponse
  }
  if (content[0].resource_id) {
    linkedHeader = await createDividers('Linked')
    linkedDivider = createElement('div', {
      style: `
      width: 75%;
      border-bottom: 2px solid black;
      margin: 0 auto;
      `
    })
    nonLinkedHeader = await createDividers('Non-Linked')
  }
  empty(contentGrid)
  if (linkedHeader) {
    nestElements(contentGrid, [linkedHeader])
  }
  content.forEach((c) => {
    const cFragment = fragmentElements([
      createElement(
        'h2',
        {
          'data-id': c.id,
          style: `
          margin: 0;
          `
        },
        c.header_text
      ),
      createElement(
        'p',
        {
          'data-id': c.paragraph_id,
          style: `
          margin: 1rem 0 2rem 0;
          `
        },
        c.paragraph_text
      )
    ])

    const renderedContent = nestElements(
      createElement('div', {
        id: `content${c.id}`,
        'data-image-pair': c.image_id,
        class: 'rendered-content'
      }),
      [cFragment]
    )

    const renderedImage = nestElements(
      createElement('div', {
        class: 'rendered-image'
      }),
      [
        createElement('img', {
          src: c.image_link,
          alt: c.image_name,
          'data-id': c.image_id,
          'data-content-ref': `content${c.id}`
        })
      ]
    )

    const pkgContent = fragmentElements([
      nestElements(
        createElement('div', {
          class: 'rendered-block r-content',
          onclick: 'selectThisContent(event)',
          'data-content-id': c.id
        }),
        [renderedContent, renderedImage]
      )
    ])
    if (!c.resource_id && !foundNonLinked) {
      nestElements(contentGrid, [nonLinkedHeader])
      foundNonLinked = true
    }
    nestElements(contentGrid, [pkgContent])
  })
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

// const toggleSwapForm = (e) => {
//   e.stopPropagation()
//   const swapForm = generateSwapForm()
//   const existingForms = searchForAll('.editors > .content-editor')
//   activeForms = existingForms.length
//   // const formId = `.content-editor.form-count"${formCount}"]`
//   // const prev = existingForms[existingForms.length - 1]
//   // let prevStyle = getComputedStyle(prev).transform
//   // prevStyle = prevStyle.match(/\d+(?=\)$)/)[0]
//   dynamicStyles.insertRule(
//     `.form-count${formCount} { transform: matrix(1, 0, 0, 1, -3.37, ${
//       activeForms * 35
//     }); transition: all 0.2s linear; }`,
//     formCount
//   )
//   dynamicStyles.list.push(formCount)
//   console.log('before', dynamicStyles)
//   swapForm.setAttribute('data-form-count', formCount)
//   transition('in', swapForm, `form-count${formCount}`, searchForOne('.editors'))
//   formCount += 1
//   showMenu()
//   return formCount
// }
