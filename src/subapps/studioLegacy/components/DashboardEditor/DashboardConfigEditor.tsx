import * as React from 'react';
import { Input, Form, Tooltip, Button } from 'antd';
import { ResourceList } from '@bbp/nexus-sdk';
import Icon from '@ant-design/icons/lib/components/Icon';
import TextArea from 'antd/lib/input/TextArea';

import DEFAULT_DASHBOARD_VIEW_QUERY from './DefaultDashboardViewQuery';
import SparqlQueryFormInput from '../../../admin/components/ViewForm/SparqlQueryInput';

export type DashboardPayload = {
  description?: string;
  label?: string;
  dataQuery: string;
  plugins?: string[];
};

export type DashboardConfigEditorProps = {
  dashboard?: DashboardPayload;
  onSubmit?(dashboard: DashboardPayload): void;
  viewList?: ResourceList<{}>;
  linkToSparqlQueryEditor?(dataQuery: string): React.ReactElement;
  availablePlugins?: string[];
};

const dashboardSPARQLDocumentationURL =
  'https://github.com/BlueBrain/nexus-web/blob/master/docs/studio/Dashboards.md#sparql-query-requirements';

const DashboardConfigEditorComponent: React.FunctionComponent<DashboardConfigEditorProps> = ({
  onSubmit,
  dashboard,
  linkToSparqlQueryEditor,
}) => {
  const { description, label, dataQuery, plugins = [] } = dashboard || {};

  const handleOnFinish = (values: {
    description?: string;
    label: string;
    dataQuery: string;
  }) => {
    const { description, label, dataQuery } = values;
    onSubmit &&
      onSubmit({
        description,
        label,
        dataQuery,
      });
  };

  return (
    <Form onFinish={handleOnFinish}>
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="What do you want to call this dashboard?">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
        name="label"
        initialValue={label}
        rules={[
          {
            required: true,
            message: 'Please input a label!',
          },
        ]}
      >
        <Input className="ui-dashboard-label-input" />
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description{' '}
            <Tooltip title="A short description of what's in the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
        name="description"
        initialValue={description}
        rules={[
          {
            required: false,
          },
        ]}
      >
        <TextArea className="ui-dashboard-description-input" />
      </Form.Item>
      <Form.Item
        name="dataQuery"
        label={
          <span>
            Sparql Query{' '}
            <Tooltip title="A query that will return the elements of the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>{' '}
            {linkToSparqlQueryEditor &&
              linkToSparqlQueryEditor(
                dataQuery || DEFAULT_DASHBOARD_VIEW_QUERY
              )}
            {' | '}
            <a href={dashboardSPARQLDocumentationURL} target="_blank">
              Read Docs
            </a>
          </span>
        }
        initialValue={dataQuery || DEFAULT_DASHBOARD_VIEW_QUERY}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <SparqlQueryFormInput />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

export default DashboardConfigEditorComponent;
