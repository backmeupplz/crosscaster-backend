import { ethers } from 'ethers'
import { publishCast } from '@standard-crypto/farcaster-js'

export default async function (mnemonic: string, text: string) {
  const wallet = ethers.Wallet.fromMnemonic(mnemonic)
  await publishCast(wallet, text)
}
