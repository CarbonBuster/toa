const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true, region: process.AWS_REGION || 'eu-west-1' });

class StellarTransaction {
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

    save() {
        let Item = {
          eventId: this.eventId,
          transactionType: this.transactionType,
          transactionEnvelope: this.transactionEnvelope
        };
        return documentClient
          .put({
            TableName: 'StellarTransactions',
            Item,
            ConditionExpression: 'attribute_not_exists(#eventId)',
            ExpressionAttributeNames: {
              '#eventId': 'eventId'
            }
          })
          .promise()
          .catch(error => {
            if (error.code !== 'ConditionalCheckFailedException') {
              throw error;
            }
          });
      }
}

module.exports = StellarTransaction;