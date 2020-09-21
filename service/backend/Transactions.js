const mysql = require('mysql');
const {respondWithCode, respondWithError} = require("../../utils/writer");

/**
 * Used to do transactions of amount between two accounts
 */
class Transactions {
    // DB connection instance
    #connection;

    /**
     * Transactions constructor
     * @param config
     */
    constructor(config) {
        this.#connection = mysql.createConnection(config)
        this.#connection.connect(function(err) {
            if (err) throw err;
        });
    }

    /**
     * Fetches account information for given account id
     *
     * @param id
     * @returns {Promise<Array>}
     */
    #fetchAccount = id => new Promise((resolve, reject) => {
        this.#connection.query('SELECT id, accountType, balance FROM users WHERE id = ?', this.#connection.escape(id), (err, rows) => {
            if (err) {
                reject(err);
            } else
                resolve(rows[0]);
        });
    });

    /**
     * Updates balance for given account
     *
     * @param id
     * @param balance
     * @returns {Promise<*>}
     */
    #updateBalance = (id, balance) => new Promise((resolve, reject) => {
        this.#connection.query('UPDATE users SET balance = ? WHERE id = ?', [balance, id], (err, rows) => {
            if (err) {
                reject(err);
            } else
                resolve();
        });
    });

    /**
     * Creates a new transaction
     *
     * @param sourceId
     * @param destId
     * @param amount
     * @param date
     * @returns {Promise<*>}
     */
    #createTransaction = (sourceId, destId, amount, date) => new Promise((resolve, reject) => {
        this.#connection.query('INSERT INTO transactions (source, destination, amount, date) VALUE (?, ?, ?, ?)', [sourceId, destId, amount, date], (err, rows) => {
            if (err) {
                reject(err);
            } else
                resolve();
        });
    });

    /**
     * Transfers the said amount from source to destination account
     *
     * @param source
     * @param dest
     * @param amount
     * @returns {Promise<Object>}
     */
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

        if (!sourceAccount)
            throw respondWithError(404, 'Source account not found.')

        if (sourceAccount.balance < amount) {
            throw respondWithError(422, 'Not enough funds in source account.');
        }

        try {
            destAccount = await this.#fetchAccount(dest);
        } catch (err) {
            throw respondWithError(500, err.toString());
        }

        if (!destAccount)
            throw respondWithError(404, 'Destination account not found.')

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
