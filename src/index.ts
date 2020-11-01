import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the gprime extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'gprime',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension gprime is activated!!!');

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
