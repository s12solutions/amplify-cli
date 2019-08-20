import add from './plugin/add';
import configure from './plugin/configure';
import newplugin from './plugin/new';
import list from './plugin/list';
import remove from './plugin/remove';
import scan from './plugin/scan';
import verify from './plugin/verify';
import help from './plugin/help';
import Context from '../domain/context';

export async function run(context: Context) {
    let subcommand = 'help'; 

    if(context.input.subCommands && context.input.subCommands.length > 0){
        subcommand = context.input.subCommands![0];
    }

    switch (subcommand) {
        case 'add':
            await add(context);
            break;
        case 'configure':
            await configure(context);
            break;
        case 'new':
            await newplugin(context);
            break;
        case 'init':
            await newplugin(context);
            break;
        case 'list':
            await list(context);
            break;
        case 'remove':
            await remove(context);
            break;
        case 'scan':
            await scan(context);
            break;
        case 'verify':
            await verify(context);
            break;
        case 'help':
            await help(context);
            break;
    }
}