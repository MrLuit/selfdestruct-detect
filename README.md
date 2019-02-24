# EVM Selfdestruct Detection
[![](https://img.shields.io/travis/com/MrLuit/selfdestruct-detect.svg?style=flat-square)](https://travis-ci.com/MrLuit/selfdestruct-detect)
[![](https://img.shields.io/npm/v/selfdestruct-detect.svg?style=flat-square)](https://www.npmjs.com/package/selfdestruct-detect)
[![](https://img.shields.io/david/MrLuit/selfdestruct-detect.svg?style=flat-square)](https://david-dm.org/MrLuit/selfdestruct-detect)
[![](https://img.shields.io/github/license/MrLuit/selfdestruct-detect.svg?style=flat-square)](https://github.com/MrLuit/selfdestruct-detect/blob/master/LICENSE)
    
Detect the possibility of a self-destruction happening during the execution of an Ethereum smart contract by determining whether the runtime bytecode ran by the [Ethereum Virtual Machine](https://medium.com/@jeff.ethereum/optimising-the-ethereum-virtual-machine-58457e61ca15) contains a possibly reachable `SELFDESTRUCT` instruction.

## Usage

> npm i selfdestruct-detect

## Features
- Unreachable code (like the [metadata hash](https://solidity.readthedocs.io/en/latest/metadata.html)) will not result in a false positive

## How does it work?
First of all, the application breaks down bytecode into its opcodes. Secondly, it loops over the opcodes, and skips over push data (if any). If it comes across a halting opcode (`STOP`, `RETURN`, `REVERT`, `INVALID`, `SELFDESTRUCT`), it will correctly assume all following opcodes are **unreachable**, until it can find a valid jump destination (`JUMPDEST`). While this method does prevent false positives caused by the metadata hash included by the Solidity compiler, it will not detect whether code is unreachable due to exceptional halting, excluding halting due to the `INVALID` (`0xfe`) opcode. Please note that his tool is also not able to determine whether a contract will *actually* self destruct at any given time, it only detects whether it *might* be possible.

## Example

#### Node.js

```javascript
const { mightSelfdestruct } = require("selfdestruct-detect");
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://api.mycryptoapi.com/eth"));

web3.eth.getCode("0x06012c8cf97BEaD5deAe237070F9587f8E7A266d").then(code => {  /* CryptoKitties contract */
    console.log(mightSelfdestruct(code));
});
```

#### Browser
```javascript
const { mightSelfdestruct } = window.SelfdestructDetector;
const web3 = new Web3(window.web3.currentProvider);
web3.eth.getCode("0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359", function(err,code) {  /* DAI contract */
    if(err) throw err;
    console.log(mightSelfdestruct(code));
});
```