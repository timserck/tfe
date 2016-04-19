			<?php
	include_once('functions.php');
include_once('initialization.php');
	$order = 0;
	$scores = getScore($connexion);
	foreach ($scores as $key => $score) {
		
		echo "<li> <span class='score_number'>".$order++."</span>
			<span class='score_name'>".$score['teamName']."</span>
			<span class='score_value'>".$score['score']."</span>";
	}
	 ?>