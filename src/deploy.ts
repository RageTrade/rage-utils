import { ethers } from 'ethers'
import { ChainId } from '@biconomy-devx/core-types'
import { Bundler } from '@biconomy-devx/bundler'
import { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS } from '@biconomy-devx/account'
import { DEFAULT_ECDSA_OWNERSHIP_MODULE, ECDSAOwnershipValidationModule } from '@biconomy-devx/modules'

export const createAccount = async (wallet: ethers.Signer, bundler: Bundler) => {
  const module = await ECDSAOwnershipValidationModule.create({
    signer: wallet,
    moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE,
  })

  let biconomySmartAccount = await BiconomySmartAccountV2.create({
    bundler: bundler,
    activeValidationModule: module,
    defaultValidationModule: module,
    chainId: ChainId.ARBITRUM_ONE_MAINNET,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  })

  return biconomySmartAccount
}
