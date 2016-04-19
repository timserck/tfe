<?php include_once("inc/db/initialization.php"); ?>

<?php
if ($_POST) {

$score = nettoyage($_POST['score']);
$teamName = nettoyage($_POST['teamName']);

setScore($connexion, $score, $teamName) ;
};
?>

<?php include_once("inc/meta.inc.php"); ?>


<title>The little voice</title>
<meta name="description" content="game by Timothée Serck for his final exam" />

</head><body>

<?php include_once("inc/analyticstracking.inc.php"); ?>
<section class="section_login">

<?php include_once("inc/view/instructions.view.php"); ?>
<?php include_once("inc/view/scores.view.php"); ?>
<?php include_once("inc/view/credits.view.php"); ?>
<?php include_once("inc/view/login.view.php"); ?>


</section>
<?php include_once("inc/view/wait.view.php"); ?>

<?php include_once("inc/view/game.view.php"); ?>

</main>

<?php include_once("inc/footer.inc.php"); ?>