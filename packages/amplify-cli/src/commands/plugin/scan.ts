import Context from '../../domain/context';
import * as pluginManager from '../../plugin-manager';

export default async function scan(context: Context) {
    await pluginManager.scan();
}