<?php

function nettoyage($value){
return trim(strip_tags($value));
}

function getScore($connexion)
{

  $query = $connexion->prepare('SELECT * FROM score WHERE score order by score DESC');
  $query->execute();
  return $user = $query->fetchAll();

}


function setScore($connexion, $score, $teamName)
{

 $query = $connexion->prepare("INSERT INTO score (teamName, score) VALUES (:teamName, :score)");
$query->bindParam(':teamName', $teamName);
$query->bindParam(':score', $score);
$query->execute();

}


