import * as React from 'react';
import { NexusClient } from '@bbp/nexus-sdk/es';
import { useNexusContext } from '@bbp/react-nexus';
import InfiniteSearch from '../../../shared/components/List/InfiniteSearch';

const DEFAULT_PAGE_SIZE = 20;
const SHOULD_INCLUDE_DEPRECATED = false;

const ProjectListContainer: React.FunctionComponent<{
  orgLabel: string;
  children: any;
  defaultSearchValue?: string;
  height?: number;
}> = props => {
  const nexus: NexusClient = useNexusContext();
  const [projects, setProjects] = React.useState<any>({
    total: 0,
    items: [],
    searchValue: props.defaultSearchValue,
  });

  // initial load
  React.useEffect(() => {
    nexus.Project.list(props.orgLabel, {
      size: DEFAULT_PAGE_SIZE,
      label: projects.searchValue,
      deprecated: SHOULD_INCLUDE_DEPRECATED,
    }).then(res =>
      setProjects({ ...projects, total: res._total, items: res._results })
    );
  }, []);

  const loadMore = ({ searchValue }: { searchValue: string }) => {
    // if filters have changed, we need to reset:
    // - the entire list back to []
    // - the from index back to 0
    const newFilter: boolean = searchValue !== projects.searchValue;

    nexus.Project.list(props.orgLabel, {
      size: DEFAULT_PAGE_SIZE,
      from: newFilter ? 0 : projects.items.length,
      label: searchValue,
      deprecated: SHOULD_INCLUDE_DEPRECATED,
    }).then(res => {
      setProjects({
        searchValue,
        total: res._total,
        items: newFilter ? res._results : [...projects.items, ...res._results],
      });
    });
  };
  return (
    <InfiniteSearch
      dataLength={projects.items.length}
      onLoadMore={loadMore}
      hasMore={projects.items.length < projects.total}
      defaultSearchValue={props.defaultSearchValue}
      height={props.height}
    >
      {props.children && props.children({ items: projects.items })}
    </InfiniteSearch>
  );
};

export default ProjectListContainer;
