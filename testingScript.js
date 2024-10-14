/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
const player = document.querySelector('dotlottie-player'),
  dl = async () => {
    await dotLottiePlayer().addAnimation(
      [
        {
          id: 'care-education-1',
          url: './assets/care-education-1.lottie',
        },
        {
          id: 'care-education-2',
          url: './assets/care-education-2.lottie',
        },
      ],
      'care-education-combined.lottie'
    )
    // if (dotLottiePlayer) {
    //   await dotLottiePlayer().addAnimation([
    //     {
    //       id: 'am',
    //       url: './assets/am.lottie'
    //     },
    //     {
    //       id: 'bulb',
    //       url: './assets/bulb.lottie'
    //     },
    //     {
    //       id: 'dev',
    //       url: './assets/dev.lottie'
    //     }
    //   ],
    //     'test-av-standalone')
    // }
  },
  cl = async () => {
    if (dotLottiePlayer) {
      await dotLottiePlayer().convert({
        // manifest: {
        //   animations: [
        //     { id: 'thinking' }
        //   ]
        // },
        // animations: [lottieJSON],
        fileName: 'thinking',
        shouldDownload: true,
        src: '/assets/thinking.lottie',
        typeCheck: true,
      })
    }
  }
// if (player) {
//   player.addEventListener('mouseover', () => {
//     player.pause()
//   })
//   player.addEventListener('mouseout', () => {
//     player.play()
//   })
// //   console.log(player.multiAnimationSettings)
// //   // player.setSpeed(4)
// //   // player.setMultiAnimationSettings(
// //   //   {
// //   //     autoplay: true,
// //   //   },
// //   //   {
// //   //     autoplay: true,
// //   //     loop: true,
// //   //     bounce: true
// //   //   }
// //   // )
// }
