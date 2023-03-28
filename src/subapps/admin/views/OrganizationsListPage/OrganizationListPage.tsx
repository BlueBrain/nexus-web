
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Link, useLocation } from 'react-router-dom';
import { useInfiniteQuery, useQueryClient } from 'react-query'
import { Button, Modal, Drawer, Input, Spin } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import { NexusClient, OrganizationList, OrgResponseCommon } from '@bbp/nexus-sdk';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';
import { Avatar, Breadcrumb, List, Tag } from 'antd';
import { flatten } from 'lodash';
import { useOrganisationsSubappContext } from '../..';
import useNotification, { NexusError, } from '../../../../shared/hooks/useNotification';
import useIntersectionObserver from '../../../../shared/hooks/useIntersectionObserver';
import OrgForm from '../../components/Orgs/OrgForm';
import './styles.less';


const DEFAULT_PAGE_SIZE = 10;
const SHOULD_INCLUDE_DEPRECATED = false;

type NewOrg = {
  label: string;
  description?: string;
};

type Props = {}
type TOrganizationOptions = {
  from: number;
  size: number;
  query: string;
}
type TFetchOrganizationListProps = TOrganizationOptions & { nexus: NexusClient };
const fetchOrganizationList = ({ nexus, size, query, from = 0 }: TFetchOrganizationListProps) => nexus.Organization.list({
  from, size,
  label: query,
  deprecated: SHOULD_INCLUDE_DEPRECATED,
})

function OrgsListView({ }: Props) {
  const queryInputRef = useRef<Input>(null);
  const loadMoreRef = useRef(null);
  const location = useLocation();
  const [formBusy, setFormBusy] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = useState<
    OrgResponseCommon | undefined
  >(undefined);
  const history = useHistory();
  const subapp = useOrganisationsSubappContext();
  const goTo = (org: string) => history.push(`/${subapp.namespace}/${org}`);
  const notification = useNotification();
  const nexus: NexusClient = useNexusContext();
  const [query, setQueryString] = useState<string>('');
  const queryClient = useQueryClient();
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    isLoading,
    isFetching,
  } = useInfiniteQuery({
    queryKey: ['fusion-projects', { query }],
    queryFn: ({ pageParam = 0 }) => fetchOrganizationList({ nexus, query, from: pageParam, size: DEFAULT_PAGE_SIZE }),
    //@ts-ignore
    getNextPageParam: (lastPage) => lastPage._next ? new URL(lastPage._next).searchParams.get('from') : undefined,
  });

  // useIntersectionObserver({
  //     target: loadMoreRef,
  //     onIntersect: fetchNextPage,
  //     enabled: !!hasNextPage,
  // });
  const loadMoreFooter = hasNextPage && (<Button
    className='organizations-view-list-btn-infinitfetch'
    ref={loadMoreRef}
    loading={isFetching || isLoading}
    onClick={() => fetchNextPage()}
    disabled={!hasNextPage || isFetchingNextPage}
  >
    {isFetchingNextPage && <span>Fetching</span>}
    {hasNextPage && !isFetchingNextPage && <span>Load more</span>}
  </Button>)

  const dataSource: OrgResponseCommon[] = flatten<OrgResponseCommon>(
    // @ts-ignore
    data?.pages?.map((page: OrganizationList) => page._results)
  );
  const saveAndModify = (selectedOrg: OrgResponseCommon, newOrg: NewOrg) => {
    setFormBusy(true);
    nexus.Organization.update(newOrg.label, selectedOrg._rev, {
      description: newOrg.description,
    })
      .then(
        () => {
          notification.success({
            message: 'Organization saved',
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);
          queryClient.invalidateQueries({ queryKey: ['fusion-projects', { query }] });
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT saved',
            description: action?.error?.message,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };

  const saveAndDeprecate = (selectedOrg: OrgResponseCommon) => {
    setFormBusy(true);

    nexus.Organization.deprecate(selectedOrg._label, selectedOrg._rev)
      .then(() => {
        notification.success({
          message: 'Organization deprecated',
        });
        setFormBusy(false);
        setModalVisible(false);
        setSelectedOrg(undefined);
        queryClient.invalidateQueries({ queryKey: ['fusion-projects', { query }] });
      })
      .catch((error: Error) => {
        setFormBusy(false);
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };
  const saveAndCreate = (newOrg: NewOrg) => {
    setFormBusy(true);
    nexus.Organization.create(newOrg.label, { description: newOrg.description })
      .then(() => {
        notification.success({
          message: 'Organization created',
        });
        setFormBusy(false);
        goTo(newOrg.label);
      })
      .catch((error: NexusError) => {
        setFormBusy(false);
        notification.error({
          message: 'Error creating organization',
          description: error.reason,
        });
      });
  };
  const handleOnOrgSearch: React.ChangeEventHandler<HTMLInputElement> = (e) => setQueryString(e.target.value);
  
  useEffect(() => {
    setQueryString("");
    if (queryInputRef.current) {
      queryInputRef.current.focus({
        cursor: 'end',
      });
    }
  }, []);
  return (
    <Fragment>
      <div className='organizations-view view-container'>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to={'/'}>Home</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={location.pathname}>Organisations List</Link>
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className='organizations-view-title'>
          <h2>Organisations List</h2>
        </div>
        <div className='organizations-view-actions'>
          <Input.Search 
            allowClear
            ref={queryInputRef} 
            value={query} 
            onChange={handleOnOrgSearch}
            placeholder='Search Organisation'
          />
          <AccessControl permissions={['organizations/create']} path="/">
            <Button className='organizations-view-create-org' type="primary" onClick={() => setModalVisible(true)}>
              <PlusSquareOutlined
                style={{ fontSize: '16px', color: 'white' }}
              />
              Create Organization
            </Button>
          </AccessControl>
        </div>
        <Fragment>
          {status === 'error' && <div className='organizations-view-error'>⛔️ Error loading the organizations list</div>}
          {status === 'success' && <div className='organizations-view-list'>
            <Spin spinning={isLoading} >
              <List
                // loading={isLoading}
                itemLayout="horizontal"
                loadMore={loadMoreFooter}
                dataSource={dataSource}
                renderItem={item => {
                  const to = `/orgs/${item._label}/`;
                  return (
                    <List.Item
                      className='organizations-view-list-item'
                      actions={[
                        <Link to={to}>
                          <Button type='link'>More</Button>
                        </Link>,
                        <AccessControl
                          key={`access-control-${item['@id']}`}
                          path={`/${item._label}`}
                          permissions={['organizations/write']}
                        >
                          <Button
                            className="edit-button"
                            type="primary"
                            size="small"
                            tabIndex={1}
                            onClick={(e: React.SyntheticEvent) => {
                              e.stopPropagation();
                              setSelectedOrg(item);
                            }}
                          >
                            Edit
                          </Button>
                        </AccessControl>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar className='organization-initial'>{item._label.substring(0, 2)}</Avatar>}
                        title={
                          <Fragment>
                            <Link to={to} className='organization-link'>{item._label}</Link>
                          </Fragment>
                        }
                        description={item.description}
                      />
                    </List.Item>
                  )
                }}
              />
            </Spin>
          </div>}
        </Fragment>
      </div>
      <Modal
        title="New Organization"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        confirmLoading={formBusy}
        footer={null}
      >
        <OrgForm onSubmit={(o: NewOrg) => saveAndCreate(o)} busy={formBusy} />
      </Modal>
      <Drawer
        width={640}
        visible={!!(selectedOrg && selectedOrg._label)}
        onClose={() => setSelectedOrg(undefined)}
        title={selectedOrg && selectedOrg._label}
      >
        {selectedOrg && (
          <OrgForm
            org={{
              label: selectedOrg._label,
              description: selectedOrg.description,
              isDeprecated: selectedOrg._deprecated,
            }}
            onSubmit={(o: NewOrg) => saveAndModify(selectedOrg, o)}
            onDeprecate={() => saveAndDeprecate(selectedOrg)}
            busy={formBusy}
            mode="edit"
          />
        )}
      </Drawer>
    </Fragment>
  )
}

export default OrgsListView;