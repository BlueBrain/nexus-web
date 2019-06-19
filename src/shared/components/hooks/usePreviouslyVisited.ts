import useLocalStorage from './useLocalStorage';
import { Project } from '@bbp/nexus-sdk';

export interface ProjectWithVisitedTime extends Project {
  at: number;
}

const usePreviouslyVisited = (key: string) => {
  const [visitedIndex, setVisitedIndex] = useLocalStorage(key);

  const setPreviouslyVisited = (visited: Project) => {
    setVisitedIndex({
      ...visitedIndex,
      [visited.label]: { ...visited, at: Date.now() },
    });
  };

  const previouslyVisitedList: ProjectWithVisitedTime[] = (Object.values(
    visitedIndex
  ) as ProjectWithVisitedTime[]).sort((a, b) => {
    return a.at > b.at ? -1 : a.at < b.at ? 1 : 0;
  });
  return { previouslyVisitedList, setPreviouslyVisited };
};

export default usePreviouslyVisited;
