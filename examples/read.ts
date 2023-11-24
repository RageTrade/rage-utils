import { init, createAccount, setupExecute } from '../src'
import GmxV2Service from 'perp-aggregator-sdk/src/exchanges/gmxv2'

async function main() {
  // takes .env and initializes provider, signer and bundler
  const env = init()

  // create gmx v2 instance to use for read and write operations
  const gmxV2 = new GmxV2Service()

  // creates instance of smart account
  // deployment of smart account is lazy and handled internally
  // i.e it will deploy bytecode in when first transaction is made
  // createAccount must be called to get smart account instance and its address to use for read & write fn
  const account = await createAccount(env.signer, env.bundler)

  // get account address to use in exchange
  const address = await account.getAccountAddress()

  // get all positions
  // refer sdk for in-depth documentation
  const position = await gmxV2.getAllPositions(address, undefined)
  console.dir(position, { depth: 4 })
}

main()
  .then(() => process.exit())
  .catch((e) => console.log(e))
