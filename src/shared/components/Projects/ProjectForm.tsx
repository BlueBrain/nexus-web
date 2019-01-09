import * as React from 'react';
import { Form, Icon, Input, Button, Checkbox } from 'antd';

export interface ProjectFormProps {}

const ProjectForm: React.FunctionComponent<ProjectFormProps> = ({}) => (
  <Form onSubmit={() => console.log('lol')}>
    <Form.Item>
      <Input placeholder="Project's label" />
    </Form.Item>
    <Form.Item>
      <Input placeholder="Project's name" />
    </Form.Item>
    <Form.Item>
      <Button type="primary" htmlType="submit" className="login-form-button">
        Save
      </Button>
    </Form.Item>
  </Form>
);

export default ProjectForm;
