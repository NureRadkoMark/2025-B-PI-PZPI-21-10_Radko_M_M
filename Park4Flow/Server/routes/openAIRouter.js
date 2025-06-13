const Router = require('express')
const router = new Router()
const {flexibleOpenAIRequest} = require('../APIs/openAI')

router.post("/analyze", flexibleOpenAIRequest);

module.exports = router