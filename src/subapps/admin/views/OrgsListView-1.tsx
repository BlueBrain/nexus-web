import * as React from 'react';
import { Button, Modal, Drawer } from 'antd';
import { PlusSquareOutlined } from '@ant-design/icons';
import { OrgResponseCommon } from '@bbp/nexus-sdk';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';

import OrgList from '../containers/OrgList';
import OrgForm from '../components/Orgs/OrgForm';
import OrgItem from '../components/Orgs/OrgItem';
import ListItem from '../../../shared/components/List/Item';
import { useHistory } from 'react-router';
import { useAdminSubappContext, useOrganisationsSubappContext } from '..';
import useNotification, {
  NexusError,
} from '../../../shared/hooks/useNotification';



const DEFAULT_PAGE_SIZE = 20;
const SHOULD_INCLUDE_DEPRECATED = false;

type NewOrg = {
  label: string;
  description?: string;
};

const OrgsListView: React.FunctionComponent = () => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = React.useState<
    OrgResponseCommon | undefined
  >(undefined);
  const nexus = useNexusContext();
  const history = useHistory();
  const subapp = useOrganisationsSubappContext();
  const goTo = (org: string) => history.push(`/${subapp.namespace}/${org}`);
  const notification = useNotification();

  const [orgs, setOrgs] = React.useState<{
    total: number;
    items: OrgResponseCommon[];
    searchValue?: string;
  }>({
    total: 0,
    items: [],
  });

  // initial load
  React.useEffect(() => {
    nexus.Organization.list({
      size: DEFAULT_PAGE_SIZE,
      label: orgs.searchValue,
      deprecated: SHOULD_INCLUDE_DEPRECATED,
    }).then(res =>
      setOrgs({ ...orgs, total: res._total, items: res._results })
    );
  }, []);

  const loadMore = ({ searchValue }: { searchValue: string }) => {
    // if filters have changed, we need to reset:
    // - the entire list back to []
    // - the from index back to 0
    const newFilter: boolean = searchValue !== orgs.searchValue;

    nexus.Organization.list({
      size: DEFAULT_PAGE_SIZE,
      from: newFilter ? 0 : orgs.items.length,
      label: searchValue,
      deprecated: SHOULD_INCLUDE_DEPRECATED,
    }).then(res => {
      setOrgs({
        searchValue,
        total: res._total,
        items: newFilter ? res._results : [...orgs.items, ...res._results],
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

  const updateOrganization = (org: OrgResponseCommon) => {
    const newState = {
      total: orgs.total,
      items: (orgs.items as OrgResponseCommon[]).map(o => {
        return o['@id'] === org['@id'] ? org : o;
      }),
      searchValue: orgs.searchValue,
    };
    setOrgs(newState);
  };

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
          updateOrganization({
            ...selectedOrg,
            description: newOrg.description,
            _rev: selectedOrg._rev + 1,
          });
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
        updateOrganization({
          ...selectedOrg,
          _deprecated: true,
          _rev: selectedOrg._rev + 1,
        });
      })
      .catch((error: Error) => {
        setFormBusy(false);
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
        });
      });
  };

  return (
    <div className="orgs-view view-container">
      <div style={{ flexGrow: 1, overflow: 'auto' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}
        >
          <h1 style={{ marginBottom: 0, marginRight: 8 }}>Organizations</h1>
          <AccessControl permissions={['organizations/create']} path="/">
            <Button type="primary" onClick={() => setModalVisible(true)}>
              <PlusSquareOutlined
                style={{ fontSize: '16px', color: 'white' }}
              />
              Create Organization
            </Button>
          </AccessControl>
        </div>

        <OrgList orgs={orgs} loadMore={loadMore}>
          {({ items }: { items: OrgResponseCommon[] }) =>
            items.map(i => (
              <ListItem
                key={i['@id']}
                onClick={() => goTo(i._label)}
                actions={[
                  <AccessControl
                    key={`access-control-${i['@id']}`}
                    path={`/${i._label}`}
                    permissions={['organizations/write']}
                  >
                    <Button
                      className="edit-button"
                      type="primary"
                      size="small"
                      tabIndex={1}
                      onClick={(e: React.SyntheticEvent) => {
                        e.stopPropagation();
                        setSelectedOrg(i);
                      }}
                    >
                      Edit
                    </Button>
                  </AccessControl>,
                ]}
              >
                <OrgItem {...i} />
              </ListItem>
            ))
          }
        </OrgList>

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
      </div>
    </div>
  );
};

export default OrgsListView;
