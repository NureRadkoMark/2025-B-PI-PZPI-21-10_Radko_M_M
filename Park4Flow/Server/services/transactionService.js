const {Transaction} = require('../models/models')
class TransactionService {
    //Universal create new transaction
    static async create(Amount, Currency, userID, type, paymentSource, status, info) {
        return await Transaction.create({
            UserUserID: userID,
            Type: type,
            Amount: Amount,
            Currency: Currency,
            PaymentSource: paymentSource,
            DateAndTime: new Date(),
            Status: status,
            Info: info
        });
    }

    //Update transaction status
    static async update(transactionID, status) {
        return await Transaction.update({
            Status: status },
            { where: {
                TransactionID: transactionID
            } });
    }
}

module.exports = TransactionService