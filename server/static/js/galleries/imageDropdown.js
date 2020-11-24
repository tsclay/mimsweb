// let gallery = []
const gallery = new Map()

// const generateImageDropdown = (image = null) => {
//   const parent = createElement('div', {
//     class: 'select new-image-ref',
//     'data-image-id': image ? image.dataset.id : ''
//   })

//   const toggleImageGrid = async (e) => {
//     const setAndRemove = (e) => {
//       const dropDown = e.target.closest('.select.new-image-ref')
//       const imgWrapper = e.target.parentElement
//       const { 1: imgList } = dropDown.children
//       imgList.innerText += e.target.alt
//       gallery.push(e.target.id)
//       imgWrapper.style.backgroundColor = 'green'
//       nestElements(imgWrapper, [
//         createElement(
//           'div',
//           {
//             style:
//               'border-radius: 20px; background-color: white; display: flex; align-items: center; justify-content: center; position: absolute; top: 0; right: 0;'
//           },
//           `${gallery.length}`
//         )
//       ])

//       // nameTag.innerText = e.target.alt
//       // dropDown.dataset.imageId = e.target.id
//       // empty(imagesToClear)
//       // dropDown.querySelector('.image-grid-wrapper').classList.remove('active')
//       // dropDown.querySelector('.arrow-icon').classList.remove('active')
//     }
//     const check = new Set(e.target.classList)
//     const thisDiv = e.currentTarget

//     if (check.has('image-grid') || check.has('update-img-ref')) return

//     thisDiv.querySelector('.image-grid-wrapper').classList.add('active')
//     const imageGrid = createElement('div', { class: 'image-grid' })
//     const loading = loadingSpinner.cloneNode(true)
//     if (thisDiv.querySelector('.image-grid')) {
//       thisDiv.querySelector('.image-grid-wrapper').classList.remove('active')
//       thisDiv.querySelector('.image-grid').remove()
//       thisDiv.querySelector('.arrow-icon').classList.remove('active')
//       return
//     }
//     // nestElements(imageGrid, [loading])
//     nestElements(parent.querySelector('.image-grid-wrapper'), [imageGrid])
//     thisDiv.querySelector('.arrow-icon').classList.add('active')
//     const response = await fetch('/admin/assets/read')
//     const json = await response.json()
//     loading.remove()
//     json.forEach((j) => {
//       const img = createElement('img', {
//         class: 'update-img-ref',
//         id: j.id,
//         alt: j.image_name,
//         src: j.image_link
//       })
//       img.addEventListener('click', setAndRemove)

//       imageGrid.appendChild(
//         nestElements(
//           createElement('div', {
//             class: 'update-img-wrapper',
//             style: 'position: relative;'
//           }),
//           [img]
//         )
//       )
//     })
//   }

//   parent.addEventListener('click', toggleImageGrid, true)
//   // Image dropdown menu
//   const imageDropdown = nestElements(parent, [
//     nestElements(
//       createSVG('svg', { class: 'drop-arrow' }, [158.75, 158.75], [15, '100%']),
//       [
//         createSVG('path', {
//           d: 'M 155.46289,78.494058 42.636336,144.00382 42.636333,13.648303 Z',
//           class: 'arrow-icon'
//         })
//       ]
//     ),
//     createElement(
//       'span',
//       { class: 'selected-image-name' },
//       image ? image.alt : ''
//     ),
//     createElement('div', { class: 'image-grid-wrapper' })
//   ])

//   return imageDropdown
// }

const generateImageModal = (e) => {
  const parentForm = e.target.parentElement

  const loading = loadingSpinner.cloneNode(true)

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

  const boxTitle = createElement(
    'span',
    {
      class: 'box-title'
    },
    'Add Images to New Gallery'
  )

  const titleBar = nestElements(
    createElement('div', {
      class: 'title-bar',
      style: 'grid-template-columns: calc(100% - 24px) 20px;'
    }),
    [boxTitle, exitBtn]
  )

  const infoBtn = createElement(
    'button',
    {
      type: 'button',
      style: `position: absolute; top: 34px; right: 4px;
      border-radius: 30px;
      width: 25px;
      height: 25px;
      display: flex;
      align-items: center;
      justify-content: center;`
    },
    'i'
  )

  const confirmBtn = createElement(
    'button',
    {
      class: 'confirm-btn',
      type: 'button',
      style: `
      position: absolute;
      bottom: 4px;
      right: 4px;
      border-radius: 30px;`
    },
    '✅'
  )
  const imagePool = createElement('div', {
    class: 'image-pool'
  })
  nestElements(imagePool, [loading])

  const multiSelectImg = nestElements(
    createElement('div', {
      class: 'multi-select-img'
    }),
    [titleBar, infoBtn, imagePool, confirmBtn]
  )

  nestElements(parentForm, [multiSelectImg])

  /*
   * ************************************************
   *
   * Methods
   *
   * ************************************************
   */
  const toggleSelectImg = (e) => {
    const thisImage = e.currentTarget
    const thisImageWrapper = thisImage.parentElement
    const galleryCheck = gallery.get(thisImage.dataset.id)
    if (galleryCheck) {
      gallery.delete(thisImage.dataset.id)
      thisImageWrapper.querySelector('.selected-img-number').remove()
      imagePool.querySelectorAll('.update-img-ref').forEach((s) => {
        const numberBox = s.querySelector('.selected-img-number')
        if (numberBox) {
          numberBox.innerText = `${
            [...gallery.keys()].indexOf(s.querySelector('img').dataset.id) + 1
          }`
        }
      })
      return
    }
    gallery.set(thisImage.dataset.id, {
      image_id: thisImage.dataset.id,
      alt: thisImage.alt,
      src: thisImage.src,
      css_selector: `img[data-id="${thisImage.dataset.id}"]`
    })
    nestElements(thisImageWrapper, [
      createElement(
        'div',
        {
          class: 'selected-img-number'
        },
        `${[...gallery.keys()].indexOf(thisImage.dataset.id) + 1}`
      )
    ])
  }

  const cancelProcess = (e) => {
    const thisGallerySelector = e.currentTarget.closest('.multi-select-img')
    gallery.clear()
    thisGallerySelector.remove()
  }

  const toggleInstructions = (e) => {
    const instructionsCheck = searchForOne('#gallery-instructions')
    if (instructionsCheck) {
      removeNodes([instructionsCheck])
    } else {
      const instructions = createElement(
        'p',
        { id: 'gallery-instructions' },
        `Click images to toggle adding and removing from queue.\nAdded images will show a number in their upper-left right corners. Clicking these images will remove them from the queue and remove their numbers.\nClick "Confirm" to certify changes, or click "X" to cancel the process.`
      )
      return nestElements(e.currentTarget.parentElement, [instructions])
    }
  }

  const confirmGallerySelections = (e) => {
    const thisGallerySelector = e.currentTarget.closest('.multi-select-img')
    if (gallery.size === 0) {
      thisGallerySelector.remove()
      return
    }
    const modalToggler = searchForOne('.img-modal-activator')
    modalToggler.innerText =
      gallery.size > 0 ? 'Change Selected Images' : 'Toggle Modal'
    thisGallerySelector.remove()
  }

  const changeSelections = () => {
    if (gallery.size === 0) return
    ;[...gallery.entries()].forEach((g, i) => {
      const imgDiv = searchForOne(g[1].css_selector).parentElement
      nestElements(imgDiv, [
        createElement(
          'div',
          {
            class: 'selected-img-number',
            id: i
          },
          `${i + 1}`
        )
      ])
    })
  }

  const fetchImages = async () => {
    const response = await fetch('/admin/assets/read')
    const json = await response.json()
    imagePool.querySelector('.loading-wrapper').remove()
    json.forEach((j) => {
      const img = createElement('img', {
        'data-id': j.id,
        alt: j.image_name,
        src: j.image_link
      })
      img.addEventListener('click', toggleSelectImg)
      const div = createElement('div', {
        class: 'update-img-ref'
      })
      nestElements(div, [img])
      nestElements(imagePool, [div])
    })
    changeSelections()
  }

  /*
   * ************************************************
   *
   * Register listeners
   *
   * ************************************************
   */
  exitBtn.addEventListener('click', cancelProcess)
  infoBtn.addEventListener('click', toggleInstructions)
  confirmBtn.addEventListener('click', confirmGallerySelections)

  /*
   * ************************************************
   *
   * Call methods
   *
   * ************************************************
   */

  fetchImages()
}
