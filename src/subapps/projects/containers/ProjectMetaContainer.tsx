import * as React from 'react';
import { Button, notification, Card } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Project, Resource } from '@bbp/nexus-sdk';

import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';

const ProjectMetaContaier: React.FC<{
  orgLabel: string;
  projectLabel: string;
}> = ({ orgLabel, projectLabel }) => {
  const [showFrom, setShowForm] = React.useState<boolean>(false);
  const [project, setProject] = React.useState<Project>();
  const [busy, setBusy] = React.useState<boolean>(false);
  const [projectMetaData, setProjectMetaData] = React.useState<
    ProjectMetadata
  >();
  const [metaDataResource, setMetaDataResource] = React.useState<Resource>();
  const [error, setError] = React.useState<Error>();
  const nexus = useNexusContext();

  React.useEffect(() => {
    if (orgLabel && projectLabel) {
      nexus.Project.get(orgLabel, projectLabel)
        .then((value: Project) => {
          setProject(value);
        })
        .catch(error => {
          setError(error);
        });
    }
  }, []);

  React.useEffect(() => {
    if (project) {
      nexus.Resource.list(project._organizationLabel, project._label, {
        type: 'fusionMetadata',
      })
        .then(resourceList => {
          if (resourceList._results.length > 0) {
            nexus.Resource.get(
              project._organizationLabel,
              project._label,
              encodeURIComponent(resourceList._results[0]['@id'] as string)
            )
              .then(result => {
                const resource = result as Resource;
                setMetaDataResource(resource);
                const metaData: ProjectMetadata = {
                  name: project._label,
                  description: resource['description']
                    ? (resource['description'] as string)
                    : '',
                  dueDate: resource['dueDate']
                    ? (resource['dueDate'] as string)
                    : '',
                  topic: resource['topic'] ? (resource['topic'] as string) : '',
                  hypotheses: resource['hypotheses']
                    ? (resource['hypotheses'] as string)
                    : '',
                  visibility: resource['visibility']
                    ? (resource['visibility'] as string)
                    : '',
                  questions: resource['questions']
                    ? (resource['questions'] as string)
                    : '',
                  goals: resource['goals'] ? (resource['goals'] as string) : '',
                };
                setProjectMetaData(metaData);
              })
              .catch(e => {
                setError(e);
              });
          }
        })
        .catch(e => {
          setError(e);
        });
    }
  }, [project]);

  const submitProject = (data: ProjectMetadata) => {
    setBusy(true);
    if (project && metaDataResource) {
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
              '@type': ['fusionMetadata', 'fusionProject'],
            }
          )
            .then(result => {
              setShowForm(false);
              setProjectMetaData(data);
              setProject(resultProject as Project);
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
  };

  return (
    <div>
      <Button onClick={() => setShowForm(!showFrom)}>
        Project Information
      </Button>
      {showFrom ? (
        <Card
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '350px',
            borderRadius: '1rem',
            borderColor: '#44c7f4',
          }}
        >
          <ProjectForm
            onClickCancel={() => setShowForm(false)}
            onSubmit={submitProject}
            busy={busy}
            project={projectMetaData}
          />
        </Card>
      ) : null}
    </div>
  );
};

export default ProjectMetaContaier;
