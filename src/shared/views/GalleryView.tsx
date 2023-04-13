import { Route, useLocation, useHistory } from 'react-router-dom';
import { Location } from 'history';
import * as React from 'react';
import { message, Drawer } from 'antd';
import ResourceViewContainer from '../containers/ResourceViewContainer';
import { useNexusContext } from '@bbp/react-nexus';
import { Resource } from '@bbp/nexus-sdk';
import { parseProjectUrl } from '../utils';
import './GalleryView.less';

const getUrlParameter = (name: string) => {
  const filteredName = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  const regex = new RegExp(`[\\?&]${filteredName}=([^&#]*)`);
  const results = regex.exec(window.location.search);
  return results === null ? '' : results[1].replace(/\+/g, ' ');
};

const GalleryView: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const nexus = useNexusContext();

  const [drawerVisible, setDrawerVisible] = React.useState<boolean>(true);

  // The following provides the logic
  // To search for a self url using
  // a query param from any app path
  const self = getUrlParameter('_self');
  if (self && self !== '') {
    nexus
      .httpGet({
        path: self,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
        // We use history.replace here
        // to replace the /?_self history
        // with our resolved resource
        // otherwise if we hit the back button
        // we would never be able to go back to
        // whatever url was before the /?_self query
        history.replace(
          `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
            resource['@id']
          )}`,
          location.state || {}
        );
      })
      .catch((error: any) => {
        message.error(`Resource ${self} could not be found`);
      });
  }

  // This piece of state is set when one of the
  // gallery links is clicked. The `background` state
  // is the location that we were at when one of
  // the gallery links was clicked. If it's there,
  // use it as the location for the <Switch> so
  // we show the gallery in the background, behind
  // the modal.
  const background =
    location.state && (location.state as { background?: Location }).background;

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  /* custom logic for hiding drawer component when clicking outside of it */
  React.useEffect(() => {
    const handleClickOutsideWrapper = (event: Event) => {
      if (wrapperRef.current) {
        const currentWrapperRef = wrapperRef.current;
        // @ts-ignore
        if (event.target && event.target.closest('.ListItem')) {
          return;
        }
        if (
          (event.target &&
            !currentWrapperRef.contains(event.target as Node) &&
            // @ts-ignore
            event.target.closest('#app')) ||
          // @ts-ignore
          event.target.closest('.ant-drawer-close')
        ) {
          // @ts-ignore
          history.push(`${background.pathname}${background.search}`, {
            refresh: true,
          });
          setDrawerVisible(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutsideWrapper);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideWrapper);
    };
  }, [wrapperRef, background]);

  React.useEffect(() => {
    setDrawerVisible(true);
  }, [location]);

  // This is where special routes should go
  // that are placed inside a modal
  // when the background state is provided
  return (
    <>
      {background && (
        <Drawer
          className="gallery-drawer"
          maskClosable={false}
          destroyOnClose={false}
          visible={drawerVisible}
          width="" // intentionally blank, specified in css
        >
          <Route
            key="resource-modal"
            path={'/:orgLabel/:projectLabel/resources/:resourceId'}
            render={() => (
              <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
                <ResourceViewContainer />
              </div>
            )}
          />
        </Drawer>
      )}
    </>
  );
};

export default GalleryView;
