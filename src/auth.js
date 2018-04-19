import { removeTokenFromUrl } from './libs/url';
import store from 'store';

/* globals window */
// just in case user logs out from a new tab...
window.onfocus = () => {
  isAuthenticated();
}

export function login(location) {
  const token = removeTokenFromUrl(location);
  if (isAuthenticated()) {
    return;
  }
  if (token === undefined) {
    return;
  }
  const [, payload, ] = token.split('.');
  try {
    // Go through URL decoding to properly parse UTF-8 data.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_Unicode_Problem
    const { name, exp } = JSON.parse(decodeURIComponent(escape(atob(payload))));
    store.set('token', token);
    store.set('tokenOwner', name);
    store.set('tokenExpiration', exp);
    window.location.assign(window.location.href);
  } catch (e) {
    console.error(e);
  }

}

export function logout() {
  store.remove('token');
  store.remove('tokenOwner');
  store.remove('tokenExpiration');
  window.location.assign(window.location.href);
}

export function getToken() {
  return store.get('token');
}

export function getTokenOwner() {
  return store.get('tokenOwner');
}

export function isAuthenticated() {
  const now = Date.now()/1000; //toz get in seconds
  const tokenExpiration = store.get('tokenExpiration');
  if (!isFinite(tokenExpiration)) {
    return false;
  }
  if (now < tokenExpiration) {
    return true;
  }
  logout();
  return false;
}
