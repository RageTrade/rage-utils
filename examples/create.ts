import { Transaction } from '@biconomy-devx/core-types'
import RouterV1 from 'perp-aggregator-sdk/router/RouterV1'
import { init, setupExecute, createAccount } from '../src'
import { tokens } from 'perp-aggregator-sdk/src/common/tokens'
import { FixedNumber } from 'perp-aggregator-sdk/src/common/fixedNumber'
import { CreateOrder } from 'perp-aggregator-sdk/src/interfaces/V1/IRouterAdapterBaseV1'

async function main() {
  // takes .env and initializes provider, signer and bundler
  const env = init()

  // create gmx v2 instance to use for read and write operations
  const router = new RouterV1()

  // creates instance of smart account
  // deployment of smart account is lazy and handled internally
  // i.e it will deploy bytecode in when first transaction is made
  // createAccount must be called to get smart account instance and its address to use for read & write fn
  const account = await createAccount(env.signer, env.bundler)

  // get account address to use in exchange
  const address = await account.getAccountAddress()

  // this sets up account context and makes it ready to relay txns, and returns fn which can be used to execute
  // It internally sets up caching for gas price as well
  const { executeTransactions } = setupExecute(account)

  // get supported markets, refer sdk for in-depth documentation
  const markets = await router.supportedMarkets(undefined, undefined)

  // filter requried market/s, unique id is market token address of market. refer sdk for detailed documentation
  const ethMarket = markets.find((e) => e.marketId === '42161-GMXV2-0x70d95587d40A2caf56bd97485aB3Eec10Bee6336')!

  // create eth short
  const orderData: CreateOrder = {
    type: 'MARKET',
    direction: 'SHORT',
    slippage: undefined, // undefined or 0-100
    triggerData: undefined, // only valid for market orders
    collateral: tokens.ETH,
    marketId: ethMarket.marketId,
    sizeDelta: { amount: FixedNumber.fromString('40', 30), isTokenAmount: false }, // in USD e30 tems
    marginDelta: { amount: FixedNumber.fromString('0.005', 18), isTokenAmount: true }, // in collateral token terms
  }

  const unsignedTxs = await router.increasePosition([orderData], address)
  const mapped = unsignedTxs.map((t) => {
    return { to: t.to, data: t.data, value: t.value } as Transaction
  })

  // returns userOp recepit once confirmed
  // NOTE: ETH for keeper fee and gas fee is deducted from smart account
  // for any revert, it will throw error
  // if error starts with "AA", refer 4337 EIP to know cause
  console.log(await executeTransactions(mapped))
}

main()
  .then(() => process.exit())
  .catch((e) => console.log(e))
