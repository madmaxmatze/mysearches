<?php	
	$path = $_SERVER['DOCUMENT_ROOT'] . $_SERVER['REDIRECT_URL'];
	$path_parts = pathinfo($_SERVER['REDIRECT_URL']);
	/*
		$path_parts['dirname'] // /www/htdocs
		$path_parts['basename'] // index.html
		$path_parts['extension'] // html
		$path_parts['filename'] // index
	*/
	
	if (substr($path, -1) == "/" || !is_file($path)) {
		header("HTTP/1.0 404 Not Found");
	} else {
		
		if ($path_parts['extension'] == "js" || $path_parts['extension'] == "png") {
			ob_start("ob_gzhandler");
			
			if ($path_parts['extension'] == "png") {
				header("Content-type: image/png");
			}
			if ($path_parts['extension'] == "js") {
				header("Content-type: application/x-javascript");
			}
			
			$maxAge = 24 * 60 * 60; // 1 day
			if ($_GET['cacheid']) {
				$maxAge *= 365;		// 365 days
			} else {
				$maxAge *= 7;		// days
			}

			header('expires: ' . gmdate('D, d M Y H:i:s \G\M\T', (time() + $maxAge)));
			header("Cache-Control: public, max-age=" . $maxAge);
			header("Cache-Control: pre-check=" . $maxAge, FALSE);			// Speziell für MSIE 5
		}
		
		// header("Content-Length: " . filesize($ParsedFilePath));
		readfile ($path);
	}
?>