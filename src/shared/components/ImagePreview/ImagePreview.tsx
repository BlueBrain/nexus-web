import React, { useEffect, useState, useRef, useMemo } from 'react';
import { NexusClient, Resource } from '@bbp/nexus-sdk';
import {
  Button,
  Collapse,
  Dropdown,
  Input,
  Menu,
  Radio,
  RadioChangeEvent,
  Tooltip,
  List,
  Image,
} from 'antd';
import { ListProps } from 'antd/lib/list';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { orderBy, isNil } from 'lodash';

import './ImagePreview.less';

type Props = {
  resource: Resource;
  nexus: NexusClient;
  collapsed: boolean;
  handleCollapseChanged: () => void;
};
type TDataSource = {
  id: string;
  image: string;
  title: string;
  size: string;
  score: number;
};

const { Search } = Input;
const DEFAULT_SORT_OPTION = '-_createdAt';
const DEFAULT_DISPLAY_OPTION = 'list';
const imageDisplayOptions = [
  { label: 'Grid', value: 'grid' },
  { label: 'List', value: 'list' },
];

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
  const matches = [];

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

  const onSearchChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (isNil(e.target.value)) {
      return setDataSource(dataSourceRef.current);
    }
    setDataSource(fuzzySearch(e.target.value, dataSource, 0.1));
  };
  const onChangeSort = (option: any) => setSortOption(option.key);
  const onChangeDisplayOption = ({ target: { value } }: RadioChangeEvent) =>
    setDisplayOption(value);

  const sortOptions = (
    <Menu onClick={onChangeSort} selectedKeys={[sortOption]}>
      <Menu.Item key="-_createdAt">Newest</Menu.Item>
      <Menu.Item key="_createdAt">Oldest</Menu.Item>
    </Menu>
  );

  const type: Partial<ListProps<TDataSource>> =
    displayOption === 'list'
      ? {
          size: 'large',
          pagination: {
            pageSize: 3,
            current: currentListPage,
            onChange: (page: number, pageSize?: number | undefined) =>
              setCurrentListPage(page),
          },
        }
      : {
          grid: {
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 4,
            lg: 4,
            xl: 6,
            xxl: 3,
          },
          pagination: {
            pageSize: 6,
            current: currentListPage,
            onChange: (page: number, pageSize?: number) =>
              setCurrentListPage(page),
          },
        };

  useEffect(() => {
    const fetchImageResources = async () => {
      const data: TDataSource[] = [];
      // @ts-ignore
      for (const item of resource.distribution) {
        const response = await fetch(item.contentUrl);
        const blob = await response.blob();
        // @ts-ignore
        data.push({
          image: URL.createObjectURL(blob),
          title: item.name,
          size: `${(item.contentSize.value / 1024).toFixed(2)} mb`,
          score: 1,
        });
      }
      dataSourceRef.current = data;
      setDataSource(data);
    };
    fetchImageResources();
  }, [resource]);
  return (
    <div>
      <Collapse
        onChange={handleCollapseChanged}
        activeKey={collapsed ? 'imagePreview' : undefined}
      >
        <Collapse.Panel header="Image Preview" key="imagePreview">
          <div className="preview-menu">
            <Search
              placeholder="Seach by name"
              onChange={onSearchChange}
              allowClear
            />
            <Dropdown overlay={sortOptions} trigger={['hover', 'click']}>
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
            <List
              {...type}
              dataSource={dataSource}
              renderItem={item =>
                displayOption === 'list' ? (
                  <List.Item
                    style={{ flexDirection: 'row-reverse' }}
                    key={`list-${item.id}`}
                    extra={
                      <Image
                        width={'30%'}
                        src={item.image}
                        preview={{ src: item.image }}
                      />
                    }
                  >
                    <div className="item-content">
                      <div>{item.title}</div>
                      <div>{item.size}</div>
                    </div>
                  </List.Item>
                ) : (
                  <List.Item key={`grid-${item.id}`}>
                    <Image
                      src={item.image}
                      preview={{
                        src: item.image,
                        maskStyle: {
                          'background-color': 'rgba(0, 0, 0, 0.75)',
                        },
                      }}
                    />
                  </List.Item>
                )
              }
            />
          </div>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default ImagePreview;
