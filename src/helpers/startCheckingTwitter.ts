import { SubscriptionModel } from '@/models/Subscription'
import cast from '@/helpers/cast'
import twitter from '@/helpers/twitter'
import usersToCheck from '@/helpers/usersToCheck'

let checking = false
async function checkTwitter() {
  if (checking) return
  checking = true
  try {
    for (const idToCheck of usersToCheck) {
      const { data } = await twitter.v2.userTimeline(idToCheck, {
        exclude: ['retweets', 'replies'],
        max_results: 10,
      })
      if (!data.data.length) {
        continue
      }
      const subscriptions = await SubscriptionModel.find({
        twitterId: idToCheck,
      })
      for (const subscription of subscriptions) {
        const lastSeenTweetId = subscription.lastSeenTweetId
        const newTweets = data.data.filter(
          (tweet) => !lastSeenTweetId || tweet.id > lastSeenTweetId
        )
        if (!newTweets.length) {
          continue
        }
        // Cast new tweets
        for (const tweet of newTweets) {
          try {
            console.log(`Casting tweet ${tweet.id} from ${tweet.author_id}`)
            await cast(subscription.mnemonic, tweet.text)
          } catch (errorCasting) {
            console.error(errorCasting)
          }
        }
        // Save last seent tweet id
        const lastSeenTweet = newTweets[newTweets.length - 1]
        await SubscriptionModel.findOneAndUpdate(
          { _id: subscription._id },
          { lastSeenTweetId: lastSeenTweet.id }
        )
      }
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
  } finally {
    console.log('Done checking')
    checking = false
  }
}

export default function () {
  void checkTwitter()
  setInterval(checkTwitter, 15 * 60 * 1000)
}
