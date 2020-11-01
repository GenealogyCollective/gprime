import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette,
  MainAreaWidget
} from '@jupyterlab/apputils';
import { IFileBrowserFactory } from '@jupyterlab/filebrowser';
import { ILauncher } from '@jupyterlab/launcher';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { Widget } from '@lumino/widgets';

import { requestAPI } from './handler';

/**
 * Initialization data for the gprime extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
    id: 'gprime',
    autoStart: true,
    requires: [IFileBrowserFactory],
    optional: [ILauncher, IMainMenu, ICommandPalette],
    activate: (
	app: JupyterFrontEnd,
	browserFactory: IFileBrowserFactory,
	launcher: IFileBrowserFactory,
	mainMenu: IMainMenu | null,
	palette: ICommandPalette | null
    ) => {
    console.log('JupyterLab extension gprime is activated!!!');

    // Create a blank content widget inside of a MainAreaWidget
    const content = new Widget();
    const widget = new MainAreaWidget({ content });
    widget.id = 'gprime-jupyterlab';
    widget.title.label = 'gprime Genealogy';
    widget.title.closable = true;

    // Add an application command
    const command: string = 'gprime:open';
    app.commands.addCommand(command, {
      label: 'gprime Window',
      execute: () => {
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    });

      // Add the command to the palette.
      if (palette) {
	  palette.addItem({ command, category: 'Application' });
      } else {
	  console.log("palette is null");
      }
      if (mainMenu) {
	  //
      } else {
	  console.log("mainmenu is null");
      }

    // Get some info from the gprime_server:
    requestAPI<any>('get_example')
      .then(data => {
        console.log(data);
      })
      .catch(reason => {
        console.error(
          `The gprime_server server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default extension;
