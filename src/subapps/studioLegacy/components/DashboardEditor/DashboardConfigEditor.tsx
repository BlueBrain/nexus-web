import * as React from 'react';
import { Input, Form, Tooltip, Button, Alert } from 'antd';
import { View } from '@bbp/nexus-sdk';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

import DEFAULT_DASHBOARD_VIEW_QUERY, {
  DEFAULT_DASHBOARD_ES_VIEW_QUERY,
} from './DefaultDashboardViewQuery';
import SparqlQueryFormInput from '../../../admin/components/ViewForm/SparqlQueryInput';
import ElasticSearchQueryInput from '../../../admin/components/ViewForm/ElasticSearchQueryInput';

export type DashboardPayload = {
  description?: string;
  label?: string;
  dataQuery: string;
  plugins?: string[];
};

export type DashboardConfigEditorProps = {
  dashboard?: DashboardPayload;
  onSubmit?(dashboard: DashboardPayload): void;
  view?: View;
  linkToSparqlQueryEditor?(dataQuery: string): React.ReactElement;
  availablePlugins?: string[];
};

const DashboardConfigEditorComponent: React.FunctionComponent<DashboardConfigEditorProps> = ({
  onSubmit,
  dashboard,
  linkToSparqlQueryEditor,
  view,
}) => {
  const { description, label, dataQuery, plugins = [] } = dashboard || {};

  const viewType =
    view && view['@type']?.includes('ElasticSearchView') ? 'ES' : 'SPARQL';

  const defaultQuery =
    viewType === 'ES'
      ? DEFAULT_DASHBOARD_ES_VIEW_QUERY
      : DEFAULT_DASHBOARD_VIEW_QUERY;

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
    <Form onFinish={handleOnFinish} layout="vertical">
      <Alert
        message="This dashboard is using an old version of Studio Dashboards. In order to take advantage of the new features of Studio dashboards
      create a new dashboard from scratch."
        type="info"
      />
      <br />
      <Form.Item
        label={
          <span>
            Label{' '}
            <Tooltip title="What do you want to call this dashboard?">
              <QuestionCircleOutlined />
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
              <QuestionCircleOutlined />
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
        noStyle={true}
        name="dataQuery"
        label={
          linkToSparqlQueryEditor &&
          linkToSparqlQueryEditor(dataQuery || defaultQuery)
        }
        initialValue={dataQuery || defaultQuery}
        rules={[
          {
            required: true,
          },
        ]}
      >
        {viewType === 'ES' ? (
          <ElasticSearchQueryInput />
        ) : (
          <SparqlQueryFormInput />
        )}
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
