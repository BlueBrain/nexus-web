import * as React from 'react';
import { Empty, Pagination, Spin, Button } from 'antd';
import { OrgResponseCommon, OrganizationList } from '@bbp/nexus-sdk';
import { PaginationSettings } from '../../utils/types';
import Search from 'antd/lib/input/Search';
import OrgItem from './OrgItem';
import { AccessControl, useNexus } from '@bbp/react-nexus';
import './Orgs.less';
import { DEFAULT_UI_SETTINGS } from '../../utils/consts';

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
  const [searchValue, setSearchValue] = React.useState<string>();
  const [{ from, size }, setPagination] = React.useState({
    size: pageSize,
    from: 0,
  });

  const { loading, error, data } = useNexus<OrganizationList>(
    nexus =>
      nexus.Organization.list({
        from,
        size,
        label: searchValue,
        deprecated: false,
      }),
    [from, size, searchValue]
  );

  const orgs = (data && data._results) || [];

  const paginationSettings = {
    from,
    total: (data && data._total) || 0,
    pageSize: size,
  };

  const onPaginationChange = (pageNumber: number) => {
    setPagination({
      size,
      from: size * pageNumber - size,
    });
  };

  return (
    <OrgListComponent
      {...{
        orgs,
        loading,
        error,
        onOrgClick,
        onOrgEdit,
        createOrg,
        paginationSettings,
        onPaginationChange,
        searchValue,
        setSearchValue,
      }}
    />
  );
};

export interface OrgListProps {
  orgs: OrgResponseCommon[];
  loading?: boolean;
  error?: Error;
  onOrgClick?(orgLabel: string): void;
  onOrgEdit?(orgLabel: string): void;
  createOrg?(): void;
  paginationSettings: PaginationSettings;
  onPaginationChange?(page: number, pageSize?: number): void;
  searchValue?: string;
  setSearchValue(value: string): void;
}

export const OrgListComponent: React.FunctionComponent<
  OrgListProps
> = props => {
  const {
    orgs,
    loading,
    error,
    onOrgClick,
    onOrgEdit,
    createOrg,
    paginationSettings,
    onPaginationChange,
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
      <div>
        <Spin spinning={loading}>
          <ul className="list">
            {!!error && (
              <Empty
                description={
                  <span>An error happened while retrieving Organizations</span>
                }
              />
            )}
            {!error && !paginationSettings.total && (
              <Empty description="No orgs found">
                <AccessControl permissions={['organizations/create']} path="/">
                  <Button
                    type="primary"
                    onClick={() => !!createOrg && createOrg()}
                    icon="plus-square"
                  >
                    Create Organization
                  </Button>
                </AccessControl>
              </Empty>
            )}
            {!error &&
              orgs.map(({ _label: label, description }) => (
                <OrgItem
                  label={label}
                  description={description}
                  onClick={() => !!onOrgClick && onOrgClick(label)}
                  onEdit={() => !!onOrgEdit && onOrgEdit(label)}
                />
              ))}
            {paginationSettings.total > paginationSettings.pageSize && (
              <Pagination
                simple
                onChange={onPaginationChange}
                current={
                  Math.round(
                    paginationSettings.from / paginationSettings.pageSize
                  ) + 1
                }
                pageSize={paginationSettings.pageSize}
                total={paginationSettings.total}
              />
            )}
          </ul>
        </Spin>
      </div>
    </div>
  );
};

export default OrgsListContainer;
