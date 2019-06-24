import * as React from 'react';
import { Project } from '@bbp/nexus-sdk-legacy';
import NavigationMenuComponent from './Component';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { fetchOrg } from '../../store/actions/nexus/activeOrg';

interface MenuProps {
  render: (
    visible: boolean,
    toggleVisibility: () => void
  ) => React.ReactElement<any>;
}

const NavMenuContainer: React.FunctionComponent<MenuProps> = props => {
  const { render } = props;
  const dispatch = useDispatch();

  const goToProject = (orgLabel: string, projectLabel: string) =>
    dispatch(push(`/${orgLabel}/${projectLabel}`));
  const activateOrg = (orgLabel: string) => dispatch(fetchOrg(orgLabel));

  return (
    <NavigationMenuComponent
      {...{
        render,
        goToProject,
        activateOrg,
      }}
    />
  );
};

export default NavMenuContainer;
