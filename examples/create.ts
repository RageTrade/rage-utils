import { Transaction } from '@biconomy-devx/core-types'
import { init, setupExecute, createAccount } from '../src'
import { tokens } from 'perp-aggregator-sdk/src/common/tokens'
import GmxV2Service from 'perp-aggregator-sdk/src/exchanges/gmxv2'
import { FixedNumber } from 'perp-aggregator-sdk/src/common/fixedNumber'
import { CreateOrder } from 'perp-aggregator-sdk/src/interfaces/V1/IRouterAdapterBaseV1'

async function main() {
  const env = init()
  const gmxV2 = new GmxV2Service()

  const account = await createAccount(env.signer, env.bundler)
  const address = await account.getAccountAddress()

  const { executeTransactions } = setupExecute(account)

  const markets = await gmxV2.supportedMarkets(undefined, undefined)
  const ethMarket = markets.find((e) => e.marketId === '42161-GMXV2-0x70d95587d40A2caf56bd97485aB3Eec10Bee6336')!

  // create eth long
  const orderData: CreateOrder = {
    type: 'MARKET',
    direction: 'SHORT',
    slippage: undefined,
    triggerData: undefined,
    collateral: tokens.ETH,
    marketId: ethMarket.marketId,
    sizeDelta: { amount: FixedNumber.fromString('40', 30), isTokenAmount: false },
    marginDelta: { amount: FixedNumber.fromString('0.005', 18), isTokenAmount: true },
  }

  const unsignedTxs = await gmxV2.increasePosition([orderData], address)
  const mapped = unsignedTxs.map((t) => {
    return { to: t.to, data: t.data, value: t.value } as Transaction
  })

  console.log(await executeTransactions(mapped))
}

main()
  .then(() => process.exit())
  .catch((e) => console.log(e))
