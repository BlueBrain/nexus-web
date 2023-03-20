import React, { useState, useEffect } from 'react'
import { groupBy, sortBy } from 'lodash';
import { Table, Collapse, Checkbox } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouteMatch } from 'react-router';
import { ACL, Identity } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { useAdminSubappContext } from '../../../../subapps/admin';

import './SettingsView.less';

type Props = {}
type DataType = {
    key: string;
    name: string;
    parent?: boolean;
    read?: boolean;
    write?: boolean;
    create?: boolean;
    query?: boolean;
    children?: DataType[];
}
type GroupedPermission = {
    name: string;
    permissions: string[];
};
function groupPermissions(permissions: string[]): GroupedPermission[] {
    const permissionsSplited = permissions.map(item => {
        const [name, permission] = item.split('/');
        return { name, permission }
    });
    return Object.entries(groupBy(permissionsSplited, 'name')).map(([key, value]) => {
        return {
            name: key,
            permissions: value.map(item => item.permission),
        }
    })
}

type ACLViewProp = {
    identity: Identity;
    permissions: string[];
}[] | undefined;

const { Panel } = Collapse;
function PermissionsAclsSubView({ }: Props) {
    const { namespace } = useAdminSubappContext();
    const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
        `/${namespace}/:orgLabel/:projectLabel`
    );
    const {
        params: { orgLabel, projectLabel },
    } = match || {
        params: {
            orgLabel: '',
            projectLabel: '',
        },
    };
    const path = `${orgLabel}${projectLabel ? `/${projectLabel}` : ''}`;

    const [{ busy, error, acls }, setACLs] = useState<{
        busy: Boolean;
        error: Error | null;
        acls: ACL[] | null;
    }>({
        busy: false,
        error: null,
        acls: null,
    });

    const nexus = useNexusContext();
    useEffect(() => {
        if (!busy) {
            setACLs({
                error: null,
                acls: null,
                busy: true,
            });
            nexus.ACL.list(path, { ancestors: true, self: false })
                .then(acls => {
                    setACLs({
                        acls: acls._results,
                        busy: false,
                        error: null,
                    });
                })
                .catch(error => {
                    setACLs({
                        error,
                        acls: null,
                        busy: false,
                    });
                });
        }
    }, []);
    const columns: ColumnsType<DataType> = [{
        key: 'name',
        dataIndex: 'name',
        title: '',
        width: 200,
        ellipsis: true,
        render: (text, record) => <span className={record.parent ? 'row-as-head' : ''}>{text}</span>
    }, {
        key: 'read',
        dataIndex: 'read',
        title: 'Read',
        align: 'center',
        width: 80,
        render: (text, record) => record.parent ? null : <Checkbox checked={record.read} disabled />
    }, {
        key: 'write',
        dataIndex: 'write',
        title: 'Write',
        align: 'center',
        width: 80,
        render: (text, record) => record.parent ? null : <Checkbox checked={record.write} disabled />
    }, {
        key: 'create',
        dataIndex: 'create',
        title: 'Create',
        align: 'center',
        width: 80,
        render: (text, record) => record.parent ? null : <Checkbox checked={record.create} disabled />
    }, {
        key: 'query',
        dataIndex: 'query',
        title: 'Query',
        align: 'center',
        width: 80,
        render: (text, record) => record.parent ? null : <Checkbox checked={record.query} disabled />
    }];
    const results = acls?.map((acl, index) => {
        const id = acl['@id'];
        const path = acl._path;
        const aclItems: ACLViewProp = acl.acl;
        const identitiesPermissions = sortBy(aclItems?.map(({ identity, permissions }) => {
            return {
                identity,
                permissions: groupPermissions(permissions),
            }
        }), o => o.identity.subject);
        const data = identitiesPermissions?.map(({ identity, permissions }) => {
            const iden = identity.subject ?? (identity.group || '');
            const name =  iden ? `: ${iden}` : '';
            return {
                key: identity['@id'],
                name: `${identity['@type']}${name}`,
                parent: true,
                children: permissions.map(({ name, permissions }) => ({
                    name,
                    key: `${identity['@type']}:${identity.subject}:${name}`,
                    read: permissions.includes('read'),
                    write: permissions.includes('write'),
                    create: permissions.includes('create'),
                    query: permissions.includes('query'),
                }))
            }
        });
        return {
            id,
            path,
            data,
        };
    });
    return (
        <div className='settings-view settings-permissions-view'>
            <h2>Permissions & ACLs</h2>
            <div className='settings-view-container'>
                <Collapse accordion bordered={false}>
                    { results?.map(({ id, path, data }, index) => (
                        <Panel header={`Permissions applied to: ${path}`} key={`${id}:${index}`}>
                            <Table
                                key={`table:${id}:${index}`}
                                className='views-table acls-table'
                                rowClassName='view-item-row'
                                columns={columns}
                                dataSource={data}
                                sticky={true}
                                size='middle'
                                pagination={false}
                            />
                        </Panel>
                    ))}
                </Collapse>
            </div>
        </div>
    )
}

export default PermissionsAclsSubView