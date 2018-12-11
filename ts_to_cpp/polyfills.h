#include <stdio.h>
#include <stdlib.h>

namespace pc {
	class Float32Array { public:
		float *memory = NULL;

		Float32Array() {
			memory = NULL;
		}

		Float32Array(int n) {
			memory = (float *) malloc(n * sizeof(float));
		}

		struct Deref {
			Float32Array& a;
			int index;
			Deref(Float32Array& a, int index) : a(a), index(index) {}

			operator float() {
				//std::cout << "reading\n";
				return a.memory[index];
			}

			float& operator=(const float& other) {
				//std::cout << "writing\n";
				return a.memory[index] = other;
			}
		};

		Deref operator[](int index) {
			return Deref(*this, index);
		}

	};
}
