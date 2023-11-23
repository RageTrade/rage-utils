import { init, setupExecute, createAccount } from '../src'
import GmxV2Service from 'perp-aggregator-sdk/src/exchanges/gmxv2'

async function main() {
  const env = init()
  const gmxV2 = new GmxV2Service()

  const account = await createAccount(env.signer, env.bundler)
  console.log(await account.getAccountAddress())

  const { executeTransactions } = setupExecute(account)

  const markets = await gmxV2.supportedMarkets(undefined, undefined)
  console.dir(markets, { depth: 4 })
}

main().catch((e) => console.log(e))
