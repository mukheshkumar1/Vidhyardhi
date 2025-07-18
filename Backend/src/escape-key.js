import { readFile } from 'fs/promises';

const key = await readFile('../apikey.json', 'utf8');
const escaped = key.replace(/\n/g, '\\n');
console.log(escaped);
