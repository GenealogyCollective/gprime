import { ICommandPalette } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';
import { ITranslator } from '@jupyterlab/translation';
import { gPrimePanel } from './panel';
/**
 * Initialization data for the extension1 extension.
 */
const extension = {
    id: 'gprime',
    autoStart: true,
    requires: [ICommandPalette, ITranslator, ILauncher],
    activate: async (app, palette, translator, launcher) => {
        const { commands, shell } = app;
        const manager = app.serviceManager;
        const trans = translator.load('jupyterlab');
        function createPanel() {
            let panel;
            return manager.ready.then(async () => {
                panel = new gPrimePanel(translator);
                await panel.populateMenu(commands, shell);
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
    }
};
export default extension;
