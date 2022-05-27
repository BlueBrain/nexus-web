import * as React from 'react';
import { useNexusContext } from '@bbp/react-nexus';
import { Spin, List, Input } from 'antd';
import { useHistory } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  getOrgAndProjectFromProjectId,
  makeStudioUri,
} from '../../../shared/utils';
import '../studio.less';

const DEFAULT_STUDIO_TYPE =
  'https://bluebrainnexus.io/studio/vocabulary/Studio';
const STUDIO_RESULTS_DEFAULT_SIZE = 1000;

export type StudioItem = {
  id: string;
  label: string;
  description?: string;
  workspaces?: string[];
  projectLabel: string;
  orgLabel: string;
};

const StudioListView: React.FC = () => {
  const nexus = useNexusContext();
  const history = useHistory();
  const [studioList, setStudioList] = React.useState<StudioItem[]>([]);
  const [searchFilter, setSearchFilter] = React.useState<string>('');

  const fetchStudios = async () =>
    nexus.Resource.list(undefined, undefined, {
      size: STUDIO_RESULTS_DEFAULT_SIZE,
      deprecated: false,
      type: DEFAULT_STUDIO_TYPE,
    });

  const { data, status } = useQuery({
    queryKey: 'studios',
    queryFn: fetchStudios,
    enabled: true,
    retry: 2,
  });

  React.useEffect(() => {
    if (data) {
      console.log(data, searchFilter);
      const list: StudioItem[] = data._results
        .map(r => {
          const labels = getOrgAndProjectFromProjectId(r._project);
          return {
            id: r['@id'],
            label: r.label,
            description: r.description,
            projectLabel: labels.projectLabel,
            orgLabel: labels.orgLabel,
          };
        })
        .filter(
          s =>
            s.label.toLowerCase().includes(searchFilter) ||
            s.orgLabel.includes(searchFilter) ||
            s.projectLabel.includes(searchFilter)
        );
      setStudioList(list);
    }
    return () => {
      // do nothing
    };
  }, [data, searchFilter]);
  const goToStudio = (studioUrl: string) => {
    history.push(studioUrl);
  };

  return (
    <div className="view-container">
      <div className="global-studio-list">
        <div className={'studio-header'}>
          <h1>Studios</h1>
          <Input.Search
            className={'studio-search'}
            placeholder={'Type to filter'}
            onChange={e => {
              setSearchFilter(e.target.value.toLowerCase());
            }}
          ></Input.Search>
        </div>
        <div className={'studio-description'}>
          <p>
            You can see all the studios in Nexus projects where you have read
            access. The list is alphabetically sorted.
          </p>
        </div>
        {status === 'error' ? (
          <>A Error Occured</>
        ) : (
          <Spin
            spinning={status === 'loading'}
            size={'large'}
            style={{ display: 'flex' }}
          >
            <List
              pagination={{
                total: studioList.length,
                showTotal: total => ` ${total} results`,
                pageSize: 10,
              }}
              className={'studio-list'}
              dataSource={studioList}
              renderItem={item => {
                return (
                  <List.Item
                    role="listitem"
                    onClick={() => {
                      const { orgLabel, projectLabel, id } = item;
                      const studioUri = makeStudioUri(
                        orgLabel,
                        projectLabel,
                        id
                      );
                      goToStudio(studioUri);
                    }}
                    className={'studio-list-item'}
                  >
                    <div className={'studio'}>
                      {`${item.orgLabel}/${item.projectLabel}/`}
                      <span className={'studio-name'}>{item.label}</span>
                    </div>
                  </List.Item>
                );
              }}
            ></List>
          </Spin>
        )}
      </div>
    </div>
  );
};

export default StudioListView;
