import { DownOutlined } from '@ant-design/icons';
import { Context, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Col, Dropdown, Menu, Row } from 'antd';
import * as React from 'react';
import { generatePath, useHistory, useLocation } from 'react-router-dom';
import { CartContext } from '../hooks/useDataCart';
import { makeResourceUri } from '../utils';
import { triggerCopy } from '../utils/copy';

const ResourceViewActionsContainer: React.FC<{
  resource: Resource;
  orgLabel: string;
  projectLabel: string;
  revision: number;
}> = ({ resource, orgLabel, projectLabel, revision }) => {
  const resourceId = encodeURIComponent(resource['@id']);
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const { addResourceToCart } = React.useContext(CartContext);

  const handleAddToCart = async () => {
    addResourceToCart ? await addResourceToCart(resource as Resource) : null;
  };

  const [latestResource, setLatestResource] = React.useState<Resource>();

  React.useEffect(() => {
    nexus.Resource.get(orgLabel, projectLabel, resourceId).then(d => {
      setLatestResource(d as Resource);
    });
  }, [resource]);

  const isLatest = resource._rev === latestResource?._rev;

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

  React.useEffect(() => {
    nexus.Resource.tags(orgLabel, projectLabel, resourceId).then(data => {
      setTags(data);
    });
  }, [resource, revision]);

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

  return (
    <Row>
      <Col>
        <Dropdown
          overlay={
            <Menu>
              {[...Array(latestResource?._rev).keys()]
                .map(k => k + 1)
                .sort((a, b) => b - a)
                .map(rev => (
                  <Menu.Item
                    key={rev}
                    onClick={() => {
                      goToResource(orgLabel, projectLabel, resourceId, rev);
                    }}
                  >
                    Revision {rev}
                    {revisionLabels(rev).length > 0 &&
                      ` (${revisionLabels(rev).join(', ')})`}
                  </Menu.Item>
                ))}
            </Menu>
          }
        >
          <Button>
            Revision {resource._rev}{' '}
            {revisionLabels(resource._rev).length > 0 &&
              ` (${revisionLabels(resource._rev).join(', ')})`}
            <DownOutlined />
          </Button>
        </Dropdown>
      </Col>
      <Col>
        <Dropdown.Button
          onClick={() => {
            const pathToResource = generatePath(
              '/:orgLabel/:projectLabel/resources/:resourceId',
              {
                orgLabel,
                projectLabel,
                resourceId,
              }
            );

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
                  const pathToResource = generatePath(
                    '/:orgLabel/:projectLabel/resources/:resourceId',
                    {
                      orgLabel,
                      projectLabel,
                      resourceId,
                    }
                  );

                  triggerCopy(
                    `${window.location.origin.toString()}${pathToResource}`
                  );
                }}
              >
                URL
              </Menu.Item>
              <Menu.Item
                onClick={() => {
                  const pathToResource = generatePath(
                    '/:orgLabel/:projectLabel/resources/:resourceId',
                    {
                      orgLabel,
                      projectLabel,
                      resourceId,
                    }
                  );

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
                  triggerCopy(`${resource['@id']}%3Frev=${resource._rev}`)
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
                    self ? `${self}%3Frev=${resource ? resource._rev : ''}` : ''
                  )
                }
              >
                Nexus address (with revision)
              </Menu.Item>
            </Menu>
          }
        >
          Copy
        </Dropdown.Button>
      </Col>
      <Col>
        <Button onClick={handleAddToCart}>Add to Cart</Button>
      </Col>
    </Row>
  );
};

export default ResourceViewActionsContainer;
