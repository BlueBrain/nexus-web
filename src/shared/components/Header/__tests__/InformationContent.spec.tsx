import { EnvironmentInfo, InformationContent } from '..';
import { render, screen } from '../../../../utils/testUtil';
import '@testing-library/jest-dom';

describe('InformationContent', () => {
    
    beforeEach(() => {
        render(<InformationContent environment={MOCK_ENVIRONMENT} githubIssueURL='https://mock-issues-url'/>)
    })

    it('shows nexus environment information', async () => {
        const deltaVersion = await screen.findByTestId('delta-version')
        expect(deltaVersion.textContent).toContain(MOCK_ENVIRONMENT.deltaVersion)
    
        const fusionVersion = await screen.findByTestId('fusion-version')
        expect(fusionVersion.textContent).toContain(MOCK_ENVIRONMENT.fusionVersion)

        const environmentName = await screen.getByText(MOCK_ENVIRONMENT.environmentName)
        expect(environmentName).toBeDefined();
    })

})

const MOCK_ENVIRONMENT: EnvironmentInfo = {
    deltaVersion: '1.0.0',
    fusionVersion: '1.0.0',
    environmentName: 'unit-test',
    browser: 'FireFox',
    operatingSystem: 'Ubuntu 18',
}