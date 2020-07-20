import * as React from 'react';
import { match } from 'react-router';
import { Link } from 'react-router-dom';
import * as queryString from 'query-string';
import { Menu, Dropdown, Icon, notification } from 'antd';
import { ViewList, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ViewStatisticsProgress from '../components/Views/ViewStatisticsProgress';
import SparqlQueryContainer from '../containers/SparqlQuery';
import HomeIcon from '../components/HomeIcon';
import { getResourceLabel, labelOf } from '../utils';

const SparqlQueryView: React.FunctionComponent<{
  match: match<{ orgLabel: string; projectLabel: string; viewId: string }>;
  location: Location;
}> = ({ match, location }): JSX.Element => {
  const {
    params: { orgLabel, projectLabel, viewId },
  } = match;
  const [{ _results: views }, setViews] = React.useState<ViewList>({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const decodedViewId = decodeURIComponent(viewId);
  const query = queryString.parse(location.search).query;

  React.useEffect(() => {
    nexus.View.list(orgLabel, projectLabel)
      .then(setViews)
      .catch(error => {
        notification.error({
          message: 'Problem loading Views',
          description: error.message,
        });
      });
  }, [orgLabel, projectLabel]);

  const menu = (
    <Menu>
      {views.map((view: View, index: number) => {
        const stringifiedViewType = Array.isArray(view['@type'])
          ? view['@type'].join('')
          : view['@type'];
        const pathAppendage = (stringifiedViewType || '')
          .toLowerCase()
          .includes('elastic')
          ? '_search'
          : 'sparql';
        return (
          <Menu.Item key={index}>
            <Link
              to={`/${orgLabel}/${projectLabel}/${encodeURIComponent(
                view['@id']
              )}/${pathAppendage}`}
            >
              {getResourceLabel(view)}
            </Link>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
    <>
      <div className="project-banner no-bg" style={{ marginBottom: 20 }}>
        <div className="label">
          <h1 className="name">
            <span>
              <HomeIcon />
              {' | '}
              <Link to={`/${orgLabel}`}>{orgLabel}</Link>
              {' | '}
              <Link to={`/${orgLabel}/${projectLabel}`}>{projectLabel}</Link>
              {' | '}
            </span>
            <Dropdown overlay={menu}>
              <span>
                {labelOf(decodedViewId)}
                <Icon type="down" />
              </span>
            </Dropdown>{' '}
          </h1>
          <div style={{ marginLeft: 10 }}>
            <ViewStatisticsProgress
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              resourceId={viewId}
            />
          </div>
        </div>
      </div>
      <div className="view-view view-container -unconstrained-width">
        <SparqlQueryContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          initialQuery={Array.isArray(query) ? query.join(',') : query}
          viewId={viewId}
        />
      </div>
    </>
  );
};

export default SparqlQueryView;
