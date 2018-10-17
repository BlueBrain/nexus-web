import createHistory from 'history/createBrowserHistory'

const APP_PATH = window.BASE_PATH.startsWith('$') ? '' : window.BASE_PATH;
const history = createHistory({ basename: APP_PATH })

export default history;