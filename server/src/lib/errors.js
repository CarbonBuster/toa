class UnhandledChainError extends Error {
    constructor(chain){
        super(`${chain} is unhandled.`);
        this.name = 'UnhandledChainError';
        this.chain = chain;
    }
}

module.exports = {
    UnhandledChainError
}