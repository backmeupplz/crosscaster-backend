import { Body, Controller, Ctx, Delete, Get, Post, Query } from 'amala'
import { Context } from 'koa'
import { SubscriptionModel } from '@/models/Subscription'
import { UserV2Result } from 'twitter-api-v2'
import { badRequest } from '@hapi/boom'
import { ethers } from 'ethers'
import Mnemonic from '@/validators/Mnemonic'
import TwitterUsername from '@/validators/TwitterUsername'
import farcasterRegistry from '@/helpers/farcasterRegistry'
import twitter from '@/helpers/twitter'
import usersToCheck from '@/helpers/usersToCheck'

@Controller('/subscription')
export default class SetupController {
  @Get('/')
  async get(@Query({ required: true }) { mnemonic }: Mnemonic) {
    return (await SubscriptionModel.findOne({ mnemonic })) || {}
  }

  @Post('/')
  async post(
    @Ctx() ctx: Context,
    @Body({ required: true })
    { mnemonic, twitterUsername }: Mnemonic & TwitterUsername
  ) {
    // Check if on Farcaster
    const wallet = ethers.Wallet.fromMnemonic(mnemonic)
    const id = await farcasterRegistry.idOf(wallet.address)
    if (id.lte(0)) {
      return ctx.throw(badRequest('Account must be registered on Farcaster'))
    }
    // Find Twitter ID
    let twitterUser: UserV2Result
    try {
      twitterUser = await twitter.v2.userByUsername(twitterUsername)
    } catch {
      return ctx.throw(badRequest('Twitter user not found'))
    }
    usersToCheck.add(twitterUser.data.id)
    // Get the latest tweets
    const { data } = await twitter.v2.userTimeline(twitterUser.data.id, {
      exclude: ['retweets', 'replies'],
      max_results: 10,
    })
    return SubscriptionModel.findOneAndUpdate(
      { mnemonic },
      {
        twitterUsername,
        twitterId: twitterUser.data.id,
        lastSeenTweetId: data.data[0]?.id,
      },
      { upsert: true, new: true }
    )
  }

  @Delete('/')
  async delete(@Query({ required: true }) { mnemonic }: Mnemonic) {
    const deletedUser = await SubscriptionModel.findOneAndDelete({ mnemonic })
    if (deletedUser) {
      const otherUsersListeningCount = await SubscriptionModel.countDocuments({
        twitterId: deletedUser?.twitterId,
      })
      if (otherUsersListeningCount === 0) {
        usersToCheck.delete(deletedUser.twitterId)
      }
    }
    return {
      success: true,
    }
  }
}
