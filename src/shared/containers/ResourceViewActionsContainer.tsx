import { DownOutlined } from '@ant-design/icons';
import { Context, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Col, Dropdown, Menu, Row } from 'antd';
import * as React from 'react';
import { generatePath, useHistory, useLocation } from 'react-router-dom';
import Copy from '../components/Copy';
import { CartContext } from '../hooks/useDataCart';
import { makeResourceUri } from '../utils';
import { useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import { useAdminSubappContext } from '../../subapps/admin';
import { intersection as intersect } from 'lodash';


const ResourceViewActionsContainer: React.FC<{
  resource: Resource;
  latestResource: Resource;
  isLatest: boolean;
  orgLabel: string;
  projectLabel: string;
}> = ({ resource, orgLabel, projectLabel, latestResource, isLatest }) => {
  const encodedResourceId = encodeURIComponent(resource['@id']);
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const { addResourceToCart } = React.useContext(CartContext);

  const handleAddToCart = async () => {
    addResourceToCart ? await addResourceToCart(resource as Resource) : null;
  };

  const basePath = useSelector((state: RootState) => state.config.basePath);

  const [tags, setTags] = React.useState<{
    '@context'?: Context;
    tags: {
      rev: number;
      tag: string;
    }[];
  }>();

  const revisionTags = (revision: number) => {
    if (tags?.tags) {
      return tags?.tags.filter(t => t.rev === revision).map(t => t.tag);
    }
    return [];
  };
  const [view, setView] = React.useState<Resource | null>(null);
  const subapp = useAdminSubappContext();
  React.useEffect(() => {
    nexus.Resource.tags(orgLabel, projectLabel, encodedResourceId).then(
      data => {
        setTags(data);
      }
    );
    nexus.Resource.get(orgLabel, projectLabel, encodedResourceId).then(resource => {
      // @ts-ignore
      if(resource && resource['@type'].includes('View')){
        // @ts-ignore
        setView(resource);
      }
    });
  }, [resource, latestResource]);

  const redirectToQueryTab = React.useCallback(() => {
    if(view){
      const base = `/${subapp.namespace}/${orgLabel}/${projectLabel}`;
      const href = `${base}/query/${encodeURIComponent(view['@id'])}?from=browse`;
      return href;
    }
    return;
  }, [view]);

  const self = resource._self;

  const goToResource = (
    orgLabel: string,
    projectLabel: string,
    resourceId: string,
    revision?: number
  ) => {
    history.push(
      makeResourceUri(orgLabel, projectLabel, resourceId, { revision }),
      location.state
    );
  };

  const revisionLabels = (revision: number) => {
    const labels = [];
    if (latestResource?._rev === revision) {
      labels.push('latest');
    }
    labels.push(...revisionTags(revision));

    return labels;
  };

  const revisionMenuItems = React.useMemo(
    () => (
      <Menu>
        {[...Array(latestResource?._rev).keys()]
          .map(k => k + 1)
          .sort((a, b) => b - a)
          .map(rev => (
            <Menu.Item
              key={rev}
              onClick={() => {
                goToResource(orgLabel, projectLabel, encodedResourceId, rev);
              }}
            >
              Revision {rev}
              {revisionLabels(rev).length > 0 &&
                ` (${revisionLabels(rev).join(', ')})`}
            </Menu.Item>
          ))}
      </Menu>
    ),
    [resource, latestResource, tags]
  );

  return (
    <Row>
      <Col>
        <Dropdown overlay={revisionMenuItems}>
          <Button>
            Revision {resource._rev}{' '}
            {revisionLabels(resource._rev).length > 0 &&
              ` (${revisionLabels(resource._rev).join(', ')})`}
            <DownOutlined />
          </Button>
        </Dropdown>
      </Col>
      <Col>
        <Copy
          render={(copySuccess, triggerCopy) => {
            return (
              <Dropdown.Button
                onClick={() => {
                  const pathToResource = `${basePath}${generatePath(
                    '/:orgLabel/:projectLabel/resources/:resourceId',
                    {
                      orgLabel,
                      projectLabel,
                      resourceId: encodedResourceId,
                    }
                  )}`;

                  if (!isLatest) {
                    triggerCopy(
                      `${window.location.origin.toString()}${pathToResource}?rev=${
                        resource._rev
                      }`
                    );
                  } else {
                    triggerCopy(
                      `${window.location.origin.toString()}${pathToResource}`
                    );
                  }
                }}
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() => {
                        const pathToResource = `${basePath}${generatePath(
                          '/:orgLabel/:projectLabel/resources/:resourceId',
                          {
                            orgLabel,
                            projectLabel,
                            resourceId: encodedResourceId,
                          }
                        )}`;

                        triggerCopy(
                          `${window.location.origin.toString()}${pathToResource}`
                        );
                      }}
                    >
                      URL
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        const pathToResource = `${basePath}${generatePath(
                          '/:orgLabel/:projectLabel/resources/:resourceId',
                          {
                            orgLabel,
                            projectLabel,
                            resourceId: encodedResourceId,
                          }
                        )}`;

                        triggerCopy(
                          `${window.location.origin.toString()}${pathToResource}?rev=${
                            resource._rev
                          }`
                        );
                      }}
                    >
                      URL (with revision)
                    </Menu.Item>
                    <Menu.Item onClick={() => triggerCopy(resource['@id'])}>
                      ID
                    </Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        triggerCopy(`${resource['@id']}?rev=${resource._rev}`)
                      }
                    >
                      ID (with revision)
                    </Menu.Item>
                    <Menu.Item onClick={() => triggerCopy(self ? self : '')}>
                      Nexus address
                    </Menu.Item>
                    <Menu.Item
                      onClick={() =>
                        triggerCopy(
                          self
                            ? `${self}?rev=${resource ? resource._rev : ''}`
                            : ''
                        )
                      }
                    >
                      Nexus address (with revision)
                    </Menu.Item>
                  </Menu>
                }
              >
                {copySuccess ? 'Copied!' : 'Copy'}
              </Dropdown.Button>
            );
          }}
        ></Copy>
      </Col>
      <Col>
        <Button onClick={handleAddToCart}>Add to Cart</Button>
      </Col>
      {
        view && <Col>
          <Button
            href={redirectToQueryTab()}
          >
            Query the View
          </Button>
        </Col>
      }
    </Row>
  );
};

export default ResourceViewActionsContainer;
