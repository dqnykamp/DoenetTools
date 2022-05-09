<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

include "db_connection.php";

$success = true;

$sql = "
INSERT INTO course (courseId, label, isPublic, isDeleted, image, color)
  SELECT concat('_', driveId), label, isPublic, isDeleted, image, color
  FROM drive; 
";

$result = $conn->query($sql);

$sql = "INSERT INTO course_content (type, courseId, doenetId, parentDoenetId, label, creationDate, isAssigned, isGloballyAssigned, sortOrder, jsonDefinition)
  SELECT 'section' AS type,
  concat('_', driveId) AS courseId, 
  concat('_', itemId) AS doenetId,
  concat('_', parentFolderId) AS parentDoenetId,
  label,
  creationDate,
  isReleased AS isAssigned,
  isReleased AS isGloballyAssigned,
  sortOrder,
  '{\"isIncludedInStudentNavigation\": true}' AS jsonDefinition
  FROM drive_content
  WHERE isDeleted=0 AND itemType='Folder'
  ";

$result = $conn->query($sql);

$sql = "DROP TABLE IF EXISTS `activityToConvert`";
$result = $conn->query($sql);

$sql = "CREATE TABLE `activityToConvert` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `courseId` VARCHAR(255) NOT NULL,
  `doenetId` VARCHAR(255) NOT NULL,
  `parentDoenetId` VARCHAR(255) NOT NULL,
  `pageId` VARCHAR(255) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `creationDate` TIMESTAMP NOT NULL,
  `isAssigned` BIT(1) NOT NULL,
  `isGloballyAssigned` BIT(1) NOT NULL,
  `sortOrder` VARCHAR(255) NOT NULL,
  `draftPageOldCid` CHAR(64) NULL,
  `assignedPageOldCid` CHAR(64) NULL,
  PRIMARY KEY (`id`))
  ";
$result = $conn->query($sql);

$sql = "SELECT concat('_', driveId) AS courseId, 
  doenetId AS subDoenetId,
  concat('_', parentFolderId) AS parentDoenetId,
  label,
  creationDate,
  isReleased AS isAssigned,
  isReleased AS isGloballyAssigned,
  sortOrder
  FROM drive_content
  WHERE isDeleted=0 AND itemType='DoenetML'
  ";

$result = $conn->query($sql);

$activitiesToConvert = [];

while ($row = $result->fetch_assoc()) {
    $courseId = $row["courseId"];
    $subDoenetId = $row["subDoenetId"];
    $doenetId = "_" . $subDoenetId;
    $parentDoenetId = $row["parentDoentId"];
    $label = $row["label"];
    $creationDate = $row["creationDate"];
    $isAssigned = $row["isAssigned"];
    $isGloballyAssigned = $row["isGloballyAssigned"];
    $sortOrder = $row["sortOrder"];

    $pageId = include "randomId.php";
    $pageId = "_" . $pageId;

    $sql = "INSERT INTO pages (courseId, containingDoenetId, doenetId)
        VALUES ('$courseId', '$doenetId', '$pageId') ";

    $result2 = $conn->query($sql);


    $sql = "SELECT 
      cid
      FROM content
      WHERE doenetId='$subDoenetId' AND removedFlag=0 AND isReleased=1
      ";

    $result2 = $conn->query($sql);

    if ($result2->num_rows > 0) {
        $row2 = $result2->fetch_assoc();
        $assignedPageOldCid = $row2["cid"];
    }

    $sql = "SELECT 
      cid
      FROM content
      WHERE doenetId='$subDoenetId' AND removedFlag=0 AND isDraft=1
      ";

    $result2 = $conn->query($sql);

    if ($result2->num_rows > 0) {
        $row2 = $result2->fetch_assoc();
        $draftPageOldCid = $row2["cid"];
    } else {
        die("Found page without a draft!!!!!");
    }

    $sql = "INSERT INTO activityToConvert (courseId, doenetId, parentDoenetId, pageId, label, creationDate, isAssigned, isGloballyAssigned, sortOrder, draftPageOldCid, assignedPageOldCid)
      VALUE ('$courseId', '$doenetId', '$parentDoenetId', '$pageId', '$label', '$creationDate', $isAssigned, $isGloballyAssigned, '$sortOrder', '$draftPageOldCid', '$assignedPageOldCid')
      ";

    $result2 = $conn->query($sql);

    $activityData = [
        "courseId" => $courseId,
        "doenetId" => $doenetId,
        "parentDoenetId" => $parentDoenetId,
        "pageId" => $pageId,
        "label" => $label,
        "creationDate" => $creationDate,
        "isAssigned" => $isAssigned,
        "isGloballyAssigned" => $isGloballyAssigned,
        "sortOrder" => $sortOrder,
        "draftPageOldCid" => $draftPageOldCid,
        "assignedPageOldCid" => $assignedPageOldCid,
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
