---
layout: default
title: Samsung
parent: Device Compatibility
permalink: /device-compatibility/samsung
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

# Samsung

## Capability
* 2 modes: Full Capacity Mode, and Maximum Life Span mode.
* The charging threshold are fixed at value 100% and 80%(85% in some models) and are not customizable.
* Full Capacity mode is the what Samsung refers to as `Smart Charging Mode` disabled (100%).
* Maximum Life Span mode is the what Samsung refers to as `Smart Charging Mode` enabled (80% or 85% depending on model).
* Maximum Life Span mode limits charging to 80% or 85% of battery level depending on the model.

## Dependencies
* No dependencies required.
* Samsung laptop that allows setting charging threshold are supported by mainline linux kernels.

## Testing charging threshold using command-line
Charging mode can be set by using  `echo` command in `terminal`.
<br>
<br>

To enable **Smart Charging Mode**

Require root privileges
{: .label .label-yellow .mt-0}
```bash
echo '1' | pkexec tee /sys/devices/platform/samsung/battery_life_extender
```
<br>

To disable **Smart Charging Mode**

Require root privileges
{: .label .label-yellow .mt-0}
```bash
echo '0' | pkexec tee /sys/devices/platform/samsung/battery_life_extender
```
<br>
`sudo` also can be used in place of `pkexec` in the above commands as both `sudo` and `pkexec` can be use to run commands in root mode. To make use of polkit rules, the extension uses `pkexec`.

The current threshold value can also be read using `cat` command in `terminal`.
```bash
cat /sys/devices/platform/samsung/battery_life_extender
```
<br>

{: .important-title }
> Condition for applying threshold
>
> * Accepted values for `battery_life_extender` : 0 or 1

If charging threshold are applied successfully using above commands, the extension is compatible.

## Quick Settings
<br>
<img src="../assets/images/device-compatibility/samsung/quick-settings.png" width="100%">
<div class="outer-container">
    <span class="txt-horizantal-align"><b>Gnome 43 and above</b></span>
    <span class="txt-horizantal-align"><b>Gnome 42</b></span>
</div>

## Extension Preferences
<br>
<img src="../assets/images/device-compatibility/samsung/settings.png" width="100%">

