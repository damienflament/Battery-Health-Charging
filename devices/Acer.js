'use strict';
/* Acer Laptops using dkms https://github.com/frederik-h/acer-wmi-battery/issues */
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import * as Helper from '../lib/helper.js';

const {exitCode, fileExists, readFileInt, runCommandCtl} = Helper;

const ACER_PATH = '/sys/bus/wmi/drivers/acer-wmi-battery/health_mode';

export const AcerSingleBattery = GObject.registerClass({
    Signals: {'threshold-applied': {param_types: [GObject.TYPE_STRING]}},
}, class AcerSingleBattery extends GObject.Object {
    constructor(settings) {
        super();
        this.name = 'Acer';
        this.type = 17;
        this.deviceNeedRootPermission = true;
        this.deviceHaveDualBattery = false;
        this.deviceHaveStartThreshold = false;
        this.deviceHaveVariableThreshold = false;
        this.deviceHaveBalancedMode = false;
        this.deviceHaveAdaptiveMode = false;
        this.deviceHaveExpressMode = false;
        this.deviceUsesModeNotValue = false;
        this.iconForFullCapMode = '100';
        this.iconForMaxLifeMode = '080';

        this._settings = settings;
        this.ctlPath = null;
    }

    isAvailable() {
        if (!fileExists(ACER_PATH))
            return false;
        return true;
    }

    async setThresholdLimit(chargingMode) {
        if (chargingMode === 'ful')
            this._healthMode = 0;
        else if (chargingMode === 'max')
            this._healthMode = 1;

        if (this._verifyThreshold())
            return exitCode.SUCCESS;

        const [status] = await runCommandCtl(this.ctlPath, 'ACER', `${this._healthMode}`, null, null);
        if (status === exitCode.ERROR) {
            this.emit('threshold-applied', 'failed');
            return exitCode.ERROR;
        }

        if (this._verifyThreshold())
            return exitCode.SUCCESS;

        if (this._delayReadTimeoutId)
            GLib.source_remove(this._delayReadTimeoutId);
        this._delayReadTimeoutId = null;

        await new Promise(resolve => {
            this._delayReadTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
                resolve();
                return GLib.SOURCE_REMOVE;
            });
        });
        this._delayReadTimeoutId = null;

        if (this._verifyThreshold())
            return exitCode.SUCCESS;

        this.emit('threshold-applied', 'failed');
        return exitCode.ERROR;
    }

    _verifyThreshold() {
        const endLimitValue = readFileInt(ACER_PATH);
        if (this._healthMode === endLimitValue) {
            if (endLimitValue === 1)
                this.endLimitValue = 80;
            else
                this.endLimitValue = 100;
            this.emit('threshold-applied', 'success');
            return true;
        }
        return false;
    }

    destroy() {
        if (this._delayReadTimeoutId)
            GLib.source_remove(this._delayReadTimeoutId);
        this._delayReadTimeoutId = null;
    }
});

