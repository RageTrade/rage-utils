import { arbitrumGasCache } from './cache'
import { Transaction } from '@biconomy-devx/core-types'
import { BiconomySmartAccountV2 } from '@biconomy-devx/account'

export const setupExecute = (account: BiconomySmartAccountV2) => {
  const smartAccount = account

  const { readFn } = arbitrumGasCache(account.provider)

  const executeTransactions = async (txs: Transaction[]) => {
    const partial = await smartAccount.buildUserOp(txs, {
      overrides: {
        maxFeePerGas: readFn(),
        maxPriorityFeePerGas: readFn(),
      },
    })

    const response = await smartAccount.sendUserOp(partial)

    const recepit = await response.wait()

    return recepit
  }

  return { executeTransactions }
}
