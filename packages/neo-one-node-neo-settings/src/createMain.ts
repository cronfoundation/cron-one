import { common as clientCommon, crypto, UInt160 } from '@neo-one/client-common';
import { Settings, TransactionType } from '@neo-one/node-core';
import { common } from './common';

const DEFAULT_VALIDATORS: readonly string[] = [
  "035d64f7ff9a02d7c0f8c11977ac04cc82c7ba1fb7d7932b926e561cdee11fe402",
  "0266fad048f713b12cf54008bf73e4310b70bdb049873c9126008e512f167b2612",
  "0326ab6643f8b687d5b2b2a6fb5d593c4a6e35cf0f91c80efaf4c87590f872c70b",
  "021b0ca082ebc1452c10e794d18ad6c78345ff0b00777a5b842cfa925f3d3b72c4",
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

  const consensusAddress =
    standbyValidatorsIn === DEFAULT_VALIDATORS
      ? clientCommon.asUInt160(Buffer.from('51b6a4d6f883b530726467bcf54d52bf08055ce5', 'hex'))
      : crypto.getConsensusAddress(standbyValidators);
  let address: UInt160;
  if (addressIn === undefined) {
    address =
      standbyValidatorsIn === DEFAULT_VALIDATORS
        ? clientCommon.asUInt160(Buffer.from('51b6a4d6f883b530726467bcf54d52bf08055ce5', 'hex'))
        : crypto.toScriptHash(
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
    messageMagic: 67827978,
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
