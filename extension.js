'use strict';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

async function execCheck(argv) {
    try {
        const flags = Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE;
        const proc = new Gio.Subprocess({
            argv,
            flags,
        });
        proc.init(null);
        return new Promise((resolve, reject) => {
            proc.communicate_utf8_async(null, null, (obj, res) => {
                try {
                    const [, stdout, stderr] = obj.communicate_utf8_finish(res);
                    const status = obj.get_exit_status();
                    log(`TestPolkit: Status: ${status}`);
                    log(`TestPolkit: Stdout: ${stdout}`);
                    log(`TestPolkit: Stderr: ${stderr}`);
                    resolve(stdout);
               } catch (e) {
                   log (`TestPolkit: Inner Exemption: ${e}`)
                   reject(e);
               }
           });
       });
    } catch (e) {
        log (`TestPolkit: Outer Exemption: ${e}`);
    }
}

async function execPkexec() {
    try {
        const argv = ['pkexec', 'echo', '"---_hello_maniacx_---"'];
        log(`TestPolkit: Command: ${argv.join(' ')}`);
        const stdout = await execCheck(argv);
    } catch (e) {
        log(`TestPolkit: execPkexec Error: ${e}`);
    }
}

export default class TestPolkit extends Extension {
    enable() {
        execPkexec();
        //GLib.spawn_command_line_async('pkexec echo "---_hello_maniacx_---"');
    }

    disable() {
    }
}

