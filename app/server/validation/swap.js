import Joi from 'joi'

export default {
  deployContract: {
    body: Joi.object({
      amount: Joi.number().required().min(1e8).max(100e8),
      recipientAddress: Joi.string().hex().length(68).required(),
      secretHash: Joi.string().hex().length(64).required(),
      endTime: Joi.date().timestamp().required(),
      ethereumContractAddress: Joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required(),
      ethereumChainId: Joi.number().required().valid(1, 5, 1337)
    })
  },
  withdraw: {
    body: Joi.object({
      archethicContractAddress: Joi.string().hex().length(68).required(),
      ethereumContractAddress: Joi.string().regex(/^0x[a-fA-F0-9]{40}$/).required(),
      secret: Joi.string().hex().required(),
      ethereumChainId: Joi.number().required().valid(1, 5, 1337)
    })
  }
}
