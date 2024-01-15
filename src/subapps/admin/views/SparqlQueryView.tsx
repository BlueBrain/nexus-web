import { useEffect, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { Button, Col, Row, Select } from 'antd';
import { Link } from 'react-router-dom';
import { ViewList, DEFAULT_SPARQL_VIEW_ID, View } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import queryString from 'query-string';
import { useOrganisationsSubappContext } from '..';
import SparqlQueryContainer from '../containers/SparqlQuery';
import { getResourceLabel } from 'shared/utils';
import useNotification from 'shared/hooks/useNotification';

const { Option } = Select;
const SparqlQueryView: React.FunctionComponent = (): JSX.Element => {
  const match = useRouteMatch<{
    orgLabel: string;
    projectLabel: string;
    viewId: string;
  }>();
  const location = useLocation();
  const history = useHistory();
  const subapp = useOrganisationsSubappContext();
  const notification = useNotification();
  const {
    params: { orgLabel, projectLabel, viewId },
  } = match;

  const [{ _results: views }, setViews] = useState<ViewList>({
    '@context': {},
    _total: 0,
    _results: [],
  });
  const nexus = useNexusContext();
  const query = queryString.parse(location.search).query;
  const [selectedView, setSelectedView] = useState<string>(
    viewId ? decodeURIComponent(viewId) : DEFAULT_SPARQL_VIEW_ID
  );

  const onSelectView = (view: string) => {
    console.log('@@view', view);
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
          onChange={onSelectView}
          style={{ width: '100%' }}
          defaultActiveFirstOption={false}
          defaultValue={selectedView}
        >
          {[views]
            .flat()
            .filter(
              v =>
                v['@type']?.includes('SparqlView') ||
                v['@type']?.includes('AggregateSparqlView')
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
      <SparqlQueryContainer
        orgLabel={orgLabel}
        projectLabel={projectLabel}
        initialQuery={Array.isArray(query) ? query.join(',') : query}
        viewId={encodeURIComponent(selectedView)}
      />
    </>
  );
};

export default SparqlQueryView;
