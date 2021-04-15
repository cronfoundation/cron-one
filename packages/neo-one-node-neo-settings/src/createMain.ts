import { common as clientCommon, crypto, UInt160 } from '@neo-one/client-common';
import { Settings, TransactionType } from '@neo-one/node-core';
import { common } from './common';

const DEFAULT_VALIDATORS: readonly string[] = [
  "02404e75abba2b5055fe4daac2a295c6c2cbb840999d3bbb14a5772bf998bd61a3",
  "02f404a6ed5e86d9c5ce2782660c451da591ec5ae6e6a71efbbbe00698415aabb1",
  "02fe6cf56db5035e574635b1f6d07a43b33ee1c03db4d74cb47d85e41c4c7c9cd8"
];

export const createMain = ({
  privateNet = false,
  standbyValidators: standbyValidatorsIn = DEFAULT_VALIDATORS,
  secondsPerBlock,
  address: addressIn,
}: {
  readonly privateNet?: boolean;
  readonly secondsPerBlock?: number;
  readonly standbyValidators?: readonly string[];
  readonly address?: string;
} = {}): Settings => {
 
  const standbyValidators = standbyValidatorsIn.map((value) => clientCommon.stringToECPoint(value));
  console.log("standbyValidators", standbyValidators);
  console.log("DEFAULT_VALIDATORS", DEFAULT_VALIDATORS);
  console.log("standbyValidatorsIn === DEFAULT_VALIDATORS", standbyValidatorsIn === DEFAULT_VALIDATORS);
  const consensusAddress = crypto.getConsensusAddress(standbyValidators);
  let address: UInt160;
  if (addressIn === undefined) {
    address = crypto.toScriptHash(
            crypto.createMultiSignatureVerificationScript(standbyValidators.length / 2 + 1, standbyValidators),
          );
  } else {
    address = clientCommon.stringToUInt160(addressIn);
  }

  const commonSettings = common({
    privateNet,
    consensusAddress,
    address,
  });

  return {
    genesisBlock: commonSettings.genesisBlock,
    governingToken: commonSettings.governingToken,
    utilityToken: commonSettings.utilityToken,
    decrementInterval: commonSettings.decrementInterval,
    generationAmount: commonSettings.generationAmount,
    secondsPerBlock: secondsPerBlock === undefined ? commonSettings.secondsPerBlock : secondsPerBlock,
    maxTransactionsPerBlock: commonSettings.maxTransactionsPerBlock,
    memPoolSize: commonSettings.memPoolSize,
    fees: {
      [TransactionType.Enrollment]: clientCommon.fixed8FromDecimal(1000),
      [TransactionType.Issue]: clientCommon.fixed8FromDecimal(500),
      [TransactionType.Publish]: clientCommon.fixed8FromDecimal(500),
      [TransactionType.Register]: clientCommon.fixed8FromDecimal(10000),
    },

    registerValidatorFee: clientCommon.fixed8FromDecimal(1000),
    messageMagic: 74798271,
    addressVersion: clientCommon.NEO_ADDRESS_VERSION,
    privateKeyVersion: clientCommon.NEO_PRIVATE_KEY_VERSION,
    standbyValidators,
    vm: {
      storageContext: {
        v0: {
          index: 0,
        },
      },
    },
  };
};
