export declare type UnlinkedActivity = {
  name?: string;
  resourceId: string;
  createdAt: string;
  createdBy: string;
  used?: string[];
  generated?: string[];
  resourceType: string | string[];
};
export declare const useUnlinkedActivities: (
  orgLabel: string,
  projectLabel: string
) => {
  unlinkedActivities: UnlinkedActivity[];
  fetchUnlinkedActivities: () => Promise<void>;
};
