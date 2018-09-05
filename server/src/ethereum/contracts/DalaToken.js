const SmartContractBase = require('./SmartContractBase');
const contract = require('../../../lib/DalaToken.json');

class DalaToken extends SmartContractBase {
  constructor(params) {
    super(contract, params);
  }

  async approve(spender, value) {
    const transaction = await this.contractInstance.approve(spender, value, {
      from: this.signerAddress,
      gas: this.gas
    });
    return transaction;
  }

  async allowance(owner, spender){
    const allowance = await this.contractInstance.allowance(owner, spender);
    return allowance;
  }
}

module.exports = DalaToken;
