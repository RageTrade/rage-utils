import { init, createAccount, setupExecute } from '../src'
import GmxV2Service from 'perp-aggregator-sdk/src/exchanges/gmxv2'

async function main() {
  const env = init()
  const gmxV2 = new GmxV2Service()

  const account = await createAccount(env.signer, env.bundler)
  const address = await account.getAccountAddress()

  // get all positions
  const position = await gmxV2.getAllPositions(address, undefined)
  console.dir(position, { depth: 4 })
}

main()
  .then(() => process.exit())
  .catch((e) => console.log(e))
