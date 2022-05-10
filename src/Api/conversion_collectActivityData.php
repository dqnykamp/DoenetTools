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

// $result = $conn->query($sql);

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

// $result = $conn->query($sql);

$sql = "DROP TABLE IF EXISTS `activityToConvert`";
// $result = $conn->query($sql);

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
// var_dump($result);

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
    $parentDoenetId = $row["parentDoenetId"];
    $label = $row["label"];
    $creationDate = $row["creationDate"];
    $isAssigned = $row["isAssigned"];
    $isGloballyAssigned = $row["isGloballyAssigned"];
    $sortOrder = $row["sortOrder"];

    $pageId = include "randomId.php";
    $pageId = "_" . $pageId;
  
    $orderDoenetId = include "randomId.php";
    $orderDoenetId = "_" . $orderDoenetId;

    $activityData = [
      "courseId" => $courseId,
      "doenetId" => $doenetId,
      "subDoenetId" => $subDoenetId,
      "parentDoenetId" => $parentDoenetId,
      "pageId" => $pageId,
      "orderDoenetId" => $orderDoenetId,
      "label" => $label,
      "creationDate" => $creationDate,
      "isAssigned" => $isAssigned,
      "isGloballyAssigned" => $isGloballyAssigned,
      "sortOrder" => $sortOrder,
  ];

  array_push($activitiesToConvert, $activityData);
}
$index = 1;
foreach ($activitiesToConvert as $activityData){
  echo "$index/n";
  $index++;
  $courseId = $activityData["courseId"];
  $subDoenetId = $activityData["subDoenetId"];
  $doenetId = "_" . $subDoenetId;
  $parentDoenetId = $activityData["parentDoenetId"];
  $label = $activityData["label"];
  $creationDate = $activityData["creationDate"];
  $isAssigned = $activityData["isAssigned"];
  $isGloballyAssigned = $activityData["isGloballyAssigned"];
  $sortOrder = $activityData["sortOrder"];
  $pageId = $activityData["pageId"];
  $orderDoenetId = $activityData["orderDoenetId"];

  
    $jsonDefinition = '{"type":"activity","version": "0.1.0","isSinglePage": true,"order":{"type":"order","doenetId":"'.$orderDoenetId.'","behavior":"sequence","content":["'.$pageId.'"]},"assignedCid":null,"draftCid":null,"itemWeights": [1],"files":[]}';
  
    $label = mysqli_real_escape_string($conn, $label);
    $sql = "INSERT INTO course_content (type, courseId, doenetId, parentDoenetId, label, creationDate, isAssigned, isGloballyAssigned, sortOrder, jsonDefinition)
        VALUES ('activity', '$courseId', '$doenetId', '$parentDoenetId', '$label', '$creationDate', '$isAssigned', '$isGloballyAssigned', '$sortOrder', '$jsonDefinition')
        ";

    $result2 = $conn->query($sql);


    $sql = "INSERT INTO pages (courseId, containingDoenetId, doenetId)
        VALUES ('$courseId', '$doenetId', '$pageId') ";

    $result2 = $conn->query($sql);


    $sql = "SELECT 
      contentId
      FROM content
      WHERE doenetId='$subDoenetId' AND removedFlag=0 AND isReleased=1
      ";

    $result2 = $conn->query($sql);

    $assignedPageOldCid = null;

    if ($result2->num_rows > 0) {
        $row2 = $result2->fetch_assoc();
        $assignedPageOldCid = $row2["contentId"];
    }

    $sql = "SELECT 
      contentId
      FROM content
      WHERE doenetId='$subDoenetId' AND removedFlag=0 AND isDraft=1
      ";

    $result2 = $conn->query($sql);

    if ($result2->num_rows > 0) {
        $row2 = $result2->fetch_assoc();
        $draftPageOldCid = $row2["contentId"];
    } else {
        die("Found page without a draft!!!!!");
    }

    $sql = "INSERT INTO activityToConvert (courseId, doenetId, parentDoenetId, pageId, label, creationDate, isAssigned, isGloballyAssigned, sortOrder, draftPageOldCid, assignedPageOldCid)
      VALUE ('$courseId', '$doenetId', '$parentDoenetId', '$pageId', '$label', '$creationDate', $isAssigned, $isGloballyAssigned, '$sortOrder', '$draftPageOldCid', '$assignedPageOldCid')
      ";

    $result2 = $conn->query($sql);

    
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
