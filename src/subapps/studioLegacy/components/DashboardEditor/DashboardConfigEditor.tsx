import * as React from 'react';
import { Input, Form, Tooltip, Button } from 'antd';
import { View } from '@bbp/nexus-sdk';
import { QuestionCircleOutlined } from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';

import DEFAULT_DASHBOARD_VIEW_QUERY, {
  DEFAULT_DASHBOARD_ES_VIEW_QUERY,
} from './DefaultDashboardViewQuery';
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

  const defaultQuery =
    view && view['@type']?.includes('ElasticSearchView')
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
