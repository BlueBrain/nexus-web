import * as React from 'react';
import { useProjectsSubappContext } from '..';
import ProjectHeader from '../components/ProjectHeader';
import { useRouteMatch } from 'react-router';
import { Button, notification, Card } from 'antd';
import './ProjectView.less';
import { useNexusContext } from '@bbp/react-nexus';
import { Project, Resource } from '@bbp/nexus-sdk';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';

import ActivityCard from '../components/ActivityCard';
import { Status } from '../components/StatusIcon';

const ProjectView: React.FC = () => {
  const subapp = useProjectsSubappContext();
  const match = useRouteMatch<{ orgLabel: string; projectLabel: string }>(
    `/${subapp.namespace}/:orgLabel/:projectLabel`
  );

  const [project, setProject] = React.useState<Project>();
  const [projectMetaData, setProjectMetaData] = React.useState<
    ProjectMetadata
  >();
  const [metaDataResource, setMetaDataResource] = React.useState<Resource>();
  const [error, setError] = React.useState<Error>();
  const [busy, setBusy] = React.useState<boolean>(false);
  const projectLabel = match?.params.projectLabel;
  const orgLabel = match?.params.orgLabel;
  const nexus = useNexusContext();
  const [editProject, setEditProject] = React.useState<boolean>(false);
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
        .then(result => {
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
              setEditProject(false);
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
  };

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
  }, [projectMetaData]);

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
  return (
    <>
      {project && projectMetaData ? (
        <div className="project-container">
          <ProjectHeader project={projectMetaData}>
            <Button onClick={() => setEditProject(!editProject)}>
              Project Information
            </Button>
          </ProjectHeader>
          {editProject ? (
            <Card
              style={{
                width: '350px',
                float: 'right',
                borderRadius: '1rem',
                borderColor: '#44c7f4',
              }}
            >
              <ProjectForm
                onClickCancel={() => setEditProject(false)}
                onSubmit={submitProject}
                busy={busy}
                project={projectMetaData}
              />
            </Card>
          ) : null}
          <ActivityCard
            status={Status.blocked}
            name="Single Cell Models"
            description="This is an example summary"
            codeResourcesTotal={2}
            dataResourcesTotal={10}
          />
          <ActivityCard
            status={Status.done}
            name="Single Cell Models"
            description="This is an example summary"
            codeResourcesTotal={2}
          />
          <ActivityCard
            status={Status.inProgress}
            name="Single Cell Models"
            description="This is an example summary"
            codeResourcesTotal={2}
          />
        </div>
      ) : (
        'Project not found'
      )}
    </>
  );
};

export default ProjectView;
