import Context from '../../domain/context';
import { verifyPlugin } from '../../plugin-manager';

export default async function verify(context: Context) {
    const verificatonResult = await verifyPlugin(process.cwd());
    if(verificatonResult.verified){
        context.print.success('The current directory is verified to be a valid Amplify CLI plugin package.');
        context.print.info('');
    }else{
        context.print.error('The current directory faied Amplify CLI plugin verification.');
        context.print.info(`Error code: ${verificatonResult.error}`); 
        context.print.info('');
    }
}