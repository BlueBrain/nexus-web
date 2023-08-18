import * as React from 'react';
import { ArchivePayload, NexusClient } from '@bbp/nexus-sdk/es';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { getResourceLabel, parseProjectUrl, uuidv4 } from '../../shared/utils';
import { parseURL, ParsedNexusUrl } from '../../shared/utils/nexusParse';
import {
  ShoppingCartOutlined,
  DownloadOutlined,
  CloseCircleFilled,
  WarningFilled,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Drawer,
  Empty,
  List,
  Menu,
  Dropdown,
  Input,
  Tooltip,
  Popconfirm,
} from 'antd';
import { CartContext } from '../hooks/useDataCart';
import ResultPreviewItemContainer from './ResultPreviewItemContainer';
import DefaultResourcePreviewCard from '!!raw-loader!../templates/DefaultResourcePreviewCard.hbs';
import useNotification, { NexusError } from '../hooks/useNotification';

type DownloadResourcePayload = {
  '@type': string;
  resourceId: string;
  project: string;
  path: string;
};

function makePayload(resourcesPayload: DownloadResourcePayload[]) {
  const archiveId = uuidv4();
  const payload: ArchivePayload = {
    archiveId,
    resources: resourcesPayload,
  };
  return { payload, archiveId };
}

async function downloadArchive(
  nexus: NexusClient,
  parsedData: ParsedNexusUrl,
  payload: ArchivePayload,
  archiveId: string,
  setDownloadUrl: React.Dispatch<any>,
  refContainer: React.MutableRefObject<any>,
  format?: 'x-tar' | 'json'
) {
  try {
    await nexus.Archive.create(parsedData.org, parsedData.project, payload);
  } catch {
    // Fail silently. This needs to be fixed in API.
  }
  const archive = await nexus.Archive.get(
    parsedData.org,
    parsedData.project,
    archiveId,
    {
      as: format || 'x-tar',
    }
  );
  const blob =
    !format || format === 'x-tar'
      ? (archive as Blob)
      : new Blob([archive.toString()]);
  const url = window.URL.createObjectURL(blob);
  setDownloadUrl(url);
  refContainer.current.click();
}

const DataCartContainer = () => {
  const nexus = useNexusContext();
  const [downloadUrl, setDownloadUrl] = React.useState<any>(null);
  const [extension, setExtension] = React.useState<string>('tar');
  const refContainer = React.useRef<any>(null);
  const { emptyCart, removeCartItem, length, resources } = React.useContext(
    CartContext
  );
  const notification = useNotification();

  const resourceProjectPaths = React.useMemo(
    () => [
      ...new Set(
        resources?.map(r => {
          const [orgLabel, projectLabel] = parseProjectUrl(r._project);
          return `/${orgLabel}/${projectLabel}`;
        })
      ),
    ],
    [resources]
  );

  const [search, setSearch] = React.useState<string>('');
  const filteredResources = React.useMemo(() => {
    return resources
      ? resources.filter(resource => {
          const label: string = getResourceLabel(resource);
          return label.toLowerCase().includes(search.toLowerCase());
        })
      : [];
  }, [search, resources]);

  const [showShoppingCart, setShowShoppingCart] = React.useState(false);

  const handleToggleCart = () => {
    setShowShoppingCart(!showShoppingCart);
  };

  const handleDrawerClose = () => {
    setShowShoppingCart(false);
  };

  const onRemove = (selfUrl: string) => {
    removeCartItem ? removeCartItem(selfUrl) : null;
  };

  const onEmptyCart = () => {
    emptyCart ? emptyCart() : null;
  };

  const ids = filteredResources
    ? filteredResources
        .map(r => {
          return r['@id'];
        })
        .join(',')
    : '';

  const downLoadFiles = async () => {
    if (filteredResources && filteredResources.length > 0) {
      const parsedData: ParsedNexusUrl = parseURL(filteredResources[0]._self);
      const resourcesPayload = filteredResources
        .filter(r => {
          return r['@type'] === 'File';
        })
        .map(r => {
          const parsedSelf = parseURL(r._self);
          return {
            '@type': 'File',
            resourceId: r['@id'],
            project: `${parsedSelf.org}/${parsedSelf.project}`,
            path: `/${parsedSelf.project}/${parsedSelf.id}`,
          };
        });
      if (resourcesPayload.length === 0) {
        notification.info({
          message: 'There are no downloadable files in the cart.',
        });
        return;
      }
      setExtension('tar');
      const {
        payload,
        archiveId,
      }: { payload: ArchivePayload; archiveId: string } = makePayload(
        resourcesPayload
      );

      try {
        await downloadArchive(
          nexus,
          parsedData,
          payload,
          archiveId,
          setDownloadUrl,
          refContainer
        );
      } catch (ex) {
        notification.error({
          message: `Download failed`,
          description: (ex as NexusError).reason,
        });
      }
    }
  };

  const downLoadAll = async () => {
    if (filteredResources && filteredResources.length > 0) {
      const parsedData: ParsedNexusUrl = parseURL(filteredResources[0]._self);
      const resourcesPayload = filteredResources.map(r => {
        const parsedSelf = parseURL(r._self);
        return {
          '@type': r['@type'] === 'File' ? 'File' : 'Resource',
          resourceId: r['@id'],
          project: `${parsedSelf.org}/${parsedSelf.project}`,
          path: `/${parsedSelf.project}/${parsedSelf.id}`,
        };
      });
      const {
        payload,
        archiveId,
      }: { payload: ArchivePayload; archiveId: string } = makePayload(
        resourcesPayload
      );
      setExtension('tar');
      try {
        await downloadArchive(
          nexus,
          parsedData,
          payload,
          archiveId,
          setDownloadUrl,
          refContainer
        );
      } catch (ex) {
        notification.error({
          message: `Download failed`,
          description: (ex as NexusError).reason,
        });
      }
    }
  };

  const downLoadMetaData = async (): Promise<void> => {
    if (filteredResources && filteredResources.length > 0) {
      const parsedData: ParsedNexusUrl = parseURL(filteredResources[0]._self);
      const resourcesPayload = filteredResources
        .filter(r => {
          return r['@type'] !== 'File';
        })
        .map(r => {
          const parsedSelf = parseURL(r._self);
          return {
            '@type': 'Resource',
            resourceId: r['@id'],
            project: `${parsedSelf.org}/${parsedSelf.project}`,
            path: `/${parsedSelf.project}/${parsedSelf.id}`,
          };
        });
      const {
        payload,
        archiveId,
      }: { payload: ArchivePayload; archiveId: string } = makePayload(
        resourcesPayload
      );
      try {
        await downloadArchive(
          nexus,
          parsedData,
          payload,
          archiveId,
          setDownloadUrl,
          refContainer
        );
      } catch (ex) {
        notification.error({
          message: `Download failed`,
          description: (ex as NexusError).reason,
        });
      }
    }
  };

  const menu = (
    <Menu
      onClick={clicked => {
        clicked.key === 'both'
          ? downLoadAll()
          : clicked.key === 'files'
          ? downLoadFiles()
          : downLoadMetaData();
      }}
    >
      <Menu.Item key="meta-data">Metadata</Menu.Item>
      <Menu.Item key="files">Files</Menu.Item>
      <Menu.Item key="both">Both</Menu.Item>
    </Menu>
  );

  const downloadButton = (disabled: boolean) => {
    const btn = (
      <Button
        style={{
          marginRight: '2px',
        }}
        icon={<DownloadOutlined />}
        disabled={disabled}
      >
        Download
      </Button>
    );

    if (disabled) {
      return (
        <Tooltip title="You don't have the required permissions to create an archive for some resources in your cart. Please contact your project administrator to request to be granted the required archives/write permission.">
          {btn}
        </Tooltip>
      );
    }

    return btn;
  };

  return (
    <>
      <Badge size="small" count={length}>
        <Button
          className="cart"
          icon={<ShoppingCartOutlined />}
          onClick={handleToggleCart}
        ></Button>
      </Badge>
      <a
        href={downloadUrl}
        ref={refContainer}
        download={`data-cart.${extension}`}
        style={{ display: 'none' }}
      >
        download
      </a>
      <Drawer
        width={400}
        title="Data Cart"
        placement="right"
        onClose={handleDrawerClose}
        open={showShoppingCart}
      >
        {length && length > 0 ? (
          <>
            <div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(ids).then(() => {
                    notification.info({
                      message: 'Ids copied to the clipboard',
                    });
                  });
                }}
                style={{
                  marginRight: '2px',
                }}
              >
                {' '}
                Copy IDs
              </Button>
              <AccessControl
                path={resourceProjectPaths}
                permissions={['archives/write']}
                noAccessComponent={() => downloadButton(true)}
                loadingComponent={downloadButton(false)}
              >
                <Dropdown overlay={menu}>{downloadButton(false)}</Dropdown>
              </AccessControl>
              <Button onClick={onEmptyCart}>Empty Cart</Button>
            </div>
            <div
              style={{
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Input.Search
                type="search"
                onChange={e => {
                  setSearch(e.target.value);
                }}
                placeholder="Search cart locally"
                allowClear
              ></Input.Search>
            </div>
            <List
              itemLayout="vertical"
              dataSource={filteredResources}
              renderItem={resource => {
                return (
                  <List.Item>
                    <div className="result-preview-card">
                      <div>
                        <CloseCircleFilled
                          onClick={e => {
                            onRemove(resource._self);
                          }}
                          style={{
                            float: 'right',
                            display: 'block',
                          }}
                        />
                      </div>
                      <ResultPreviewItemContainer
                        resource={resource}
                        defaultPreviewItemTemplate={DefaultResourcePreviewCard}
                      />
                    </div>
                  </List.Item>
                );
              }}
            />
          </>
        ) : (
          <Empty
            description={
              <>
                <p>You don't have any resources in your data cart. </p>
                <p>Try to add one using the Search interface</p>
              </>
            }
          ></Empty>
        )}
      </Drawer>
    </>
  );
};

const FallbackCart: React.FC<{ resetErrorState?: () => void }> = ({
  resetErrorState,
}) => {
  const { emptyCart } = React.useContext(CartContext);
  return (
    <Popconfirm
      title="An error has occurred and the data cart is unavailable. Do you want to try re-initializing the cart?"
      icon={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
      onConfirm={() => {
        if (!emptyCart) return;
        emptyCart().then(() => resetErrorState && resetErrorState());
      }}
      okText="Yes"
      cancelText="No"
    >
      <Badge
        size="small"
        count={<WarningFilled style={{ color: '#f5222d' }} />}
      >
        <Button className="cart" icon={<ShoppingCartOutlined />}></Button>
      </Badge>
    </Popconfirm>
  );
};

export { FallbackCart };

export default DataCartContainer;
