cmd /c "emcc standalone.c -o pc_wasm.js -s WASM=1 -s TOTAL_MEMORY=33554432 -O2"
pause