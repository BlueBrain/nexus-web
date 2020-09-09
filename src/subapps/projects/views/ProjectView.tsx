import * as React from 'react';
import { useRouteMatch } from 'react-router';
import { Button, notification, Card } from 'antd';
import { useNexusContext } from '@bbp/react-nexus';
import { Project, Resource } from '@bbp/nexus-sdk';

import { useProjectsSubappContext } from '..';
import ProjectHeader from '../components/ProjectHeader';
import ProjectForm, { ProjectMetadata } from '../components/ProjectForm';
import ActivitiesContainer from '../containers/ActivitiesContainer';
import NewActivityContainer from '../containers/NewActivityContainer';

import './ProjectView.less';

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
  // switch to trigger activities list update
  const [refreshActivities, setRefreshActivities] = React.useState<boolean>(
    false
  );

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
              setEditProject(false);
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

  const waitAntReloadActivities = () =>
    setTimeout(() => setRefreshActivities(!refreshActivities), 3500);

  return (
    <>
      {project && projectMetaData ? (
        <div className="project-view__container">
          {orgLabel && projectLabel && (
            <ProjectHeader title={projectLabel}>
              <>
                <NewActivityContainer
                  projectLabel={projectLabel}
                  orgLabel={orgLabel}
                  onSuccess={waitAntReloadActivities}
                />
                <Button onClick={() => setEditProject(!editProject)}>
                  Project Information
                </Button>
              </>
            </ProjectHeader>
          )}
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
          {orgLabel && projectLabel && (
            <ActivitiesContainer
              orgLabel={orgLabel}
              projectLabel={projectLabel}
              refresh={refreshActivities}
            />
          )}
        </div>
      ) : (
        'Project not found'
      )}
    </>
  );
};

export default ProjectView;
