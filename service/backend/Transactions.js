const mysql = require('mysql');
const {respondWithCode, respondWithError} = require("../../utils/writer");

class Transactions {
    #connection;

    constructor(config) {
        this.#connection = mysql.createConnection(config)
        this.#connection.connect(function(err) {
            if (err) throw err;
        });
    }

    #fetchAccount = id => new Promise((resolve, reject) => {
        this.#connection.query('SELECT id, accountType, balance FROM users WHERE id = ?', this.#connection.escape(id), (err, rows) => {
            if (err) {
                reject(err);
            } else
                resolve(rows[0]);
        });
    });

    #updateBalance = (id, balance) => new Promise((resolve, reject) => {
        this.#connection.query('UPDATE users SET balance = ? WHERE id = ?', [balance, id], (err, rows) => {
            if (err) {
                reject(err);
            } else
                resolve();
        });
    });

    #createTransaction = (sourceId, destId, amount, date) => new Promise((resolve, reject) => {
        this.#connection.query('INSERT INTO transactions (source, destination, amount, date) VALUE (?, ?, ?, ?)', [sourceId, destId, amount, date], (err, rows) => {
            if (err) {
                reject(err);
            } else
                resolve();
        });
    });

    create = async (source, dest, amount) => {
        if (source === dest) {
            throw respondWithError(422, 'Source and destination accounts cannot be same.');
        }

        let sourceAccount, destAccount;
        try {
            sourceAccount = await this.#fetchAccount(source);
        } catch (err) {
            throw respondWithError(500, err.toString());
        }

        if (sourceAccount.balance < amount) {
            throw respondWithError(422, 'Not enough funds in source account.');
        }

        try {
            destAccount = await this.#fetchAccount(dest);
        } catch (err) {
            throw respondWithError(500, err.toString());
        }

        if (destAccount.accountType === 'basicSavings' && (destAccount.balance + amount) > 5000000) {
            throw respondWithError(422, 'Destination account limit reached.');
        }

        let transactionDate = new Date();
        let sourceBalance = sourceAccount.balance - amount;
        let destBalance = destAccount.balance + amount;

        this.#connection.beginTransaction();
        try {
            await this.#createTransaction(source, dest, amount, transactionDate);
            await this.#updateBalance(source, sourceBalance);
            await this.#updateBalance(dest, destBalance);
        } catch (err) {
            this.#connection.rollback();
            throw respondWithError(500, err.toString());
        }

        this.#connection.commit();

        return respondWithCode(202, {
            newSrcBalance: sourceBalance,
            totalDestBalance: destBalance,
            transferredAt: transactionDate,
        });
    };
}

module.exports = Transactions;
