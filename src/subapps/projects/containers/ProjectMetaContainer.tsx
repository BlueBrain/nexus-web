import * as React from 'react';
import { Drawer, Button, notification } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Project, Resource } from '@bbp/nexus-sdk';

import fusionConfig from '../config';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';

const ProjectMetaContaier: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
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
            .catch(e => {
              setError(e);
            });
        }
      })
      .catch(e => {
        setError(e);
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
                nexus.Resource.update(
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
                    notification.success({
                      message: `Project information Updated`,
                    });
                    setBusy(false);
                  })
                  .catch(error => {
                    notification.error({
                      message: `Could not update Project information`,
                      description: error.message,
                    });
                    setBusy(false);
                  });
              })
              .catch(error => {
                notification.error({
                  message: `Could not update Project information`,
                  description: error.message,
                });
                setBusy(false);
              });
          }
        })
        .catch(error => {
          setError(error);
        });
    }
  };

  const onClickInfo = () => {
    fetchProjectMetadata();
  };

  return (
    <div>
      <Button onClick={onClickInfo}>Project Info</Button>
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
