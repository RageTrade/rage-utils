import { z } from 'zod'
import { config } from 'dotenv'
import { Wallet, ethers } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

import RouterV1 from 'perp-aggregator-sdk/router/RouterV1'
import { tokens } from 'perp-aggregator-sdk/src/common/tokens'
import { FixedNumber } from 'perp-aggregator-sdk/src/common/fixedNumber'
import { UnsignedTxWithMetadata } from 'perp-aggregator-sdk/src/interface'
import { ClosePositionData, CreateOrder } from 'perp-aggregator-sdk/src/interfaces/V1/IRouterAdapterBaseV1'

const schema = z.object({
  ARB_RPC: z.string(),
  PRIVATE_KEY: z.string(),
})

const init = () => {
  config()

  const parsed = schema.parse({
    ARB_RPC: process.env.ARB_RPC,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
  })

  const provider = new ethers.providers.StaticJsonRpcProvider(parsed.ARB_RPC)
  const signer = new ethers.Wallet(parsed.PRIVATE_KEY, provider)

  return {
    signer,
    provider,
  }
}

const { signer, provider } = init()
console.log('eoa wallet address:', signer.address)

const router = new RouterV1()
const chains = router.supportedChains()

const executeTxs = async (signer: Wallet, txs: UnsignedTxWithMetadata[]) => {
  for (const txData of txs) {
    if (!txData.tx) throw new Error('transaction data not found')
    console.log('executing ', txData.heading)

    //@ts-ignore
    const exec = await signer.sendTransaction(txData.tx)

    await exec.wait(1)
  }
}

const closeAllPositions = async () => {
  // get all positions for all markets on all protocols
  // refer sdk for in-depth documentation
  const positions = (await router.getAllPositions(signer.address, undefined)).result
  console.dir(positions, { depth: 4 })

  const txs = []

  for (const pos of positions) {
    const closeData: ClosePositionData = {
      closeSize: pos.size,
      type: 'MARKET',
      triggerData: undefined, // not required for market
      outputCollateral: tokens.ETH, // input collateral if "undefined"
    }

    txs.push(await router.closePosition([pos], [closeData], signer.address))
  }

  console.log(txs)

  //@ts-ignore
  await executeTxs(signer, txs)

  console.log('eoa eth balance:', formatEther(await provider.getBalance(signer.address)))
}

const trade = async () => {
  console.log('eoa eth balance:', formatEther(await provider.getBalance(signer.address)))

  // get supported markets on arbitrum, refer sdk for in-depth documentation
  const markets = await router.supportedMarkets([chains.find((c) => c.id === 42161)!], undefined)
  // console.dir(markets, { depth: 4 })

  // filter requried market/s by token symbol. refer sdk for detailed documentation
  const ethMarketGmxV2 = markets.find((e) => e.marketSymbol === 'ETH')!
  // console.dir(ethMarketGmxV2, { depth: 4 })

  // get eth index token market for gmx v1
  const ethMarketGmxV1 = markets.find((e) => e.marketSymbol === 'ETH')!
  // console.dir(ethMarketGmxV1, { depth: 4 })

  // create eth short
  const orderDataV2: CreateOrder = {
    type: 'MARKET',
    direction: 'SHORT',
    slippage: undefined, // undefined or 0-100
    triggerData: undefined, // only required for limit orders
    collateral: tokens.ETH,
    marketId: ethMarketGmxV2.marketId,
    sizeDelta: { amount: FixedNumber.fromString('40', 30), isTokenAmount: false }, // in USD e30 tems
    marginDelta: { amount: FixedNumber.fromString('0.005', 18), isTokenAmount: true }, // in collateral token terms
  }

  // create eth lopg
  const orderDataV1: CreateOrder = {
    type: 'MARKET',
    direction: 'LONG',
    slippage: undefined, // undefined or 0-100
    triggerData: undefined, // only required for limit orders
    collateral: tokens.ETH,
    marketId: ethMarketGmxV1.marketId,
    sizeDelta: { amount: FixedNumber.fromString('40', 30), isTokenAmount: false }, // in USD e30 tems
    marginDelta: { amount: FixedNumber.fromString('0.005', 18), isTokenAmount: true }, // in collateral token terms
  }

  const unsignedTxsV2 = await router.increasePosition([orderDataV2], signer.address)
  const unsignedTxsV1 = await router.increasePosition([orderDataV1], signer.address)

  //@ts-ignore
  await executeTxs(signer, unsignedTxsV1)
  //@ts-ignore
  await executeTxs(signer, unsignedTxsV2)
}

// trade()
//   .then(() => console.log('script run complete'))
//   .catch((e) => console.error(e))

closeAllPositions()
  .then(() => console.log('script run complete'))
  .catch((e) => console.error(e))
