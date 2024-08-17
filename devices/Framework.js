'use strict';
/* Framework Laptops using dkms  https://github.com/DHowett/framework-laptop-kmod */
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import * as Helper from '../lib/helper.js';

const {fileExists, readFileInt, runCommandCtl} = Helper;

const VENDOR_FRAMEWORK = '/sys/devices/platform/framework_laptop';
const BAT1_END_PATH = '/sys/class/power_supply/BAT1/charge_control_end_threshold';
const CROS_EC_PATH = '/dev/cros_ec';


export const FrameworkSingleBatteryBAT1 = GObject.registerClass({
    Signals: {'threshold-applied': {param_types: [GObject.TYPE_STRING]}},
}, class FrameworkSingleBatteryBAT1 extends GObject.Object {
    constructor(settings) {
        super();
        this.name = 'Framework';
        this.type = 31;
        this.deviceNeedRootPermission = true;
        this.deviceHaveDualBattery = false;
        this.deviceHaveStartThreshold = false;
        this.deviceHaveVariableThreshold = true;
        this.deviceHaveBalancedMode = true;
        this.deviceHaveAdaptiveMode = false;
        this.deviceHaveExpressMode = false;
        this.deviceUsesModeNotValue = false;
        this.iconForFullCapMode = '100';
        this.iconForBalanceMode = '080';
        this.iconForMaxLifeMode = '060';
        this.endFullCapacityRangeMax = 100;
        this.endFullCapacityRangeMin = 80;
        this.endBalancedRangeMax = 85;
        this.endBalancedRangeMin = 65;
        this.endMaxLifeSpanRangeMax = 85;
        this.endMaxLifeSpanRangeMin = 50;
        this.incrementsStep = 1;
        this.incrementsPage = 5;

        this._settings = settings;
    }

    isAvailable() {
        if (!fileExists(VENDOR_FRAMEWORK))
            return false;

        this._hasSysfsNode = fileExists(BAT1_END_PATH);
        this._hasFrameworkTool = !!GLib.find_program_in_path('framework_tool');
        if (!this._hasSysfsNode && !this._hasFrameworkTool)
            return false;

        this._settings.set_boolean('detected-framework-sysfs', this._hasSysfsNode);
        this._settings.set_boolean('detected-framework-tool', this._hasFrameworkTool);

        if (this._hasFrameworkTool)
            this._frameworkToolDriver = fileExists(CROS_EC_PATH) ? 'cros_ec' : 'portio';

        return true;
    }

    async setThresholdLimit(chargingMode) {
        let status = 0;
        this._ctlPath = this._settings.get_string('ctl-path');
        this._endValue = this._settings.get_int(`current-${chargingMode}-end-threshold`);

        if (this._hasSysfsNode && this._hasFrameworkTool) {
            const frameworkApplyThresholdMode = this._settings.get_int('framework-apply-threshold-mode');
            if (frameworkApplyThresholdMode === 0)
                status = await this._setThresholdLimitSysFs();
            else if (frameworkApplyThresholdMode === 1)
                status = await this._setThresholdFrameworkTool();
        } else if (this._hasSysfsNode) {
            status = await this._setThresholdLimitSysFs();
        } else if (this._hasFrameworkTool) {
            status = await this._setThresholdFrameworkTool();
        }
        return status;
    }

    async _setThresholdLimitSysFs() {
        this._status = 0;
        if (this._verifyThreshold())
            return this._status;
        [this._status] = await runCommandCtl(this._ctlPath, 'BAT1_END', `${this._endValue}`, null, null);
        if (this._status === 0) {
            if (this._verifyThreshold())
                return this._status;
        }

        if (this._delayReadTimeoutId)
            GLib.source_remove(this._delayReadTimeoutId);
        this._delayReadTimeoutId = null;

        this._delayReadTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 200, () => {
            this._reVerifyThreshold();
            this._delayReadTimeoutId = null;
            return GLib.SOURCE_REMOVE;
        });
        return this._status;
    }

    _verifyThreshold() {
        this.endLimitValue = readFileInt(BAT1_END_PATH);
        if (this._endValue === this.endLimitValue) {
            this.emit('threshold-applied', 'success');
            return true;
        }
        return false;
    }

    _reVerifyThreshold() {
        if (this._status === 0) {
            if (this._verifyThreshold())
                return;
        }
        this.emit('threshold-applied', 'failed');
    }

    async _setThresholdFrameworkTool() {
        let output = await runCommandCtl(this._ctlPath, 'FRAMEWORK_TOOL_THRESHOLD_READ', this._frameworkToolDriver, null, null);
        if (this._verifyFrameworkToolThreshold(output))
            return 0;

        output = await runCommandCtl(this._ctlPath, 'FRAMEWORK_TOOL_THRESHOLD_WRITE', this._frameworkToolDriver, this._endValue, null);
        if (this._verifyFrameworkToolThreshold(output))
            return 0;

        this.emit('threshold-applied', 'failed');
        return 1;
    }

    _verifyFrameworkToolThreshold(output) {
        let endValue;
        const matchOutput = output[1].trim().match(/Minimum 0%, Maximum (\d+)%/);
        if (matchOutput) {
            endValue = parseInt(matchOutput[1]);
            if (!isNaN(endValue) && endValue > 0 && endValue <= 100 && this._endValue ===  endValue) {
                this.endLimitValue = this._endValue;
                this.emit('threshold-applied', 'success');
                return true;
            }
        }
        return false;
    }

    destroy() {
        if (this._delayReadTimeoutId)
            GLib.source_remove(this._delayReadTimeoutId);
        this._delayReadTimeoutId = null;
    }
});


