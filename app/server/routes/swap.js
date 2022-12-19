import express from 'express'
import { validate } from 'express-validation'

import swapControllers from '../controllers/swap.js'
import swapValidations from '../validation/swap.js'

const router = express.Router()

router.route('/deployContract')
  .post(validate(swapValidations.deployContract), swapControllers.deployContract)

router.route('/withdraw')
  .post(validate(swapValidations.withdraw), swapControllers.withdraw)

export default router
