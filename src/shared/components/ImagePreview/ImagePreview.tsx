import './ImagePreview.scss';

import {
  DownloadOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { NexusClient, NexusFile, Resource } from '@bbp/nexus-sdk/es';
import {
  Alert,
  Button,
  Collapse,
  Dropdown,
  Image,
  Input,
  List,
  Menu,
  Radio,
  RadioChangeEvent,
  Spin,
  Tooltip,
} from 'antd';
import { ListProps } from 'antd/lib/list';
import { isArray, isNil, isObject,orderBy } from 'lodash';
import React, { createRef,useRef, useState } from 'react';
import { useQuery } from 'react-query';

import nexusUrlHardEncode from '../../utils/nexusEncode';
import { parseProjectUrl, parseResourceId } from '../Preview/Preview';

type Props = {
  resource: Resource;
  nexus: NexusClient;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};
type TDataSource = {
  id: string;
  image: string | NexusFile | Blob | FormData;
  imageSrc: string;
  title: string;
  size: string;
  score: number;
  type: string;
};

const { Search } = Input;
const DEFAULT_SORT_OPTION = '-_createdAt';
const DEFAULT_DISPLAY_OPTION = 'list';
const imageDisplayOptions = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
];

const renderFileSize = (contentSize: { value: string; unitCode?: string }) => {
  if (!contentSize) {
    return '-';
  }
  if (contentSize.unitCode) {
    if (contentSize.unitCode.toLocaleLowerCase() === 'kilo bytes') {
      return `${contentSize.value} KB`;
    }
    if (contentSize.unitCode.toLocaleLowerCase() === 'mega bytes') {
      return `${contentSize.value} MB`;
    }
  }
  const sizeInMB = (parseInt(contentSize.value, 10) / 1000000).toFixed(2);
  if (sizeInMB !== '0.00') {
    return `${sizeInMB} MB`;
  }

  return `${contentSize.value} Bytes`;
};

const fetchImageResources = async ({
  nexus,
  resource,
  orgLabel,
  projectLabel,
}: {
  nexus: NexusClient;
  resource: Resource;
  orgLabel: string;
  projectLabel: string;
}) => {
  const images: TDataSource[] = [];
  try {
    if (isArray(resource.distribution)) {
      for (const item of resource.distribution) {
        const contentUrl = item.contentUrl;
        const rawData = await nexus.File.get(
          orgLabel,
          projectLabel,
          parseResourceId(contentUrl),
          { as: 'blob' }
        );
        const blob = new Blob([rawData as string], {
          type: item.encodingFormat,
        });
        const src = URL.createObjectURL(blob);
        images.push({
          id: item.contentUrl,
          image: rawData,
          imageSrc: src,
          title: item.name,
          size: renderFileSize(item.contentSize),
          type: item.encodingFormat,
          score: 1,
        });
      }
      return images;
    }
    if (isObject(resource.distribution)) {
      // @ts-ignore
      const contentUrl = resource.distribution?.contentUrl;
      const rawData = await nexus.File.get(
        orgLabel,
        projectLabel,
        nexusUrlHardEncode(contentUrl),
        { as: 'blob' }
      );
      const blob = new Blob([rawData as string], {
        // @ts-ignore
        type: resource.distribution.encodingFormat,
      });
      const src = URL.createObjectURL(blob);
      images.push({
        // @ts-ignore
        id: resource.distribution.contentUrl,
        image: rawData,
        imageSrc: src,
        // @ts-ignore
        title: resource.distribution.name,
        // @ts-ignore
        size: renderFileSize(resource.distribution.contentSize),
        // @ts-ignore
        type: resource.distribution.encodingFormat,
        score: 1,
      });
      return images;
    }
    return images;
  } catch (error) {
    // @ts-ignore
    throw new Error(`Can not fetch the images list`, { cause: error });
  }
};

function calculateScore(input: string, text: string) {
  const inputSet = new Set(input.toLowerCase().split(/\W+/));
  const phraseSet = new Set(text.toLowerCase().split(/\W+/));

  const intersection = new Set([...inputSet].filter(x => phraseSet.has(x)));
  const contains = [...inputSet].filter(
    x => [...phraseSet].filter(item => item.includes(x)).length
  );
  const union = new Set([...inputSet, ...phraseSet]);
  const score = (10 * intersection.size + contains.length) / union.size;
  return score;
}

function fuzzySearch(input: string, data: TDataSource[], threshold: number) {
  const matches: TDataSource[] = [];

  for (const item of data) {
    const score = calculateScore(input, item.title);

    if (score >= threshold) {
      matches.push({
        ...item,
        score,
      });
    }
  }
  return orderBy(matches, 'score', 'desc');
}

const ImagePreview: React.FC<Props> = ({
  resource,
  nexus,
  collapsed,
  handleCollapseChanged,
}) => {
  const [sortOption, setSortOption] = useState(DEFAULT_SORT_OPTION);
  const [currentListPage, setCurrentListPage] = useState(0);
  const [displayOption, setDisplayOption] = useState(DEFAULT_DISPLAY_OPTION);
  const [dataSource, setDataSource] = useState<TDataSource[]>(() => []);
  const dataSourceRef = useRef<TDataSource[]>([]);
  const [orgLabel, projectLabel] = parseProjectUrl(resource._project);

  const onSearchChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (isNil(e.target.value) || e.target.value === '') {
      return setDataSource(dataSourceRef.current);
    }
    setDataSource(fuzzySearch(e.target.value, dataSource, 0.1));
  };
  const onChangeSort = (option: any) => setSortOption(option.key);
  const onChangeDisplayOption = ({ target: { value } }: RadioChangeEvent) =>
    setDisplayOption(value);

  const sortOptions = (
    <Menu
      onClick={onChangeSort}
      selectedKeys={[sortOption]}
      items={[
        {
          key: '-_createdAt',
          label: 'Newest',
        },
        {
          key: '_createdAt',
          label: 'Oldest',
        },
      ]}
    />
  );

  const type: Partial<ListProps<TDataSource>> =
    displayOption === 'list'
      ? {
          size: 'large',
          pagination: {
            pageSize: 3,
            current: currentListPage,
            onChange: (page: number) => setCurrentListPage(page),
          },
        }
      : {
          grid: { gutter: 16 },
          pagination: {
            pageSize: 6,
            current: currentListPage,
            onChange: (page: number, pageSize?: number) =>
              setCurrentListPage(page),
          },
        };

  const { status, error } = useQuery({
    queryKey: ['image-preview-set', { resource: resource['@id'] }],
    queryFn: () =>
      fetchImageResources({ nexus, resource, orgLabel, projectLabel }),
    onSuccess: data => {
      dataSourceRef.current = data;
      setDataSource(data);
    },
  });
  const downloadImageHandler = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    item: TDataSource
  ) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.style.display = 'none';
    link.download = item.title;
    document.body.appendChild(link);
    link.href = item.imageSrc;
    link.click();
    document.body.removeChild(link);
    // URL.revokeObjectURL(link.href);
  };
  return (
    <div>
      <Collapse
        onChange={handleCollapseChanged}
        activeKey={collapsed ? 'imagePreview' : undefined}
        items={[
          {
            key: 'imagePreview',
            label: 'Image Preview',
            children: (
              <>
                <div className="preview-menu">
                  <Search
                    placeholder="Seach by name"
                    onChange={onSearchChange}
                    allowClear
                  />
                  <Dropdown
                    dropdownRender={() => sortOptions}
                    trigger={['hover', 'click']}
                  >
                    <Tooltip title="Sort resources">
                      <Button
                        ghost
                        type="primary"
                        icon={
                          sortOption === '_createdAt' ? (
                            <SortAscendingOutlined />
                          ) : (
                            <SortDescendingOutlined />
                          )
                        }
                      />
                    </Tooltip>
                  </Dropdown>
                  <Radio.Group
                    options={imageDisplayOptions}
                    onChange={onChangeDisplayOption}
                    value={displayOption}
                    optionType="button"
                    buttonStyle="solid"
                  />
                </div>
                <div
                  className={`preview-content ${
                    displayOption === 'grid' ? 'grid' : 'list'
                  }`}
                >
                  <Spin spinning={status === 'loading'}>
                    {status === 'success' && (
                      <List
                        {...type}
                        dataSource={dataSource}
                        renderItem={item =>
                          displayOption === 'list' ? (
                            <List.Item
                              style={{ flexDirection: 'row-reverse' }}
                              key={`list-${item.id}`}
                              extra={
                                <div style={{ width: '30%' }}>
                                  <Image
                                    src={item.imageSrc}
                                    preview={{ src: item.imageSrc }}
                                  />
                                </div>
                              }
                            >
                              <div className="item-content">
                                <div>{item.title}</div>
                                <div>{item.size}</div>
                                <Button
                                  onClick={e => downloadImageHandler(e, item)}
                                  type="link"
                                  style={{ padding: '4px 0px' }}
                                >
                                  <DownloadOutlined />
                                  Download
                                </Button>
                              </div>
                            </List.Item>
                          ) : (
                            <List.Item key={`grid-${item.id}`}>
                              <div className="image-grid-container">
                                <Image
                                  src={item.imageSrc}
                                  preview={{
                                    src: item.imageSrc,
                                    maskStyle: {
                                      'background-color': 'rgba(0, 0, 0, 0.75)',
                                    },
                                  }}
                                  style={{
                                    maxWidth: '100%',
                                    width: '100%',
                                  }}
                                />
                                <Button
                                  icon={<DownloadOutlined />}
                                  className="download-image-grid"
                                  onClick={e => downloadImageHandler(e, item)}
                                />
                              </div>
                            </List.Item>
                          )
                        }
                      />
                    )}
                    {status === 'error' && (
                      <Alert
                        // @ts-ignore
                        message={error.message}
                        // @ts-ignore
                        description={error.cause.message}
                        type="error"
                      />
                    )}
                  </Spin>
                </div>
              </>
            ),
          },
        ]}
      />
    </div>
  );
};

export default ImagePreview;
