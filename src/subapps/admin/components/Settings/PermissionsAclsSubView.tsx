import React, { useMemo } from 'react';
import { groupBy, sortBy } from 'lodash';
import { Table, Collapse, Checkbox, Empty, Spin, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useRouteMatch } from 'react-router';
import { useQuery } from 'react-query';
import { Identity, NexusClient } from '@bbp/nexus-sdk';
import { useNexusContext } from '@bbp/react-nexus';
import { match as pmatch } from 'ts-pattern';
import { useOrganisationsSubappContext } from '../../../../subapps/admin';
import './styles.less';

type TError = Error & { cause: any };
type Props = {};
type DataType = {
  key: string;
  name: string;
  parent?: boolean;
  read?: boolean;
  write?: boolean;
  create?: boolean;
  query?: boolean;
  children?: DataType[];
  realm?: string;
};
type GroupedPermission = {
  name: string;
  permissions: string[];
};
function groupPermissions(permissions: string[]): GroupedPermission[] {
  const permissionsSplited = permissions.map(item => {
    const [name, permission] = item.split('/');
    return { name, permission };
  });
  return Object.entries(groupBy(permissionsSplited, 'name')).map(
    ([key, value]) => {
      return {
        name: key,
        // @ts-ignore
        permissions: value.map(item => item.permission),
      };
    }
  );
}

type ACLViewProp =
  | {
      identity: Identity;
      permissions: string[];
    }[]
  | undefined;

const { Panel } = Collapse;

const fetchPermissions = async ({
  nexus,
  path,
}: {
  nexus: NexusClient;
  path: string;
}) => {
  try {
    const acls = await nexus.ACL.list(path, { ancestors: true, self: false });
    return acls._results;
  } catch (error) {
    // @ts-ignore
    throw new Error('Can not fetch ACL list', { cause: error });
  }
};
const PermissionsAclsSubView = (props: Props) => {
  const { namespace } = useOrganisationsSubappContext();
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
  const nexus = useNexusContext();
  const { data: acls, status, error } = useQuery({
    queryKey: [`permissions-${orgLabel}-${projectLabel}`],
    queryFn: () => fetchPermissions({ nexus, path }),
    refetchOnWindowFocus: false,
    retry: false,
  });
  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        key: 'name',
        dataIndex: 'name',
        title: '',
        width: 200,
        ellipsis: true,
        render: (text, record) => (
          <span className={record.parent ? 'row-as-head' : ''}>
            {record.realm && <Tag>{record.realm}</Tag>}
            {text}
          </span>
        ),
      },
      {
        key: 'read',
        dataIndex: 'read',
        title: 'Read',
        align: 'center',
        width: 80,
        render: (text, record) =>
          record.parent ? null : <Checkbox checked={record.read} disabled />,
      },
      {
        key: 'write',
        dataIndex: 'write',
        title: 'Write',
        align: 'center',
        width: 80,
        render: (text, record) =>
          record.parent ? null : <Checkbox checked={record.write} disabled />,
      },
      {
        key: 'create',
        dataIndex: 'create',
        title: 'Create',
        align: 'center',
        width: 80,
        render: (text, record) =>
          record.parent ? null : <Checkbox checked={record.create} disabled />,
      },
      {
        key: 'query',
        dataIndex: 'query',
        title: 'Query',
        align: 'center',
        width: 80,
        render: (text, record) =>
          record.parent ? null : <Checkbox checked={record.query} disabled />,
      },
    ],
    []
  );

  const results = acls?.map((acl, index) => {
    const id = acl['@id'];
    const path = acl._path;
    const aclItems: ACLViewProp = acl.acl;
    const identitiesPermissions = sortBy(
      aclItems?.map(({ identity, permissions }) => {
        return {
          identity,
          permissions: groupPermissions(permissions),
        };
      }),
      // @ts-ignore
      o => o.identity.subject
    );
    const data = identitiesPermissions?.map(({ identity, permissions }) => {
      const iden = identity.subject ?? (identity.group || '');
      const name = iden ? `: ${iden}` : '';
      return {
        key: `${identity.realm}/${identity['@id']}`,
        name: `${identity['@type']}${name}`,
        realm: identity.realm,
        parent: true,
        // @ts-ignore
        children: permissions.map(({ name, permissions }) => ({
          name,
          key: `${identity.realm}/${identity['@type']}/${identity.subject}:${name}`,
          read: permissions.includes('read'),
          write: permissions.includes('write'),
          create: permissions.includes('create'),
          query: permissions.includes('query'),
        })),
      };
    });
    return {
      id,
      path,
      data,
    };
  });

  return (
    <div className="settings-view settings-permissions-view">
      <h2>Permissions & ACLs</h2>
      <div className="settings-view-container">
        {pmatch(status)
          .with('error', () => (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{ color: 'red' }}>
                  {(error as TError)?.cause?.['@type'] === 'AuthorizationFailed'
                    ? (error as TError).cause?.['reason']
                    : 'Error while fetching the permisions and ACLs'}
                </div>
              }
            />
          ))
          .with('loading', () => (
            <div className="row-center">
              <Spin spinning />
            </div>
          ))
          .with('success', () => {
            if (!acls?.length) {
              return (
                <Empty
                  image={Empty.PRESENTED_IMAGE_DEFAULT}
                  description="No ACLs was found"
                />
              );
            }
            return (
              <Collapse accordion bordered={false}>
                {results?.map(({ id, path, data }, index) => (
                  <Panel
                    header={`Permissions applied to: ${path}`}
                    key={`${id}:${index}`}
                  >
                    <Table
                      key={`table:${id}:${index}`}
                      className="views-table acls-table"
                      rowClassName="view-item-row"
                      columns={columns}
                      dataSource={data}
                      sticky={true}
                      size="middle"
                      pagination={false}
                    />
                  </Panel>
                ))}
              </Collapse>
            );
          })
          .otherwise(() => (
            <></>
          ))}
      </div>
    </div>
  );
};

export default PermissionsAclsSubView;
