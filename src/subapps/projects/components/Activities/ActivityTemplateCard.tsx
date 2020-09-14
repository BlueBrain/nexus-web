import * as React from 'react';

export type ActivityTemplate = {
  name: string;
  description: string;
  version: number;
  updatedOn: string;
  totalContributors: number;
  author: string;
};

const ActivityTemplateCard: React.FC<{
  template: ActivityTemplate;
}> = ({ template }) => {
  const {
    name,
    description,
    version,
    updatedOn,
    totalContributors,
    author,
  } = template;

  return (
    <div className="activity-template-card">
      <h3>{name}</h3>
      <p>
        Updated on {updatedOn} by {author}
      </p>
      <p>v{version}</p>
      <p>{description}</p>
      <p>{totalContributors} contributors</p>
      <button>Details</button>
    </div>
  );
};

export default ActivityTemplateCard;
