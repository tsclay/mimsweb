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
  const date = new Date(isoStr)
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  const offset = Math.floor(date.getTimezoneOffset() / 60)
  let meridiem = 'AM'
  if (offset > 0 && hours >= 12) {
    hours = (hours - offset) % 12
    meridiem = hours > 12 ? 'PM' : 'AM'
  } else if (offset > 0 && hours === 0) {
    hours = 12
  }

  minutes = minutes < 10 ? `0${minutes}` : minutes
  seconds = seconds < 10 ? `0${seconds}` : seconds

  return `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()} at ${hours}:${minutes}:${seconds} ${meridiem}`
}
