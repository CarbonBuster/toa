const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true, region: process.AWS_REGION || 'eu-west-1' });

class ToaEvent {
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

  withSwapper(swapper) {
    this.swapper = swapper;
    return this;
  }

  withHash(hash) {
    this.hash = hash;
    return this;
  }

  withTargetAddress(targetAddress) {
    this.targetAddress = targetAddress;
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

  withTargetChain(targetChain) {
    this.targetChain = targetChain;
    return this;
  }

  withHoldingAddress(holdingAddress) {
    this.holdingAddress = holdingAddress;
    return this;
  }

  withPreimage(preimage) {
    this.preimage = preimage;
    return this;
  }

  withSourceChain(sourceChain) {
    this.sourceChain = sourceChain;
    return this;
  }

  static loadFrom(swap) {
    return new ToaEvent()
      .withId(swap.id)
      .withTimelock(swap.timelock)
      .withValue(swap.value)
      .withTokenAddress(swap.tokenAddress)
      .withSwappee(swap.swappee)
      .withHash(swap.hash)
      .withTargetAddress(swap.targetAddress)
      .withStatus(swap.status)
      .withEvent(swap.event)
      .withTargetChain(swap.targetChain)
      .withHoldingAddress(swap.holdingAddress)
      .withPreimage(swap.preimage)
      .withSourceChain(swap.sourceChain);
  }

  setPreimage(preimage) {
    return documentClient
      .update({
        TableName: 'ToaEvents',
        Key: {
          id: this.id,
          status: this.status
        },
        UpdateExpression: 'SET #preimage = :preimage',
        ConditionExpression: 'attribute_exists(#id) and attribute_exists(#status)',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#status': 'status',
          '#preimage': 'preimage'
        },
        ExpressionAttributeValues: {
          ':preimage': preimage
        }
      })
      .promise();
  }

  setValidated(validated) {
    return documentClient
      .update({
        TableName: 'ToaEvents',
        Key: {
          id: this.id,
          status: this.status
        },
        UpdateExpression: 'SET #validated = :validated',
        ConditionExpression: 'attribute_exists(#id) and attribute_exists(#status)',
        ExpressionAttributeNames: {
          '#validated': 'validated',
          '#id': 'id',
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':validated': validated
        }
      })
      .promise();
  }

  incrementAcceptCounter(count) {
    return documentClient
      .update({
        TableName: 'ToaEvents',
        Key: {
          id: this.id,
          status: this.status
        },
        UpdateExpression: 'ADD #acceptCounter :increment',
        ConditionExpression: 'attribute_exists(#id) and attribute_exists(#status)',
        ExpressionAttributeNames: {
          '#acceptCounter': 'acceptCounter',
          '#id': 'id',
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':increment': count
        }
      })
      .promise();
  }

  save() {
    const Item = {
      id: this.id,
      sourceChain: this.sourceChain,
      targetChain: this.targetChain,
      timelock: this.timelock,
      tokenAddress: this.tokenAddress,
      value: this.value,
      swapper: this.swapper,
      swappee: this.swappee,
      hash: this.hash,
      targetAddress: this.targetAddress,
      holdingAddress: this.holdingAddress,
      status: this.status,
      preimage: this.preimage
    };
    return documentClient
      .put({
        TableName: 'ToaEvents',
        Item,
        ConditionExpression: 'attribute_not_exists(#id) and attribute_not_exists(#status)',
        ExpressionAttributeNames: {
          '#id': 'id',
          '#status': 'status'
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

module.exports = ToaEvent;
