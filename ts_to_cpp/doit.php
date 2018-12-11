<?php

	$src = file_get_contents("../src/math/mat4.ts");
	
	$src = str_replace("'use strict'", "//'use strict'", $src);
	$src = str_replace("export", "/*export*/", $src);
	
	file_put_contents("mat4.cpp", $src);
	
	
?>
