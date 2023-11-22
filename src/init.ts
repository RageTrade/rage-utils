import { z } from 'zod'
import { config } from 'dotenv'
import { ethers } from 'ethers'

const schema = z.object({
  ARB_RPC: z.string(),
  PRIVATE_KEY: z.string(),
  BUNDLER_URL: z.string(),
})

export const init = () => {
  config()

  const env = {
    ARB_RPC: process.env.ARB_RPC,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    BUNDLER_URL: process.env.BUNDLER_URL,
  }

  const parsed = schema.parse(env)

  const signer = new ethers.Wallet(parsed.PRIVATE_KEY)
  const provider = new ethers.providers.StaticJsonRpcProvider(parsed.ARB_RPC)

  return {
    signer,
    provider,
    bundlerUrl: parsed.BUNDLER_URL,
  }
}
