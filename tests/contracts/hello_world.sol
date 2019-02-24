pragma solidity 0.5.4;

contract Contract {
    event HelloWorld(string);

    function () external {
        emit HelloWorld("Hello, world!");
    }
}