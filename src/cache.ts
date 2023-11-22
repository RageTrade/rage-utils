import { ethers } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'

let gasPrice = parseUnits('0.1', 9)

export const arbitrumGasCache = (provider: ethers.providers.Provider) => {
  const fn = () => {
    provider
      .getGasPrice()
      .then((gp) => {
        gasPrice = gp
      })
      .catch((e) => {
        console.log('error while fetching gas', e)
      })
  }

  setInterval(fn, 10_000)
}
