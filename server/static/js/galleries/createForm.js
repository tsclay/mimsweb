const generateCreateForm = () => {
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
  // Content Creation form
  const createForm = nestElements(
    createElement('form', {
      class: 'content-editor'
    }),
    [
      titleBar,
      createElement('input', {
        type: 'text',
        name: 'headerText',
        placeholder: 'Header Text'
      }),
      createElement('textarea', {
        id: 'content-body',
        name: 'contentBody',
        cols: 30,
        rows: 10
      }),
      createElement(
        'div',
        {
          class: 'img-modal-activator',
          onclick: 'generateImageModal(event)'
        },
        'Toggle Modal'
      ),
      createElement('button', { type: 'submit' }, 'Create')
    ]
  )

  /*
   * ************************************************
   *
   * Methods
   *
   * ************************************************
   */
  // CREATE new content, send to server to store in db, and re-render content
  const createNewGallery = async (e) => {
    e.preventDefault()
    if (gallery.size === 0) {
      alert('You must select at least one image for the gallery.')
      return
    }
    const { 1: header, 2: paragraph } = e.target.children
    const request = {
      method: 'POST',
      body: JSON.stringify({
        gallery_name: header.value,
        description: paragraph.value,
        images: [...gallery.keys()].map((n) => Number(n))
      }),
      headers: { 'Content-Type': 'application/json' }
    }
    const response = await fetch('/galleries/admin/create', request).then((r) => r.json())
    
    renderGalleries(response)
    gallery.clear()
    exitBtn.click()
  }

  const handleExit = (e) => {
    gallery.clear()
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

  /*
   * ************************************************
   *
   * Register listeners
   *
   * ************************************************
   */
  exitBtn.addEventListener('click', handleExit)
  minimizeBtn.addEventListener('click', handleMinimize)
  createForm.addEventListener('submit', createNewGallery)

  return createForm
}
