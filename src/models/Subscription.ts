import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'

@modelOptions({
  schemaOptions: { timestamps: true },
})
export class Subscription {
  @prop({ index: true, lowercase: true, required: true })
  mnemonic!: string
  @prop({ index: true, lowercase: true })
  twitterUsername?: string
}

export const SubscriptionModel = getModelForClass(Subscription)
