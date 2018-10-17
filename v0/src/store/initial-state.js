const BASE_URI = window.BASE_URI.startsWith('$') ? 'https://bbp-nexus.epfl.ch/staging' : window.BASE_URI;
const APP_PATH = window.BASE_PATH.startsWith('$') ? '' : window.BASE_PATH;
const API_PATH = `${BASE_URI}/v0`;
const PAGE_SIZE = 20
const { href: appLocation } = window.location;

export default () => {
    return {
        api: API_PATH,
        pageSize: PAGE_SIZE,
        base: BASE_URI,
        appPath: APP_PATH,
        appLocation
    }
}