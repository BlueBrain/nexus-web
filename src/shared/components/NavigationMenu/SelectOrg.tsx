import * as React from 'react';
import { NavMenuPageProps } from './Home';
import Search from 'antd/lib/input/Search';
import { Icon, Spin, Empty } from 'antd';
import Orgs from '../Nexus/Orgs';
import ListItem from '../Animations/ListItem';
import { OrganizationList } from '@bbp/nexus-sdk';

interface NavMenuOrgsContainerProps extends NavMenuPageProps {
  activateOrg(orgLabel: string): void;
}

export const NavMenuOrgsContainer: React.FunctionComponent<
  NavMenuOrgsContainerProps
> = props => {
  const { path, goTo, activateOrg } = props;
  const [searchValue, setSearchValue] = React.useState<string>();
  return (
    <Orgs.List options={{ label: searchValue }}>
      {({
        data,
        error,
        loading,
      }: {
        loading: boolean;
        error: Error;
        data: OrganizationList;
      }) => {
        return (
          <NavMenuSelectOrgPage
            {...{
              path,
              goTo,
              activateOrg,
              error,
              loading,
              data,
              setSearchValue,
              searchValue,
            }}
          />
        );
      }}
    </Orgs.List>
  );
};

interface NavMenuSelectOrgPageProps extends NavMenuPageProps {
  error: Error;
  loading: boolean;
  data: OrganizationList;
  searchValue?: string;
  setSearchValue(value: string): void;
  activateOrg(orgLabel: string): void;
}

export const NavMenuSelectOrgPage: React.FunctionComponent<
  NavMenuSelectOrgPageProps
> = props => {
  const {
    path,
    goTo,
    setSearchValue,
    searchValue,
    activateOrg,
    loading,
    data,
  } = props;
  return (
    <div className="page -select-org">
      <h3 className="title">
        <a onClick={() => goTo('/')}>
          <Icon type="arrow-left" />
        </a>{' '}
        Select an Organziation
      </h3>
      <Search
        allowClear={true}
        value={searchValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchValue(e.currentTarget.value);
        }}
      />
      <div>
        <Spin spinning={loading}>
          {data && !data._total && <Empty>No Orgs found</Empty>}
          <ul className="list">
            {data &&
              data['_results'].map(({ description, _label }) => (
                <ListItem
                  onClick={() => {
                    activateOrg(_label);
                    goTo(`/selectProject/${_label}`);
                  }}
                  key={_label}
                  id={_label}
                  label={_label}
                  description={description}
                ></ListItem>
              ))}
          </ul>
        </Spin>
      </div>
    </div>
  );
};

export default NavMenuOrgsContainer;
