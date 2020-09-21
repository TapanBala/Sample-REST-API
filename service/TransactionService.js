'use strict';

const Backend = require('./backend/Transactions.js')
const transactions = new Backend({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB || 'bank',
})

/**
 * Create a new transaction to transfer amount from one account to another
 *
 * body NewTransaction
 * returns TransactionSuccess
 **/
exports.createTransaction = function (body) {
    return new Promise(function (resolve, reject) {
        transactions.create(body.fromAccountId, body.toAccountId, body.amount).then(res =>{
            resolve(res);
        }).catch(err => {
            reject(err);
        })
    });
}

