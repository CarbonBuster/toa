const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true, region: process.AWS_REGION || 'eu-west-1' });

class AtomicSwapEvent {
  constructor() {}

  withId(id) {
    this.id = id;
    return this;
  }

  withTimelock(timelock) {
    this.timelock = timelock;
    return this;
  }

  withValue(value) {
    this.value = value;
    return this;
  }

  withTokenAddress(address) {
    this.tokenAddress = address;
    return this;
  }

  withSwappee(swappee) {
    this.swappee = swappee;
    return this;
  }

  withHash(hash) {
    this.hash = hash;
    return this;
  }

  withXAddress(xAddress) {
    this.xAddress = xAddress;
    return this;
  }

  withStatus(status) {
    this.status = status;
    return this;
  }

  withEvent(event) {
    this.event = event;
    return this;
  }

  save() {
    let Item = {
      id: this.id,
      timelock: this.timelock,
      value: this.value,
      tokenAddress: this.tokenAddress,
      swappee: this.swappee,
      hash: this.hash,
      xAddress: this.xAddress,
      status: this.status,
      event: this.event
    };
    return documentClient
      .put({
        TableName: 'AtomicSwapEvents',
        Item,
        ConditionExpression: 'attribute_not_exists(#id)',
        ExpressionAttributeNames: {
          '#id': 'id'
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

module.exports = AtomicSwapEvent;
