pragma solidity ^0.4.23;

import "zeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract AtomicSwap {
    struct Swap {
        uint256 timelock;
        uint256 tokenValue;
        address swapper;
        address tokenAddress;
        address swappee;
        bytes32 hash;
        bytes preimage;
        string xAddress;
    }

    enum States {
        INVALID,
        OPEN,
        CLOSED,
        EXPIRED
    }

    mapping (bytes32 => Swap) private swaps;
    mapping (bytes32 => States) private swapStates;

    event Open(bytes32 _swapID, address _swappee,bytes32 _hash);
    event Expire(bytes32 _swapID);
    event Close(bytes32 _swapID, bytes _preimage);

    modifier onlyInvalidSwaps(bytes32 _swapID) {
        require (swapStates[_swapID] == States.INVALID, "Swap state must be INVALID");
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

    modifier onlyExpirableSwaps(bytes32 _swapID) {
        require (swaps[_swapID].timelock <= now, "Swap timelock must be less than or equal to NOW");
        _;
    }

    modifier onlyWithPreimage(bytes32 _swapID, bytes _preimage) {
        require (swaps[_swapID].hash == sha256(_preimage), "Swap must have secret");
        _;
    }

    function open(bytes32 _swapID, uint256 _tokenValue, address _tokenAddress, address _swappee, bytes32 _hash, uint256 _timelock, string _xAddress) public onlyInvalidSwaps(_swapID) {
        require(swapStates[_swapID] == States.INVALID, "Swap must be INVALID");
        // Transfer value from the swapper to this contract.
        ERC20 erc20Contract = ERC20(_tokenAddress);
        require(_tokenValue <= erc20Contract.allowance(msg.sender, address(this)), "Value must be less than or equal to allowance");
        require(erc20Contract.transferFrom(msg.sender, address(this), _tokenValue), "Transfer failed");

        // Store the details of the swap.
        Swap memory swap = Swap({
            timelock: _timelock,
            tokenValue: _tokenValue,
            swapper: msg.sender,
            tokenAddress: _tokenAddress,
            swappee: _swappee,
            hash: _hash,
            preimage: new bytes(0),
            xAddress: _xAddress
        });
        swaps[_swapID] = swap;
        swapStates[_swapID] = States.OPEN;
        emit Open(_swapID, _swappee, _hash);
    }

    function close(bytes32 _swapID, bytes _preimage) public onlyOpenSwaps(_swapID) onlyWithPreimage(_swapID, _preimage) {
        // Close the swap.
        Swap memory swap = swaps[_swapID];
        swaps[_swapID].preimage = _preimage;
        swapStates[_swapID] = States.CLOSED;

        // Transfer the token value from this contract to the swappee.
        ERC20 erc20Contract = ERC20(swap.tokenAddress);
        require(erc20Contract.transfer(swap.swappee, swap.tokenValue), "Transfer failed");

        emit Close(_swapID, _preimage);
    }

    function expire(bytes32 _swapID) public onlyOpenSwaps(_swapID) onlyExpirableSwaps(_swapID) {
        // Expire the swap.
        Swap memory swap = swaps[_swapID];
        swapStates[_swapID] = States.EXPIRED;

        // Transfer the token value from this contract back to the swapper.
        ERC20 erc20Contract = ERC20(swap.tokenAddress);
        require(erc20Contract.transfer(swap.swapper, swap.tokenValue), "Transfer failed");

        emit Expire(_swapID);
    }

    function check(bytes32 _swapID) public view returns (uint256 timelock, uint256 tokenValue, address tokenAddress, address swappee, bytes32 hash, string xAddress) {
        Swap memory swap = swaps[_swapID];
        return (swap.timelock, swap.tokenValue, swap.tokenAddress, swap.swappee, swap.hash, swap.xAddress);
    }

    function checkSecretKey(bytes32 _swapID) public view onlyClosedSwaps(_swapID) returns (bytes preimage) {
        Swap memory swap = swaps[_swapID];
        return swap.preimage;
    }
}