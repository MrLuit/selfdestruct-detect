
const STOP = 0x00;
const JUMPDEST = 0x5b;
const PUSH1 = 0x60;
const PUSH32 = 0x7f;
const RETURN = 0xf3;
const REVERT = 0xfd;
const INVALID = 0xfe;
const SELFDESTRUCT = 0xff;

const isHalting = (opcode: number): boolean => [ STOP, RETURN, REVERT, INVALID, SELFDESTRUCT ].includes(opcode);
const isPUSH = (opcode: number): boolean => opcode >= PUSH1 && opcode <= PUSH32;

export const mightSelfdestruct = (code: string): boolean => {
    const bytecode = Buffer.from(code, 'hex');
    let halted = false;
    for (let index = 0; index < bytecode.length; index++) {
        const opcode = bytecode[index];
        if(opcode === SELFDESTRUCT && !halted) {
            return true;
        } else if(opcode === JUMPDEST) {
            halted = false;
        } else if(isHalting(opcode)) {
            halted = true;
        } else if(isPUSH(opcode)) {
            index += opcode - PUSH1 + 0x01;
        }
    }
    return false;
}

export default mightSelfdestruct;