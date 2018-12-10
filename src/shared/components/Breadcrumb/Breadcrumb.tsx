import * as React from 'react';
import { RootState } from '../../store/reducers';
import { NavLink } from 'react-router-dom';
import routes, { RouteWithData } from '../../routes';
import { connect } from 'react-redux';
import './Breadcrumb.less';
import getBreadcrumbs from './getBreadcrumbs';

export interface Breadcrumb {
  component: JSX.Element;
  path: string;
}

export interface BreadcrumbProps {
  dividerComponent?: React.Component;
  breadcrumbs: Breadcrumb[];
}

export interface BreadcrumbContainerProps {
  dividerComponent?: React.Component;
  state: RootState;
}

const DefaultDividerComponent: React.FunctionComponent<{
  key: string;
}> = props => {
  return (
    <li className="breadcrumb-item" {...props}>
      {<span>{'/'}</span>}
    </li>
  );
};

const BreadcrumbsListComponent: React.FunctionComponent<BreadcrumbProps> = ({
  breadcrumbs,
  dividerComponent,
}) => {
  console.log({ breadcrumbs });
  const DividerComponent = dividerComponent;
  return (
    <ul className="breadcrumb-list">
      {breadcrumbs.map(({ component, path }: Breadcrumb, index: number) => (
        <React.Fragment key={`breadcrumb-list-${index}`}>
          <li
            className={`breadcrumb-item ${
              // disable the page we're currently viewing from being clicked.
              index === breadcrumbs.length - 1 ? '-disabled' : ''
            }`}
            key={`${path}-${index}`}
          >
            <NavLink to={path}>{component}</NavLink>
          </li>
          {!!(index < breadcrumbs.length - 1) && (
            // @ts-ignore
            <DividerComponent key={`divider-${index}`} />
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};

const BreadcrumbsContainer: React.FunctionComponent<
  BreadcrumbContainerProps
> = ({ dividerComponent, state }) => {
  const location = state.router && state.router.location;
  const breadcrumbs = getBreadcrumbs({ location, routes, state });
  return BreadcrumbsListComponent({ breadcrumbs, dividerComponent });
};

const mapStateToProps = (state: RootState) => ({
  state,
});

export default connect(mapStateToProps)(BreadcrumbsContainer);
