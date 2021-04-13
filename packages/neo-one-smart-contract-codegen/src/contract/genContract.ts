import { SmartContractNetworksDefinition } from '@neo-one/client-common';
import stringify from 'safe-stable-stringify';
import { getABIName } from '../abi';
import { getSmartContractName } from '../types';
import { getRelativeImport } from '../utils';
import { getCreateSmartContractName } from './getCreateSmartContractName';

export const genContract = ({
  name,
  createContractPath,
  typesPath,
  sourceMapsPath,
  abiPath,
  networksDefinition,
}: {
  readonly name: string;
  readonly createContractPath: string;
  readonly typesPath: string;
  readonly abiPath: string;
  readonly sourceMapsPath: string;
  readonly networksDefinition: SmartContractNetworksDefinition;
}) => {
  const relativeTypes = getRelativeImport(createContractPath, typesPath);
  const smartContract = getSmartContractName(name);
  const relativeABI = getRelativeImport(createContractPath, abiPath);
  const relativeSourceMaps = getRelativeImport(createContractPath, sourceMapsPath);
  const abiName = getABIName(name);

  return {
    js: `import { ${abiName} } from '${relativeABI}';
import { sourceMaps } from '${relativeSourceMaps}';

const definition = {
  networks: ${stringify(networksDefinition, undefined, 2)},
  abi: ${abiName},
  sourceMaps,
};

export const ${getCreateSmartContractName(name)} = (
  client,
) => client.smartContract(definition);
  `,
    ts: `
import { Client } from '@neo-one/client';
import { ${smartContract} } from '${relativeTypes}';
import { ${abiName} } from '${relativeABI}';
import { sourceMaps } from '${relativeSourceMaps}';

const definition = {
  networks: ${stringify(networksDefinition, undefined, 2)},
  abi: ${abiName},
  sourceMaps,
};

export const ${getCreateSmartContractName(name)} = <TClient extends Client>(
  client: TClient,
): ${smartContract}<TClient> => client.smartContract(definition);
`,
  };
};
