import Context from '../../domain/context';

export default function help(context: Context) {
    context.print.info(''); 

    const commands = [
        {
          name: 'init',
          description: 'Creates a new Amplify CLI plugin package for further development.',
        },
        {
          name: 'configure',
          description: 'Configures plugin scan behavior of the Amplify CLI pluggable platform.',
        },
        {
          name: 'list',
          description: 'Lists the current status of the Amplify CLI pluggable platform.',
        },
        {
          name: 'scan',
          description: 'Manualls starts a scan for plugins.',
        },
        {
          name: 'add',
          description: 'Manually adds a plugin into the Amplify CLI.',
        },
        {
          name: 'remove',
          description: 'Removes a plugin from the Amplify CLI',
        },
        {
          name: 'verify',
          description: 'Verifies if a package is a valid Amplify CLI plugin.',
        },
        {
          name: 'help',
          description: 'Prints out the this help message.',
        }
    ]; 
    const tableOptions = [];
    for (let i = 0; i < commands.length; i += 1) {
        tableOptions.push([commands[i].name, commands[i].description]);
    }
    context.print.table(tableOptions, { format: 'default' });

    context.print.info(''); 
}