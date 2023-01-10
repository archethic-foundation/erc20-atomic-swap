import express from 'express'
import { validate } from 'express-validation'
import queue from "express-queue";

import swapControllers from '../controllers/swap.js'
import swapValidations from '../validation/swap.js'

const router = express.Router()

router.use(queue({ activeLimit: 1, queuedLimit: 10 }))

router.route('/deployContract')
  .post(validate(swapValidations.deployContract), swapControllers.deployContract)

router.route('/withdraw')
  .post(validate(swapValidations.withdraw), swapControllers.withdraw)

export default router
