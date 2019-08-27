import Context from '../../domain/context';
import { scan as pluginManagerScan } from '../../plugin-manager';

export default async function scan(context: Context) {
    await pluginManagerScan();
}