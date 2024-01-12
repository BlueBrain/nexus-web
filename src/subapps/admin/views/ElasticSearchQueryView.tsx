import { useEffect, useState, FC } from 'react';
import { useRouteMatch, useLocation, useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import {
  ViewList,
  DEFAULT_ELASTIC_SEARCH_VIEW_ID,
  View,
} from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import { Button, Col, Row, Select } from 'antd';
import queryString from 'query-string';

import { useOrganisationsSubappContext } from '..';
import { getResourceLabel } from 'shared/utils';
import useNotification from 'shared/hooks/useNotification';
import ElasticSearchQueryContainer from '../containers/ElasticSearchQuery';

const { Option } = Select;

const ElasticSearchQueryView: FC = (): JSX.Element => {
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
  const [{ _results: views }, setViews] = useState<ViewList>({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const query = queryString.parse(location.search).query;
  const [selectedView, setSelectedView] = useState<string>(
    viewId ? decodeURIComponent(viewId) : DEFAULT_ELASTIC_SEARCH_VIEW_ID
  );

  const onViewChange = (view: string) => {
    setSelectedView(view);
    history.replace(
      `/${
        subapp.namespace
      }/${orgLabel}/${projectLabel}/query/${encodeURIComponent(view)}`
    );
  };

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
          onChange={onViewChange}
          style={{ width: '100%' }}
          defaultActiveFirstOption={false}
          defaultValue={selectedView}
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

  useEffect(() => {
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
      {menu}
      <ElasticSearchQueryContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        initialQuery={query ? JSON.parse(`${query}`) : null}
        viewId={encodeURIComponent(selectedView)}
      />
    </>
  );
};

export default ElasticSearchQueryView;
