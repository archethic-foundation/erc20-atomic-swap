import Joi from 'joi'

export default {
  archethicBalance: {
    params: Joi.object({
      address: Joi.string().hex().length(68).required(),
    })
  }
}
