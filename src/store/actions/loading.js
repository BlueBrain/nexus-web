import * as types from './types';

export default {
  startListeningToRequests,
}

const wrapFetch = (requestMade, requestResolved) => {
  const fetch = global.fetch
  global.fetch = function () {
    const args = arguments
    return new Promise((resolve, reject) => {
      requestMade()
      fetch(...args)
        .then(response => {
          requestResolved()
          resolve(response)
        })
        .catch(error => {
          requestResolved()
          reject(error)
        })
    })
  }
}

function startListeningToRequests() {
  return dispatch => {
    wrapFetch(() => dispatch(requestMade()), () => dispatch(requestResolved()));
  }
}

function requestMade() {
  return {
    type: types.REQUEST_MADE,
  }
}

function requestResolved() {
  return {
    type: types.REQUEST_RESOLVED,
  }
}
