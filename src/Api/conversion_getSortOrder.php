<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include "db_connection.php";

$success = true;

$sql = "
SELECT id,
courseId,
doenetId,
parentDoenetId
FROM course_content
ORDER BY sortOrder
";

$result = $conn->query($sql);

$items_in_order = [];
while ($row = $result->fetch_assoc()) {
  array_push($items_in_order,array(
    "id"=>$row["id"],
    "courseId"=>$row["courseId"],
    "doenetId"=>$row["doenetId"],
    "parentDoenetId"=>$row["parentDoenetId"],
  ));
}

$sql = "
SELECT courseId
FROM course
";

$result = $conn->query($sql);

$courseIds = [];
while ($row = $result->fetch_assoc()) {
  array_push($courseIds,$row["courseId"]);
}

$response_arr = [
  "success" => $success,
  "items_in_order" => $items_in_order,
  "courseIds" => $courseIds,
];

// set response code - 200 OK
http_response_code(200);

// make it json format
echo json_encode($response_arr);
$conn->close();

?>
