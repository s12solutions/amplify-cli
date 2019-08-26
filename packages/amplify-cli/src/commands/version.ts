import Context from '../domain/context';
import { readJsonFileSync } from '../utils/readJsonFile';
import path from 'path';

export function run(context: Context) {
    const packageJsonFilePath = path.join(__dirname, '../../package.json');
    console.log(readJsonFileSync(packageJsonFilePath).version);
}