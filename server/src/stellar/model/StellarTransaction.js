const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({convertEmptyValues: true});

class StellarTransaction {
    static Types = {
        Refund: 'REFUND'
    }

    withEventId(eventId){
        this.eventId = eventId;
        return this;
    }

    withTransactionType(transactionType){
        this.transactionType = transactionType;
        return this;
    }

    withTransactionEnvelope(transactionEnvelope){
        this.transactionEnvelope = transactionEnvelope;
        return this;
    }
}

module.exports = StellarTransaction;