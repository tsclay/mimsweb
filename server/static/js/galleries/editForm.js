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
const generateEditForm = (name, details, row, e) => {
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
    name.innerText
  )

  const titleBar = nestElements(createElement('div', { class: 'title-bar' }), [
    boxTitle,
    minimizeBtn,
    exitBtn
  ])

  const textArea = createElement('textarea', {
    cols: 30,
    rows: 10,
    'data-id': row.parentElement.dataset.galleryId,
    name: 'edit-body'
  })

  textArea.value = details.innerText

  row.childNodes.forEach((r, i) => {
    gallery.set(r.dataset.imageId, {
      image_id: r.dataset.imageId,
      alt: r.alt,
      src: r.src,
      css_selector: `img[data-id="${r.dataset.imageId}"]`
    })
  })

  const editForm = nestElements(
    createElement('form', {
      class: 'content-editor'
    }),
    [
      titleBar,
      createElement('input', {
        name: 'edit-header',
        type: 'text',
        'data-id': row.parentElement.dataset.galleryId,
        value: name.innerText
      }),
      textArea,
      createElement(
        'div',
        {
          class: 'img-modal-activator',
          'data-gallery-ref': row.parentElement.dataset.galleryId,
          onclick: 'generateImageModal(event, true)'
        },
        'Toggle Modal'
      ),
      createElement(
        'button',
        { type: 'submit', value: e.target.value[e.target.value.length - 1] },
        'Confirm'
      )
    ]
  )

  const updateContent = async (e) => {
    e.preventDefault()
    if (gallery.size === 0) {
      alert('You must select at least one image for the gallery.')
      return
    }
    console.log(e.target.children)
    const { 0: titleBar, 1: h, 2: p } = e.target.children
    const { 2: exit } = titleBar.children
    const request = {
      method: 'PUT',
      body: JSON.stringify({
        id: h.dataset.id,
        gallery_name: h.value,
        description: p.value,
        images: [...gallery.keys()]
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const response = await fetch('/galleries/admin/update', request).then((r) =>
      r.json()
    )
    renderGalleries(response)
    gallery.clear()
    exit.click()
  }

  editForm.addEventListener('submit', updateContent)
  minimizeBtn.addEventListener('click', handleMinimize)
  exitBtn.addEventListener('click', handleExit, true)

  return editForm
}
