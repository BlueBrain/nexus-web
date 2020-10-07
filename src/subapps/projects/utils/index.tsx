import { labelOf } from '../../../shared/utils';
import { ResourceLink } from '@bbp/nexus-sdk';

/**
 * isParentLink function - checks if a link created with a property 'hasParent'
 * @param {Object}
 * @returns {boolean}
 */
export const isParentLink = (link: ResourceLink) => {
  if (Array.isArray(link.paths)) {
    return (
      link.paths.filter((path: string) => labelOf(path) === 'hasParent')
        .length > 0
    );
  }

  return labelOf(link.paths) === 'hasParent';
};

export const isActivityResource = (link: ResourceLink) => {
  if (Array.isArray(link.paths)) {
    return (
      link.paths.filter(
        (path: string) =>
          labelOf(path) === 'used' || labelOf(path) === 'wasAssociatedWith'
      ).length > 0
    );
  }

  return (
    labelOf(link.paths) === 'used' ||
    labelOf(link.paths) === 'wasAssociatedWith'
  );
};
