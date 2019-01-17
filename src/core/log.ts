namespace pc.log {
    /**
     * @private
     * @function
     * @name pc.log.write
     * @description Write text to the console
     * @param {String} text The text to log.
     */
    export function write(text: string): void {
        console.log(text);
    }

    /**
     * @private
     * @function
     * @name pc.log.open
     * @description Starting logging to the console
     */
    export function open(): void {
        write("Powered by PlayCanvas " + pc.version + " " + pc.revision);
    }

    /**
     * @private
     * @function
     * @name pc.log.info
     * @description Write text to the log preceded by 'INFO:'
     * @param {String} text The text to log.
     */
    export function info(text: string): void {
        console.info("INFO:    " + text);
    }

    /**
     * @private
     * @function
     * @name pc.log.debug
     * @description Write text to the log preceded by 'DEBUG:'
     * @param {String} text The text to log.
     */
    export function debug(text: string): void {
        console.debug("DEBUG:   " + text);
    }

    /**
     * @private
     * @function
     * @name pc.log.error
     * @description Write text to the log preceded by 'ERROR:'
     * @param {String} text The text to log.
     */
    export function error(text: string): void {
        console.error("ERROR:   " + text);
    }

    /**
     * @private
     * @function
     * @name pc.log.warning
     * @description Write text to the log preceded by 'WARNING:'
     * @param {String} text The text to log.
     */
    export function warning(text: string): void {
        console.warn("WARNING: " + text);
    }

    /**
     * @private
     * @function
     * @name pc.log.alert
     * @description Write text to the log preceded by 'ALERT:' and pop up an alert dialog box with the text
     * @param {String} text The text to show in the alert.
     */
    export function alert(text: string): void {
        pc.log.write("ALERT:   " + text);
        alert(text); // eslint-disable-line no-alert
    }

    /**
     * @private
     * @function
     * @name pc.log.assert
     * @description If condition is false, then write text to the log preceded by 'ASSERT:'.
     * @param {Boolean} condition The condition to test.
     * @param {String} text The text to show if the condition is false.
     */
    export function assert(condition: boolean, text: string): void {
        if (!condition) {
            pc.log.write("ASSERT:  " + text);
        }
    }
}
