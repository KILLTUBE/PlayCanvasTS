namespace pc {
    'use strict';

    /**
     * @enum pc.CURVE
     * @name pc.CURVE_LINEAR
     * @description A linear interpolation scheme.
     */
    export const CURVE_LINEAR: number = 0;
    /**
     * @enum pc.CURVE
     * @name pc.CURVE_SMOOTHSTEP
     * @description A smooth step interpolation scheme.
     */
    export const CURVE_SMOOTHSTEP: number = 1;
    /**
     * @enum pc.CURVE
     * @name pc.CURVE_CATMULL
     * @description A Catmull-Rom spline interpolation scheme.
     */
    export const CURVE_CATMULL: number = 2;
    /**
     * @enum pc.CURVE
     * @name pc.CURVE_CARDINAL
     * @description A cardinal spline interpolation scheme.
     */
    export const CURVE_CARDINAL: number = 3;

    /**
     * @constructor
     * @name pc.Curve
     * @classdesc A curve is a collection of keys (time/value pairs). The shape of the
     * curve is defined by its type that specifies an interpolation scheme for the keys.
     * @description Creates a new curve.
     * @param {Number[]} [data] An array of keys (pairs of numbers with the time first and
     * value second)
     * @property {Number} length The number of keys in the curve. [read only]
     */
    export class Curve {
        keys: number[][];
        type: number; // actual type is enum
        tension: number;

        constructor(data?: number[]) {
            this.keys = [];
            this.type = CURVE_SMOOTHSTEP;

            this.tension = 0.5; // used for CURVE_CARDINAL

            if (data) {
                for (var i = 0; i < data.length - 1; i += 2) {
                    this.keys.push([data[i], data[i + 1]]);
                }
            }

            this.sort();
        }
    
        /**
         * @function
         * @name pc.Curve#add
         * @description Add a new key to the curve.
         * @param {Number} time Time to add new key
         * @param {Number} value Value of new key
         * @returns {Number[]} [time, value] pair
         */
        add(time: number, value: number): number[] {
            var keys = this.keys;
            var len = keys.length;
            var i = 0;

            for (; i < len; i++) {
                if (keys[i][0] > time) {
                    break;
                }
            }

            var key = [time, value];
            this.keys.splice(i, 0, key);
            return key;
        }

        /**
         * @function
         * @name pc.Curve#get
         * @description Return a specific key.
         * @param {Number} index The index of the key to return
         * @returns {Number[]} The key at the specified index
         */
        get(index: number): number[] {
            return this.keys[index];
        }

        /**
         * @function
         * @name pc.Curve#sort
         * @description Sort keys by time.
         */
        sort(): void {
            this.keys.sort(function (a: number[], b: number[]) {
                return a[0] - b[0];
            });
        }

        /**
         * @function
         * @name pc.Curve#value
         * @description Returns the interpolated value of the curve at specified time.
         * @param {Number} time The time at which to calculate the value
         * @returns {Number} The interpolated value
         */
        value(time: number): number {
            var i, len;
            var keys = this.keys;

            // no keys
            if (!keys.length) {
                return 0;
            }

            // Clamp values before first and after last key
            if (time < keys[0][0]) {
                return keys[0][1];
            } else if (time > keys[keys.length - 1][0]) {
                return keys[keys.length - 1][1];
            }

            var leftTime = 0;
            var leftValue = keys.length ? keys[0][1] : 0;

            var rightTime = 1;
            var rightValue = 0;

            for (i = 0, len = keys.length; i < len; i++) {
                // early exit check
                if (keys[i][0] === time) {
                    return keys[i][1];
                }

                rightValue = keys[i][1];

                if (time < keys[i][0]) {
                    rightTime = keys[i][0];
                    break;
                }

                leftTime = keys[i][0];
                leftValue = keys[i][1];
            }

            var div = rightTime - leftTime;
            var interpolation = (div === 0 ? 0 : (time - leftTime) / div);

            if (this.type === CURVE_SMOOTHSTEP) {
                interpolation *= interpolation * (3 - 2 * interpolation);
            } else if (this.type === CURVE_CATMULL || this.type === CURVE_CARDINAL) {
                var p1 = leftValue;
                var p2 = rightValue;
                var p0 = p1 + (p1 - p2); // default control points are extended back/forward from existing points
                var p3 = p2 + (p2 - p1);

                var dt1 = rightTime - leftTime;
                var dt0 = dt1;
                var dt2 = dt1;

                // back up index to left key
                if (i > 0) {
                    i--;
                }

                if (i > 0) {
                    p0 = keys[i - 1][1];
                    dt0 = keys[i][0] - keys[i - 1][0];
                }

                if (keys.length > i + 1) {
                    dt1 = keys[i + 1][0] - keys[i][0];
                }

                if (keys.length > i + 2) {
                    dt2 = keys[i + 2][0] - keys[i + 1][0];
                    p3 = keys[i + 2][1];
                }

                // normalize p0 and p3 to be equal time with p1->p2
                p0 = p1 + (p0 - p1) * dt1 / dt0;
                p3 = p2 + (p3 - p2) * dt1 / dt2;

                if (this.type === CURVE_CATMULL) {
                    return this._interpolateCatmullRom(p0, p1, p2, p3, interpolation);
                }

                return this._interpolateCardinal(p0, p1, p2, p3, interpolation, this.tension);
            }

            return pc.math.lerp(leftValue, rightValue, interpolation);
        }

        _interpolateHermite(p0: number, p1: number, t0: number, t1: number, s: number): number {
            var s2 = s * s;
            var s3 = s * s * s;
            var h0 = 2 * s3 - 3 * s2 + 1;
            var h1 = -2 * s3 + 3 * s2;
            var h2 = s3 - 2 * s2 + s;
            var h3 = s3 - s2;

            return p0 * h0 + p1 * h1 + t0 * h2 + t1 * h3;
        }

        _interpolateCardinal(p0: number, p1: number, p2: number, p3: number, s: number, t: number): number {
            var t0 = t * (p2 - p0);
            var t1 = t * (p3 - p1);

            return this._interpolateHermite(p1, p2, t0, t1, s);
        }

        _interpolateCatmullRom(p0: number, p1: number, p2: number, p3: number, s: number): number {
            return this._interpolateCardinal(p0, p1, p2, p3, s, 0.5);
        }

        closest(time: number): number[] | null {
            var keys = this.keys;
            var length = keys.length;
            var min = 2;
            var result = null;

            for (var i = 0; i < length; i++) {
                var diff = Math.abs(time - keys[i][0]);
                if (min >= diff) {
                    min = diff;
                    result = keys[i];
                } else {
                    break;
                }
            }

            return result;
        }

        /**
         * @function
         * @name pc.Curve#clone
         * @description Returns a clone of the specified curve object.
         * @returns {pc.Curve} A clone of the specified curve
         */
        clone(): Curve {
            var result = new pc.Curve();
            result.keys = pc.extend(result.keys, this.keys);
            result.type = this.type;
            return result;
        }

        quantize(precision: number): Float32Array {
            precision = Math.max(precision, 2);

            var values = new Float32Array(precision);
            var step = 1.0 / (precision - 1);

            // quantize graph to table of interpolated values
            for (var i = 0; i < precision; i++) {
                var value = this.value(step * i);
                values[i] = value;
            }

            return values;
        }
    }

    Object.defineProperty(Curve.prototype, 'length', {
        get: function () {
            return this.keys.length;
        }
    });
}
