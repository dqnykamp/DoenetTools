<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include "db_connection.php";

$success = true;

$sql = "SELECT courseId, doenetId, parentDoenetId, pageId, label, creationDate, isAssigned, isGloballyAssigned, sortOrder, draftPageOldCid, assignedPageOldCid
  FROM activityToConvert
  ";

$result = $conn->query($sql);

$activitiesToConvert = [];

while ($row = $result->fetch_assoc()) {
    $activityData = [
        "courseId" => $row["courseId"],
        "doenetId" => $row["doenetId"],
        "parentDoenetId" => $row["parentDoenetId"],
        "pageId" => $row["pageId"],
        "label" => $row["label"],
        "creationDate" => $row["creationDate"],
        "isAssigned" => $row["isAssigned"],
        "isGloballyAssigned" => $row["isGloballyAssigned"],
        "sortOrder" => $row["sortOrder"],
        "draftPageOldCid" => $row["draftPageOldCid"],
        "assignedPageOldCid" => $row["assignedPageOldCid"],
    ];

    array_push($activitiesToConvert, $activityData);
}

$response_arr = [
    "success" => $success,
    "activitiesToConvert" => $activitiesToConvert,
];

// set response code - 200 OK
http_response_code(200);

// make it json format
echo json_encode($response_arr);
$conn->close();

?>
