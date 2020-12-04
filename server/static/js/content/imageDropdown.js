const generateImageDropdown = (image = null) => {
  const parent = createElement('div', {
    class: 'select new-image-ref',
    'data-image-id': image ? image.dataset.id : ''
  })

  const toggleImageGrid = async (e) => {
    const setAndRemove = (e) => {
      const dropDown = e.target.parentElement.parentElement.parentElement
      const { 1: nameTag } = dropDown.children
      const imagesToClear = dropDown.querySelector('.image-grid-wrapper')
      nameTag.innerText = e.target.alt
      dropDown.dataset.imageId = e.target.id
      empty(imagesToClear)
      dropDown.querySelector('.image-grid-wrapper').classList.remove('active')
      dropDown.querySelector('.arrow-icon').classList.remove('active')
    }
    const check = new Set(e.target.classList)
    const thisDiv = e.currentTarget

    if (check.has('image-grid') || check.has('update-img-ref')) return

    thisDiv.querySelector('.image-grid-wrapper').classList.add('active')
    const imageGrid = createElement('div', { class: 'image-grid' })
    const loading = loadingSpinner.cloneNode(true)
    if (thisDiv.querySelector('.image-grid')) {
      thisDiv.querySelector('.image-grid-wrapper').classList.remove('active')
      thisDiv.querySelector('.image-grid').remove()
      thisDiv.querySelector('.arrow-icon').classList.remove('active')
      return
    }
    // nestElements(imageGrid, [loading])
    nestElements(parent.querySelector('.image-grid-wrapper'), [imageGrid])
    thisDiv.querySelector('.arrow-icon').classList.add('active')
    const response = await fetch('/admin/assets/read').then((r) => r.json())
    
    loading.remove()
    response.forEach((j) => {
      const img = createElement('img', {
        class: 'update-img-ref',
        id: j.id,
        alt: j.image_name,
        src: j.image_link
      })
      img.addEventListener('click', setAndRemove)
      imageGrid.appendChild(img)
    })
  }

  parent.addEventListener('click', toggleImageGrid, true)
  // Image dropdown menu
  const imageDropdown = nestElements(parent, [
    nestElements(
      createSVG('svg', { class: 'drop-arrow' }, [158.75, 158.75], [15, '100%']),
      [
        createSVG('path', {
          d: 'M 155.46289,78.494058 42.636336,144.00382 42.636333,13.648303 Z',
          class: 'arrow-icon'
        })
      ]
    ),
    createElement(
      'span',
      { class: 'selected-image-name' },
      image ? image.alt : ''
    ),
    createElement('div', { class: 'image-grid-wrapper' })
  ])

  return imageDropdown
}
