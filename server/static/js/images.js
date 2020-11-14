// Fetch content data on page load and insert into DOM
const renderImages = async (preResponse = null) => {
  const imageDisplay = searchForOne('div.asset-grid')
  let content

  const deleteImage = async (eRef) => {
    const request = {
      method: 'DELETE',
      body: JSON.stringify({
        image_id: parseInt(eRef.value)
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const response = await fetch('/admin/assets/delete', request)
    const json = await response.json()
    renderImages(json)
  }
  const handleNotification = (json, asset) => {
    const cancel = (e) => {
      e.currentTarget.parentElement.remove()
    }
    const confirm = (e) => {
      e.currentTarget.parentElement.remove()
      deleteImage({ value: e.currentTarget.value })
    }
    const exitBtn = createElement(
      'button',
      {
        class: 'notif-exit-btn'
      },
      'X'
    )
    const confirmBtn = createElement(
      'button',
      {
        class: 'notif-confirm-btn',
        value: asset.dataset.imageId
      },
      'Confirm'
    )

    exitBtn.addEventListener('click', cancel)
    confirmBtn.addEventListener('click', confirm)
    nestElements(searchForOne('.windows'), [
      nestElements(
        createElement('div', {
          class: 'notification',
          'data-linked-image': asset.dataset.imageId
        }),
        [
          createElement(
            'p',
            { class: 'notification-msg' },
            `${json.length - 1} pieces of content will lose ${
              asset.querySelector('p').innerText
            } image\n\nAre you sure you wish to delete it?`
          ),
          exitBtn,
          confirmBtn
        ]
      )
    ])
  }

  const checkForLinkedContent = async (e) => {
    const thisAsset = e.target.closest('.asset-box')
    const request = {
      method: 'POST',
      body: JSON.stringify({
        image_id: parseInt(e.target.closest('button').value)
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
    const response = await fetch('/admin/assets/delete', request)
    const json = await response.json()
    if (json[0].message === 1) {
      await handleNotification(json, thisAsset)
    } else if (json[0].message === 0) {
      await deleteImage(e.target.closest('button'))
    }
  }

  const viewFullImage = (e) => {
    const { 2: thisImage } = e.target.closest('.asset-box').children
    window.open(thisImage.src, '_blank')
  }

  const selectThisContent = (e) => {
    const div = e.currentTarget
    if (searchForOne(`div[data-linked-image="${div.dataset.imageId}"]`)) return
    const parentDiv = div.parentElement
    parentDiv.querySelectorAll('.selected').forEach((d) => {
      if (d !== div) {
        d.classList.toggle('selected')
        d.querySelector('.asset-box > .btn-group').remove()
      }
    })
    div.classList.toggle('selected')
    if (div.classList[div.classList.length - 1] === 'selected') {
      const deleteBtn = createElement('button', {
        type: 'button',
        value: div.dataset.imageId
      })
      const replaceInput = createElement('input', {
        type: 'file',
        name: 'file',
        'data-image-id': div.dataset.imageId,
        class: 'replace-image',
        autocomplete: 'off',
        onchange: "generateImageEditor(event, 'edit')"
      })
      const replaceBtn = nestElements(
        createElement('label', { class: 'replace' }),
        [
          replaceInput,
          nestElements(
            createElement('div', {
              class: 'replace-image-button',
              value: div.dataset.imageId
            }),
            [
              nestElements(
                createSVG('svg', null, [112.18, 93.927], ['100%', '100%']),
                [
                  nestElements(
                    createSVG('g', {
                      transform: 'translate(-17.601098,6.0505133)',
                      fill: '#b0b0b0',
                      stroke: '#000'
                    }),
                    [
                      createSVG('path', {
                        d: 'm58.876 48.925-40.5-40.5-0.30907 40.809z',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': '.5'
                      }),
                      createSVG('path', {
                        d:
                          'm47.719 36.249s12.557-22.668 49.486-41.671c-40.32 5.2933-66.153 25.004-66.153 25.004z',
                        'stroke-width': '.5'
                      }),
                      createSVG('path', {
                        d: 'm88.326 32.974 40.5 40.5 0.30908-40.809z',
                        'stroke-linecap': 'round',
                        'stroke-linejoin': 'round',
                        'stroke-width': '.5'
                      }),
                      createSVG('path', {
                        d:
                          'm99.483 45.65s-12.557 22.668-49.486 41.671c40.32-5.2933 66.153-25.004 66.153-25.004z',
                        'stroke-width': '.5'
                      })
                    ]
                  )
                ]
              )
            ]
          )
        ]
      )
      const previewBtn = nestElements(
        createElement('button', {
          type: 'button'
        }),
        [
          nestElements(
            createSVG('svg', null, [91.81, 44.185], ['100%', '100%']),
            [
              nestElements(
                createSVG('g', {
                  fill: 'none',
                  stroke: '#b0b0b0',
                  'stroke-width': '6'
                }),
                [
                  createSVG('path', {
                    d:
                      'm7.0794 17.67c8.009-5.149 26.823-16.598 39.695-16.598 12.872 1.482e-4 30.69 11.449 38.275 16.598 7.5848 5.1489 7.5848 5.6992-1.12e-4 10.404s-25.275 15.038-38.278 15.038c-13.003 1.37e-4 -31.682-10.332-39.691-15.038-8.0091-4.7053-8.0091-5.2557-1.34e-4 -10.405z'
                  }),
                  createSVG('ellipse', {
                    cx: '45.905',
                    cy: '22.093',
                    rx: '14.145',
                    ry: '10.543',
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round'
                  })
                ]
              )
            ]
          )
        ]
      )

      const controls = fragmentElements([
        nestElements(createElement('div', { class: 'btn-group' }), [
          previewBtn,
          replaceBtn,
          nestElements(deleteBtn, [
            nestElements(
              createSVG(
                'svg',
                { class: 'trash-can' },
                [105.83, 119.06],
                ['100%', '100%']
              ),
              [
                createSVG('path', {
                  d:
                    'm22.951 30.289h61.61c0.5235 0 0.99476 0.42382 0.94494 0.94494l-7.4083 77.485c-0.04982 0.52112-5.3265 0.94494-5.85 0.94494h-38.437c-0.5235 0-5.9444-0.42291-5.9836-0.94494l-5.8208-77.485c-0.03922-0.52203 0.42144-0.94494 0.94494-0.94494z',
                  style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                }),
                createSVG('rect', {
                  x: 51.815,
                  y: 49.944,
                  width: 2.0045,
                  height: 44.099,
                  ry: 1.0023,
                  style:
                    'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999'
                }),
                createSVG('rect', {
                  x: 60.142,
                  y: 48.893,
                  width: 2.0045,
                  height: 44.099,
                  ry: 1.0023,
                  style:
                    'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                  transform: 'rotate(1)'
                }),
                createSVG('rect', {
                  x: 68.447,
                  y: 47.579,
                  width: 2.0045,
                  height: 44.099,
                  ry: 1.0023,
                  style:
                    'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                  transform: 'rotate(2)'
                }),
                createSVG('rect', {
                  x: 76.722,
                  y: 46.004,
                  width: 2.0045,
                  height: 44.099,
                  ry: 1.0023,
                  style:
                    'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                  transform: 'rotate(3)'
                }),
                createSVG('rect', {
                  x: 43.472,
                  y: 50.733,
                  width: 2.0045,
                  height: 44.099,
                  ry: 1.0023,
                  style:
                    'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                  transform: 'rotate(-1)'
                }),
                createSVG('rect', {
                  x: 35.12,
                  y: 51.26,
                  width: 2.0045,
                  height: 44.099,
                  ry: 1.0023,
                  style:
                    'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                  transform: 'rotate(-2)'
                }),
                createSVG('rect', {
                  x: 26.764,
                  y: 51.523,
                  width: 2.0045,
                  height: 44.099,
                  ry: 1.0023,
                  style:
                    'fill-rule:evenodd;fill:#ececec;stroke-width:.265;stroke:#999',
                  transform: 'rotate(-3)'
                }),
                nestElements(
                  createSVG('g', {
                    class: 'trash-can-lid',
                    transform: 'translate(-.060786 6.35)'
                  }),
                  [
                    createSVG('path', {
                      d: 'm33.872 12.653v-9.472h38.437v9.472',
                      style: 'fill:none;stroke-width:.26458px;stroke:#999'
                    }),
                    createSVG('path', {
                      d: 'm40.128 12.248v-6.0598h25.862v6.0598',
                      style: 'fill:none;stroke-width:.27166;stroke:#999'
                    }),
                    createSVG('path', {
                      d:
                        'm34.015 8.0121v-4.6771h38.166v9.3543h-6.5619v-6.1471h-25.042v6.1471h-6.5619z',
                      style:
                        'fill-rule:evenodd;fill:#999;stroke-width:.13398;stroke:#999'
                    }),
                    createSVG('rect', {
                      x: 10.093,
                      y: 22.817,
                      width: 85.86,
                      height: 2.0713,
                      style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                    }),
                    createSVG('rect', {
                      x: 9.9796,
                      y: 12.233,
                      width: 85.86,
                      height: 2.0713,
                      style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                    }),
                    createSVG('rect', {
                      x: 95.806,
                      y: 12.233,
                      width: 2.0714,
                      height: 12.655,
                      style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                    }),
                    createSVG('rect', {
                      x: 8.077,
                      y: 12.233,
                      width: 2.0714,
                      height: 12.655,
                      style: 'fill-rule:evenodd;fill:#999;stroke-width:0'
                    }),
                    createSVG('path', {
                      d: 'm10.168 18.561v-4.2256h85.665v8.4513h-85.665z',
                      style:
                        'fill-rule:evenodd;fill:#fff;stroke-width:.034606;stroke:#fff'
                    })
                  ]
                )
              ]
            )
          ])
        ])
      ])
      deleteBtn.addEventListener('click', checkForLinkedContent)
      // replaceInput.addEventListener('onchange', toggleReplaceForm)
      previewBtn.addEventListener('click', viewFullImage)

      div.prepend(controls)
    } else {
      div.querySelector('.asset-box > .btn-group').remove()
    }
  }

  if (preResponse === null) {
    const response = await fetch('/admin/assets/read')
    const json = await response.json()
    content = json
  } else {
    content = preResponse
  }
  empty(imageDisplay)
  content.forEach((c) => {
    const img = createElement('img', {
      class: 'thumbnail',
      src: c.image_link,
      alt: c.image_name
    })
    const assetBox = nestElements(
      createElement('div', {
        class: 'asset-box',
        'data-image-id': c.id
      }),
      [fragmentElements([createElement('p', null, c.image_name), img])]
    )

    assetBox.addEventListener('click', selectThisContent)
    imageDisplay.appendChild(assetBox)
  })
}

const generateImageEditor = (e, flag) => {
  const thisInput = e.target
  console.log(thisInput)
  const gate = flag
  const [file] = thisInput.files
  const fileNameSpan = createElement('p', { id: 'file-selected' }, file.name)
  const nameLabel = createElement(
    'label',
    { for: 'new-image-name' },
    'New image name'
  )
  const newImageName = createElement('input', {
    type: 'text',
    name: 'new-image-name',
    id: 'new-image-name'
  })
  const removeButton = createElement('button', { class: 'exit-btn' }, 'X')
  const uploadButton = createElement(
    'button',
    { class: 'upload-btn' },
    'Upload'
  )

  const uploadNewImage = async (e) => {
    const imageEditor = e.currentTarget.parentElement
    const fd = new FormData()
    if (gate === 'new') {
      fd.append('new_image', file)
      fd.append('image_name', document.querySelector('#new-image-name').value)
    } else if (gate === 'edit') {
      fd.append('new_image', file)
      fd.append('image_name', document.querySelector('#new-image-name').value)
      fd.append('image_id', thisInput.dataset.imageId)
    }

    const url =
      gate === 'edit' ? '/admin/assets/replace' : '/admin/assets/create'

    const response = await fetch(url, {
      method: 'POST',
      body: fd
    })
    const updatedImages = await response.json()
    imageEditor.remove()
    renderImages(updatedImages)
  }

  const exitEditor = (e) => {
    e.currentTarget.parentElement.remove()
  }

  uploadButton.addEventListener('click', uploadNewImage)
  removeButton.addEventListener('click', exitEditor)

  const editNewImageInfo = nestElements(
    createElement('div', { class: 'image-uploader' }),
    [
      fragmentElements([
        fileNameSpan,
        nameLabel,
        newImageName,
        removeButton,
        uploadButton
      ])
    ]
  )

  nestElements(searchForOne('.windows'), [editNewImageInfo])
}
