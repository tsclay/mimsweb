const loadingSpinner = nestElements(
  createElement('div', { class: 'loading-wrapper' }),
  [
    nestElements(
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
  ]
)

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
        padding: 0.5rem 0.25rem;
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

const userRole = searchForOne('meta[name="role"]').content

const handleExit = (e) => {
  const tasksRect = searchForOne('.tasks').getBoundingClientRect()
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
