import * as React from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Context, Resource } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Col, Dropdown, Menu, Row, notification } from 'antd';
import { generatePath, Link, useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { has } from 'lodash';
import { CartContext } from '../hooks/useDataCart';
import { makeResourceUri } from '../utils';
import { RootState } from '../store/reducers';
import { useOrganisationsSubappContext } from '../../subapps/admin';
import Copy from '../components/Copy';
import {
  MAX_DATA_SELECTED_ALLOWED_SIZE,
  TResourceTableData, MAX_LOCAL_STORAGE_ALLOWED_SIZE,
  getLocalStorageSize, notifyTotalSizeExeeced
} from '../../shared/molecules/MyDataTable/MyDataTable';
import { DATA_PANEL_STORAGE, DATA_PANEL_STORAGE_EVENT } from '../../shared/organisms/DataPanel/DataPanel';

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
  const [isInCart, setIsInCart] = React.useState(() => false);
  const handleAddToCart = async () => {
    const record = {
      resource,
      key: resource._self,
      _self: resource._self,
      id: resource['@id'],
      name: resource['@id'] ?? resource._self,
      project: resource._project,
      description: '',
      type: resource['@type'],
      createdAt: resource._createdAt,
      updatedAt: resource._updatedAt,
      distribution: has(resource, 'distribution') ? {
        contentSize: (resource.distribution?.contentSize?.value ?? resource.distribution?.contentSize) ?? 0,
        encodingFormat: resource.distribution?.encodingFormat ?? '',
        label: resource.distribution?.name ?? '',
      } : {
        contentSize: resource._bytes ?? 0,
        encodingFormat: resource._mediaType ?? '',
        label: resource._filename ?? '',
      },
      source: 'resource-view',
    }
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];
    let isRemoved = false;
    if (selectedRows.find(item => item._self === resource._self)) {
      selectedRowKeys = selectedRowKeys.filter(t => t !== record._self);
      selectedRows = selectedRows.filter(t => t.key !== record._self);
      isRemoved = true;
    } else {
      selectedRowKeys = [...selectedRowKeys, resource._self];
      selectedRows = [...selectedRows, { ...record, source: 'resource-view' }];
      isRemoved = false;
    }
    const size = selectedRows.reduce(
      (acc, item) => acc + (item.distribution?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_ALLOWED_SIZE ||
      getLocalStorageSize() > MAX_LOCAL_STORAGE_ALLOWED_SIZE
    ) {
      return notifyTotalSizeExeeced();
    }
    localStorage.setItem(
      DATA_PANEL_STORAGE,
      JSON.stringify({
        selectedRowKeys,
        selectedRows,
      })
    );
    window.dispatchEvent(
      new CustomEvent(DATA_PANEL_STORAGE_EVENT, {
        detail: {
          datapanel: { selectedRowKeys, selectedRows },
        },
      })
    );
    notification.success({
      message: <strong>{resource['@id'].split('/').pop()}</strong>,
      description: isRemoved ?
        'Resource removed from the data cart' :
        'Resource added to your cart',
    })
    if (isRemoved) {
      setIsInCart(false);
    } else {
      setIsInCart(true);
    }
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
  const subapp = useOrganisationsSubappContext();
  React.useEffect(() => {
    nexus.Resource.tags(orgLabel, projectLabel, encodedResourceId).then(
      data => {
        setTags(data);
      }
    );
    nexus.Resource.get(orgLabel, projectLabel, encodedResourceId).then(
      resource => {
        // @ts-ignore
        if (resource && resource['@type'].includes('View')) {
          // @ts-ignore
          setView(resource);
        }
      }
    );
  }, [resource, latestResource]);
  const redirectToQueryTab = React.useCallback(() => {
    if (view) {
      const base = `/${subapp.namespace}/${orgLabel}/${projectLabel}`;
      const href = `${base}/query/${encodeURIComponent(view['@id'])}`;
      return href;
    }
    return '';
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
  React.useEffect(() => {
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    console.log('@@test', selectedRowKeys, resource._self);
    if (selectedRowKeys.find(item => item === resource._self)) {
      return setIsInCart(true);
    } else {
      setIsInCart(false)
    }
    return () => {
      setIsInCart(false)
    }
  }, [resource._self])
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
                      `${window.location.origin.toString()}${pathToResource}?rev=${resource._rev
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
                          `${window.location.origin.toString()}${pathToResource}?rev=${resource._rev
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
        <Button onClick={handleAddToCart}>{isInCart ? 'Remove from' : 'Add to'} Cart</Button>
      </Col>
      {view && (
        <Col>
          <Link to={redirectToQueryTab()}>
            <Button>Query the View</Button>
          </Link>
        </Col>
      )}
    </Row>
  );
};

export default ResourceViewActionsContainer;
