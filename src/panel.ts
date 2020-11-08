import {
    ITranslator,
    TranslationBundle
} from '@jupyterlab/translation';

import { StackedPanel } from '@lumino/widgets';

const PANEL_CLASS = 'gprime-panel';

export class gPrimePanel extends StackedPanel {
    private _translator: ITranslator;
    private _trans: TranslationBundle;
    
    constructor(translator: ITranslator) {
	super();
	this._translator = translator;
	this._trans = this._translator.load('jupyterlab');

	this.addClass(PANEL_CLASS);
	this.id = 'gPrimePanel';
	this.title.label = this._trans.__('gPrime');
	this.title.closable = true;
    }
}
