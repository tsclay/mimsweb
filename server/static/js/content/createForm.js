const generateCreateForm = () => {
  const thisImageDropdown = generateImageDropdown()
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
      thisImageDropdown,
      createElement('button', { type: 'submit' }, 'Create')
    ]
  )

  // CREATE new content, send to server to store in db, and re-render content
  const createNewContent = async (e) => {
    e.preventDefault()
    const { 1: h, 2: p, 3: i } = e.target.children
    const headerText = h.value
    const contentBody = p.value
    const imageRef = i.dataset.imageId
    const request = {
      method: 'POST',
      body: JSON.stringify({
        header_text: headerText,
        paragraph_text: contentBody,
        image_id: parseInt(imageRef)
      }),
      headers: { 'Content-Type': 'application/json' }
    }
    const response = await fetch('/content/admin/create', request).then((r) =>
      r.json()
    )

    renderContent(response)
    exitBtn.click()
  }

  exitBtn.addEventListener('click', handleExit)
  minimizeBtn.addEventListener('click', handleMinimize)
  createForm.addEventListener('submit', createNewContent)

  return createForm
}
