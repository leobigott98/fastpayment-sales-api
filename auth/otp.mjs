import { customAlphabet }  from 'nanoid';
const alphabet = '0123456789';
export const nanoid = customAlphabet(alphabet, 6);