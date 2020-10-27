import * as React from 'react';
import SubApps, { SubAppObject, SubApp } from '../../subapps/index';
import { RootState } from '../store/reducers';
import { useSelector } from 'react-redux';

function addExternalSubApps(
  subApps: Map<string, SubAppObject>,
  eSubbApps: ExternalSubApp[]
) {
  const icon = require('../images/gridIcon.svg');
  if (eSubbApps) {
    for (let i = 0; i < eSubbApps.length; i += 1) {
      const y = {
        icon,
        namespace: eSubbApps[i].title,
        routes: [],
        subAppType: 'external',
        ...eSubbApps[i],
      };
      subApps.set(y.title, y);
    }
  }
  return subApps;
}

type ExternalSubApp = {
  title: string;
  url: string;
};

const useSubApps = () => {
  // Invoke SubApps
  const subApps = Array.from(SubApps.values()).reduce(
    (memo: Map<string, SubAppObject>, subApp: SubApp) => {
      const app = subApp();
      memo.set(app.namespace, app);
      return memo;
    },
    new Map()
  );

  const [subAppsState, setSubAppsState] = React.useState<
    Map<string, SubAppObject>
  >(subApps);

  const [subAppError, setSubAppError] = React.useState<Error>();

  const subAppsManifestPath =
    useSelector((state: RootState) => state.config.subAppsManifestPath) || [];
  const abortController = new AbortController();
  React.useEffect(() => {
    if (subAppsManifestPath) {
      fetch(`${subAppsManifestPath as string}/manifest.json`, {
        signal: abortController.signal,
      })
        .then(resp => resp.json())
        .then(manifest => {
          const externalSubApps = manifest['subapps'] as ExternalSubApp[];
          const subApps = new Map(
            addExternalSubApps(subAppsState, externalSubApps)
          );
          setSubAppsState(subApps);
        })
        .catch(error => {
          setSubAppError(error);
        });
    }
  }, []);

  const subAppRoutes = Array.from(subApps.values())
    .map((subApp: SubAppObject) => {
      return subApp.routes.map((route: any) => {
        route.path = `/${subApp.namespace}${route.path}`;
        return route;
      });
    })
    .reduce((acc, val) => {
      return [...acc, ...val];
    }, []);

  const subAppProps = React.useMemo(() => {
    return Array.from(subAppsState.values()).map(subApp => ({
      label: subApp.title,
      key: subApp.title,
      subAppType: subApp.subAppType,
      url: subApp.url,
      route: `/${subApp.namespace}`,
      icon: subApp.icon,
    }));
  }, [subAppsState]);

  return [subAppProps, subAppRoutes];
};

export default useSubApps;
