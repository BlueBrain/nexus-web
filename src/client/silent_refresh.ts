import userManager from './userManager';

userManager
  .signinSilentCallback()
  .then(
    any => console.log('Renewed', any),
    any => console.log('not renewed', any)
  )
  .catch(err => console.error('renew error', err));
