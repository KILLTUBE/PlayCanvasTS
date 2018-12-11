#include "polyfills.h"

namespace pc {
	//'use strict';

	/**
	 * @Vec4
	 * @name pc.Vec4
	 * @classdesc A 4-dimensional vector.
	 * @description Creates a new Vec4 object.
	 * @param {Number} [x] The x value. If x is an array of length 4, the array will be used to populate all components.
	 * @param {Number} [y] The y value.
	 * @param {Number} [z] The z value.
	 * @param {Number} [w] The w value.
	 * @example
	 * auto v = new pc.Vec4(1, 2, 3, 4);
	 */
	/*export*/ class Vec4 {
		float x;
		float y;
		float z;
		float w;

		Vec4(x?: any, y?: float, z?: float, w?: float) {
			if (x && x.length == 4) {
				this->x = x[0];
				this->y = x[1];
				this->z = x[2];
				this->w = x[3];
			} else {
				this->x = x || 0;
				this->y = y || 0;
				this->z = z || 0;
				this->w = w || 0;
			}
		}

		/**
		 * @function
		 * @name pc.Vec4#add
		 * @description Adds a 4-dimensional vector to another in place.
		 * @param {pc.Vec4} rhs The vector to add to the specified vector.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto a = new pc.Vec4(10, 10, 10, 10);
		 * auto b = new pc.Vec4(20, 20, 20, 20);
		 *
		 * a.add(b);
		 *
		 * // Should output [30, 30, 30]
		 * console.log("The result of the addition is: " + a.toString());
		 */
		Vec4 add(Vec4 rhs) {
			this->x += rhs.x;
			this->y += rhs.y;
			this->z += rhs.z;
			this->w += rhs.w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#add2
		 * @description Adds two 4-dimensional vectors together and returns the result.
		 * @param {pc.Vec4} lhs The first vector operand for the addition.
		 * @param {pc.Vec4} rhs The second vector operand for the addition.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto a = new pc.Vec4(10, 10, 10, 10);
		 * auto b = new pc.Vec4(20, 20, 20, 20);
		 * auto r = new pc.Vec4();
		 *
		 * r.add2(a, b);
		 * // Should output [30, 30, 30]
		 *
		 * console.log("The result of the addition is: " + r.toString());
		 */
		Vec4 add2(Vec4 lhs, Vec4 rhs) {
			this->x = lhs.x + rhs.x;
			this->y = lhs.y + rhs.y;
			this->z = lhs.z + rhs.z;
			this->w = lhs.w + rhs.w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#clone
		 * @description Returns an identical copy of the specified 4-dimensional vector.
		 * @returns {pc.Vec4} A 4-dimensional vector containing the result of the cloning.
		 * @example
		 * auto v = new pc.Vec4(10, 20, 30, 40);
		 * auto vclone = v.clone();
		 * console.log("The result of the cloning is: " + vclone.toString());
		 */
		Vec4 clone() {
			return new Vec4().copy(this);
		}

		/**
		 * @function
		 * @name pc.Vec4#copy
		 * @description Copied the contents of a source 4-dimensional vector to a destination 4-dimensional vector.
		 * @param {pc.Vec4} rhs A vector to copy to the specified vector.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto src = new pc.Vec4(10, 20, 30, 40);
		 * auto dst = new pc.Vec4();
		 *
		 * dst.copy(src);
		 *
		 * console.log("The two vectors are " + (dst.equals(src) ? "equal" : "different"));
		 */
		Vec4 copy(Vec4 rhs) {
			this->x = rhs.x;
			this->y = rhs.y;
			this->z = rhs.z;
			this->w = rhs.w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#dot
		 * @description Returns the result of a dot product operation performed on the two specified 4-dimensional vectors.
		 * @param {pc.Vec4} rhs The second 4-dimensional vector operand of the dot product.
		 * @returns {Number} The result of the dot product operation.
		 * @example
		 * auto v1 = new pc.Vec4(5, 10, 20, 40);
		 * auto v2 = new pc.Vec4(10, 20, 40, 80);
		 * auto v1dotv2 = v1.dot(v2);
		 * console.log("The result of the dot product is: " + v1dotv2);
		 */
		float dot(Vec4 rhs) {
			return *this->x * rhs.x + this->y * rhs.y + this->z * rhs.z + this->w * rhs.w;
		}

		/**
		 * @function
		 * @name pc.Vec4#equals
		 * @description Reports whether two vectors are equal.
		 * @param {pc.Vec4} rhs The vector to compare to the specified vector.
		 * @returns {Boolean} true if the vectors are equal and false otherwise.
		 * @example
		 * auto a = new pc.Vec4(1, 2, 3, 4);
		 * auto b = new pc.Vec4(5, 6, 7, 8);
		 * console.log("The two vectors are " + (a.equals(b) ? "equal" : "different"));
		 */
		bool equals(Vec4 rhs) {
			return *this->x == rhs.x && this->y == rhs.y && this->z == rhs.z && this->w == rhs.w;
		}

		/**
		 * @function
		 * @name pc.Vec4#length
		 * @description Returns the magnitude of the specified 4-dimensional vector.
		 * @returns {Number} The magnitude of the specified 4-dimensional vector.
		 * @example
		 * auto vec = new pc.Vec4(3, 4, 0, 0);
		 * auto len = vec.length();
		 * // Should output 5
		 * console.log("The length of the vector is: " + len);
		 */
		float length() {
			return Math.sqrt(this->x * this->x + this->y * this->y + this->z * this->z + this->w * this->w);
		}

		/**
		 * @function
		 * @name pc.Vec4#lengthSq
		 * @description Returns the magnitude squared of the specified 4-dimensional vector.
		 * @returns {Number} The magnitude of the specified 4-dimensional vector.
		 * @example
		 * auto vec = new pc.Vec4(3, 4, 0);
		 * auto len = vec.lengthSq();
		 * // Should output 25
		 * console.log("The length squared of the vector is: " + len);
		 */
		float lengthSq() {
			return *this->x * this->x + this->y * this->y + this->z * this->z + this->w * this->w;
		}

		/**
		 * @function
		 * @name pc.Vec4#lerp
		 * @description Returns the result of a linear interpolation between two specified 4-dimensional vectors.
		 * @param {pc.Vec4} lhs The 4-dimensional to interpolate from.
		 * @param {pc.Vec4} rhs The 4-dimensional to interpolate to.
		 * @param {Number} alpha The value controlling the point of interpolation. Between 0 and 1, the linear interpolant
		 * will occur on a straight line between lhs and rhs. Outside of this range, the linear interpolant will occur on
		 * a ray extrapolated from this line.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto a = new pc.Vec4(0, 0, 0, 0);
		 * auto b = new pc.Vec4(10, 10, 10, 10);
		 * auto r = new pc.Vec4();
		 *
		 * r.lerp(a, b, 0);   // r is equal to a
		 * r.lerp(a, b, 0.5); // r is 5, 5, 5, 5
		 * r.lerp(a, b, 1);   // r is equal to b
		 */
		Vec4 lerp(Vec4 lhs, Vec4 rhs, float alpha) {
			this->x = lhs.x + alpha * (rhs.x - lhs.x);
			this->y = lhs.y + alpha * (rhs.y - lhs.y);
			this->z = lhs.z + alpha * (rhs.z - lhs.z);
			this->w = lhs.w + alpha * (rhs.w - lhs.w);

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#mul
		 * @description Multiplies a 4-dimensional vector to another in place.
		 * @param {pc.Vec4} rhs The 4-dimensional vector used as the second multiplicand of the operation.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto a = new pc.Vec4(2, 3, 4, 5);
		 * auto b = new pc.Vec4(4, 5, 6, 7);
		 *
		 * a.mul(b);
		 *
		 * // Should output 8, 15, 24, 35
		 * console.log("The result of the multiplication is: " + a.toString());
		 */
		Vec4 mul(Vec4 rhs) {
			this->x *= rhs.x;
			this->y *= rhs.y;
			this->z *= rhs.z;
			this->w *= rhs.w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#mul2
		 * @description Returns the result of multiplying the specified 4-dimensional vectors together.
		 * @param {pc.Vec4} lhs The 4-dimensional vector used as the first multiplicand of the operation.
		 * @param {pc.Vec4} rhs The 4-dimensional vector used as the second multiplicand of the operation.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto a = new pc.Vec4(2, 3, 4, 5);
		 * auto b = new pc.Vec4(4, 5, 6, 7);
		 * auto r = new pc.Vec4();
		 *
		 * r.mul2(a, b);
		 *
		 * // Should output 8, 15, 24, 35
		 * console.log("The result of the multiplication is: " + r.toString());
		 */
		Vec4 mul2(Vec4 lhs, Vec4 rhs) {
			this->x = lhs.x * rhs.x;
			this->y = lhs.y * rhs.y;
			this->z = lhs.z * rhs.z;
			this->w = lhs.w * rhs.w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#normalize
		 * @description Returns the specified 4-dimensional vector copied and converted to a unit vector.
		 * If the vector has a length of zero, the vector's elements will be set to zero.
		 * @returns {pc.Vec4} The result of the normalization.
		 * @example
		 * auto v = new pc.Vec4(25, 0, 0, 0);
		 *
		 * v.normalize();
		 *
		 * // Should output 1, 0, 0, 0
		 * console.log("The result of the vector normalization is: " + v.toString());
		 */
		Vec4 normalize() {
			auto lengthSq = this->x * this->x + this->y * this->y + this->z * this->z + this->w * this->w;
			if (lengthSq > 0) {
				auto invLength = 1 / Math.sqrt(lengthSq);
				this->x *= invLength;
				this->y *= invLength;
				this->z *= invLength;
				this->w *= invLength;
			}

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#scale
		 * @description Scales each dimension of the specified 4-dimensional vector by the supplied
		 * scalar value.
		 * @param {Number} scalar The value by which each vector component is multiplied.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto v = new pc.Vec4(2, 4, 8, 16);
		 *
		 * // Multiply by 2
		 * v.scale(2);
		 *
		 * // Negate
		 * v.scale(-1);
		 *
		 * // Divide by 2
		 * v.scale(0.5);
		 */
		Vec4 scale(float scalar) {
			this->x *= scalar;
			this->y *= scalar;
			this->z *= scalar;
			this->w *= scalar;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#set
		 * @description Sets the specified 4-dimensional vector to the supplied numerical values.
		 * @param {Number} x The value to set on the first component of the vector.
		 * @param {Number} y The value to set on the second component of the vector.
		 * @param {Number} z The value to set on the third component of the vector.
		 * @param {Number} w The value to set on the fourth component of the vector.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto v = new pc.Vec4();
		 * v.set(5, 10, 20, 40);
		 *
		 * // Should output 5, 10, 20, 40
		 * console.log("The result of the vector set is: " + v.toString());
		 */
		Vec4 set(float x, float y, float z, float w) {
			this->x = x;
			this->y = y;
			this->z = z;
			this->w = w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#sub
		 * @description Subtracts a 4-dimensional vector from another in place.
		 * @param {pc.Vec4} rhs The vector to add to the specified vector.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto a = new pc.Vec4(10, 10, 10, 10);
		 * auto b = new pc.Vec4(20, 20, 20, 20);
		 *
		 * a.sub(b);
		 *
		 * // Should output [-10, -10, -10, -10]
		 * console.log("The result of the subtraction is: " + a.toString());
		 */
		Vec4 sub(Vec4 rhs) {
			this->x -= rhs.x;
			this->y -= rhs.y;
			this->z -= rhs.z;
			this->w -= rhs.w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#sub2
		 * @description Subtracts two 4-dimensional vectors from one another and returns the result.
		 * @param {pc.Vec4} lhs The first vector operand for the subtraction.
		 * @param {pc.Vec4} rhs The second vector operand for the subtraction.
		 * @returns {pc.Vec4} Self for chaining.
		 * @example
		 * auto a = new pc.Vec4(10, 10, 10, 10);
		 * auto b = new pc.Vec4(20, 20, 20, 20);
		 * auto r = new pc.Vec4();
		 *
		 * r.sub2(a, b);
		 *
		 * // Should output [-10, -10, -10, -10]
		 * console.log("The result of the subtraction is: " + r.toString());
		 */
		Vec4 sub2(Vec4 lhs, Vec4 rhs) {
			this->x = lhs.x - rhs.x;
			this->y = lhs.y - rhs.y;
			this->z = lhs.z - rhs.z;
			this->w = lhs.w - rhs.w;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec4#toString
		 * @description Converts the vector to string form.
		 * @returns {String} The vector in string form.
		 * @example
		 * auto v = new pc.Vec4(20, 10, 5, 0);
		 * // Should output '[20, 10, 5, 0]'
		 * console.log(v.toString());
		 */
		string toString() {
			return '[' + this->x + ', ' + this->y + ', ' + this->z + ', ' + this->w + ']';
		}
	};

	/**
	 * @field
	 * @type Number
	 * @name pc.Vec4#x
	 * @description The first component of the vector.
	 * @example
	 * auto vec = new pc.Vec4(10, 20, 30, 40);
	 *
	 * // Get x
	 * auto x = vec.x;
	 *
	 * // Set x
	 * vec.x = 0;
	 */
	/**
	 * @field
	 * @type Number
	 * @name pc.Vec4#y
	 * @description The second component of the vector.
	 * @example
	 * auto vec = new pc.Vec4(10, 20, 30, 40);
	 *
	 * // Get y
	 * auto y = vec.y;
	 *
	 * // Set y
	 * vec.y = 0;
	 */
	/**
	 * @field
	 * @type Number
	 * @name pc.Vec4#z
	 * @description The third component of the vector.
	 * @example
	 * auto vec = new pc.Vec4(10, 20, 30, 40);
	 *
	 * // Get z
	 * auto z = vec.z;
	 *
	 * // Set z
	 * vec.z = 0;
	 */
	/**
	 * @field
	 * @type Number
	 * @name pc.Vec4#w
	 * @description The fourth component of the vector.
	 * @example
	 * auto vec = new pc.Vec4(10, 20, 30, 40);
	 *
	 * // Get w
	 * auto w = vec.w;
	 *
	 * // Set w
	 * vec.w = 0;
	 */

	/**
	 * @field
	 * @static
	 * @readonly
	 * @type pc.Vec4
	 * @name pc.Vec4.ONE
	 * @description A constant vector set to [1, 1, 1, 1].
	 */
	Object.defineProperty(Vec4, 'ONE', {
		get: (function () {
			auto one = new Vec4(1, 1, 1, 1);
			return function () {
				return one;
			};
		}())
	});

	/**
	 * @field
	 * @static
	 * @readonly
	 * @type pc.Vec4
	 * @name pc.Vec4.ZERO
	 * @description A constant vector set to [0, 0, 0, 0].
	 */
	Object.defineProperty(Vec4, 'ZERO', {
		get: (function () {
			auto zero = new Vec4(0, 0, 0, 0);
			return function () {
				return zero;
			};
		}())
	});
}
