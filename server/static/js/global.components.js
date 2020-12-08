const userRole = searchForOne('meta[name="role"]').content

const createLoadingSpinner = () => {
  const loadingWrapper = createElement('div', { class: 'loading-wrapper' })
  const loadingSVG = nestElements(
    createSVG(
      'svg',
      {
        class: 'loader-icon'
      },
      [132.29166, 132.29167],
      [500, 500]
    ),
    [
      nestElements(createSVG('g'), [
        createSVG('path', {
          class: 'loader-path',
          d:
            'm 66.573613,126.66219 9.9e-4,-8e-5 c 33.183731,-6e-5 60.084447,-27.034831 60.084487,-60.38394 l 7e-5,-0.0029',
          style: `fill: none;
            fill-rule: evenodd;
            stroke: #00ffff;
            stroke-width: 10.7299;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;`
        })
      ])
    ]
  )
  return nestElements(loadingWrapper, [loadingSVG])
}

const formatDateTimeString = (isoStr) => {
  const date = new Date((isoStr += 'Z'))
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
}

const createDividers = (innerText) => {
  return nestElements(
    createElement('div', {
      style: `
      display: flex;
      align-items: center;
      justify-content: space-between;
      `
    }),
    [
      createElement(
        'h1',
        {
          style: `
        margin: 0;
        padding: 0.25rem 1rem;
        width: 49%;
        background: var(--light);
        box-sizing: border-box;
        border-radius: 8px;
        `
        },
        innerText
      ),
      createElement('div', {
        style: `
        width: 49%;
        border-bottom: 2px solid black;
        margin: 0 auto;
        `
      })
    ]
  )
}

// Have editor forms exit gracefully on any page
const handleExit = (e) => {
  const hasTaskBar = searchForOne('.tasks')
  const tasksRect = hasTaskBar ? hasTaskBar.getBoundingClientRect() : null
  const thisForm = e.currentTarget.parentElement.parentElement
  const thisFormCount = Number(thisForm.dataset.formCount)
  const targetIndex = dynamicStyles.list.indexOf(thisFormCount)
  if (new Set(thisForm.classList).has('minimized')) {
    dynamicStyles.deleteRule(targetIndex)
    dynamicStyles.list.splice(targetIndex, 1)
    let next = thisForm.nextElementSibling ? thisForm.nextElementSibling : null
    let prev = thisForm
    let prevRect = prev.getBoundingClientRect()
    thisForm.remove()
    transitionObservers.delete(thisForm)
    while (next) {
      const shiftVal = prevRect.left + prevRect.width
      const oldVal = next.getBoundingClientRect().width
      next.style.transform = `translate(${
        shiftVal - oldVal - tasksRect.left
      }px)`
      prev = next
      prevRect = prev.getBoundingClientRect()
      next = next.nextElementSibling
    }
    if (searchForAll('.content-editor').length === 0) {
      formCount = 0
    } else {
      formCount -= 1
    }
    return formCount
  }
  if (thisForm.style.transform) {
    thisForm.style.transform = ''
  }
  transition(
    'out',
    thisForm,
    `form-count${thisFormCount}`,
    searchForOne('.editors')
  )
  dynamicStyles.deleteRule(targetIndex)
  dynamicStyles.list.splice(targetIndex, 1)
  if (thisForm.nextSibling) {
    let next = thisForm.nextSibling
    while (next) {
      const oldVal = getComputedStyle(next).transform
      const change = oldVal.match(/\d+(?=\)$)/)[0]
      const newVal = oldVal.replace(/\d+(?=\)$)/, change - 35)
      next.style.transform = newVal
      next = next.nextSibling
    }
  }
  if (searchForAll('.content-editor').length === 0) {
    formCount = 0
  } else {
    formCount -= 1
  }
  return formCount
}

// Minimize editor forms on content and galleries pages
const handleMinimize = (e) => {
  const thisForm = e.currentTarget.parentElement.parentElement
  const thisBtnGroup = e.currentTarget.parentElement
  const classes = new Set(thisForm.classList)
  if (!classes.has('minimized')) {
    e.currentTarget.innerText = '⬆'
    thisForm.style.overflow = 'hidden'
    console.log(thisBtnGroup.style.gridTemplateColumns)
    animateTo(
      thisForm,
      { maxHeight: '2.5rem' },
      { className: 'minimized', change: 'add' },
      searchForOne('.tasks')
    )
    if (thisForm.nextSibling) {
      let next = thisForm.nextSibling
      while (next) {
        const oldVal = getComputedStyle(next).transform

        const change = oldVal.match(/\d+(?=\)$)/)[0]
        const newVal = oldVal.replace(/\d+(?=\)$)/, change - 35)
        next.style.transform = newVal
        next = next.nextSibling
      }
    }
    return formCount
  }
  e.currentTarget.innerText = '–'
  animateTo(
    thisForm,
    { maxHeight: '432px', maxWidth: '500px' },
    { className: 'minimized', change: 'remove' },
    searchForOne('.editors')
  )
  let next = thisForm.nextElementSibling ? thisForm.nextElementSibling : null
  let prev = thisForm
  let prevRect = prev.getBoundingClientRect()
  while (next) {
    const shiftVal = prevRect.width

    const oldVal = Number(next.style.transform.match(/\d+(?=px\)$)/)[0])
    next.style.transform = `translate(${oldVal - shiftVal}px)`

    prev = next
    prevRect = prev.getBoundingClientRect()
    next = next.nextElementSibling
  }
}

// Delete resources depending on which page client is on
const fetchDelete = async (e, dataType, callback) => {
  let url
  let jsonIdLabel
  switch (dataType) {
    case 'content':
      url = '/content/admin/delete'
      jsonIdLabel = 'header_id'
      break
    case 'gallery':
      url = '/galleries/admin/delete'
      jsonIdLabel = 'gallery_id'
      break
    default:
      break
  }
  const payload = {}
  payload[jsonIdLabel] = parseInt(e.currentTarget.value)
  const request = {
    method: 'DELETE',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(url, request).then((r) => r.json())

  callback(response)
}

// The "Edit" and "Delete" buttons that appear when clicking rows on content, galleries, and images pages
const generateBtnGroup = (element, dataType, renderFunc) => {
  let btnValue
  switch (dataType) {
    case 'content':
      btnValue = element.dataset.contentId
      break
    case 'gallery':
      btnValue = element.dataset.galleryId
      break
    default:
      break
  }
  return fragmentElements([
    nestElements(createElement('div', { class: 'btn-group' }), [
      createElement(
        'button',
        {
          type: 'button',
          value: btnValue,
          onclick: 'showContentEditor(event, "edit")'
        },
        'Edit'
      ),
      nestElements(
        createElement('button', {
          type: 'button',
          class: 'delete-button',
          value: btnValue,
          onclick: `fetchDelete(event, '${dataType}', ${renderFunc})`
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
    ])
  ])
}
