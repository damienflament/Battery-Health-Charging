'use strict';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';

export const Framework = GObject.registerClass({
    GTypeName: 'BHC_Framework',
    Template: GLib.Uri.resolve_relative(import.meta.url, '../ui/framework.ui', GLib.UriFlags.NONE),
    InternalChildren: [
        'device_settings_group',
        'choose_configuration',
    ],
}, class Framework extends Adw.PreferencesPage {
    constructor(settings) {
        super({});
        this._settings = settings;
        this._settings.bind(
            'framework-apply-threshold-mode',
            this._choose_configuration,
            'selected',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
});
