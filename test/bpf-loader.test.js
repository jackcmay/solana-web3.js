// @flow

import fs from 'mz/fs';

import {
  Connection,
  BpfLoader,
} from '../src';
import {mockRpcEnabled} from './__mocks__/node-fetch';
import {url} from './url';
import {newAccountWithLamports} from './new-account-with-lamports';

if (!mockRpcEnabled) {
  // The default of 5 seconds is too slow for live testing sometimes
  jest.setTimeout(120000);
}

const NUM_RETRIES = 100; /* allow some number of retries */

test('load BPF C program', async () => {
  if (mockRpcEnabled) {
    console.log('non-live test skipped');
    return;
  }

  const connection = new Connection(url);
  const data = await fs.readFile('test/fixtures/noop-c/noop.so');
  const connection = new Connection(url);
  const [, feeCalculator] = await connection.getRecentBlockhash();
  const fees =
    feeCalculator.lamportsPerSignature *
    (BpfLoader.getMinNumSignatures(data.length) + NUM_RETRIES);
  const from = await newAccountWithLamports(connection, fees);

  const programId = await BpfLoader.load(connection, from, data);

  const program_data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
  await Loader.invoke_main(
    connection,
    from,
    programId,
    [{pubkey: from.publicKey, isSigner: true, isDebitable: true}],
    program_data,
  );
});

test('load BPF Rust program', async () => {
  if (mockRpcEnabled) {
    console.log('non-live test skipped');
    return;
  }

  const data = await fs.readFile(
    'test/fixtures/noop-rust/solana_bpf_rust_noop.so',
  );
  const connection = new Connection(url);
  const [, feeCalculator] = await connection.getRecentBlockhash();
  const fees =
    feeCalculator.lamportsPerSignature *
    (BpfLoader.getMinNumSignatures(data.length) + NUM_RETRIES);
  const from = await newAccountWithLamports(connection, fees);
  const programId = await BpfLoader.load(connection, from, data);

  const program_data = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
  await Loader.invoke_main(
    connection,
    from,
    programId,
    [{pubkey: from.publicKey, isSigner: true, isDebitable: true}],
    program_data,
  );
});
