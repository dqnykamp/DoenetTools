<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include "db_connection.php";

$success = true;

$sql = "
DROP TABLE IF EXISTS `drive`;
";

$result = $conn->query($sql); 



$sql = "

";

$result = $conn->query($sql); 

// TODO:  add constraint to Pages table


$response_arr = array(
  "success"=>$success,
  );

// set response code - 200 OK
http_response_code(200);

// make it json format
echo json_encode($response_arr);
$conn->close();



?>
