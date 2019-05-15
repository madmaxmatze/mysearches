<?php
require 'packer/class.JavaScriptPacker.php';

$outputFile = '../_ftp/js/mysearches.js';
$outputFile_dev = '../_ftp/js/mysearches_dev.js';

$sourceFiles = Array(
	'jquery.json.js', 
	'jquery.resize.js',
	'jquery.hasevent.js',
	'mysearches_unpacked.js', 
	'mysearches.icons.js', 
	'mysearches.translations.js', 
	'mysearches.data.js',
	'mysearches.init.js',
);

$sourceJavascript = "";
foreach ($sourceFiles as $sourceFile) {
	$sourceJavascript .= "\n\n" . file_get_contents($sourceFile);
}

$f = fopen($outputFile_dev,'w'); 
fwrite($f,$sourceJavascript); 
fclose($f); 

$packer = new JavaScriptPacker($sourceJavascript, 'Normal', true, false);
$sourceJavascript = $packer->pack();

// $encodedJavascript = utf8_encode($packer->pack()); 

$sourceJavascript="\xEF\xBB\xBF". utf8_encode($sourceJavascript); 

$f = fopen($outputFile,'w'); 
fwrite($f,$sourceJavascript); 
fclose($f); 

?>

Done!