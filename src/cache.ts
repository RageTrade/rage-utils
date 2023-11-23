import { ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

export const arbitrumGasCache = (provider: ethers.providers.Provider) => {
  let gasPrice = parseUnits('0.1', 9)

  const setFn = () => {
    provider
      .getGasPrice()
      .then((gp: ethers.BigNumber) => {
        gasPrice = gp
      })
      .catch((e: any) => {
        console.log('error while fetching gas', e)
      })
  }

  const readFn = () => {
    return gasPrice
  }

  setInterval(setFn, 10_000)

  return { readFn }
}
