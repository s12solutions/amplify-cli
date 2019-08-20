import Context from '../domain/context';
import readJsonFile from '../utils/readJsonFile';
import path from 'path';

export function run(context: Context) {
    const packageJsonFilePath = path.join(__dirname, '../../package.json');
    console.log(readJsonFile(packageJsonFilePath).version);
}