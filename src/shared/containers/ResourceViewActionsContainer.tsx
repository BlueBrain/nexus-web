import { DownOutlined } from '@ant-design/icons';
import { Context, Resource } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import {
  Button,
  Col,
  Dropdown,
  Form,
  Input,
  Menu,
  Popover,
  Row,
  notification,
} from 'antd';
import { isArray, isString, uniq } from 'lodash';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useSelector } from 'react-redux';
import { Link, generatePath, useHistory, useLocation } from 'react-router-dom';
import {
  Distribution,
  MAX_DATA_SELECTED_SIZE__IN_BYTES,
  MAX_LOCAL_STORAGE_ALLOWED_SIZE,
  TResourceTableData,
  getLocalStorageSize,
  notifyTotalSizeExceeded,
} from '../../shared/molecules/MyDataTable/MyDataTable';
import {
  DATA_PANEL_STORAGE,
  DATA_PANEL_STORAGE_EVENT,
} from '../../shared/organisms/DataPanel/DataPanel';
import {
  removeLocalStorageRows,
  toLocalStorageResources,
} from '../../shared/utils/datapanel';
import { useOrganisationsSubappContext } from '../../subapps/admin';
import Copy from '../components/Copy';
import { RootState } from '../store/reducers';
import { makeResourceUri } from '../utils';

const ResourceViewActionsContainer: FC<{
  resource: Resource;
  latestResource: Resource;
  isLatest: boolean;
  orgLabel: string;
  projectLabel: string;
}> = ({ resource, orgLabel, projectLabel, latestResource, isLatest }) => {
  const nexus = useNexusContext();
  const history = useHistory();
  const location = useLocation();
  const apiEndpoint = useSelector(
    (state: RootState) => state.config.apiEndpoint
  );
  const [isInCart, setIsInCart] = useState(() => false);

  const handleAddToCart = async () => {
    const recordKey = resource._self;

    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    let selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    let selectedRows = dataPanelLS?.selectedRows || [];
    let isRemoved = false;
    if (selectedRows.find(item => item._self === resource._self)) {
      selectedRowKeys = selectedRowKeys.filter(t => t !== recordKey);
      selectedRows = removeLocalStorageRows(selectedRows, [recordKey]);
      isRemoved = true;
    } else {
      const localStorageObjects = toLocalStorageResources(
        resource,
        'resource-view',
        recordKey
      );

      selectedRowKeys = uniq([...selectedRowKeys, recordKey]);
      selectedRows = [...selectedRows, ...localStorageObjects];
    }
    const size = selectedRows.reduce(
      (acc, item) =>
        acc + ((item.distribution as Distribution)?.contentSize || 0),
      0
    );
    if (
      size > MAX_DATA_SELECTED_SIZE__IN_BYTES ||
      getLocalStorageSize() > MAX_LOCAL_STORAGE_ALLOWED_SIZE
    ) {
      return notifyTotalSizeExceeded();
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
      description: isRemoved
        ? 'Resource removed from the data cart'
        : 'Resource added to your cart',
    });
    if (isRemoved) {
      setIsInCart(false);
    } else {
      setIsInCart(true);
    }
  };
  const basePath = useSelector((state: RootState) => state.config.basePath);
  const [tags, setTags] = useState<{
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
  const [view, setView] = useState<Resource | null>(null);
  const subApp = useOrganisationsSubappContext();

  useEffect(() => {
    const encodedResourceId = encodeURIComponent(resource['@id']);
    nexus.Resource.tags(orgLabel, projectLabel, encodedResourceId).then(
      data => {
        setTags(data);
      }
    );
    nexus.Resource.get(orgLabel, projectLabel, encodedResourceId).then(
      resource => {
        const resourceType = resource ? (resource as Resource)['@type'] : null;
        const isView =
          resourceType && isArray(resourceType)
            ? resourceType.includes('View')
            : isString(resourceType)
            ? resourceType === 'View'
            : false;
        if (isView) {
          setView(resource as Resource);
        }
      }
    );
  }, [resource, latestResource]);

  const redirectToQueryTab = useCallback(() => {
    if (view) {
      const base = `/${subApp.namespace}/${orgLabel}/${projectLabel}`;
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

  const revisionMenuItems = useMemo(
    () => (
      <Menu
        items={[...Array(latestResource?._rev).keys()]
          .map(k => k + 1)
          .sort((a, b) => b - a)
          .map(rev => {
            const revision = `Revision ${rev} ${
              revisionLabels(rev).length > 0
                ? revisionLabels(rev).join(', ')
                : ''
            }`;
            return {
              key: rev,
              title: `Revision ${rev}`,
              label: revision,
            };
          })}
        onClick={({ key: rev }) =>
          goToResource(orgLabel, projectLabel, resource['@id'], Number(rev))
        }
      />
    ),
    [resource, latestResource, tags]
  );

  useEffect(() => {
    const dataPanelLS: TResourceTableData = JSON.parse(
      localStorage.getItem(DATA_PANEL_STORAGE)!
    );
    const selectedRowKeys = dataPanelLS?.selectedRowKeys || [];
    if (selectedRowKeys.find(item => item === resource._self)) {
      return setIsInCart(true);
    }
    setIsInCart(false);
    return () => {
      setIsInCart(false);
    };
  }, [resource._self]);

  const { mutate: mutateResourceTag } = useMutation({
    mutationFn: async (tag: string) => {
      try {
        await nexus.httpPost({
          path: `${apiEndpoint}/resources/${orgLabel}/${projectLabel}/_/${encodeURIComponent(
            resource['@id']
          )}/tags?rev=${latestResource._rev}`,
          body: JSON.stringify({
            tag,
            rev: resource._rev,
          }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
      } catch (error) {
        throw error;
      }
    },
  });

  const handleTagResource = ({ tag }: { tag: string }) => {
    if (tag && tag.trim() !== '') {
      mutateResourceTag(tag, {
        onSuccess: () => {
          notification.success({
            message: <strong>Resource Tagging</strong>,
            description: (
              <div>
                <p>
                  Resource identified by <strong>@id: {resource['@id']}</strong>{' '}
                  has been successfully tagged with <strong>{tag}</strong> for
                  the revision <strong>{resource._rev}</strong>.
                </p>
              </div>
            ),
          });
        },
        onError: error => {
          console.log('@@error tagging the resource', error);
          notification.error({
            message: `Resource Tagging`,
            description: (
              <div>
                <p>
                  Tagging the resource of{' '}
                  <strong>@id: {resource['@id']}</strong> with the tag {tag} has
                  been failed.
                </p>
              </div>
            ),
          });
        },
      });
    }
  };

  return (
    <Row gutter={5}>
      <Col>
        <Dropdown dropdownRender={() => revisionMenuItems}>
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
                      resourceId: resource['@id'],
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
                      key="fusion-url"
                      onClick={() => {
                        const pathToResource = `${basePath}${generatePath(
                          '/:orgLabel/:projectLabel/resources/:resourceId',
                          {
                            orgLabel,
                            projectLabel,
                            resourceId: resource['@id'],
                          }
                        )}`;

                        triggerCopy(
                          `${window.location.origin.toString()}${pathToResource}`
                        );
                      }}
                    >
                      Fusion URL
                    </Menu.Item>
                    <Menu.Item
                      key="fusion-url-(with-revision)"
                      onClick={() => {
                        const pathToResource = `${basePath}${generatePath(
                          '/:orgLabel/:projectLabel/resources/:resourceId',
                          {
                            orgLabel,
                            projectLabel,
                            resourceId: resource['@id'],
                          }
                        )}`;

                        triggerCopy(
                          `${window.location.origin.toString()}${pathToResource}?rev=${
                            resource._rev
                          }`
                        );
                      }}
                    >
                      Fusion URL (with revision)
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => triggerCopy(resource['@id'])}
                      key="resource-id"
                    >
                      Resource ID
                    </Menu.Item>
                    <Menu.Item
                      key="resource-id-with-revision"
                      onClick={() =>
                        triggerCopy(`${resource['@id']}?rev=${resource._rev}`)
                      }
                    >
                      Resource ID (with revision)
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => triggerCopy(self ? self : '')}
                      key="nexus-api-endpoint"
                    >
                      Nexus API endpoint
                    </Menu.Item>
                    <Menu.Item
                      key="nexus-api-endpoint-with-revision"
                      onClick={() =>
                        triggerCopy(
                          self
                            ? `${self}?rev=${resource ? resource._rev : ''}`
                            : ''
                        )
                      }
                    >
                      Nexus API endpoint (with revision)
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
        <Button onClick={handleAddToCart}>
          {isInCart ? 'Remove from' : 'Add to'} Cart
        </Button>
      </Col>
      <Col>
        <Popover
          destroyTooltipOnHide
          showArrow={false}
          key={resource._rev}
          trigger={['click']}
          title={
            <div>
              <div style={{ fontSize: 16 }}>Tag Resource</div>
              <i style={{ fontSize: 12 }}>
                The tag will be applied to revision{' '}
                <strong>{resource._rev}</strong>
              </i>
            </div>
          }
          content={
            <Form<{ tag: string }>
              autoComplete="off"
              name="tag-resource-form"
              initialValues={{ tag: '' }}
              onFinish={handleTagResource}
              style={{ width: 300, padding: '8px 8px O' }}
            >
              <Form.Item
                name="tag"
                rules={[
                  {
                    pattern: /^[\x00-\x7F]/,
                    message: 'Tag should include only ASCII characters.',
                  },
                  {
                    max: 64,
                    message: 'Tag should not exceed 64 characters.',
                  },
                  {
                    pattern: /^(?!latest$)/,
                    message:
                      "Please choose a different name, 'latest' is a reserved word.",
                  },
                ]}
                style={{ marginBottom: 8 }}
              >
                <Input placeholder="Resource tag" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                wrapperCol={{ offset: 8, span: 8 }}
                style={{ marginBottom: 0 }}
              >
                <Button type="primary" htmlType="submit">
                  Confirm
                </Button>
              </Form.Item>
            </Form>
          }
        >
          <Button>Tag Resource</Button>
        </Popover>
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
