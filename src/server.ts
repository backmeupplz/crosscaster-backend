import 'module-alias/register'
import 'source-map-support/register'

import populateUsersToCheck from '@/helpers/populateUsersToCheck'
import runApp from '@/helpers/runApp'
import runMongo from '@/helpers/mongo'
import startCheckingTwitter from '@/helpers/startCheckingTwitter'

void (async () => {
  console.log('Starting mongo')
  await runMongo()
  console.log('Mongo connected')
  console.log('Starting subscriptions...')
  await populateUsersToCheck()
  startCheckingTwitter()
  console.log('Subscriptions started')
  console.log('Starting app')
  await runApp()
  console.log('App started')
})()
