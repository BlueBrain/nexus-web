import { getProp } from '../../utils';

export const loadState = (path: string) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedState = localStorage.getItem('nexus__state');
    if (serializedState === null) {
      return undefined;
    }
    return getProp(JSON.parse(serializedState), path);
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('nexus__state', serializedState);
  } catch (err) {
    // ignore write errors
  }
};
