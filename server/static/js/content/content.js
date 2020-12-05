const contentGrid = searchForOne('div.content-grid')
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
  showMenu()
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
      d.querySelector('div.rendered-block.btn-group').remove()
    }
  })
  div.classList.toggle('selected')
  if (div.classList[div.classList.length - 1] === 'selected') {
    const controls = fragmentElements([
      nestElements(
        createElement('div', { class: 'rendered-block btn-group' }),
        [
          createElement(
            'button',
            {
              type: 'button',
              value: `content${div.dataset.contentId}`,
              onclick: 'editContent(event)'
            },
            'Edit'
          ),
          nestElements(
            createElement('button', {
              type: 'button',
              class: 'delete-button',
              value: div.dataset.contentId,
              onclick: 'deleteContent(event)'
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
    div.querySelector('div.rendered-block.btn-group').remove()
  }
}

// Fetch content data on page load and insert into DOM
// On refreshes and revisits, use the cached content for quicker load
// After CREATE, re-render the content and re-cache
const renderContent = async (preResponse = null) => {
  let content = null
  let linkedDivider
  let nonLinkedHeader
  let foundNonLinked
  let linkedHeader
  nestElements(searchForOne('.content-grid'), [loadingSpinner])
  if (preResponse === null) {
    const response = await fetch('/content/admin/all').then((r) => r.json())
    content = response
  } else {
    content = preResponse
  }
  if (content[0].resource_id) {
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
  empty(contentGrid)
  if (linkedHeader) {
    nestElements(contentGrid, [linkedHeader])
  }
  content.forEach((c) => {
    const cFragment = fragmentElements([
      createElement(
        'h2',
        {
          'data-id': c.id
        },
        c.header_text
      ),
      createElement(
        'p',
        {
          'data-id': c.paragraph_id
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
          class: 'rendered-block',
          onclick: 'selectThisContent(event)',
          'data-content-id': c.id
        }),
        [renderedContent, renderedImage]
      )
    ])
    if (!c.resource_id && !foundNonLinked) {
      nestElements(contentGrid, [linkedDivider, nonLinkedHeader])
      foundNonLinked = true
    }
    nestElements(contentGrid, [pkgContent])
  })
}

// UPDATE existing content, update data in DOM upon success from server
const editContent = (e) => {
  const {
    1: content,
    2: image
  } = e.currentTarget.parentElement.parentElement.children
  const { 0: header, 1: paragraph } = content.children
  const { 0: pairedImage } = image.children
  const editForm = generateEditForm(header, paragraph, pairedImage, e)

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

const deleteContent = async (e) => {
  const request = {
    method: 'DELETE',
    body: JSON.stringify({
      header_id: parseInt(e.currentTarget.value),
      delete_content: true
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch('/content/admin/delete', request).then((r) =>
    r.json()
  )

  renderContent(response)
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
