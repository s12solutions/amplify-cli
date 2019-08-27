import Context from '../../domain/context';
import { verifyPlugin } from '../../plugin-manager';

export default async function verify(context: Context) {
    const verificatonResult = await verifyPlugin(process.cwd());
    console.log(verificatonResult);
}