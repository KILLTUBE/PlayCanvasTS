<?php

	$src = file_get_contents("../src/math/mat4.ts");
	
	$src = str_replace("'use strict'", "//'use strict'", $src);
	$src = str_replace("export", "/*export*/", $src);
	$src = str_replace("this.", "this->", $src);
	$src = str_replace("===", "==", $src);
	$src = str_replace("var", "auto", $src);
	$src = str_replace("number", "float", $src);
	
	$src = preg_replace('/([a-zA-Z0-9]+): ([a-zA-Z0-9]+)/', '$2 $1', $src);
	
	file_put_contents("mat4.cpp", $src);
	
	
?>
