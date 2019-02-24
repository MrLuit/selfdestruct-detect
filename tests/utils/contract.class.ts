import * as fs from 'fs';
const solc = require("solc");

export default class Contract {
    private output: any;

    loadFile(filename: string) {
        const source = fs.readFileSync("./tests/contracts/" + filename, "utf8");
        const input = {
            language: 'Solidity',
            sources: {
                [filename]: {
                    content: source
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': [ '*' ]
                    }
                }
            }
        }
        this.output = JSON.parse(solc.compile(JSON.stringify(input)));
    }

    load(name: string, content: string) {
        const input = {
            language: 'Solidity',
            sources: {
                [name]: {
                    content: content
                }
            },
            settings: {
                outputSelection: {
                    '*': {
                        '*': [ '*' ]
                    }
                }
            }
        }
        this.output = JSON.parse(solc.compile(JSON.stringify(input)));
    }

    valid() {
        return 'contracts' in this.output && (!('errors' in this.output) || this.output.errors.length === 0);
    }

    errors() {
        return (this.output.errors || []).map((error: any) => error.formattedMessage);
    }

    bytecode() {
        const { contracts } = this.output;
        const filename = Object.keys(contracts)[0];
        const contract = contracts[filename];
        const name = Object.keys(contract)[0];
        const bytecode = contract[name].evm.deployedBytecode.object;
        return bytecode;
    }

    hash(): string {
        const regex = /a165627a7a72305820([a-f0-9]{64})0029$/;
        const match = this.bytecode().match(regex);
        if (match && match[1]) {
            return match[1];
        } else {
            return '';
        }
    }
}