#include "polyfills.h"

namespace pc {
	//'use strict';

	/**
	 * @Vec3
	 * @name pc.Vec3
	 * @classdesc A 3-dimensional vector.
	 * @description Creates a new Vec3 object.
	 * @param {Number} [x] The x value. If x is an array of length 3, the array will be used to populate all components.
	 * @param {Number} [y] The y value.
	 * @param {Number} [z] The z value.
	 * @example
	 * auto v = new pc.Vec3(1, 2, 3);
	 */
	/*export*/ class Vec3 {
		float x;
		float y;
		float z;

		Vec3(x?: any, y?: float, z?: float) {
			if (x && x.length == 3) {
				this->x = x[0];
				this->y = x[1];
				this->z = x[2];
			} else {
				this->x = x || 0;
				this->y = y || 0;
				this->z = z || 0;
			}
		}

		/**
		 * @function
		 * @name pc.Vec3#add
		 * @description Adds a 3-dimensional vector to another in place.
		 * @param {pc.Vec3} rhs The vector to add to the specified vector.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto a = new pc.Vec3(10, 10, 10);
		 * auto b = new pc.Vec3(20, 20, 20);
		 *
		 * a.add(b);
		 *
		 * // Should output [30, 30, 30]
		 * console.log("The result of the addition is: " + a.toString());
		 */
		Vec3 add(Vec3 rhs) {
			this->x += rhs.x;
			this->y += rhs.y;
			this->z += rhs.z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#add2
		 * @description Adds two 3-dimensional vectors together and returns the result.
		 * @param {pc.Vec3} lhs The first vector operand for the addition.
		 * @param {pc.Vec3} rhs The second vector operand for the addition.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto a = new pc.Vec3(10, 10, 10);
		 * auto b = new pc.Vec3(20, 20, 20);
		 * auto r = new pc.Vec3();
		 *
		 * r.add2(a, b);
		 * // Should output [30, 30, 30]
		 *
		 * console.log("The result of the addition is: " + r.toString());
		 */
		Vec3 add2(Vec3 lhs, Vec3 rhs) {
			this->x = lhs.x + rhs.x;
			this->y = lhs.y + rhs.y;
			this->z = lhs.z + rhs.z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#clone
		 * @description Returns an identical copy of the specified 3-dimensional vector.
		 * @returns {pc.Vec3} A 3-dimensional vector containing the result of the cloning.
		 * @example
		 * auto v = new pc.Vec3(10, 20, 30);
		 * auto vclone = v.clone();
		 * console.log("The result of the cloning is: " + vclone.toString());
		 */
		Vec3 clone() {
			return new Vec3().copy(this);
		}

		/**
		 * @function
		 * @name pc.Vec3#copy
		 * @description Copied the contents of a source 3-dimensional vector to a destination 3-dimensional vector.
		 * @param {pc.Vec3} rhs A vector to copy to the specified vector.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto src = new pc.Vec3(10, 20, 30);
		 * auto dst = new pc.Vec3();
		 *
		 * dst.copy(src);
		 *
		 * console.log("The two vectors are " + (dst.equals(src) ? "equal" : "different"));
		 */
		Vec3 copy(Vec3 rhs) {
			this->x = rhs.x;
			this->y = rhs.y;
			this->z = rhs.z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#cross
		 * @description Returns the result of a cross product operation performed on the two specified 3-dimensional vectors.
		 * @param {pc.Vec3} lhs The first 3-dimensional vector operand of the cross product.
		 * @param {pc.Vec3} rhs The second 3-dimensional vector operand of the cross product.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto back = new pc.Vec3().cross(pc.Vec3.RIGHT, pc.Vec3.UP);
		 *
		 * // Should print the Z axis (i.e. [0, 0, 1])
		 * console.log("The result of the cross product is: " + back.toString());
		 */
		Vec3 cross(Vec3 lhs, Vec3 rhs) {
			// Create temporary autoiables in case lhs or rhs are 'this'
			auto lx = lhs.x;
			auto ly = lhs.y;
			auto lz = lhs.z;
			auto rx = rhs.x;
			auto ry = rhs.y;
			auto rz = rhs.z;

			this->x = ly * rz - ry * lz;
			this->y = lz * rx - rz * lx;
			this->z = lx * ry - rx * ly;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#dot
		 * @description Returns the result of a dot product operation performed on the two specified 3-dimensional vectors.
		 * @param {pc.Vec3} rhs The second 3-dimensional vector operand of the dot product.
		 * @returns {Number} The result of the dot product operation.
		 * @example
		 * auto v1 = new pc.Vec3(5, 10, 20);
		 * auto v2 = new pc.Vec3(10, 20, 40);
		 * auto v1dotv2 = v1.dot(v2);
		 * console.log("The result of the dot product is: " + v1dotv2);
		 */
		float dot(Vec3 rhs) {
			return *this->x * rhs.x + this->y * rhs.y + this->z * rhs.z;
		}

		/**
		 * @function
		 * @name pc.Vec3#equals
		 * @description Reports whether two vectors are equal.
		 * @param {pc.Vec3} rhs The vector to compare to the specified vector.
		 * @returns {Boolean} true if the vectors are equal and false otherwise.
		 * @example
		 * auto a = new pc.Vec3(1, 2, 3);
		 * auto b = new pc.Vec3(4, 5, 6);
		 * console.log("The two vectors are " + (a.equals(b) ? "equal" : "different"));
		 */
		bool equals(Vec3 rhs) {
			return *this->x == rhs.x && this->y == rhs.y && this->z == rhs.z;
		}

		/**
		 * @function
		 * @name pc.Vec3#length
		 * @description Returns the magnitude of the specified 3-dimensional vector.
		 * @returns {Number} The magnitude of the specified 3-dimensional vector.
		 * @example
		 * auto vec = new pc.Vec3(3, 4, 0);
		 * auto len = vec.length();
		 * // Should output 5
		 * console.log("The length of the vector is: " + len);
		 */
		float length() {
			return Math.sqrt(this->x * this->x + this->y * this->y + this->z * this->z);
		}

		/**
		 * @function
		 * @name pc.Vec3#lengthSq
		 * @description Returns the magnitude squared of the specified 3-dimensional vector.
		 * @returns {Number} The magnitude of the specified 3-dimensional vector.
		 * @example
		 * auto vec = new pc.Vec3(3, 4, 0);
		 * auto len = vec.lengthSq();
		 * // Should output 25
		 * console.log("The length squared of the vector is: " + len);
		 */
		float lengthSq() {
			return *this->x * this->x + this->y * this->y + this->z * this->z;
		}

		/**
		 * @function
		 * @name pc.Vec3#lerp
		 * @description Returns the result of a linear interpolation between two specified 3-dimensional vectors.
		 * @param {pc.Vec3} lhs The 3-dimensional to interpolate from.
		 * @param {pc.Vec3} rhs The 3-dimensional to interpolate to.
		 * @param {Number} alpha The value controlling the point of interpolation. Between 0 and 1, the linear interpolant
		 * will occur on a straight line between lhs and rhs. Outside of this range, the linear interpolant will occur on
		 * a ray extrapolated from this line.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto a = new pc.Vec3(0, 0, 0);
		 * auto b = new pc.Vec3(10, 10, 10);
		 * auto r = new pc.Vec3();
		 *
		 * r.lerp(a, b, 0);   // r is equal to a
		 * r.lerp(a, b, 0.5); // r is 5, 5, 5
		 * r.lerp(a, b, 1);   // r is equal to b
		 */
		Vec3 lerp(Vec3 lhs, Vec3 rhs, float alpha) {
			this->x = lhs.x + alpha * (rhs.x - lhs.x);
			this->y = lhs.y + alpha * (rhs.y - lhs.y);
			this->z = lhs.z + alpha * (rhs.z - lhs.z);

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#mul
		 * @description Multiplies a 3-dimensional vector to another in place.
		 * @param {pc.Vec3} rhs The 3-dimensional vector used as the second multiplicand of the operation.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto a = new pc.Vec3(2, 3, 4);
		 * auto b = new pc.Vec3(4, 5, 6);
		 *
		 * a.mul(b);
		 *
		 * // Should output 8, 15, 24
		 * console.log("The result of the multiplication is: " + a.toString());
		 */
		Vec3 mul(Vec3 rhs) {
			this->x *= rhs.x;
			this->y *= rhs.y;
			this->z *= rhs.z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#mul2
		 * @description Returns the result of multiplying the specified 3-dimensional vectors together.
		 * @param {pc.Vec3} lhs The 3-dimensional vector used as the first multiplicand of the operation.
		 * @param {pc.Vec3} rhs The 3-dimensional vector used as the second multiplicand of the operation.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto a = new pc.Vec3(2, 3, 4);
		 * auto b = new pc.Vec3(4, 5, 6);
		 * auto r = new pc.Vec3();
		 *
		 * r.mul2(a, b);
		 *
		 * // Should output 8, 15, 24
		 * console.log("The result of the multiplication is: " + r.toString());
		 */
		Vec3 mul2(Vec3 lhs, Vec3 rhs) {
			this->x = lhs.x * rhs.x;
			this->y = lhs.y * rhs.y;
			this->z = lhs.z * rhs.z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#normalize
		 * @description Returns the specified 3-dimensional vector copied and converted to a unit vector.
		 * If the vector has a length of zero, the vector's elements will be set to zero.
		 * @returns {pc.Vec3} The result of the normalization.
		 * @example
		 * auto v = new pc.Vec3(25, 0, 0);
		 *
		 * v.normalize();
		 *
		 * // Should output 1, 0, 0, 0
		 * console.log("The result of the vector normalization is: " + v.toString());
		 */
		Vec3 normalize() {
			auto lengthSq = this->x * this->x + this->y * this->y + this->z * this->z;
			if (lengthSq > 0) {
				auto invLength = 1 / Math.sqrt(lengthSq);
				this->x *= invLength;
				this->y *= invLength;
				this->z *= invLength;
			}

			return *this;
		}

		/**
		 * @function
		 * @name  pc.Vec3#project
		 * @description Projects this 3-dimensional vector onto the specified vector.
		 * @param {pc.Vec3} rhs The vector onto which the original vector will be projected on.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto v = new pc.Vec3(5, 5, 5);
		 * auto normal = new pc.Vec3(1, 0, 0);
		 *
		 * v.project(normal);
		 *
		 * // Should output 5, 0, 0
		 * console.log("The result of the vector projection is: " + v.toString());
		 */
		Vec3 project(Vec3 rhs) {
			auto a_dot_b = this->x * rhs.x + this->y * rhs.y + this->z * rhs.z;
			auto b_dot_b = rhs.x * rhs.x + rhs.y * rhs.y + rhs.z * rhs.z;
			auto s = a_dot_b / b_dot_b;
			this->x = rhs.x * s;
			this->y = rhs.y * s;
			this->z = rhs.z * s;
			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#scale
		 * @description Scales each dimension of the specified 3-dimensional vector by the supplied
		 * scalar value.
		 * @param {Number} scalar The value by which each vector component is multiplied.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto v = new pc.Vec3(2, 4, 8);
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
		Vec3 scale(float scalar) {
			this->x *= scalar;
			this->y *= scalar;
			this->z *= scalar;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#set
		 * @description Sets the specified 3-dimensional vector to the supplied numerical values.
		 * @param {Number} x The value to set on the first component of the vector.
		 * @param {Number} y The value to set on the second component of the vector.
		 * @param {Number} z The value to set on the third component of the vector.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto v = new pc.Vec3();
		 * v.set(5, 10, 20);
		 *
		 * // Should output 5, 10, 20
		 * console.log("The result of the vector set is: " + v.toString());
		 */
		Vec3 set(float x, float y, float z) {
			this->x = x;
			this->y = y;
			this->z = z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#sub
		 * @description Subtracts a 3-dimensional vector from another in place.
		 * @param {pc.Vec3} rhs The vector to add to the specified vector.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto a = new pc.Vec3(10, 10, 10);
		 * auto b = new pc.Vec3(20, 20, 20);
		 *
		 * a.sub(b);
		 *
		 * // Should output [-10, -10, -10]
		 * console.log("The result of the addition is: " + a.toString());
		 */
		Vec3 sub(Vec3 rhs) {
			this->x -= rhs.x;
			this->y -= rhs.y;
			this->z -= rhs.z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#sub2
		 * @description Subtracts two 3-dimensional vectors from one another and returns the result.
		 * @param {pc.Vec3} lhs The first vector operand for the addition.
		 * @param {pc.Vec3} rhs The second vector operand for the addition.
		 * @returns {pc.Vec3} Self for chaining.
		 * @example
		 * auto a = new pc.Vec3(10, 10, 10);
		 * auto b = new pc.Vec3(20, 20, 20);
		 * auto r = new pc.Vec3();
		 *
		 * r.sub2(a, b);
		 *
		 * // Should output [-10, -10, -10]
		 * console.log("The result of the addition is: " + r.toString());
		 */
		Vec3 sub2(Vec3 lhs, Vec3 rhs) {
			this->x = lhs.x - rhs.x;
			this->y = lhs.y - rhs.y;
			this->z = lhs.z - rhs.z;

			return *this;
		}

		/**
		 * @function
		 * @name pc.Vec3#toString
		 * @description Converts the vector to string form.
		 * @returns {String} The vector in string form.
		 * @example
		 * auto v = new pc.Vec3(20, 10, 5);
		 * // Should output '[20, 10, 5]'
		 * console.log(v.toString());
		 */
		string toString() {
			return '[' + this->x + ', ' + this->y + ', ' + this->z + ']';
		}
  

	};
	/**
	 * @name pc.Vec3#x
	 * @type Number
	 * @description The first component of the vector.
	 * @example
	 * auto vec = new pc.Vec3(10, 20, 30);
	 *
	 * // Get x
	 * auto x = vec.x;
	 *
	 * // Set x
	 * vec.x = 0;
	 */
	/**
	 * @name pc.Vec3#y
	 * @type Number
	 * @description The second component of the vector.
	 * @example
	 * auto vec = new pc.Vec3(10, 20, 30);
	 *
	 * // Get y
	 * auto y = vec.y;
	 *
	 * // Set y
	 * vec.y = 0;
	 */
	/**
	 * @name pc.Vec3#z
	 * @type Number
	 * @description The third component of the vector.
	 * @example
	 * auto vec = new pc.Vec3(10, 20, 30);
	 *
	 * // Get z
	 * auto z = vec.z;
	 *
	 * // Set z
	 * vec.z = 0;
	 */

	/**
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.BACK
	 * @description A constant vector set to [0, 0, 1].
	 */
	Object.defineProperty(Vec3, 'BACK', {
		get: (function () {
			auto back = new Vec3(0, 0, 1);
			return function () {
				return back;
			};
		}())
	});

	/**
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.DOWN
	 * @description A constant vector set to [0, -1, 0].
	 */
	Object.defineProperty(Vec3, 'DOWN', {
		get: (function () {
			auto down = new Vec3(0, -1, 0);
			return function () {
				return down;
			};
		}())
	});

	/**
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.FORWARD
	 * @description A constant vector set to [0, 0, -1].
	 */
	Object.defineProperty(Vec3, 'FORWARD', {
		get: (function () {
			auto forward = new Vec3(0, 0, -1);
			return function () {
				return forward;
			};
		}())
	});

	/**
	 * @field
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.LEFT
	 * @description A constant vector set to [-1, 0, 0].
	 */
	Object.defineProperty(Vec3, 'LEFT', {
		get: (function () {
			auto left = new Vec3(-1, 0, 0);
			return function () {
				return left;
			};
		}())
	});

	/**
	 * @field
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.ONE
	 * @description A constant vector set to [1, 1, 1].
	 */
	Object.defineProperty(Vec3, 'ONE', {
		get: (function () {
			auto one = new Vec3(1, 1, 1);
			return function () {
				return one;
			};
		}())
	});

	/**
	 * @field
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.RIGHT
	 * @description A constant vector set to [1, 0, 0].
	 */
	Object.defineProperty(Vec3, 'RIGHT', {
		get: (function () {
			auto right = new Vec3(1, 0, 0);
			return function () {
				return right;
			};
		}())
	});

	/**
	 * @field
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.UP
	 * @description A constant vector set to [0, 1, 0].
	 */
	Object.defineProperty(Vec3, 'UP', {
		get: (function () {
			auto down = new Vec3(0, 1, 0);
			return function () {
				return down;
			};
		}())
	});

	/**
	 * @field
	 * @static
	 * @readonly
	 * @type pc.Vec3
	 * @name pc.Vec3.ZERO
	 * @description A constant vector set to [0, 0, 0].
	 */
	Object.defineProperty(Vec3, 'ZERO', {
		get: (function () {
			auto zero = new Vec3(0, 0, 0);
			return function () {
				return zero;
			};
		}())
	});

	/*export*/ class PreallocatedVec3 {
		// for user code
		public static Vec3 a = new Vec3;
		public static Vec3 b = new Vec3;
		public static Vec3 c = new Vec3;
		// each function its own, so they don't collide
		public static Vec3 setLookAt_x = new Vec3;
		public static Vec3 setLookAt_y = new Vec3;
		public static Vec3 setLookAt_z = new Vec3;
		public static Vec3 getScale_x = new Vec3;
		public static Vec3 getScale_y = new Vec3;
		public static Vec3 getScale_z = new Vec3;
		public static Vec3 getEulerAngles_scale = new Vec3;
	}	
}
