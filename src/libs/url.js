import qs from 'querystring';

/**
 * Get an object with key:value pairs from URL query string.
 *
 * @param {string} querystring
 */
export function getAllUrlParams(querystring) {
  if (querystring.startsWith('?')) {
    querystring = querystring.slice(1);
  }
  return qs.decode(querystring);
}

export function removeTokenFromUrl(location) {
  const [url, paramsString] = location.href.split('?');
  if (paramsString === undefined) {
    return;
  }
  const params = getAllUrlParams(paramsString);
  const { access_token, ...updatedParamsMap } = params;
  let updatedParams = qs.encode(updatedParamsMap);
  updatedParams = updatedParams.length ? `?${updatedParams}` : '';
  const appLocation = `${url}${updatedParams}`;
  window.history.replaceState({}, document.title, appLocation);
  return access_token;
}

export function getParameterByName(url, name) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

