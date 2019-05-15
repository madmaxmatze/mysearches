<?php

$countries = array("at", "au", "ca", "ch", "cn", "de", "dk", "es", "fr", "it", "jp", "nl", "se", "uk", "us");
echo "Download flags:<br>";

foreach ($countries as $country) {
	$path = "http://www.finanznachrichten.de/images/flags/" . $country . ".gif";
	
	$flagContent = file_get_contents($path);
	file_put_contents($country . '.gif', $flagContent);
	
	echo $country . ":<img src='" . $path . "' /> ";
}

?>