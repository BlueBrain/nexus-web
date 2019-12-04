import * as React from 'react';
import { Input, Form, Tooltip, Icon, Button, Select } from 'antd';
import { WrappedFormUtils } from 'antd/lib/form/Form';
import { DEFAULT_SPARQL_VIEW_ID, ResourceList } from '@bbp/nexus-sdk';

import { getResourceLabel } from '../../utils';

const { Option } = Select;

export type DashboardPayload = {
  description?: string;
  label: string;
};

export type DashboardAndViewPairing = {
  dashboard: DashboardPayload;
  view: {
    '@id': string;
  };
};

const DashboardConfigEditorComponent: React.FunctionComponent<{
  form: WrappedFormUtils;
  dashboardViewParing?: DashboardAndViewPairing;
  onSubmit?(dashboardViewParing: DashboardAndViewPairing): void;
  viewList?: ResourceList<{}>;
}> = ({
  onSubmit,
  form,
  dashboardViewParing,
  viewList = {
    '@context': {},
    _total: 0,
    _results: [],
  },
}) => {
  const { getFieldDecorator, getFieldsValue, validateFields } = form;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    validateFields(err => {
      if (!err) {
        const { description, label, view } = getFieldsValue() as {
          description?: string;
          label: string;
          view: string;
        };
        onSubmit &&
          onSubmit({
            dashboard: {
              description,
              label,
            },
            view: {
              '@id': view,
            },
          });
      }
    });
  };

  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 14 },
  };

  return (
    <Form {...formItemLayout} onSubmit={handleSubmit}>
      <Form.Item
        label={
          <span>
            Label&nbsp;
            <Tooltip title="What do you want to call this dashboard?">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('label', {
          initialValue: dashboardViewParing
            ? dashboardViewParing.dashboard.label
            : null,
          rules: [
            {
              required: true,
              message: 'Please input a label!',
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            Description&nbsp;
            <Tooltip title="A short description of what's in the dashboard.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('description', {
          initialValue: dashboardViewParing
            ? dashboardViewParing.dashboard.description
            : null,
          rules: [
            {
              required: false,
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item
        label={
          <span>
            View&nbsp;
            <Tooltip title="The view to query against.">
              <Icon type="question-circle-o" />
            </Tooltip>
          </span>
        }
      >
        {getFieldDecorator('view', {
          initialValue: dashboardViewParing
            ? dashboardViewParing.view['@id']
            : DEFAULT_SPARQL_VIEW_ID,
          rules: [{ required: true, message: 'Please select a view!' }],
        })(
          <Select placeholder="Please select a View">
            {viewList._results.map(view => (
              <Option value={view['@id']}>{getResourceLabel(view)}</Option>
            ))}
          </Select>
        )}
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </Form>
  );
};

export default Form.create<{
  form: WrappedFormUtils;
  dashboardViewParing?: DashboardAndViewPairing;
  onSubmit?(dashboardViewParing: DashboardAndViewPairing): void;
  viewList?: ResourceList<{}>;
}>()(DashboardConfigEditorComponent);
