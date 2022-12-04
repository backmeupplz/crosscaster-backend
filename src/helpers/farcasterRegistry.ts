import { Contract } from 'ethers'
import farcasterRegistryABI from '@/helpers/farcasterRegistryABI'
import provider from '@/helpers/provider'

export default new Contract(
  '0xda107a1caf36d198b12c16c7b6a1d1c795978c42',
  farcasterRegistryABI
).connect(provider)
