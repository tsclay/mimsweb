//= ==========================================================
// Time functions
//= ==========================================================
// const getCurrentDate = () => {
//   const unformatted = new Date()
//   const formatted = `${
//     unformatted.getMonth() + 1
//   }/${unformatted.getDate()}/${unformatted.getFullYear()}`
//   return formatted
// }

// let test = 1602824390000
// let test = 1602867595000 // 12:59 pm
// let test = 1602863995000 // 11:59 am
// let test = 1602907195000 // 11:59 pm
// Init clock and return an interval func that sets
// the seconds and increments minutes and hours in the DOM as needed
// const activateTimeMech = () => {
//   const offset = new Date().getTimezoneOffset()
//   const offSetHours =
//     offset > 0
//       ? parseInt(`-${Math.floor(offset / 60)}`)
//       : Math.floor(offset / 60)
//   const offSetMinutes = offset > 0 ? parseInt(`-${offset % 60}`) : offset % 60

//   const hours = Math.floor(Date.now() / 1000 / 60 / 60 + offSetHours) % 24
//   const minutes = Math.floor(Date.now() / 1000 / 60 + offSetMinutes) % 60
//   const seconds = Math.floor(Date.now() / 1000) % 60

//   searchForOne('#hours').innerText = hours % 12 === 0 ? 12 : hours % 12
//   if (hours >= 12) {
//     searchForOne('#meridiem').innerText = 'PM'
//   } else {
//     searchForOne('#meridiem').innerText = 'AM'
//   }

//   searchForOne('#minutes').innerText = minutes < 10 ? `0${minutes}` : minutes
//   searchForOne('#seconds').innerText = seconds < 10 ? `0${seconds}` : seconds

//   const getTime = () => {
//     const hoursDisplay = searchForOne('#hours')
//     const minutesDisplay = searchForOne('#minutes')
//     const secDisplay = searchForOne('#seconds')
//     const meridiemDisplay = searchForOne('#meridiem')
//     let minutes =
//       parseInt(minutesDisplay.innerText) === 0
//         ? parseInt(minutesDisplay.innerText[1])
//         : parseInt(minutesDisplay.innerText)
//     let hours = parseInt(hoursDisplay.innerText)
//     const seconds = Math.floor(Date.now() / 1000) % 60
//     if (seconds === 0) {
//       minutes = (minutes + 1) % 60
//       minutes = minutes < 10 ? `0${minutes}` : minutes
//       minutesDisplay.innerText = minutes
//     }
//     if (
//       parseInt(minutes) === 0 &&
//       parseInt(minutesDisplay.innerText[1]) === 0 &&
//       seconds === 0
//     ) {
//       hours += 1
//       hoursDisplay.innerText = hours % 12 === 0 ? 12 : hours % 12
//       if (hours === 12) {
//         meridiemDisplay.innerText =
//           meridiemDisplay.innerText === 'AM' ? 'PM' : 'AM'
//       }
//     }
//     secDisplay.innerText = seconds < 10 ? `0${seconds}` : seconds
//   }

//   timer = setInterval(() => {
//     getTime()
//   }, 1000)

//   return timer
// }

// activateTimeMech()
