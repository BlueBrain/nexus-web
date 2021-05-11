import * as React from 'react';
import { ArchivePayload, NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { getResourceLabel, uuidv4 } from '../../shared/utils';
import { parseURL, ParsedNexusUrl } from '../../shared/utils/nexusParse';
import {
  ShoppingCartOutlined,
  DownloadOutlined,
  CloseCircleFilled,
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
  notification,
} from 'antd';
import { CartContext } from '../hooks/useDataCart';
import ResultPreviewItemContainer from '../../subapps/search/containers/ResultPreviewItemContainer';
import DefaultResourcePreviewCard from '!!raw-loader!../../subapps/search/templates/DefaultResourcePreviewCard.hbs';

function makePayload(
  resourcesPayload: { '@type': string; resourceId: string; project: string }[]
) {
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
  const blob = new Blob([
    !format || format === 'x-tar'
      ? archive.toString()
      : JSON.stringify(archive),
  ]);
  const url = window.URL.createObjectURL(blob);
  setDownloadUrl(url);
  refContainer.current.click();
}

const DataCartContainer = () => {
  const nexus = useNexusContext();
  const [downloadUrl, setDownloadUrl] = React.useState<any>(null);
  const [extension, setExtension] = React.useState<string>('.tar.gz');
  const refContainer = React.useRef<any>(null);
  const { emptyCart, removeCartItem, length, resources } = React.useContext(
    CartContext
  );

  const [search, setSearch] = React.useState<string>('');
  const filteredResources = React.useMemo(() => {
    if (search.length <= 2) {
      return resources;
    }
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
          };
        });
      setExtension('tar.gz');
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
        };
      });
      const {
        payload,
        archiveId,
      }: { payload: ArchivePayload; archiveId: string } = makePayload(
        resourcesPayload
      );
      setExtension('tar.gz');
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
        console.log(ex);
        notification.error({
          message: `Download failed`,
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
          };
        });
      const {
        payload,
        archiveId,
      }: { payload: ArchivePayload; archiveId: string } = makePayload(
        resourcesPayload
      );
      setExtension('json');
      try {
        await downloadArchive(
          nexus,
          parsedData,
          payload,
          archiveId,
          setDownloadUrl,
          refContainer,
          'json'
        );
      } catch (ex) {
        console.log(ex);
        notification.error({
          message: `Download failed`,
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

  return (
    <>
      <Badge size="small" count={length}>
        <Button
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
        visible={showShoppingCart}
      >
        {length && length > 0 ? (
          <>
            <div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(ids).then(() => {
                    notification.info({
                      key: '',
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
              <Dropdown overlay={menu}>
                <Button
                  style={{
                    marginRight: '2px',
                  }}
                  icon={<DownloadOutlined />}
                >
                  Download
                </Button>
              </Dropdown>
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
                onSearch={e => {
                  setSearch(e);
                }}
                placeholder="Search cart locally"
                allowClear
                enterButton
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

export default DataCartContainer;
