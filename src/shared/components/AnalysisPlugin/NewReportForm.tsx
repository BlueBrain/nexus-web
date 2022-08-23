
import React from 'react'
import { Form, Button, Input } from 'antd'

const NewReportForm = () => {
  const [form] = Form.useForm()
  
  return (
    <Form>
        <Form.Item label="Report Name">
            <Input placeholder="type name here" />
        </Form.Item>
        <Form.Item label="Field Report Description">
            <Input placeholder="input placeholder" />
        </Form.Item>
        <Form.Item>
            <Button type="primary" size="large">Submit</Button>
        </Form.Item>
    </Form>
    
    )
}

export default NewReportForm;