import {
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  View,
  ViewList,
} from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Col, Row, Select } from 'antd';
import queryString from 'query-string';
import * as React from 'react';
import { useHistory,useLocation, useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';

import useNotification from '../../../shared/hooks/useNotification';
import { getResourceLabel } from '../../../shared/utils';
import { useOrganisationsSubappContext } from '..';
import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';

const { Option } = Select;
const ElasticSearchQueryView: React.FunctionComponent = (): JSX.Element => {
  const subapp = useOrganisationsSubappContext();
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId: string;
  }>();
  const location = useLocation();
  const history = useHistory();
  const notification = useNotification();
  const {
    params: { orgLabel, projectLabel, viewId },
  } = match || {
    params: {
      orgLabel: '',
      projectLabel: '',
      viewId: '',
    },
  };
  const [{ _results: views }, setViews] = React.useState<ViewList>({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const query = queryString.parse(location.search).query;
  const [selectedView, setSelectedView] = React.useState<string>(
    viewId ? decodeURIComponent(viewId) : DEFAULT_ELASTIC_SEARCH_VIEW_ID
  );

  React.useEffect(() => {
    history.replace(
      `/${
        subapp.namespace
      }/${orgLabel}/${projectLabel}/query/${encodeURIComponent(selectedView)}`
    );
  }, [selectedView]);
  const menu = (
    <Row
      gutter={3}
      justify="space-between"
      align="middle"
      style={{ marginBottom: 10 }}
    >
      <Col flex="auto">
        <Select
          value={selectedView as string}
          onChange={v => setSelectedView(v)}
          style={{ width: '100%' }}
          defaultActiveFirstOption={false}
        >
          {[views]
            .flat()
            .filter(
              v =>
                v['@type']?.includes('ElasticSearchView') ||
                v['@type']?.includes('AggregateElasticSearchView')
            )
            .map((view: View, index: number) => {
              return (
                <Option key={index} value={view['@id']}>
                  {getResourceLabel(view)}
                </Option>
              );
            })}
        </Select>
      </Col>
      <Col flex="100px">
        <Link
          to={`/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
            viewId
          )}`}
        >
          <Button>Open View Resource</Button>
        </Link>
      </Col>
    </Row>
  );

  React.useEffect(() => {
    nexus.View.list(orgLabel, projectLabel, { deprecated: false })
      .then(result => {
        setViews(result);
      })
      .catch(error => {
        notification.error({
          message: 'Problem loading Views',
          description: error.message,
        });
      });
  }, [orgLabel, projectLabel]);

  return (
    <>
      <div style={{ paddingLeft: '2em', paddingRight: '2em' }}>{menu}</div>
      <div className="view-view view-container -unconstrained-width">
        <ElasticSearchQueryContainer
          orgLabel={orgLabel}
          projectLabel={projectLabel}
          initialQuery={query ? JSON.parse(`${query}`) : null}
          viewId={encodeURIComponent(selectedView)}
        />
      </div>
    </>
  );
};

export default ElasticSearchQueryView;
