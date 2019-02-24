import 'mocha';
import { expect } from 'chai';
import { mightSelfdestruct } from '../src';
import Contract from './utils/contract.class';

describe('Contracts', () => {
    describe('hello_world.sol', () => {
        const contract = new Contract("hello_world.sol");

        it('should compile without errors', () => {
            expect(contract.valid(), contract.errors().join("\n")).to.be.true;
        });

        it('should not detect selfdestruct', () => {
            expect(mightSelfdestruct(contract.bytecode())).to.be.false;
        });
    });

    describe('selfdestruct.sol', () => {
        const contract = new Contract("selfdestruct.sol");

        it('should compile without errors', () => {
            expect(contract.valid(), contract.errors().join("\n")).to.be.true;
        });

        it('should detect selfdestruct', () => {
            expect(mightSelfdestruct(contract.bytecode())).to.be.true;
        });
    });

    describe('metadata.sol', () => {
        const contract = new Contract("metadata.sol");

        it('should compile without errors', () => {
            expect(contract.valid(), contract.errors().join("\n")).to.be.true;
        });

        it('should include false positive selfdestruct (`ff`) in metadata hash', () => {
            expect(contract.hash()).to.include('ff');
        });

        it('should not detect selfdestruct', () => {
            expect(mightSelfdestruct(contract.bytecode())).to.be.false;
        });
    });
});
