---
layout: default
title: Slimbook
parent: Device Compatibility
permalink: /device-compatibility/slimbook
---
<style>
.outer-container {
   display: table;
   width: 100%;
}
.txt-horizantal-align {
   width: 50%;
   display: table-cell;
   text-align: center;
}
</style>

# Slimbook

## Capability
* 3 presets: Full Capacity Mode, Balance Mode, and Maximum Life Span mode.
* Default threshold values of these 3 preset modes are set at 100%, 80%, and 60%.
* Each preset threshold value can be customized between 100-80 %, 85-65 %, and 85-50 % respectively.

## Dependencies
Depends on separate kernel module `slimbook-qc71-dkms` (dkms) installation, that need to be installed.<br>
<https://github.com/Slimbook-Team/slimbook-qc71-dkms>

{: .note }
`slimbook-qc71-dkms` module is supported by a third party and this extension/author is not in any way responsible for the kernel module installation, bugs or damages.

## Detection
This extension supports Slimbook laptops by checking the existence of following sysfs path for charging threshold below.

`/sys/class/power_supply/BAT0/charge_control_end_threshold`<br>

Additionally it will also check the existence of sysfs path for wmi.

`/sys/devices/platform/qc71_laptop`

## Quick Settings
<br>
<img src="../assets/images/device-compatibility/slimbook/quick-settings.png" width="100%">
<div class="outer-container">
    <span class="txt-horizantal-align"><b>Gnome 43 and above</b></span>
    <span class="txt-horizantal-align"><b>Gnome 42</b></span>
</div>

## Extension Preferences
<br>
<img src="../assets/images/device-compatibility/slimbook/settings.png" width="100%">

## Information
The extension applies threshold using `echo` command.<br>
Charging threshold value can be applied by using `echo` command in `terminal`.
Command below are helpful :
* Prior to installing extension, to check compatibility.
* During debugging, to check if threshold can be applied and read using command-line correctly.
* Incase user decides to not use extension and prefer changing via command-line.

<br>
**For example:**<br>To apply threshold value of `60`, the command would be.

Require root privileges
{: .label .label-yellow .mt-0}
```bash
echo '60' > /sys/class/power_supply/BAT0/charge_control_end_threshold
```
<br>
The current threshold value can also be read using `cat` command in `terminal`. For example, the laptops battery name in power supply sysfs is `BAT0`, command would be.
```bash
cat /sys/class/power_supply/BAT0/charge_control_end_threshold
```
<br>

{: .important-title }
> Condition for applying threshold
>
> * Accepted values for `charge_control_end_threshold` : 1 - 100

