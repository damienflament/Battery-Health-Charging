'use strict';
const {Gtk} = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const DeviceList = Me.imports.lib.deviceList;

const {General} = Me.imports.preferences.general;
const {Apple} = Me.imports.preferences.apple;
const {Asus} = Me.imports.preferences.asus;
const {Chromebook} = Me.imports.preferences.chromebook;
const {Dell} = Me.imports.preferences.dell;
const {Framework} = Me.imports.preferences.framework;
const {Thinkpad} = Me.imports.preferences.thinkpad;
const {ThresholdPrimary} = Me.imports.preferences.thresholdPrimary;
const {ThresholdSecondary} = Me.imports.preferences.thresholdSecondary;
const {About} = Me.imports.preferences.about;

function fillPreferencesWindow(window) {
    let currentDevice = null;
    const settings = ExtensionUtils.getSettings();
    const dir = Me.dir;
    const type = settings.get_int('device-type');
    if (type !== 0) {
        const device = new DeviceList.deviceArray[type - 1](settings);
        if (device.type === type)
            currentDevice = device;
    }

    const iconTheme = Gtk.IconTheme.get_for_display(window.get_display());
    const iconsDirectory = Me.dir.get_child('icons').get_path();
    iconTheme.add_search_path(iconsDirectory);

    window.set_default_size(650, 700);
    window.add(new General(settings, currentDevice, dir));
    if (currentDevice) {
        if (currentDevice.deviceHaveVariableThreshold) // Laptop has customizable threshold
            window.add(new ThresholdPrimary(settings, currentDevice));

        if (currentDevice.deviceHaveDualBattery) // Laptop has dual battery
            window.add(new ThresholdSecondary(settings, currentDevice));

        if (currentDevice.type === 1 || currentDevice.type === 2|| currentDevice.type === 3|| currentDevice.type === 4) // device.type 1,2,3,4 is Asus
            window.add(new Asus(settings));
        else if (currentDevice.type === 16) // device.type 16 is AppleIntel
            window.add(new Apple(settings));
        else if (currentDevice.type === 22 && (settings.get_strv('multiple-configuration-supported').length > 1 ||
            settings.get_string('configuration-mode') === 'cctk')) // device.type 22 is Dell
            window.add(new Dell(settings));
        else if (currentDevice.type === 31 && settings.get_strv('multiple-configuration-supported').length > 1) // device.type 31 is Framework
            window.add(new Framework(settings));
        else if (currentDevice.type === 35 && settings.get_strv('multiple-configuration-supported').length > 1) // device.type 35 is Chromebook
            window.add(new Chromebook(settings));
        else if (currentDevice.type === 20 || currentDevice.type === 21) // device.type 20,21 is Thinkpad
            window.add(new Thinkpad(settings));
    }
    window.add(new About(Me));
}

function init() {
    ExtensionUtils.initTranslations(Me.metadata.uuid);
}
