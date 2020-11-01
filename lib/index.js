import { requestAPI } from './handler';
/**
 * Initialization data for the gprime extension.
 */
const extension = {
    id: 'gprime',
    autoStart: true,
    activate: (app) => {
        console.log('JupyterLab extension gprime is activated!!!');
        requestAPI('get_example')
            .then(data => {
            console.log(data);
        })
            .catch(reason => {
            console.error(`The gprime_server server extension appears to be missing.\n${reason}`);
        });
    }
};
export default extension;
