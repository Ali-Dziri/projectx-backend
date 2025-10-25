import { Injectable } from '@nestjs/common';
import { CodeTypes } from 'src/common/types/generators-types';
import crypto from 'node:crypto';

@Injectable()
export class CodeGeneratorService {
  codeFactory() {
    return new CodeFactory();
  }

  csrfFactory() {
    return new CSRFactory();
  }
}

class CodeFactory {
  private length: number;
  private type: CodeTypes;
  private prefix?: string | null;
  static numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  static hexadecimal = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];
  static alphatics = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
  ];
  static alphanumeric = [...CodeFactory.numbers, ...CodeFactory.alphatics];

  constructor() {
    this.length = 10;
    this.type = CodeTypes.NUMERIC;
    this.prefix = null;
  }

  static pickRandom(arr: string[]): string {
    const randomIndex = crypto.randomInt(0, arr.length);
    return arr[randomIndex];
  }

  static generateCode(length: number, arr: string[]): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += this.pickRandom(arr);
    }
    return code;
  }

  withLength(length: number): CodeFactory {
    this.length = length;
    return this;
  }

  withType(type: CodeTypes): CodeFactory {
    this.type = type;
    return this;
  }

  withPrefix(prefix: string): CodeFactory {
    this.prefix = prefix;
    return this;
  }

  build() {
    let generatedCode: string = '';
    switch (this.type) {
      case CodeTypes.NUMERIC:
        generatedCode = CodeFactory.generateCode(
          this.length,
          CodeFactory.numbers,
        );
        break;
      case CodeTypes.ALPHANUMERIC:
        generatedCode = CodeFactory.generateCode(
          this.length,
          CodeFactory.alphanumeric,
        );
        break;
      case CodeTypes.HEX:
        generatedCode = CodeFactory.generateCode(
          this.length,
          CodeFactory.hexadecimal,
        );
        break;
      case CodeTypes.ALPHABETIC:
        generatedCode = CodeFactory.generateCode(
          this.length,
          CodeFactory.alphatics,
        );
        break;
      default:
        generatedCode = CodeFactory.generateCode(
          this.length,
          CodeFactory.numbers,
        );
        break;
    }

    if (this.prefix) {
      return `${this.prefix}_${generatedCode}`;
    }
    return generatedCode;
  }
}

class CSRFactory {
  private randomBytes;
  private randomUUID;
  constructor() {
    this.randomBytes = '';
    this.randomUUID = '';
  }

  withRandomBytes(length: number, type: BufferEncoding) {
    this.randomBytes = crypto.randomBytes(length).toString(type);
    return this;
  }

  withRandomUUID() {
    this.randomUUID = crypto.randomUUID();
    return this;
  }

  build() {
    return `${this.randomBytes}:${this.randomUUID}`;
  }
}
