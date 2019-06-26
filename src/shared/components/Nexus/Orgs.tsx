import { useNexus } from '@bbp/react-nexus';
import { ListOrgOptions, OrganizationList, Organization } from '@bbp/nexus-sdk';

const Get = ({ orgLabel, children }: { orgLabel: string; children: any }) => {
  const state = useNexus<Organization>(
    nexus => nexus.Organization.get(orgLabel),
    [orgLabel]
  );
  return children({ ...state });
};

const List = ({
  options,
  children,
}: {
  options?: ListOrgOptions;
  children: any;
}) => {
  const state = useNexus<OrganizationList>(
    nexus => nexus.Organization.list(options),
    [...Object.values(options || {})]
  );
  return children({ ...state });
};

export default {
  Get,
  List,
};
