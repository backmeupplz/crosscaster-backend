import { Body, Controller, Ctx, Delete, Get, Params, Post } from 'amala'
import { Context } from 'koa'
import { SubscriptionModel } from '@/models/Subscription'
import { badRequest } from '@hapi/boom'
import { ethers } from 'ethers'
import Mnemonic from '@/validators/Mnemonic'
import TwitterUsername from '@/validators/TwitterUsername'
import farcasterRegistry from '@/helpers/farcasterRegistry'

@Controller('/subscription')
export default class SetupController {
  @Get('/')
  get(@Params({ required: true }) { mnemonic }: Mnemonic) {
    return SubscriptionModel.findOne({ mnemonic })
  }

  @Post('/')
  async post(
    @Ctx() ctx: Context,
    @Body({ required: true })
    { mnemonic, twitterUsername }: Mnemonic & TwitterUsername
  ) {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic)
    const id = await farcasterRegistry.idOf(wallet.address)
    if (id.lte(0)) {
      return ctx.throw(badRequest('Account must be registered on Farcaster'))
    }
    return SubscriptionModel.findOneAndUpdate(
      { mnemonic },
      { twitterUsername },
      { upsert: true, new: true }
    )
  }

  @Delete('/')
  delete(@Params({ required: true }) { mnemonic }: Mnemonic) {
    return SubscriptionModel.findOneAndDelete({ mnemonic })
  }
}
