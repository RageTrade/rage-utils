import { z } from 'zod'
import { config } from 'dotenv'
import { ethers } from 'ethers'

import { Bundler } from '@biconomy-devx/bundler'
import { ChainId } from '@biconomy-devx/core-types'
import { DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy-devx/account'

const schema = z.object({
  ARB_RPC: z.string(),
  PRIVATE_KEY: z.string(),
  BUNDLER_URL: z.string(),
})

export const init = () => {
  config()

  const parsed = schema.parse({
    ARB_RPC: process.env.ARB_RPC,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    BUNDLER_URL: process.env.BUNDLER_URL,
  })

  const signer = new ethers.Wallet(parsed.PRIVATE_KEY)
  const provider = new ethers.providers.StaticJsonRpcProvider(parsed.ARB_RPC)

  const bundler = new Bundler({
    bundlerUrl: parsed.BUNDLER_URL,
    chainId: ChainId.ARBITRUM_ONE_MAINNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })

  return {
    signer,
    bundler,
    provider,
  }
}
