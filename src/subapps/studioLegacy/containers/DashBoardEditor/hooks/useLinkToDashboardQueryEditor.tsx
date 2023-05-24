import * as React from 'react';
import { Link } from 'react-router-dom';
import { useNexusContext } from '@bbp/react-nexus';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { View } from '@bbp/nexus-sdk';
import { Tooltip } from 'antd';

const useLinkToDashboardQueryEditor = (
  viewId: string,
  orgLabel: string,
  projectLabel: string
) => {
  const dashboardSPARQLDocumentationURL =
    'https://github.com/BlueBrain/nexus-web/blob/master/docs/studio/Dashboards.md#sparql-query-requirements';

  const nexus = useNexusContext();

  const [view, setView] = React.useState<View>();

  React.useEffect(() => {
    nexus.View.get(orgLabel, projectLabel, encodeURIComponent(viewId)).then(
      result => {
        setView(result);
      }
    );
  }, [viewId]);

  const linkQueryEditor = React.useMemo<
    (dataQuery: string) => React.ReactElement
  >(() => {
    return (dataQuery: string) => {
      if (view && view['@type']?.includes('ElasticSearchView')) {
        return (
          <span>
            Elastic Search Query{' '}
            <Tooltip title="A query that will return the elements of the dashboard.">
              <QuestionCircleOutlined />
            </Tooltip>{' '}
            <Link
              to={`/orgs/${orgLabel}/${projectLabel}/${viewId}/_search?query=${encodeURIComponent(
                dataQuery
              )}`}
              target="_blank"
            >
              View query in Elastic Search Query Editor
            </Link>{' '}
            {' | '}
            <a href={dashboardSPARQLDocumentationURL} target="_blank">
              Read Docs
            </a>
          </span>
        );
      }
      return (
        <span>
          Sparql Query{' '}
          <Tooltip title="A query that will return the elements of the dashboard.">
            <QuestionCircleOutlined />
          </Tooltip>{' '}
          <Link
            to={`/orgs/${orgLabel}/${projectLabel}/${viewId}/sparql?query=${encodeURIComponent(
              dataQuery
            )}`}
            target="_blank"
          >
            View query in Sparql Editor
          </Link>{' '}
          {' | '}
          <a href={dashboardSPARQLDocumentationURL} target="_blank">
            Read Docs
          </a>
        </span>
      );
    };
  }, [view]);
  return {
    linkQueryEditor,
    view,
  };
};

export default useLinkToDashboardQueryEditor;
