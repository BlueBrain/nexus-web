import React, { useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Form, Input, Button, Spin, notification } from 'antd';;
import { useNexusContext } from '@bbp/react-nexus';
import './SettingsView.less';
import { ProjectResponseCommon } from '@bbp/nexus-sdk';


type Props = {
    project: {
        _label: string;
        _rev: number;
        description?: string;
        base?: string;
        vocab?: string;
        mode: string;
    }
}
const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
    },
};

const GeneralSubView = ({ project: { _label, _rev, description, base, vocab, mode } }: Props) => {
    const nexus = useNexusContext();
    const match = useRouteMatch<{
        orgLabel: string;
        projectLabel: string;
        viewId?: string;
      }>();
    const [busy, setFormBusy] = useState(false);
    const {
        params: { orgLabel, projectLabel },
      } = match;
    const handleSubmitSettings = (newProject: ProjectResponseCommon) => {
        setFormBusy(true);
        nexus.Project.update(orgLabel, projectLabel, _rev, {
            base: newProject.base,
            vocab: newProject.vocab,
            description: newProject.description,
        })
        .then(() => {
            notification.success({ message: 'Project general data saved', });
            setFormBusy(false);
        })
        .catch((error: Error) => {
            setFormBusy(false);
            notification.error({
                message: 'An unknown error occurred',
                description: error.message,
            });
        });
     }
    return (
        <div className='settings-view settings-general-view'>
            <h2>General</h2>
            <div className='settings-view-container'>
                <Form
                    onFinish={handleSubmitSettings}
                    labelAlign='left'
                >
                    <Spin spinning={busy} tip="Please wait...">
                        <Form.Item
                            {...formItemLayout}
                            label="name"
                            name="_label"
                            initialValue={_label ?? ''}
                            rules={[
                                {
                                    required: true,
                                    whitespace: true,
                                    pattern: /^\S+$/g,
                                    message: 'Label must be a phrase without spaces',
                                },
                            ]}
                        >
                            <Input placeholder="Label" disabled={mode === 'edit'} />
                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            label="Description"
                            name="description"
                            initialValue={description ?? ''}
                            rules={[{ required: false }]}
                        >
                            <Input.TextArea rows={4} placeholder="Description" disabled={mode === 'edit'} />
                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            label="Base"
                            name="base"
                            initialValue={base ?? ''}
                            rules={[{ required: false }]}
                        >
                            <Input disabled placeholder="Base" />
                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            label="Vocab"
                            name="vocab"
                            initialValue={vocab ?? ''}
                            rules={[{ required: false }]}
                        >
                            <Input placeholder="Vocab" />
                        </Form.Item>
                        <Form.Item>
                            <Button
                                style={{ maxWidth: 120, margin: 0 }}
                                type="primary"
                                disabled={false} // TODO: write premission to be enabled
                                htmlType="submit"
                                className="project-form__add-button"
                            >
                                Save changes
                            </Button>

                        </Form.Item>
                    </Spin>
                </Form>
            </div>
        </div>
    )
}

export default GeneralSubView