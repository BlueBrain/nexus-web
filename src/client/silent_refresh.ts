import userManager from './userManager';

userManager
  .signinSilentCallback()
  .then(
    () => {
      // console.log('iframe-> Renewed')
    },
    error => {
      // console.log('iframe -> not renewed')
    }
  )
  .catch(err => {
    // console.error('renew error', err)
  });
