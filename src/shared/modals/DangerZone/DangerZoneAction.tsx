import { Button, Col, Form, Input, Modal, Row } from 'antd';
import React, { useState } from 'react';

export type DangerZoneActionProps = {
  action: 'deprecate' | 'delete' | 'undo-deprecate';
  description: string;
  matchTerm: string;
  open: boolean;
  status: boolean;
  title: string;
  handler(values: any): void;
  onClose(): void;
};

const DangerZoneAction = ({
  action,
  description,
  matchTerm,
  open,
  status,
  title,
  onClose,
  handler,
}: DangerZoneActionProps) => {
  const [matchTermValue, setMatchTermValue] = useState('');
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setMatchTermValue(e.target.value);

  return (
    <Modal
      centered
      open={open}
      footer={null}
      onCancel={onClose}
      maskClosable={false}
      title={<strong>{title}</strong>}
    >
      <Form onFinish={handler}>
        <Row>
          <p style={{ marginBottom: '1rem' }}>{description}.</p>
          <p>
            Please type <strong>{matchTerm}</strong> to confirm.
          </p>
        </Row>
        <Row>
          <Col span={24}>
            <Form.Item
              name="projectName"
              rules={[
                {
                  required: true,
                  message: 'This is required field',
                },
                {
                  validator: (_, value) => {
                    if (value.toLowerCase() === matchTerm) {
                      return Promise.resolve();
                    }
                    return Promise.reject();
                  },
                },
              ]}
            >
              <Input
                onPaste={e => {
                  e.preventDefault();
                  return false;
                }}
                onDrop={e => {
                  e.preventDefault();
                  return false;
                }}
                value={matchTermValue}
                onChange={handleValueChange}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ textAlign: 'right' }}>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => {
                const projectName = getFieldValue('projectName');
                const disabled =
                  (projectName as string)?.toLowerCase() !== matchTerm;
                return (
                  <Button
                    danger
                    type="primary"
                    loading={status}
                    htmlType="submit"
                    disabled={disabled}
                  >
                    I understand the consequences, {action} this project
                  </Button>
                );
              }}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DangerZoneAction;
