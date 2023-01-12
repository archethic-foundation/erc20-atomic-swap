import express from 'express'
import { validate } from 'express-validation'

import balanceControllers from '../controllers/balance.js'
import balanceValidations from '../validation/balance.js'

const router = express.Router()

router.route('/archethic/:address')
  .get(validate(balanceValidations.archethicBalance), balanceControllers.getArchethicBalance)

export default router
