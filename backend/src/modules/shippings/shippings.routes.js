
const express = require('express');
const controller = require('./shippings.controller');

const publicRouter = express.Router();
publicRouter.get('/wilayas', controller.listWilayas);
publicRouter.get('/communes', controller.listCommunes);

module.exports = { publicRouter };