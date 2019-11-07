import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';

import routes from '../routes';
import { RootState } from '../store/reducers';

export type PathOptions = {
  orgLabel?: string;
  projectLabel?: string;
  resourceId?: string;
  viewId?: string;
  [key: string]: any;
};

const useLinks = () => {
  const history = useHistory();
  const basePath = useSelector((state: RootState) => state.config.basePath);

  const makeUriFromPathOptions = (
    viewName: string,
    pathOptions: PathOptions
  ) => {
    const view = routes.find(route => route.name === viewName);
    if (!view) {
      return;
    }
    const path = Object.keys(pathOptions).reduce((path, key) => {
      return path.replace(`:${key}`, encodeURIComponent(pathOptions[key]));
    }, `${basePath}${(view.path as string) || ''}`);
    return path;
  };

  const goTo = (viewName: string, pathOptions: PathOptions) => {
    const path = makeUriFromPathOptions(viewName, pathOptions);
    if (path) {
      return history.push(path);
    }
  };

  return {
    makeUriFromPathOptions,
    goTo,
  };
};

export default useLinks;
