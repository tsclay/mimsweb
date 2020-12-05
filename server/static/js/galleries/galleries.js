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

// Toggle new content creator
const showContentEditor = (e) => {
  e.stopPropagation()
  const createForm = generateCreateForm()
  const existingForms = searchForAll('.editors > .content-editor')
  activeForms = existingForms.length
  // const formId = `.content-editor.form-count"${formCount}"]`
  // const prev = existingForms[existingForms.length - 1]
  // let prevStyle = getComputedStyle(prev).transform
  // prevStyle = prevStyle.match(/\d+(?=\)$)/)[0]
  dynamicStyles.insertRule(
    `.form-count${formCount} { transform: matrix(1, 0, 0, 1, -3.37, ${
      activeForms * 35
    }); transition: all 0.2s linear; }`,
    formCount
  )
  dynamicStyles.list.push(formCount)
  console.log('before', dynamicStyles)
  createForm.setAttribute('data-form-count', formCount)
  transition(
    'in',
    createForm,
    `form-count${formCount}`,
    searchForOne('.editors')
  )
  formCount += 1
  if (e.currentTarget === searchForOne('button.create-button')) {
    showMenu()
  }
  return formCount
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
      d.querySelector('div.rendered-gallery.btn-group').remove()
    }
  })
  div.classList.toggle('selected')
  if (div.classList[div.classList.length - 1] === 'selected') {
    const controls = fragmentElements([
      nestElements(
        createElement('div', { class: 'rendered-gallery btn-group' }),
        [
          createElement(
            'button',
            {
              type: 'button',
              value: div.dataset.galleryId,
              onclick: 'editGallery(event)'
            },
            'Edit'
          ),
          nestElements(
            createElement('button', {
              type: 'button',
              class: 'delete-button',
              value: div.dataset.galleryId,
              onclick: 'deleteGallery(event)'
            }),
            [
              nestElements(
                createSVG(
                  'svg',
                  { class: 'trash-can' },
                  [105.83, 119.06],
                  ['100%', '100%']
                ),
                [
                  createSVG('path', {
                    d:
                      'm22.951 30.289h61.61c0.5235 0 0.99476 0.42382 0.94494 0.94494l-7.4083 77.485c-0.04982 0.52112-5.3265 0.94494-5.85 0.94494h-38.437c-0.5235 0-5.9444-0.42291-5.9836-0.94494l-5.8208-77.485c-0.03922-0.52203 0.42144-0.94494 0.94494-0.94494z',
                    style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                  }),
                  createSVG('rect', {
                    x: 51.815,
                    y: 49.944,
                    width: 2.0045,
                    height: 44.099,
                    ry: 1.0023,
                    style:
                      'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999'
                  }),
                  createSVG('rect', {
                    x: 60.142,
                    y: 48.893,
                    width: 2.0045,
                    height: 44.099,
                    ry: 1.0023,
                    style:
                      'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                    transform: 'rotate(1)'
                  }),
                  createSVG('rect', {
                    x: 68.447,
                    y: 47.579,
                    width: 2.0045,
                    height: 44.099,
                    ry: 1.0023,
                    style:
                      'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                    transform: 'rotate(2)'
                  }),
                  createSVG('rect', {
                    x: 76.722,
                    y: 46.004,
                    width: 2.0045,
                    height: 44.099,
                    ry: 1.0023,
                    style:
                      'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                    transform: 'rotate(3)'
                  }),
                  createSVG('rect', {
                    x: 43.472,
                    y: 50.733,
                    width: 2.0045,
                    height: 44.099,
                    ry: 1.0023,
                    style:
                      'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                    transform: 'rotate(-1)'
                  }),
                  createSVG('rect', {
                    x: 35.12,
                    y: 51.26,
                    width: 2.0045,
                    height: 44.099,
                    ry: 1.0023,
                    style:
                      'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                    transform: 'rotate(-2)'
                  }),
                  createSVG('rect', {
                    x: 26.764,
                    y: 51.523,
                    width: 2.0045,
                    height: 44.099,
                    ry: 1.0023,
                    style:
                      'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                    transform: 'rotate(-3)'
                  }),
                  nestElements(
                    createSVG('g', {
                      class: 'trash-can-lid',
                      transform: 'translate(-.060786 6.35)'
                    }),
                    [
                      createSVG('path', {
                        d: 'm33.872 12.653v-9.472h38.437v9.472',
                        style: 'fill:none;stroke-width:.26458px;stroke:#999'
                      }),
                      createSVG('path', {
                        d: 'm40.128 12.248v-6.0598h25.862v6.0598',
                        style: 'fill:none;stroke-width:.27166;stroke:#999'
                      }),
                      createSVG('path', {
                        d:
                          'm34.015 8.0121v-4.6771h38.166v9.3543h-6.5619v-6.1471h-25.042v6.1471h-6.5619z',
                        style:
                          'fill-rule:evenodd;fill:#999;stroke-width:.13398;stroke:#999'
                      }),
                      createSVG('rect', {
                        x: 10.093,
                        y: 22.817,
                        width: 85.86,
                        height: 2.0713,
                        style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                      }),
                      createSVG('rect', {
                        x: 9.9796,
                        y: 12.233,
                        width: 85.86,
                        height: 2.0713,
                        style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                      }),
                      createSVG('rect', {
                        x: 95.806,
                        y: 12.233,
                        width: 2.0714,
                        height: 12.655,
                        style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                      }),
                      createSVG('rect', {
                        x: 8.077,
                        y: 12.233,
                        width: 2.0714,
                        height: 12.655,
                        style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                      }),
                      createSVG('path', {
                        d: 'm10.168 18.561v-4.2256h85.665v8.4513h-85.665z',
                        style:
                          'fill-rule:evenodd;fill:#fff;stroke-width:.034606;stroke:#fff'
                      })
                    ]
                  )
                ]
              )
            ]
          )
        ]
      )
    ])
    div.prepend(controls)
  } else {
    div.querySelector('div.rendered-gallery.btn-group').remove()
  }
}

// Fetch content data on page load and insert into DOM
// On refreshes and revisits, use the cached content for quicker load
// After CREATE, re-render the content and re-cache
const renderGalleries = async (fetchedGalleries = null) => {
  let galleries
  let linkedDivider
  let nonLinkedHeader
  let foundNonLinked
  let linkedHeader
  empty(galleryGrid)
  const loader = loadingSpinner.cloneNode(true)
  nestElements(galleryGrid, [loader])
  if (fetchedGalleries && fetchedGalleries.length > 0) {
    galleries = fetchedGalleries
  } else {
    const response = await fetch('/galleries').then((r) => r.json())
    galleries = response
  }
  if (galleries[0].resource_id) {
    linkedHeader = createElement('h1', null, 'Linked')
    linkedDivider = createElement('div', {
      style: `
      width: 75%;
      border-bottom: 2px solid black;
      margin: 0 auto;
      `
    })
    nonLinkedHeader = createElement('h1', null, 'Non-Linked')
  }
  loader.remove()
  if (galleries.length > 0) {
    if (linkedHeader) {
      nestElements(galleryGrid, [linkedHeader])
    }
    galleries.forEach((c) => {
      const galleryRow = createElement('div', { class: 'gallery-row' })
      const galleryFragment = fragmentElements([
        createElement('h2', null, c.gallery_name),
        createElement('p', null, c.description),
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
          class: 'rendered-gallery',
          'data-gallery-id': c.id
        }),
        [galleryFragment]
      )
      renderedGallery.addEventListener('click', selectThisContent)
      if (!c.resource_id && !foundNonLinked) {
        nestElements(galleryGrid, [linkedDivider, nonLinkedHeader])
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

// UPDATE existing content, update data in DOM upon success from server
const editGallery = (e) => {
  const {
    1: galleryName,
    2: galleryDetails,
    3: galleryRow
  } = e.currentTarget.parentElement.parentElement.children
  const editForm = generateEditForm(galleryName, galleryDetails, galleryRow, e)

  const existingForms = searchForAll('.editors > .content-editor')
  activeForms = existingForms.length
  dynamicStyles.insertRule(
    `.form-count${formCount} { transform: matrix(1, 0, 0, 1, -3.37, ${
      activeForms * 35
    }) }`,
    formCount
  )
  dynamicStyles.list.push(formCount)
  console.log('before', dynamicStyles)
  editForm.setAttribute('data-form-count', formCount)
  transition('in', editForm, `form-count${formCount}`, searchForOne('.editors'))
  formCount += 1

  return formCount
}

const deleteGallery = async (e) => {
  const request = {
    method: 'DELETE',
    body: JSON.stringify({
      gallery_id: parseInt(e.currentTarget.value),
      delete_gallery: true
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch('/galleries/admin/delete', request).then((r) =>
    r.json()
  )

  renderGalleries(response)
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
  // console.log('add to selectQueue set', selectQueue)
}

const selectAllMode = () => {
  if (!multiSelectMode) {
    const allContentRows = searchForAll('.rendered-gallery')
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
