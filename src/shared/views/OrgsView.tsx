import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Button, Modal, Drawer, notification } from 'antd';
import { OrgResponseCommon } from '@bbp/nexus-sdk';
import { AccessControl } from '@bbp/react-nexus';
import { Organization, Project } from '@bbp/nexus-sdk-legacy';
import { CreateOrgPayload } from '@bbp/nexus-sdk-legacy/lib/Organization/types';

import { createOrg, modifyOrg, deprecateOrg } from '../store/actions/orgs';
import OrgList from '../containers/OrgList';
import OrgForm from '../components/Orgs/OrgForm';
import OrgItem from '../components/Orgs/OrgItem';
import ListItem from '../components/List/Item';

interface OrgsViewProps {
  goTo(orgLabel: string): void;
  createOrg: (
    orgLabel: string,
    orgPayload: CreateOrgPayload
  ) => Promise<Organization>;
  modifyOrg: (
    orgLabel: string,
    rev: number,
    orgPayload: CreateOrgPayload
  ) => Promise<Organization>;
  deprecateOrg: (orgLabel: string, rev: number) => Promise<void>;
}

const OrgsView: React.FunctionComponent<OrgsViewProps> = ({
  goTo,
  createOrg,
  modifyOrg,
  deprecateOrg,
}) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = React.useState<
    OrgResponseCommon | undefined
  >(undefined);

  const saveAndCreate = (newOrg: Organization) => {
    setFormBusy(true);
    createOrg(newOrg.label, { description: newOrg.description || '' })
      .then(
        () => {
          notification.success({
            message: 'Organization created',
            duration: 5,
          });
          setFormBusy(false);
          goTo(newOrg.label);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT created',
            description: action.error.message,
            duration: 10,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndModify = (
    selectedOrg: OrgResponseCommon,
    newOrg: Organization
  ) => {
    setFormBusy(true);
    modifyOrg(newOrg.label, selectedOrg._rev, {
      description: newOrg.description,
    })
      .then(
        () => {
          notification.success({
            message: 'Organization saved',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT saved',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
        });
      });
  };

  const saveAndDeprecate = (selectedOrg: OrgResponseCommon) => {
    setFormBusy(true);

    deprecateOrg(selectedOrg._label, selectedOrg._rev)
      .then(
        () => {
          notification.success({
            message: 'Organization deprecated',
            duration: 2,
          });
          setFormBusy(false);
          setModalVisible(false);
          setSelectedOrg(undefined);
        },
        (action: { type: string; error: Error }) => {
          notification.warning({
            message: 'Organization NOT deprecated',
            description: action.error.message,
            duration: 2,
          });
          setFormBusy(false);
        }
      )
      .catch((error: Error) => {
        notification.error({
          message: 'An unknown error occurred',
          description: error.message,
          duration: 0,
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
            <Button
              type="primary"
              onClick={() => setModalVisible(true)}
              icon="plus-square"
            >
              Create Organization
            </Button>
          </AccessControl>
        </div>

        <OrgList>
          {({ items }: { items: OrgResponseCommon[] }) =>
            items.map(i => (
              <ListItem
                key={i['@id']}
                onClick={() => goTo(i._label)}
                actions={[
                  <AccessControl
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
          <OrgForm
            onSubmit={(o: Organization) => saveAndCreate(o)}
            busy={formBusy}
          />
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
              }}
              onSubmit={(o: Organization) => saveAndModify(selectedOrg, o)}
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

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (org: string) => dispatch(push(`/${org}`)),
  createOrg: (orgLabel: string, orgPayload: CreateOrgPayload) =>
    dispatch(createOrg(orgLabel, orgPayload)),
  modifyOrg: (orgLabel: string, rev: number, orgPayload: CreateOrgPayload) =>
    dispatch(modifyOrg(orgLabel, rev, orgPayload)),
  deprecateOrg: (orgLabel: string, rev: number) =>
    dispatch(deprecateOrg(orgLabel, rev)),
});

export default connect(
  null,
  mapDispatchToProps
)(OrgsView);
