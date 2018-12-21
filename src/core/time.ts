namespace pc {
    /**
     * @private
     * @class
     * @name pc.Timer
     * @description Create a new Timer instance.
     * @classdesc A Timer counts milliseconds from when start() is called until when stop() is called.
     */
    export class Time {
        public _isRunning: boolean = false;
        public _a: number = 0;
        public _b: number = 0;

        /**
         * @private
         * @function
         * @name pc.Timer#start
         * @description Start the timer
         */
        start(): void {
            this._isRunning = true;
            this._a = pc.now();
        }

        /**
         * @private
         * @function
         * @name pc.Timer#stop
         * @description Stop the timer
         */
        stop(): void {
            this._isRunning = false;
            this._b = now();
        }

        /**
         * @private
         * @function
         * @name pc.Timer#getMilliseconds
         * @description Get the number of milliseconds that passed between start() and stop() being called
         * @returns {Number} The elapsed milliseconds.
         */
        getMilliseconds(): number {
            return this._b - this._a;
        }
    }

    /**
     * @private
     * @function
     * @name pc.now
     * @description Get current time in milliseconds. Use it to measure time difference. Reference time may differ on different platforms.
     * @returns {Number} The time in milliseconds
     */
    export const now: () => number =
        window.performance && window.performance.timing && window.performance.now
            ? window.performance.now.bind(window.performance)
            : Date.now;
}
