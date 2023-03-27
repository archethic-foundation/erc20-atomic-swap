import Joi from 'joi'

import { enabledNetworks } from '../utils.js'

function networkIdValidator(value) {
  if (!(value in enabledNetworks)) {
    throw new Error(`ethereumChainId must be in ${enabledNetworks}`)
  }
  return value
}

export default {
  deployContract: {
    body: Joi.object({
      amount: Joi.number().required().min(1),
      recipientAddress: Joi.string().hex().length(68).required(),
      secretHash: Joi.string().hex().length(64).required(),
      ethereumContractAddress: Joi.string().regex(/^0x[a-fA-F0-9]*$/).required(),
      ethereumContractTransaction: Joi.string().regex(/^0x[a-fA-F0-9]*$/).required(),
      ethereumChainId: Joi.number().required().custom(networkIdValidator)
    })
  },
  withdraw: {
    body: Joi.object({
      archethicContractAddress: Joi.string().hex().length(68).required(),
      ethereumContractAddress: Joi.string().regex(/^0x[a-fA-F0-9]*$/).required(),
      ethereumWithdrawTransaction: Joi.string().regex(/^0x[a-fA-F0-9]*$/).required(),
      secret: Joi.string().hex().required(),
      ethereumChainId: Joi.number().required().custom(networkIdValidator)
    })
  }
}
