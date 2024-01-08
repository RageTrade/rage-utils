import { ethers } from 'ethers'

const walletGen = () => {
  const wallet = ethers.Wallet.createRandom()
  console.log('PK: ', wallet.privateKey)
  console.log('ADDRESS: ', wallet.address)
}

walletGen()
