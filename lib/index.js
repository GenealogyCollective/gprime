import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ITranslator } from '@jupyterlab/translation';
import { gPrimePanel } from './panel';
import { populateMenu } from './utils';
/**
 * Initialization data for the extension1 extension.
 */
const extension = {
    id: 'gprime',
    autoStart: true,
    requires: [ICommandPalette, ITranslator, ILauncher, IMainMenu],
    activate: async (app, palette, translator, launcher, mainMenu) => {
        const { commands, shell } = app;
        const manager = app.serviceManager;
        const trans = translator.load('jupyterlab');
        function createPanel() {
            let panel;
            return manager.ready.then(async () => {
                panel = new gPrimePanel(translator);
                shell.add(panel, 'main');
                return panel;
            });
        }
        // Add launcher
        if (launcher) {
            launcher.add({
                command: "gprime:launch",
                category: trans.__("Applications")
            });
        }
        commands.addCommand("gprime:launch", {
            label: trans.__('Launch gPrime'),
            caption: trans.__('Launch gPrime'),
            execute: createPanel
        });
        await populateMenu(commands, shell, mainMenu, translator);
    }
};
export default extension;
