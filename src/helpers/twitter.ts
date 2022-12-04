import { TwitterApi } from 'twitter-api-v2'
import env from '@/helpers/env'

const twitterClient = new TwitterApi(env.TWITTER_BEARER_TOKEN)
export default twitterClient.readOnly
