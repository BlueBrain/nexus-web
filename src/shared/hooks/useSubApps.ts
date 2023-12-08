import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import SubApps, { SubApp, SubAppObject } from '../../subapps/index';
import { RootState } from '../store/reducers';

async function addExternalSubApps(subApps: Map<string, SubAppObject>, eSubbApps: ExternalSubApp[]) {
  const defaultIcon = (await import('../images/noteIcon.svg')).default;
  eSubbApps.forEach((e) => {
    subApps.set(e.title, {
      icon: e.icon ? e.icon : defaultIcon,
      description: e.description,
      namespace: e.title,
      routes: [],
      subAppType: 'external',
      ...e,
    });
  });
  return subApps;
}

type ExternalSubApp = {
  title: string;
  url: string;
  icon?: string;
  description?: string;
};

const useSubApps = () => {
  const subAppsManifestPath =
    useSelector((state: RootState) => state.config.subAppsManifestPath) || [];
  const [subAppError, setSubAppError] = useState<Error>();
  const apps: Map<string, SubAppObject> = Array.from(SubApps.values()).reduce(
    (memo: Map<string, SubAppObject>, subApp: SubApp) => {
      const app = subApp();
      memo.set(app.namespace, app);
      return memo;
    },
    new Map()
  );

  const [subAppsState, setSubAppsState] = useState<Map<string, SubAppObject>>(apps);

  const abortController = new AbortController();

  useEffect(() => {
    if (subAppsManifestPath) {
      fetch(`${subAppsManifestPath as string}/manifest.json`, {
        signal: abortController.signal,
      })
        .then((resp) => resp.json())
        .then((manifest) => {
          let apps: Map<string, SubAppObject> = Array.from(SubApps.values()).reduce(
            (memo: Map<string, SubAppObject>, subApp: SubApp) => {
              const app = subApp();
              memo.set(app.namespace, app);
              return memo;
            },
            new Map()
          );
          const externalSubApps = manifest.subapps as ExternalSubApp[];

          if (manifest.disabled && manifest.disabled.length > 0) {
            const disabledSubApps = manifest.disabled.map(
              (subApp: { title: string }) => subApp.title
            );

            const enabledApps = new Map([...apps].filter(([k, v]) => !disabledSubApps.includes(k)));

            apps = enabledApps;
          }

          const subApps = new Map(addExternalSubApps(apps, externalSubApps));

          setSubAppsState(subApps);
        })
        .catch((error) => {
          setSubAppError(error);
        });
    }
  }, []);

  const subAppRoutes = useMemo(() => {
    return Array.from(subAppsState.values())
      .map((subApp: SubAppObject) => {
        return subApp.routes.map((route: any) => {
          if (Array.isArray(route.path)) {
            route.path = route.path.map((p: string) => `/${subApp.namespace}${p}`);
          } else {
            route.path = `/${subApp.namespace}${route.path}`;
          }

          route.requireLogin = subApp.requireLogin;
          return route;
        });
      })
      .reduce((acc, val) => {
        return [...acc, ...val];
      }, []);
  }, [subAppsState]);

  const subAppProps = useMemo(() => {
    return Array.from(subAppsState.values()).map((subApp) => ({
      label: subApp.title,
      key: subApp.title,
      subAppType: subApp.subAppType,
      url: subApp.url,
      route: `/${subApp.namespace}`,
      icon: subApp.icon,
      requireLogin: subApp.requireLogin,
      description: subApp.description,
      version: subApp.version,
    }));
  }, [subAppsState]);
  return {
    subAppProps,
    subAppRoutes,
    subAppError,
  };
};

export default useSubApps;
