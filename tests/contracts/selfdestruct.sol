pragma solidity 0.5.4;

contract Contract {
    function () external {
        selfdestruct(msg.sender);
    }
}