import { push } from 'react-router-redux';
import instanceActions from './instance';
import * as types from './types';

const entityKeys = [
  'org',
  'domain',
  'schema',
  'ver',
  'instance'
];

const navigate = url => {
  return (dispatch, getState) => {
    const basename = getState().routing.location.basename || '';
    dispatch(push(`${basename}/${url}`));
  }
}

const goToEntityByID = id => {
  return (dispatch, getState) => {
    let API = getState().config.api;
    const [, entityPath] = id.split(API+'/data/');
    dispatch(navigate(entityPath));
  }
}

const goDown = () => {
  return (dispatch, getState) => {
    const oldRoute = getState().routing.location.pathname;
    const paths = oldRoute.split('/').slice(1);
    // if last element of the path is a version, remove that at
    // the same time we remove the schema part of the path (do two pops, not just one)
    const versionIndex = 4;
    if (paths.length === versionIndex){
        paths.pop()
    }
    paths.pop()
    const newUrl = paths.join('/')
    dispatch(navigate(newUrl));
  }
}

const pickEntity = ({ entity, id }) => {
  return (dispatch, getState) => {
    const oldRoute = getState().routing.location.pathname;
    const paths = oldRoute.split('/').slice(1);
    const indexOfEntity = entityKeys.indexOf(entity);
    let newPaths = [];
    for (let i = 0; i <= indexOfEntity; i++) {
      if (indexOfEntity === i) {
        newPaths.push(id);
      } else if (paths[i]) {
        newPaths.push(paths[i]);
      }
    }
    if (entity === 'schema') {
      let [ schemaId, verId ] = id.split('_');
      newPaths[newPaths.length -1 ] = schemaId;
      newPaths.push(verId);
    }
    const newPath = newPaths.join('/');
    dispatch(navigate(newPath));
  }
}

const reconcileRoutes = () => {
  return (dispatch, getState) => {
    const newPath = getState().routing.location.pathname;
    const entityList = newPath.slice(1, newPath.length).split('/');
    const [ org='', domain='', schema='', ver='', instance='' ] = entityList;
    const oldInstance = getState().pick.instance;
    dispatch({ type: 'ALL_PICK', org, domain, schema, ver, instance });
    // FetchInstance if there is a new one
    // TODO find an async way to do this?
    if (instance && instance !== oldInstance) {
        dispatch(instanceActions.fetchInstance())
    }
  }
}

const fetchListFailed = (error, entity) => {
  error.entity = entity;
  return {
    type: types.FETCH_LIST_FAILED,
    error
  }
}

export default {
  navigate,
  pickEntity,
  goDown,
  reconcileRoutes,
  fetchListFailed,
  goToEntityByID
}
