import * as React from 'react';
import { Spin } from 'antd';
import { OrgResponseCommon, OrganizationList } from '@bbp/nexus-sdk';
import { PaginatedList } from '../../utils/types';
import Search from 'antd/lib/input/Search';
import OrgItem from './OrgItem';
import { AccessControl, useNexus } from '@bbp/react-nexus';
import './Orgs.less';
import { DEFAULT_UI_SETTINGS } from '../../utils/consts';
import InfiniteScroll from '../Animations/InfiniteScroll';
import { FetchableState } from '../../store/reducers/utils';

export interface OrgListContainerProps {
  pageSize?: number;
  onOrgClick?(orgLabel: string): void;
  onOrgEdit?(orgLabel: string): void;
  createOrg?(): void;
}

export const OrgsListContainer: React.FunctionComponent<
  OrgListContainerProps
> = props => {
  const {
    pageSize = DEFAULT_UI_SETTINGS.pageSizes.orgsListPageSize,
    onOrgClick,
    onOrgEdit,
    createOrg,
  } = props;
  const [{ from, size, label, deprecated }, setQuery] = React.useState({
    size: pageSize,
    from: 0,
    label: '',
    deprecated: false,
  });
  const [fetchablePaginatedList, setPaginatedList] = React.useState<
    FetchableState<PaginatedList<OrgResponseCommon>>
  >({
    error: null,
    isFetching: true,
    data: {
      index: from,
      total: 0,
      results: [],
    },
  });

  const { loading, error, data } = useNexus<OrganizationList>(
    nexus =>
      nexus.Organization.list({
        from,
        size,
        label,
        deprecated,
      }),
    [from, size, label, deprecated]
  );

  React.useEffect(() => {
    setPaginatedList({
      error,
      isFetching: loading,
      data: {
        index: from,
        total: (data && data._total) || 0,
        results: (data && data._results) || [],
      },
    });
  }, [loading, error, data]);

  const onLoadMore = () => {
    setQuery({
      label,
      deprecated,
      size,
      from: from + size,
    });
  };

  const setSearchValue = (value: string) => {
    setQuery({
      deprecated,
      size,
      label: value,
      from: 0,
    });
  };

  return (
    <OrgListComponent
      {...{
        fetchablePaginatedList,
        onOrgClick,
        onOrgEdit,
        createOrg,
        onLoadMore,
        setSearchValue,
        searchValue: label,
      }}
    />
  );
};

export interface OrgListProps {
  onOrgClick?(orgLabel: string): void;
  onOrgEdit?(orgLabel: string): void;
  createOrg?(): void;
  fetchablePaginatedList: FetchableState<PaginatedList<OrgResponseCommon>>;
  onLoadMore(): void;
  searchValue?: string;
  setSearchValue(value: string): void;
}

export const OrgListComponent: React.FunctionComponent<
  OrgListProps
> = props => {
  const {
    onOrgClick,
    onOrgEdit,
    createOrg,
    fetchablePaginatedList,
    onLoadMore,
    searchValue,
    setSearchValue,
  } = props;

  return (
    <div className="org-list">
      <Search
        placeholder={'Find an Org by name...'}
        allowClear={true}
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
        }}
      />
      <InfiniteScroll
        loadNextPage={onLoadMore}
        fetchablePaginatedList={fetchablePaginatedList}
        itemComponent={({ _label: label, description }) => (
          <OrgItem
            label={label}
            description={description}
            onClick={() => !!onOrgClick && onOrgClick(label)}
            onEdit={() => !!onOrgEdit && onOrgEdit(label)}
          />
        )}
      />
    </div>
  );
};

export default OrgsListContainer;
