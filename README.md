# EVM Selfdestruct Detection
[![](https://img.shields.io/travis/com/MrLuit/selfdestruct-detect.svg?style=flat-square)](https://travis-ci.com/MrLuit/selfdestruct-detect)
[![](https://img.shields.io/npm/v/selfdestruct-detect.svg?style=flat-square)](https://www.npmjs.com/package/selfdestruct-detect)
[![](https://img.shields.io/david/MrLuit/selfdestruct-detect.svg?style=flat-square)](https://david-dm.org/MrLuit/selfdestruct-detect)
[![](https://img.shields.io/github/license/MrLuit/selfdestruct-detect.svg?style=flat-square)](https://github.com/MrLuit/selfdestruct-detect/blob/master/LICENSE)
    
Detect the possibility of a self-destruction happening during the execution of an Ethereum smart contract by determining whether the runtime bytecode ran by the [Ethereum Virtual Machine](https://medium.com/@jeff.ethereum/optimising-the-ethereum-virtual-machine-58457e61ca15) contains a (possibly) reachable `SELFDESTRUCT` instruction.

## Usage

> npm i selfdestruct-detect

## How does it work?
First of all, the application breaks down bytecode into its opcodes. Secondly, it loops over the opcodes, and skips over push data (if any). If it comes across a halting opcode (`STOP`, `RETURN`, `REVERT`, `INVALID`, `SELFDESTRUCT`), it will correctly assume all following opcodes are **unreachable**, until it can find a valid jump destination (`JUMPDEST`). While this method does prevent some false positives (like the [metadata hash](https://solidity.readthedocs.io/en/latest/metadata.html), included by the Solidity compiler), it will not detect whether code is unreachable due to exceptional halting, excluding halting due to the `INVALID` (`0xfe`) opcode.

**Please note that this tool is unable to determine whether a contract will *actually* self destruct at any given time, it only detects whether it *might* be possible.**

## Why is this useful?
Ethereum's Constantinople fork introduces a new opcode called [CREATE2](https://eips.ethereum.org/EIPS/eip-1014), which allows contracts to deploy other contracts at address `keccak256( 0xff ++ address ++ salt ++ keccak256(init_code))[12:]` (instead of the usual `keccak256(rlp([sender, nonce]))`). Unfortunetaly, including `keccak256(init_code)` in the address formula does not prevent contracts from redeploying different code at the same address. For example, `init_code` could essentially just be *"call contract x for runtime bytecode"* which would allow for `keccak256(initCode)` to stay the same, even if contract x decides to return different runtime bytecode.

While there is no way to deploy code at an address which already exists in the state, contracts can remove themselves from the state by self-destructing (using the `SELFDESTRUCT` opcode), which would allow different code to be redeployed. Since (currently) there's no way of finding out whether a contract was deployed using `CREATE2`, a possible detection method for this attack vector would be to check whether the runtime bytecode contains a `SELFDESTRUCT` opcode. Interfaces which allow users to interact with Ethereum smart contracts can (and should!) implement this check to warn users when interacting with unstable smart contracts.

Read more: [Potential security implications of CREATE2? (EIP-1014)](https://ethereum-magicians.org/t/potential-security-implications-of-create2-eip-1014/2614)

## Example

#### Node.js

```javascript
const { mightSelfdestruct } = require("selfdestruct-detect");
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider("https://api.mycryptoapi.com/eth"));
const CryptoKitties = "0x06012c8cf97BEaD5deAe237070F9587f8E7A266d";

web3.eth.getCode(CryptoKitties).then(code => {
    if(mightSelfdestruct(code)) {
        console.log("Warning: CryptoKitties contract possibly contains a self-destruct method!");
    } else {
        console.log("Success: CryptoKitties contract does not contain a reachable self-destruct instruction.");
    }
});
```

#### Browser
```javascript
const { mightSelfdestruct } = window.SelfdestructDetect;
const web3 = new Web3(new Web3.providers.HttpProvider("https://api.mycryptoapi.com/eth"));
const DAI = "0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359";

web3.eth.getCode(DAI, function(err, code) {
    if(err) throw err;
    if(mightSelfdestruct(code)) {
        console.log("Warning: DAI contract possibly contains a self-destruct method!");
    } else {
        console.log("Success: DAI contract does not contain a reachable self-destruct instruction.");
    }
});
```

## References
- [EIP 1014: Skinny CREATE2](https://eips.ethereum.org/EIPS/eip-1014)
- [Potential security implications of CREATE2? (EIP-1014)](https://ethereum-magicians.org/t/potential-security-implications-of-create2-eip-1014/2614)