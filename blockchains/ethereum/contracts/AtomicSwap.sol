pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract AtomicSwap {
    struct Swap {
        uint256 timelock;
        uint256 tokenValue;
        string sourceAddress;
        address swapper;
        address tokenAddress;
        address swappee;
        bytes32 hash;
        bytes preimage;
        string targetAddress;
        string swapType;
    }

    enum States {
        INVALID,
        OPEN,
        CLOSED,
        EXPIRED,
        ACCEPTED,
        PREPARED
    }

    enum Operations {
        Open,
        Prepare
    }

    address private erc20Address;
    ERC20 private erc20Contract;

    mapping (bytes32 => Swap) private swaps;
    mapping (bytes32 => States) private swapStates;
    mapping (address => bytes32[]) public swapsByAddress;

    event Open(bytes32 indexed _swapID, address _swappee, bytes32 _hash);
    event Expire(bytes32 indexed _swapID);
    event Close(bytes32 indexed _swapID, bytes _preimage);
    event Accept(bytes32 indexed _swapID, string _holdingAddress);
    event Prepare(bytes32 indexed _swapID);

    modifier onlyInvalidSwaps(bytes32 _swapID, uint _operation) {
        if(Operations(_operation) == Operations.Open)
            require (swapStates[_swapID] == States.INVALID || swapStates[_swapID] == States.PREPARED, "Swap state must be INVALID or PREPARED");
        _;
    }

    modifier onlyOpenSwaps(bytes32 _swapID) {
        require (swapStates[_swapID] == States.OPEN, "Swap state must be OPEN");
        _;
    }

    modifier onlyClosedSwaps(bytes32 _swapID) {
        require (swapStates[_swapID] == States.CLOSED, "Swap state must be CLOSED");
        _;
    }

    modifier onlyAcceptedSwaps(bytes32 _swapID){
        require(swapStates[_swapID] == States.ACCEPTED, "Swap state must be ACCEPTED");
        _;
    }

    modifier onlyOpenOrAcceptedSwaps(bytes32 _swapID){
        States state = swapStates[_swapID];
        require(state == States.ACCEPTED || state == States.OPEN, "Swap state must be ACCEPTED or OPEN");
        _;
    }

    modifier onlyExpirableSwaps(bytes32 _swapID) {
        require (swaps[_swapID].timelock <= now, "Swap timelock must be less than or equal to NOW");
        _;
    }

    modifier onlyPreparedSwaps(bytes32 _swapID){
        States state = swapStates[_swapID];
        require(state == States.PREPARED, "Swap state must be PREPARED");
        _;
    }

    modifier onlyWithPreimage(bytes32 _swapID, bytes _preimage) {
        require (swaps[_swapID].hash == sha256(_preimage), "Swap must have secret");
        _;
    }

    modifier onlySwappee(bytes32 _swapID, address _swappee) {
        require (swaps[_swapID].swappee == _swappee, "Called must be swappee");
        _;
    }

    modifier validOperation(uint _operation){
        require(uint(Operations.Prepare) >= _operation, "_operation must be 0 or 1");
        _;
    }

    constructor(address _erc20Address){
        erc20Address = _erc20Address;
        erc20Contract = ERC20(_erc20Address);
    }

    function open(
        uint _operation,
        bytes32 _swapID, 
        uint256 _tokenValue, 
        address _swappee, 
        bytes32 _hash, 
        uint256 _timelock, 
        string _swapType, 
        string _targetAddress,
        string _sourceAddress) public onlyInvalidSwaps(_swapID, _operation) validOperation(_operation){

        Swap memory swap;
        Operations op = Operations(_operation);
        
        if(op == Operations.Open){
            if(swapStates[_swapID] == States.INVALID){
                // Transfer value from the swapper to this contract.
                require(_tokenValue <= erc20Contract.allowance(msg.sender, address(this)), "Value must be less than or equal to allowance");
                require(erc20Contract.transferFrom(msg.sender, address(this), _tokenValue), "Transfer failed");

                // Store the details of the swap.
                swap = Swap({
                    timelock: _timelock,
                    tokenValue: _tokenValue,
                    sourceAddress: "",
                    swapper: msg.sender,
                    tokenAddress: erc20Address,
                    swappee: _swappee,
                    hash: _hash,
                    preimage: new bytes(0),
                    targetAddress: _targetAddress,
                    swapType: _swapType
                });
                swaps[_swapID] = swap;
                swapStates[_swapID] = States.OPEN;
                swapsByAddress[msg.sender].push(_swapID);
                emit Open(_swapID, _swappee, _hash);
                return;
            }
            if(swapStates[_swapID] == States.PREPARED){
                swap = swaps[_swapID];
                swaps[_swapID].swapper = msg.sender;
                swapStates[_swapID] = States.OPEN;
                swapsByAddress[msg.sender].push(_swapID);

                require(swap.tokenValue <= erc20Contract.allowance(msg.sender, address(this)), "Value must be less than or equal to allowance");
                require(erc20Contract.transferFrom(msg.sender, address(this), swap.tokenValue), "Transfer failed");

                emit Open(_swapID, swap.swappee, swap.hash);
            }
        }
        if(op == Operations.Prepare){
            swap = Swap({
                timelock: _timelock,
                tokenValue: _tokenValue,
                tokenAddress: erc20Address,
                sourceAddress: _sourceAddress,
                swapper: address(0x0),
                swappee: msg.sender,
                hash: _hash,
                preimage: new bytes(0),
                targetAddress: _targetAddress,
                swapType: _swapType
            });
            swaps[_swapID] = swap;
            swapStates[_swapID] = States.PREPARED;
            swapsByAddress[msg.sender].push(_swapID);
            emit Prepare(_swapID);
        }
    }

    function accept(bytes32 _swapID, string _targetAddress) public onlyOpenSwaps(_swapID) {
        swaps[_swapID].targetAddress = _targetAddress;
        swapStates[_swapID] = States.ACCEPTED;
        emit Accept(_swapID, _targetAddress);
    }

    function close(bytes32 _swapID, bytes _preimage) public onlyAcceptedSwaps(_swapID) onlyWithPreimage(_swapID, _preimage) {
        // Close the swap.
        Swap memory swap = swaps[_swapID];
        swaps[_swapID].preimage = _preimage;
        swapStates[_swapID] = States.CLOSED;

        // Transfer the token value from this contract to the swappee.
        require(erc20Contract.transfer(swap.swappee, swap.tokenValue), "Transfer failed");

        emit Close(_swapID, _preimage);
    }

    function expire(bytes32 _swapID) public onlyOpenOrAcceptedSwaps(_swapID) onlyExpirableSwaps(_swapID) {
        // Expire the swap.
        Swap memory swap = swaps[_swapID];
        swapStates[_swapID] = States.EXPIRED;

        // Transfer the token value from this contract back to the swapper.
        require(erc20Contract.transfer(swap.swapper, swap.tokenValue), "Transfer failed");

        emit Expire(_swapID);
    }

    function getSwap(bytes32 _swapID) public view returns (
        uint256 timelock, 
        uint256 tokenValue, 
        address tokenAddress, 
        address swappee, 
        bytes32 hash, 
        string targetAddress, 
        string swapType,
        AtomicSwap.States states) {
        AtomicSwap.States _state = swapStates[_swapID];
        Swap memory swap = swaps[_swapID];
        return (
            swap.timelock, 
            swap.tokenValue, 
            swap.tokenAddress, 
            swap.swappee, 
            swap.hash, 
            swap.targetAddress, 
            swap.swapType,
            _state);
    }

    // function getSwapSource(bytes32 _swapID) public view returns (
    //     string sourceChain,
    //     string sourceAddress
    // ){
    //     Swap memory swap = swaps[_swapID];
    //     return (
    //         swap.sourceChain,
    //         swap.sourceAddress
    //     );
    // }

    function getPreimage(bytes32 _swapID) public view onlyClosedSwaps(_swapID) returns (bytes preimage) {
        Swap memory swap = swaps[_swapID];
        return swap.preimage;
    }
}