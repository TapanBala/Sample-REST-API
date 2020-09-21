'use strict';

let utils = require('../utils/writer.js');
let Transaction = require('../service/TransactionService');

module.exports.createTransaction = function createTransaction(req, res, next) {
    let body = req.swagger.params['body'].value;
    Transaction.createTransaction(body)
        .then(function (response) {
            utils.writeJson(res, response);
        })
        .catch(function (response) {
            utils.writeJson(res, response);
        });
};
