import { getInstance } from "@bbp/nexus-js-helpers";
import { auth } from "../actions";
import * as types from "./types";

export default {
  fetchInstance,
  fetchInstanceStarted,
  fetchInstanceFulfilled,
  fetchInstanceFailed
};

function fetchInstance() {
  return (dispatch, getState) => {
    let state = getState();
    const {
      pick: { org, domain, schema, ver, instance },
      config: { loginURI }
    } = state;
    const { api } = state.config;
    const { token } = state.auth;
    dispatch(fetchInstanceStarted());
    return getInstance([org, domain, schema, ver, instance], {}, api, token)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(
          `Encountered HTTP error ${
            response.status
          }. Instance info is not available.`
        );
      })
      .then(instance => {
        if (instance === undefined) {
          throw new Error("Instance is not defined");
        }
        dispatch(fetchInstanceFulfilled(instance));
        return fetchIncomingOutgoing(instance.links, token);
      })
      .then(([incoming, outgoing]) => {
        dispatch(
          instanceLinksAdded({
            incoming: incoming.results,
            outgoing: outgoing.results
          })
        );
      })
      .catch(error => {
        console.error(error);
        if (error.message.includes("401")) {
          window.location = loginURI;
        }
        return dispatch(fetchInstanceFailed(error));
      });
  };
}

function fetchIncomingOutgoing(links, access_token) {
  const requestOptions = access_token
    ? { headers: { Authorization: "Bearer " + access_token } }
    : {};
  return Promise.all([
    fetch(links["incoming"] + "?fields=all", requestOptions),
    fetch(links["outgoing"] + "?fields=all", requestOptions)
  ]).then(responses => Promise.all([responses[0].json(), responses[1].json()]));
}

function fetchInstanceStarted() {
  return {
    type: types.FETCH_INSTANCE_STARTED
  };
}

function fetchInstanceFulfilled(data) {
  return {
    type: types.FETCH_INSTANCE_FULFILLED,
    payload: data
  };
}

function fetchInstanceFailed(error) {
  return {
    type: types.FETCH_INSTANCE_FAILED,
    error: error
  };
}

function instanceLinksAdded(data) {
  return {
    type: types.INSTANCE_LINKS_ADDED,
    payload: data
  };
}
