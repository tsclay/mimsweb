/**
 * Move one element from one parent to another using an animation to show
 * the action.
 *
 * @param {HTMLElement} node - The node to animate. This only affects the node's insertion into the DOM.
 * @param {Object} props - Other CSS props to animate; translate is handled, but can add extra translates if needed
 * @param {Object} classOptions - The class name and whether to add or remove it
 * @param {HTMLElement} parent - The parent to which the animated node will be appended
 */
const animateTo = (node, props, classOptions, parent) => {
  const style = getComputedStyle(node)
  console.log(style.transform)
  const transform = style.transform === '' ? 'none' : style.transform
  const from = node.getBoundingClientRect()
  const to = parent.getBoundingClientRect()
  let correctiveX = 0
  let correctiveY = 0
  if (parent.lastElementChild && classOptions.change === 'add') {
    const lastChild = parent.lastElementChild.getBoundingClientRect()
    correctiveX = lastChild.left - to.left + lastChild.width
  }
  if (parent.lastElementChild && classOptions.change === 'remove') {
    const lastChild = parent.lastElementChild.getBoundingClientRect()
    correctiveY = 35 * parent.children.length - 1
  }

  const dx = from.left - to.left
  const dy = from.top - to.top
  console.log('node rect', from)
  console.log('parent rect', to)
  console.log(`dx: ${dx}, dy: ${dy}`)

  const player = node.animate(
    [
      {
        transform: `${transform} translate(${-1.0 * dx + correctiveX}px,${
          -1.0 * dy + correctiveY
        }px)`,
        ...props
      }
    ],
    {
      duration: 200,
      easing: 'linear',
      composite: 'replace'
    }
  )

  const swapParents = (e) => {
    parent.appendChild(node)
    if (classOptions.change === 'add') {
      node.classList.add(classOptions.className)
      node.style.transform = `translate(${correctiveX}px, 0px)`
    } else if (classOptions.change === 'remove') {
      node.classList.remove(classOptions.className)
      node.style.transform = ''
      node.style.overflow = 'visible'
      node.style.transform = `translate(-3.37px, ${
        35 * (parent.children.length - 1)
      }px)`
    }
    console.log('all done')
    player.removeEventListener('finish', swapParents, true)
  }

  player.addEventListener('finish', swapParents, true)
}
