<?php


$iconDir = "icons/";
$jsOutputFile = "../js/mysearches.icons.js";
$pngOutputFile = "icons.png";
$pngOutputFileWidth = 0;

function loadAllImages ($dir) {
	global $pngOutputFileWidth;
	$images = array();
	$dirHandler = opendir($dir);
	while ($file = readdir($dirHandler)) { 
		if (substr($file, 0, 1) != ".") {
			if (preg_match ("/(.*)\.(png|gif)$/", $file, $matches)) {
				$imageSize = getimagesize($dir . $file);
				$key = strtolower($matches[1]);
				$images[$key] = array();
				$images[$key]['path'] = $dir . $file;
				$images[$key]['type'] = $matches[2];
				$images[$key]['w'] = $imageSize[0];
				$images[$key]['h'] = $imageSize[1];
				$pngOutputFileWidth = max ($imageSize[0], $pngOutputFileWidth);
			}
			if (is_dir($dir . $file) && substr($file, 0, 1) != ".") {
				$images = array_merge($images, loadAllImages($dir . $file . "/")); 
			}
		}
	};
	closedir($dirHandler);  
	return $images;
}

$images = loadAllImages($iconDir);

// sort them with a very smart function :)
uasort  ($images, create_function('$a, $b', '$valA=$a["h"]+$a["w"]; $valB=$b["h"]+$b["w"]; if($valA==$valB)return 0; return ($valA>$valB)?-1:1;'));

// add all small images to the big one
$currentX = 0;
$currentY = 0;
$maxYDiff = 0;
$tmpImage = imagecreatetruecolor($pngOutputFileWidth, 2000); 

$transparent = imageColorAllocate($tmpImage, 244, 244, 244);
imageColorTransparent($tmpImage, $transparent);
imageFill($tmpImage, 0, 0, $transparent);


foreach ($images as $key => $value) {
	if ($images[$key]["type"] == "gif") { 
		$currentImg = imagecreatefromgif($images[$key]["path"]);
	} else {
		$currentImg = imagecreatefrompng($images[$key]["path"]);
	}
	unset($images[$key]["path"]);
	unset($images[$key]["type"]);
	
	// line break
	if ($currentX + $value['w'] > $pngOutputFileWidth) {
		$currentX = 0;
		$currentY += $maxYDiff;
		$maxYDiff = 0;
	}

	// put current image on big image
	imagecopy($tmpImage, $currentImg, $currentX, $currentY, 0, 0, $value['w'], $value['h']); 	// int $dst_x , int $dst_y , int $src_x , int $src_y , int $src_w , int $src_h )
	
	// variable cleanup
	$maxYDiff = max($maxYDiff, $value['h'] + 1);
	$images[$key]['x'] = $currentX;
	$images[$key]['y'] = $currentY;

	$currentX += $value['w'];
	imagedestroy($currentImg);
}	

// resize ////
$outputImage = imagecreatetruecolor($pngOutputFileWidth, $currentY + $maxYDiff); 
$transparent = imageColorAllocate($outputImage, 244, 244, 244);
imageColorTransparent($outputImage, $transparent);
imageFill($outputImage, 0, 0, $transparent);
ImageCopy ($outputImage, $tmpImage, 0, 0, 0, 0, $pngOutputFileWidth, $currentY + $maxYDiff);
	

$images['lastupdated'] = time();
// output icons matching
$fh = fopen($jsOutputFile, 'w');
fwrite($fh, "MMMSearchObj.icons = " . json_encode($images) . ";");
fclose($fh);

imagepng($outputImage, $pngOutputFile);
imagepng($outputImage, "../_ftp/images/" . $pngOutputFile);

// clean up
imagedestroy($tmpImage);
imagedestroy($outputImage);

?>

<body style="background: url(transparent_bg.gif)">
	<img src="icons.png" style="border: 10px solid red" />
</body>