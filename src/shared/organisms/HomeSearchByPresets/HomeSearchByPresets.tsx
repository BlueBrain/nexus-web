import React from 'react';
import { useQuery } from 'react-query';
import { useNexusContext } from '@bbp/react-nexus';
import { NexusClient } from '@bbp/nexus-sdk';

import { PresetCardItem } from '../../molecules';
import { SearchConfig } from '../../../subapps/search/hooks/useGlobalSearch';
import './HomeSearchByPresets.less';

type Props = {}
const fetchNexusSearchConfig = async (nexus: NexusClient): Promise<SearchConfig> => {
    return await nexus.Search.config();
}

const HomeSearchByPresets = (props: Props) => {
    const nexus = useNexusContext();
    const { data, error, isLoading } = useQuery('nexus-search-config', {
        queryFn: () => fetchNexusSearchConfig(nexus)
    })

    return (
        <div className='home-searchby-presets'>
            <h2 className='home-searchby-presets-title'>Search By</h2>
            <div className='home-searchby-presets-container'>
                { data?.layouts.map(layout => <PresetCardItem title={layout.name} />)}
            </div>
        </div>
    )
}


export default HomeSearchByPresets;