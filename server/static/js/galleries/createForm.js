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
    const response = await fetch('/galleries/admin/create', request).then((r) =>
      r.json()
    )

    renderGalleries(response)
    gallery.clear()
    exitBtn.click()
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
