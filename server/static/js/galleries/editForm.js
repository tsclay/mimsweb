/**
 * EditForm:
 * - Creates ```editForm``` component
 * - Attaches event listeners for ```onsubmit``` and ```onclick``` for ```exitBtn```
 * - Handles the transition out of the element
 *
 * @param {HTMLElement} header - The header text for selected content to edit
 * @param {HTMLElement} paragraph - The paragraph text for selected content to edit
 * @param {HTMLElement} image - The paired image to update
 */
const generateEditForm = (header, paragraph, image, e) => {
  const exitBtn = createElement(
    'button',
    {
      type: 'button',
      class: 'edit-form exit-btn'
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
    header.innerText
  )

  const titleBar = nestElements(createElement('div', { class: 'title-bar' }), [
    boxTitle,
    minimizeBtn,
    exitBtn
  ])

  const textArea = createElement('textarea', {
    cols: 30,
    rows: 10,
    'data-id': paragraph.getAttribute('data-id'),
    name: 'edit-body'
  })

  textArea.value = paragraph.innerText

  const editForm = nestElements(
    createElement('form', {
      class: 'content-editor'
    }),
    [
      titleBar,
      createElement('input', {
        name: 'edit-header',
        type: 'text',
        'data-id': header.getAttribute('data-id'),
        value: header.innerText
      }),
      textArea,
      generateImageDropdown(image),
      createElement(
        'button',
        { type: 'submit', value: e.target.value[e.target.value.length - 1] },
        'Confirm'
      )
    ]
  )

  const updateContent = async (e) => {
    e.preventDefault()
    console.log(e.target.children)
    const { 0: titleBar, 1: h, 2: p, 3: selectedImage } = e.target.children
    const { 2: exit } = titleBar.children
    const request = {
      method: 'PUT',
      body: JSON.stringify({
        header_text: h.value,
        paragraph_text: p.value,
        image_id: parseInt(selectedImage.dataset.imageId),
        paragraph_id: parseInt(h.dataset.id),
        header_id: parseInt(p.dataset.id)
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const response = await fetch('/admin/content/update', request)
    const updated = await response.json()
    header.innerText = updated.header_text
    paragraph.innerText = updated.paragraph_text
    image.src = updated.image_link
    image.alt = updated.image_name
    image.setAttribute('data-id', updated.image_id)
    exit.click()
  }

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
        // console.log(
        //   `oldVal: ${oldVal}, shift: ${shiftVal}, tasks: ${tasksRect.left}`
        // )
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

  editForm.addEventListener('submit', updateContent)
  minimizeBtn.addEventListener('click', handleMinimize)
  exitBtn.addEventListener('click', handleExit, true)

  return editForm
}
