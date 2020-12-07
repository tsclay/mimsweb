const generateSwapForm = (e) => {
  /*
   * ************************************************
   *
   * Elements
   *
   * ************************************************
   */
  const exitBtn = createElement(
    'button',
    {
      type: 'button',
      class: 'create-form exit-btn'
    },
    'X'
  )

  const minimizeBtn = createElement(
    'button',
    {
      type: 'button',
      class: 'create-form mini-btn'
    },
    '–'
  )

  const boxTitle = createElement(
    'span',
    {
      class: 'box-title'
    },
    'Create'
  )

  const titleBar = nestElements(createElement('div', { class: 'title-bar' }), [
    boxTitle,
    minimizeBtn,
    exitBtn
  ])

  const links = [...searchForAll('.rendered-content > h2')].map((s) =>
    createElement(
      'p',
      {
        'data-id': s.dataset.id,
        draggable: true,
        style: `
      cursor: grab;
      background: rgba(250, 235, 150, 0.699);
      box-sizing: border-box;
      padding: 0.5rem;
      `
      },
      s.innerText
    )
  )

  const orderDiv = nestElements(
    createElement('div', {
      class: 'link-order',
      ondragover: `((e) => {
        e.preventDefault()
      })(event)`,
      ondrageenter: `((e) => {
        e.preventDefault()
      })(event)`,
      ondrop: `((e) => {
        console.log(e.target);
      })(event)`,
      style: `
        width: 90%;
        margin: 0 auto;
        `
    }),
    [
      createElement(
        'p',
        null,
        'Drag-and-drop to change the order of the linked content.'
      )
    ]
  )
  nestElements(orderDiv, [
    nestElements(createElement('div', { class: 'links' }), links)
  ])

  const form = nestElements(
    createElement('form', {
      class: 'content-editor'
    }),
    [
      createElement(
        'h2',
        {
          class: 'header-text'
        },
        'Testing swap link form'
      ),
      orderDiv
    ]
  )

  /*
   * ************************************************
   *
   * Methods
   *
   * ************************************************
   */
  const handleExit = (e) => {
    const tasksRect = searchForOne('.tasks').getBoundingClientRect()
    const thisForm = e.currentTarget.parentElement.parentElement
    const thisFormCount = Number(thisForm.dataset.formCount)
    const targetIndex = dynamicStyles.list.indexOf(thisFormCount)
    if (new Set(thisForm.classList).has('minimized')) {
      dynamicStyles.deleteRule(targetIndex)
      dynamicStyles.list.splice(targetIndex, 1)
      let next = thisForm.nextElementSibling
        ? thisForm.nextElementSibling
        : null
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

  const dragLinks = (e) => {
    e.dataTransfer.setData('text/html', e.target.outerHTML)
    e.dataTransfer.dropEffect = 'move'
  }

  /*
   * ************************************************
   *
   * Register listeners
   *
   * ************************************************
   */
  links.forEach((l) => l.addEventListener('dragstart', dragLinks))
  exitBtn.addEventListener('click', handleExit)
  minimizeBtn.addEventListener('click', handleMinimize)

  return nestElements(form, [titleBar])
}
