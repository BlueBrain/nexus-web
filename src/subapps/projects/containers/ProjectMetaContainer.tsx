import * as React from 'react';
import { Drawer } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Project, Resource } from '@bbp/nexus-sdk';

import fusionConfig from '../config';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';
import { PROJECT_METADATA_CONTEXT } from '../fusionContext';
import { createResource } from '../utils/workFlowMetadataUtils';
import useNotification, {
  parseNexusError,
} from '../../../shared/hooks/useNotification';

const ProjectMetaContaier: React.FC<{
  orgLabel: string;
  projectLabel: string;
  onClose?: () => void;
}> = ({ orgLabel, projectLabel, onClose }) => {
  const [busy, setBusy] = React.useState<boolean>(false);
  const [projectMetaData, setProjectMetaData] = React.useState<
    ProjectMetadata
  >();
  const [metaDataResource, setMetaDataResource] = React.useState<Resource>();
  const [showForm, setShowForm] = React.useState<boolean>(false);
  const nexus = useNexusContext();
  const notification = useNotification();

  React.useEffect(() => {
    fetchProjectMetadata();
  }, [orgLabel, projectLabel]);

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
              notification.error({
                message: 'An error occured',
                description: parseNexusError(error),
              });
            });
        } else {
          const emptyMetadata = {
            '@type': fusionConfig.projectMetadataType,
            name: projectLabel,
            description: '',
            dueDate: '',
            topic: '',
            hypotheses: '',
            visibility: '',
            questions: '',
            goals: '',
          };
          createResource(orgLabel, projectLabel, emptyMetadata, nexus);
          notification.warning({
            message:
              'Metadata file is being created, please try after few seconds..',
          });
        }
      })
      .catch(error => {
        notification.error({
          message: 'An error occured',
          description: parseNexusError(error),
        });
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
                  encodeURIComponent(metaDataResource['@id']),
                  metaDataResource._rev,
                  {
                    ...data,
                    '@type': fusionConfig.fusionProjectTypes,
                    '@context': PROJECT_METADATA_CONTEXT['@id'],
                  }
                )
                  .then(result => {
                    setProjectMetaData(data);
                    notification.success({
                      message: 'Project information is updated succesfully',
                    });
                    setBusy(false);
                  })
                  .catch(error => {
                    notification.error({
                      message: 'Could not update Project information',
                      description: parseNexusError(error),
                    });
                    setBusy(false);
                  });
              })
              .catch(error => {
                notification.error({
                  message: 'Could not update Project information',
                  description: parseNexusError(error),
                });
                setBusy(false);
              });
          }
        })
        .catch(error => {
          notification.error({
            message: 'An error occured',
            description: parseNexusError(error),
          });
        });
    }
  };

  const closeForm = () => {
    setShowForm(false);
    onClose && onClose();
  };

  return (
    <div>
      <Drawer
        open={showForm}
        destroyOnClose={true}
        onClose={closeForm}
        title="Edit Project Information"
        placement="right"
        closable
        width={600}
      >
        <ProjectForm
          onClickCancel={closeForm}
          onSubmit={submitProject}
          busy={busy}
          project={projectMetaData}
          isFullForm
        />
      </Drawer>
    </div>
  );
};

export default ProjectMetaContaier;
