function isValidUrl(url: string) {
  try {
    return Boolean(new URL(url));
  } catch (e) {
    return false;
  }
}

function easyValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

function isUrlCurieFormat(str: string) {
  if (!str) {
    return false;
  }

  // Regular expression pattern to match CURIE format
  const curiePattern = /^[A-Za-z_][\w\-\.]*:?[\w\-\.]*$/;

  // Test the string against the CURIE pattern
  return curiePattern.test(str);
}

export { easyValidURL, isUrlCurieFormat };
export default isValidUrl;