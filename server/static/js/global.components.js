const loadingSpinner = nestElements(
  createElement('div', { class: 'loading-wrapper' }),
  [
    nestElements(
      createSVG(
        'svg',
        {
          class: 'loader-icon'
        },
        [132.29166, 132.29167],
        [500, 500]
      ),
      [
        nestElements(createSVG('g'), [
          createSVG('path', {
            class: 'loader-path',
            d:
              'm 66.573613,126.66219 9.9e-4,-8e-5 c 33.183731,-6e-5 60.084447,-27.034831 60.084487,-60.38394 l 7e-5,-0.0029',
            style: `fill: none;
            fill-rule: evenodd;
            stroke: #00ffff;
            stroke-width: 10.7299;
            stroke-miterlimit: 4;
            stroke-dasharray: none;
            stroke-opacity: 1;`
          })
        ])
      ]
    )
  ]
)

const formatDateTimeString = (isoStr) => {
  const date = new Date((isoStr += 'Z'))
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
}

const createDividers = (innerText) => {
  return nestElements(
    createElement('div', {
      style: `
      display: flex;
      align-items: center;
      justify-content: space-between;
      `
    }),
    [
      createElement('h1', {
        style: `
        margin: 0;
        padding: 0.5rem 0.25rem;
        width: 49%;
        background: var(--light);
        box-sizing: border-box;
        border-radius: 8px;
        `
      }, innerText),
      createElement('div', {
        style: `
        width: 49%;
        border-bottom: 2px solid black;
        margin: 0 auto;
        `
      })
    ]
  )
}

const userRole = searchForOne('meta[name="role"]').content

