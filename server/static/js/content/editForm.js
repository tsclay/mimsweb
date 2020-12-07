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
    const response = await fetch('/content/admin/update', request).then((r) =>
      r.json()
    )
    header.innerText = response.header_text
    paragraph.innerText = response.paragraph_text
    image.src = response.image_link
    image.alt = response.image_name
    image.setAttribute('data-id', response.image_id)
    exit.click()
  }

  editForm.addEventListener('submit', updateContent)
  minimizeBtn.addEventListener('click', handleMinimize)
  exitBtn.addEventListener('click', handleExit, true)

  return editForm
}
