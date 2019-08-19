import Context from '../../domain/context';
import { verifyPlugin } from '../../plugin-manager';

export default function verify(context: Context) {
    const verificatonResult = verifyPlugin(process.cwd());
    console.log(verificatonResult);
}