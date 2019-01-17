#include "include_ccall.h"

CCALL int hello(int a, int b) {
	return a + b;
}

int main() {

#ifdef EMSCRIPTEN
	EM_ASM_({
		//console.log($0, $1, $2, $3);
		window.callback_main();
	}, 111, 222, 333, 444);
#endif
}