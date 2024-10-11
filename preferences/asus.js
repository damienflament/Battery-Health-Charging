'use strict';
const {Adw, Gio, GLib, GObject} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var Asus = GObject.registerClass({
    GTypeName: 'BHC_Asus',
    Template: `file://${GLib.build_filenamev([Me.path, 'ui', 'asus.ui'])}`,
    InternalChildren: [
        'skip_threshold_verification',
    ],
}, class Asus extends Adw.PreferencesPage {
    constructor(settings) {
        super({});
        settings.bind(
            'skip-threshold-verification',
            this._skip_threshold_verification,
            'active',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
});
