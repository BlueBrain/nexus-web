import * as React from 'react';
import { match } from 'react-router';
import * as queryString from 'query-string';
import { Menu, Dropdown, Icon, notification } from 'antd';
import { ViewList, View } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';

import ViewStatisticsProgress from '../components/Views/ViewStatisticsProgress';
import SparqlQueryContainer from '../containers/SparqlQuery';
import LinkContainer from '../containers/LinkContainer';
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
        const viewName = (stringifiedViewType || '')
          .toLowerCase()
          .includes('elastic')
          ? 'ElasticSearchQueryView'
          : 'SparqlQueryView';
        return (
          <Menu.Item key={index}>
            <LinkContainer
              viewName={viewName}
              pathOptions={{
                orgLabel,
                projectLabel,
                viewId: view['@id'],
              }}
            >
              {getResourceLabel(view)}
            </LinkContainer>
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
              <LinkContainer
                viewName="ProjectsView"
                pathOptions={{
                  orgLabel,
                }}
              >
                {orgLabel}
              </LinkContainer>
              |{' '}
              <LinkContainer
                viewName="ProjectView"
                pathOptions={{
                  orgLabel,
                  projectLabel,
                }}
              >
                {projectLabel}
              </LinkContainer>{' '}
              |{' '}
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
