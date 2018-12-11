#include "polyfills.h"

namespace pc {
	//'use strict';

	/**
	 * @CurveSet
	 * @name pc.CurveSet
	 * @classdesc A curve set is a collection of curves.
	 * @description Creates a new curve set.
	 * @param {Array} [curveKeys] An array of arrays of keys (pairs of floats with
	 * the time first and value second).
	 */
	/*export*/ class CurveSet {
		Curve curves[];
		float _type; // enum

		CurveSet() {
			auto i;

			this->curves = [];
			this->_type = pc.CURVE_SMOOTHSTEP;

			if (arguments.length > 1) {
				for (i = 0; i < arguments.length; i++) {
					this->curves.push(new pc.Curve(arguments[i]));
				}
			} else {
				if (arguments.length == 0) {
					this->curves.push(new pc.Curve());
				} else {
					auto arg = arguments[0];
					if (pc.type(arg) == 'float') {
						for (i = 0; i < arg; i++) {
							this->curves.push(new pc.Curve());
						}
					} else {
						for (i = 0; i < arg.length; i++) {
							this->curves.push(new pc.Curve(arg[i]));
						}
					}
				}
			}
		}

		/**
		 * @function
		 * @name pc.CurveSet#get
		 * @description Return a specific curve in the curve set.
		 * @param {Number} index The index of the curve to return
		 * @returns {pc.Curve} The curve at the specified index
		 */
		Curve get(float index) {
			return *this->curves[index];
		}

		/**
		 * @function
		 * @name pc.CurveSet#value
		 * @description Returns the interpolated value of all curves in the curve
		 * set at the specified time.
		 * @param {Number} time The time at which to calculate the value
		 * @param {Array} [result] The interpolated curve values at the specified time.
		 * If this parameter is not supplied, the function allocates a new array internally
		 * to return the result.
		 * @returns {Array} The interpolated curve values at the specified time
		 */
		float value(float time, result?: float[])[] {
			auto length = this->curves.length;
			result = result || [];
			result.length = length;

			for (auto i = 0; i < length; i++) {
				result[i] = this->curves[i].value(time);
			}

			return result;
		}

		/**
		 * @function
		 * @name pc.CurveSet#clone
		 * @description Returns a clone of the specified curve set object.
		 * @returns {pc.CurveSet} A clone of the specified curve set
		 */
		CurveSet clone() {
			auto result = new pc.CurveSet();

			result.curves = [];
			for (auto i = 0; i < this->curves.length; i++) {
				result.curves.push(this->curves[i].clone());
			}

			result._type = this->_type;

			return result;
		}

		Float32Array quantize(float precision) {
			precision = Math.max(precision, 2);

			auto numCurves = this->curves.length;
			auto values = Float32Array(precision * numCurves);
			auto step = 1.0 / (precision - 1);
			auto float temp[] = [];

			for (auto i = 0; i < precision; i++) { // quantize graph to table of interpolated values
				auto value = this->value(step * i, temp);
				if (numCurves == 1) {
					values[i] = value[0];
				} else {
					for (auto j = 0; j < numCurves; j++) {
						values[i * numCurves + j] = value[j];
					}
				}
			}

			return values;
		}
	}

	/**
	 * @readonly
	 * @name pc.CurveSet#length
	 * @type Number
	 * @description The float of curves in the curve set.
	 */
	Object.defineProperty(CurveSet.prototype, 'length', {
		function get () {
			return *this->curves.length;
		}
	});

	/**
	 * @name pc.CurveSet#type
	 * @type Number
	 * @description The interpolation scheme applied to all curves in the curve set. Can be:
	 * <ul>
	 *	 <li>pc.CURVE_LINEAR</li>
	 *	 <li>pc.CURVE_SMOOTHSTEP</li>
	 *	 <li>pc.CURVE_CATMULL</li>
	 *	 <li>pc.CURVE_CARDINAL</li>
	 * </ul>
	 */
	Object.defineProperty(CurveSet.prototype, 'type', {
		function get () {
			return *this->_type;
		},

		function set (value) {
			this->_type = value;
			for (auto i = 0; i < this->curves.length; i++) {
				this->curves[i].type = value;
			}
		}
	});
}
