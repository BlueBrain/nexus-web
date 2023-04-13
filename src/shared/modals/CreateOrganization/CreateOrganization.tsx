import * as React from 'react'
import { Form, Modal, Input, Button, notification } from 'antd';
import { NexusClient } from '@bbp/nexus-sdk';
import { useMutation } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { useHistory } from 'react-router';
import { useOrganisationsSubappContext } from '../../../subapps/admin';


export type TCreationUnitModal = {
    visible: boolean;
    updateVisibility(value?: boolean): void;
}
type Props = TCreationUnitModal & {}
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
    },
};
const formItemLayoutWithOutLabel = {
    wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 19, offset: 5 },
    },
};
const createOrganization = async (
    { nexus, label, description }:
        { nexus: NexusClient, label: string, description: string }
) => {
    try {
        return await nexus.Organization.create(label, { description })
    } catch (error) {
        // @ts-ignore
        throw new Error('Can not create new organization', { cause: error });
    }
}
const CreateOrganization = ({ visible, updateVisibility }: Props) => {
    const history = useHistory();
    const nexus = useNexusContext();
    const subapp = useOrganisationsSubappContext();
    const { mutateAsync, status, error } = useMutation({
        mutationFn: createOrganization,
    })
    const handleSubmit = (values: { label: string, description: string }) => mutateAsync({
        nexus,
        label: values.label,
        description: values.description
    }, {
        onSuccess: (data) => {
            notification.success({
                message: <strong>{data._label}</strong>,
                description: `organisation has been created Successfully`,
                onClick: () => history.push(`/${subapp.namespace}/${data._label}`),
            });
        },
        onError: (error) => {
            notification.error({
                // @ts-ignore
                message: error.message,
                // @ts-ignore
                description: <strong>{error.cause['@type']}</strong>
            })
        }
    });
    return (
        <Modal
            centered
            closable
            visible={visible}
            onCancel={() => updateVisibility(false)}
            footer={null}
            title={<div>Create Organization</div>}
        >
            <Form onFinish={handleSubmit}>
                <Form.Item
                    {...formItemLayout}
                    label="Label"
                    name="label"
                    initialValue={''}
                    rules={[
                        {
                            required: true,
                            whitespace: true,
                            pattern: /^\S+$/g,
                            message: 'Label must be a phrase without spaces',
                        },
                        {
                            pattern: /^[a-zA-Z0-9_-]+$/,
                            message: 'Label must contains only letters and numbers',
                        },
                    ]}
                >
                    <Input placeholder="Label" />
                </Form.Item>
                <Form.Item
                    label="Description"
                    name="description"
                    initialValue={''}
                    rules={[{ required: false }]}
                    {...formItemLayout}
                >
                    <Input placeholder="Description" />
                </Form.Item>
                <Form.Item {...formItemLayoutWithOutLabel}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={status === 'loading'}
                    >
                        Create
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default CreateOrganization;