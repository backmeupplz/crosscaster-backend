import { SubscriptionModel } from '@/models/Subscription'
import usersToCheck from '@/helpers/usersToCheck'

export default async function () {
  const subscriptions = await SubscriptionModel.find()
  for (const subscription of subscriptions) {
    usersToCheck.add(subscription.twitterId)
  }
}
