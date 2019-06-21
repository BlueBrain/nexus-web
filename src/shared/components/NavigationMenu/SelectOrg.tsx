import * as React from 'react';
import { NavMenuPageProps } from './Home';
import Search from 'antd/lib/input/Search';
import { Icon, Spin, Empty } from 'antd';
import { Orgs } from '@bbp/react-nexus';
import ListItem from '../Animations/ListItem';
import { OrganizationList } from '@bbp/nexus-sdk';

export const NavMenuOrgsContainer: React.FunctionComponent<
  NavMenuPageProps
> = props => {
  const { path, goTo } = props;
  return (
    <Orgs.List options={{}}>
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
          <NavMenuSelectOrgPage {...{ path, goTo, error, loading, data }} />
        );
      }}
    </Orgs.List>
  );
};

interface NavMenuSelectOrgPageProps extends NavMenuPageProps {
  error: Error;
  loading: boolean;
  data: OrganizationList;
}

export const NavMenuSelectOrgPage: React.FunctionComponent<
  NavMenuSelectOrgPageProps
> = props => {
  const { path, goTo, loading, data } = props;
  return (
    <div>
      <h3>
        <a onClick={() => goTo('/')}>
          <Icon type="arrow-left" />
        </a>{' '}
        Select an Organziation
      </h3>
      <Search></Search>
      <div>
        <Spin spinning={loading}>
          {data && !data._total && <Empty>No Orgs found</Empty>}
          <ul>
            {data &&
              data['_results'].map(({ _label }: { _label: string }) => (
                <ListItem id={_label} label={_label}></ListItem>
              ))}
          </ul>
        </Spin>
      </div>
    </div>
  );
};

export default NavMenuOrgsContainer;
