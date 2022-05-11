<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include "db_connection.php";

$_POST = json_decode(file_get_contents("php://input"),true);

// var_dump($_POST['doenetId_to_sortOrder']);
foreach(array_keys($_POST['doenetId_to_sortOrder']) as $doenetId){
  $sortOrder = $_POST['doenetId_to_sortOrder'][$doenetId];
  echo "$doenetId $sortOrder \n";
$sql = "
UPDATE course_content
SET sortOrder='$sortOrder'
WHERE doenetId = '$doenetId'
";

$result = $conn->query($sql);
}



// $response_arr = [
//   "success" => $success,
// ];

// set response code - 200 OK
http_response_code(200);

// make it json format
// echo json_encode($response_arr);
$conn->close();

?>
