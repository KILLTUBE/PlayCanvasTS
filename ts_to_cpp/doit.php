<?php

	$src = file_get_contents("../src/math/mat4.ts");
	
	$src = "#include \"polyfills.h\"\r\n\r\n" . $src;
	$src = str_replace("'use strict'", "//'use strict'", $src);
	$src = str_replace("export", "/*export*/", $src);
	$src = str_replace("this.", "this->", $src);
	$src = str_replace("===", "==", $src);
	$src = str_replace("var", "auto", $src);
	$src = str_replace("number", "float", $src);
	
	
	$src = preg_replace('/([a-zA-Z0-9]+): (Mat4)/', '$2 *$1', $src);
	$src = preg_replace('/([a-zA-Z0-9]+): ([a-zA-Z0-9]+)/', '$2 $1', $src);
	$src = preg_replace('/([a-zA-Z0-9]+): ([a-zA-Z0-9]+)/', '$2 $1', $src);
	$src = preg_replace('/([a-zA-Z0-9]+)\((.*)\): ([a-zA-Z0-9]+)/', '$3 $1($2)', $src); // rewrite function signatures
	
	$src = str_replace("lhs.data", "lhs->data", $src);
	$src = str_replace("rhs.data", "rhs->data", $src);
	//$src = str_replace("Float32Array data", "Float32Array *data", $src);
	$src = str_replace("new Float32Array", "Float32Array", $src);
	$src = str_replace("    ", "\t", $src);
	
	
	// file specific
	$src = str_replace("constructor", "Mat4", $src);
	
	file_put_contents("mat4.cpp", $src);
	
	
?>
