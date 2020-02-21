import * as React from 'react';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import { Button, Modal, Drawer, notification } from 'antd';
import { OrgResponseCommon, Resource } from '@bbp/nexus-sdk';
import { AccessControl, useNexusContext } from '@bbp/react-nexus';

import OrgList from '../containers/OrgList';
import OrgForm from '../components/Orgs/OrgForm';
import OrgItem from '../components/Orgs/OrgItem';
import ListItem from '../components/List/Item';
import useQueryString from '../hooks/useQueryString';
import { useHistory } from 'react-router';
import { matchResultUrls, parseProjectUrl } from '../utils';

type NewOrg = {
  label: string;
  description?: string;
};

interface OrgsViewProps {
  goTo(orgLabel: string): void;
}

const OrgsView: React.FunctionComponent<OrgsViewProps> = ({ goTo }) => {
  const [formBusy, setFormBusy] = React.useState<boolean>(false);
  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const [selectedOrg, setSelectedOrg] = React.useState<
    OrgResponseCommon | undefined
  >(undefined);
  const nexus = useNexusContext();
  const history = useHistory();

  const [{ _self: self }] = useQueryString();

  // redirect to ResourceView if self is a resource
  if (self) {
    nexus
      .httpGet({
        path: self,
        headers: { Accept: 'application/json' },
      })
      .then((resource: Resource) => {
        const [orgLabel, projectLabel] = parseProjectUrl(resource._project);
        history.push(
          `/${orgLabel}/${projectLabel}/resources/${encodeURIComponent(
            resource['@id']
          )}`
        );
      })
      .catch(console.log);
  }

  const saveAndCreate = (newOrg: NewOrg) => {
    setFormBusy(true);
    nexus.Organization.create(newOrg.label, { description: newOrg.description })
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

  const saveAndModify = (selectedOrg: OrgResponseCommon, newOrg: NewOrg) => {
    setFormBusy(true);
    nexus.Organization.update(newOrg.label, selectedOrg._rev, {
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

    nexus.Organization.deprecate(selectedOrg._label, selectedOrg._rev)
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

const mapDispatchToProps = (dispatch: any) => ({
  goTo: (org: string) => dispatch(push(`/${org}`)),
});

export default connect(null, mapDispatchToProps)(OrgsView);
