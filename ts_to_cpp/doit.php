<?php

	function ts_to_cpp($filename_ts, $filename_cpp, $constructorName) {
		$src = file_get_contents($filename_ts);
		
		$src = "#include \"polyfills.h\"\r\n\r\n" . $src;
		$src = str_replace("'use strict'", "//'use strict'", $src);
		
		$src = str_replace("export function", "/*exxport function*/", $src);
		$src = str_replace("export", "/*export*/", $src);
		
		$src = str_replace("this.", "this->", $src);
		$src = str_replace("===", "==", $src);
		$src = str_replace("var", "auto", $src);
		$src = str_replace("number", "float", $src);
		
		
		//$src = preg_replace('/([a-zA-Z0-9]+): (Mat4)/', '$2 *$1', $src);
		$src = preg_replace('/([a-zA-Z0-9_]+): ([a-zA-Z0-9_]+)/', '$2 $1', $src);
		$src = preg_replace('/([a-zA-Z0-9_]+): ([a-zA-Z0-9_]+)/', '$2 $1', $src);
		
		// rewrite function signatures
		//$src = preg_replace('/([a-zA-Z0-9]+)\((.*)\): (Mat4)/', '$3 *$1($2)', $src);
		$src = preg_replace('/([a-zA-Z0-9_]+)\((.*)\): ([a-zA-Z0-9_]+)/', '$3 $1($2)', $src);
		
		
		//$src = str_replace("lhs.data", "lhs->data", $src);
		//$src = str_replace("rhs.data", "rhs->data", $src);
		//$src = str_replace("Float32Array data", "Float32Array *data", $src);
		$src = str_replace("new Float32Array", "Float32Array", $src);
		$src = str_replace("    ", "\t", $src);
		$src = str_replace("return this", "return *this", $src);
		$src = str_replace("boolean", "bool", $src);
		$src = str_replace("Math.PI", "M_PI", $src);
		$src = str_replace("pc.math.", "pc::math::", $src);
		
		if (strpos($src, "namespace pc.math") !== false) {
			$src = str_replace("namespace pc.math", "namespace pc {\r\nnamespace math", $src);
			$src .= "}";
		}
		
		// C++ Deref bullshit
		$src = str_replace("auto b0", "float b0", $src);
		$src = str_replace("auto b1", "float b1", $src);
		$src = str_replace("auto b2", "float b2", $src);
		$src = str_replace("auto b3", "float b3", $src);
		
		// file specific
		$src = str_replace("constructor", $constructorName, $src);
		
		file_put_contents($filename_cpp, $src);
	}
	
	ts_to_cpp("../src/math/curve-set.ts", "CurveSet.cpp", "CurveSet");
	ts_to_cpp("../src/math/curve.ts"    , "Curve.cpp"   , "Curve"   );
	ts_to_cpp("../src/math/mat3.ts"     , "Mat3.cpp"    , "Mat3"    );
	ts_to_cpp("../src/math/mat4.ts"     , "Mat4.cpp"    , "Mat4"    );
	ts_to_cpp("../src/math/math.ts"     , "Math.cpp"    , "Math"    );
	ts_to_cpp("../src/math/quat.ts"     , "Quat.cpp"    , "Quat"    );
	ts_to_cpp("../src/math/vec2.ts"     , "Vec2.cpp"    , "Vec2"    );
	ts_to_cpp("../src/math/vec3.ts"     , "Vec3.cpp"    , "Vec3"    );
	ts_to_cpp("../src/math/vec4.ts"     , "Vec4.cpp"    , "Vec4"    );
?>
