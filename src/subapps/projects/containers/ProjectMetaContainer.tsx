import * as React from 'react';
import { Drawer, Button } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Project, Resource } from '@bbp/nexus-sdk';

import fusionConfig from '../config';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';
import { displayError, successNotification } from '../components/Notifications';

const editIcon = require('../../../shared/images/pencil.svg');

const ProjectMetaContaier: React.FC<{
  orgLabel: string;
  projectLabel: string;
  showAsIcon?: boolean;
}> = ({ orgLabel, projectLabel, showAsIcon }) => {
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const [busy, setBusy] = React.useState<boolean>(false);
  const [projectMetaData, setProjectMetaData] = React.useState<
    ProjectMetadata
  >();
  const [metaDataResource, setMetaDataResource] = React.useState<Resource>();
  const [error, setError] = React.useState<Error>();
  const nexus = useNexusContext();

  const fetchProjectMetadata = () => {
    return nexus.Resource.list(orgLabel, projectLabel, {
      type: fusionConfig.projectMetadataType,
    })
      .then(resourceList => {
        if (resourceList._results.length > 0) {
          nexus.Resource.get(
            orgLabel,
            projectLabel,
            encodeURIComponent(resourceList._results[0]['@id'] as string)
          )
            .then(result => {
              const resource = result as Resource;
              setMetaDataResource(resource);
              const metaData: ProjectMetadata = {
                name: resource.name || '',
                description: resource.description || '',
                dueDate: resource.dueDate || '',
                topic: resource.topic || '',
                hypotheses: resource.hypotheses || '',
                visibility: resource.visibility || '',
                questions: resource.questions || '',
                goals: resource.goals || '',
              };
              setProjectMetaData(metaData);
              setShowForm(true);
            })
            .catch(error => {
              displayError(error, 'An error occured');
            });
        }
      })
      .catch(error => {
        displayError(error, 'An error occured');
      });
  };

  const submitProject = (data: ProjectMetadata) => {
    setBusy(true);

    if (orgLabel && projectLabel) {
      nexus.Project.get(orgLabel, projectLabel)
        .then((project: Project) => {
          if (metaDataResource) {
            nexus.Project.update(
              project?._organizationLabel,
              project?._label,
              project?._rev,
              {
                description: data.description,
              }
            )
              .then(resultProject => {
                return nexus.Resource.update(
                  project._organizationLabel,
                  project._label,
                  metaDataResource['@id'],
                  metaDataResource._rev,
                  {
                    ...data,
                    '@type': fusionConfig.projectMetadataType,
                  }
                )
                  .then(result => {
                    setShowForm(false);
                    setProjectMetaData(data);
                    successNotification(
                      'Project information is updated succesfully'
                    );
                    setBusy(false);
                  })
                  .catch(error => {
                    displayError(error, 'Could not update Project information');
                    setBusy(false);
                  });
              })
              .catch(error => {
                displayError(error, 'Could not update Project information');
                setBusy(false);
              });
          }
        })
        .catch(error => {
          displayError(error, 'An error occured');
        });
    }
  };

  const onClickInfo = () => {
    fetchProjectMetadata();
  };

  return (
    <div>
      {showAsIcon ? (
        <div>
          <button className="edit-button" onClick={onClickInfo}>
            <img src={editIcon} />
          </button>
        </div>
      ) : (
        <Button onClick={onClickInfo}>Project Info</Button>
      )}
      <Drawer
        visible={showForm}
        destroyOnClose={true}
        onClose={() => setShowForm(false)}
        title="Edit Project Information"
        placement="right"
        closable
        width={600}
      >
        <ProjectForm
          onClickCancel={() => setShowForm(false)}
          onSubmit={submitProject}
          busy={busy}
          project={projectMetaData}
        />
      </Drawer>
    </div>
  );
};

export default ProjectMetaContaier;
