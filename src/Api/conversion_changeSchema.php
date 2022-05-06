<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

include "db_connection.php";

$success = true;

$sql = "
  CREATE TABLE `activity_state` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `userId` char(21) COLLATE utf8_unicode_ci NOT NULL,
    `doenetId` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
    `attemptNumber` int(11) NOT NULL,
    `saveId` char(21) COLLATE utf8_unicode_ci DEFAULT NULL,
    `cid` char(64) COLLATE utf8_unicode_ci NOT NULL,
    `deviceName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `variantIndex` int(11) NOT NULL,
    `activityInfo` mediumtext COLLATE utf8_unicode_ci,
    `activityState` mediumtext COLLATE utf8_unicode_ci,
    PRIMARY KEY (`id`),
    UNIQUE KEY `userId-doenetId-attemptNumber` (`userId`,`doenetId`,`attemptNumber`),
    KEY `saveId` (`saveId`),
    KEY `cid` (`cid`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
      
";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `assignment` 
  DROP COLUMN `examCoverHTML`,
  DROP COLUMN `multipleAttempts`,
  DROP COLUMN `sortOrder`,
  DROP COLUMN `contentId`,
  DROP COLUMN `title`,
  CHANGE COLUMN `doenetId` `doenetId` VARCHAR(255) NOT NULL DEFAULT '' ,
  CHANGE COLUMN `driveId` `courseId` VARCHAR(255) NULL DEFAULT NULL ,
  CHANGE COLUMN `attemptAggregation` `attemptAggregation` CHAR(1) NULL DEFAULT 'm' ,
  CHANGE COLUMN `totalPointsOrPercent` `totalPointsOrPercent` FLOAT NULL DEFAULT 10 ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `class_times` 
  CHANGE COLUMN `driveId` `driveId` VARCHAR(255) NOT NULL DEFAULT '' ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  
  ALTER TABLE `content` 
  CHANGE COLUMN `doenetId` `doenetId` VARCHAR(255) NOT NULL DEFAULT '' ,
  CHANGE COLUMN `contentId` `cid` CHAR(64) NULL DEFAULT '0' ,
  DROP INDEX `contentId` ,
  ADD INDEX `cid` (`cid` ASC);
  ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `course` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `courseId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `label` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'Untitled',
    `isPublic` tinyint(1) DEFAULT '0' COMMENT 'Course is findable in search and drive_content isPublic content is available',
    `isDeleted` tinyint(1) DEFAULT '0',
    `image` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `color` char(6) COLLATE utf8_unicode_ci DEFAULT 'none',
    PRIMARY KEY (`id`),
    UNIQUE KEY `driveId` (`courseId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `course_content` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `type` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `courseId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `doenetId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `cid` char(64) COLLATE utf8_unicode_ci DEFAULT NULL,
    `parentDoenetId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `label` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'Untitled',
    `creationDate` timestamp NULL DEFAULT NULL,
    `isDeleted` int(1) NOT NULL DEFAULT '0',
    `isAssigned` int(1) NOT NULL DEFAULT '0' COMMENT 'The content or folder shows to the student',
    `isGloballyAssigned` int(1) NOT NULL DEFAULT '1' COMMENT 'The content from cid shows to all students without a cidOverride',
    `isPublic` int(1) NOT NULL DEFAULT '0' COMMENT 'The course is available to search for and this content is available',
    `userCanViewSource` int(1) NOT NULL DEFAULT '0',
    `sortOrder` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `jsonDefinition` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `doenetId` (`doenetId`),
    KEY `courseId` (`courseId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `course_grade_category` 
  CHANGE COLUMN `courseId` `courseId` VARCHAR(255) NOT NULL DEFAULT '' ,
  DROP INDEX `course_grade_category` ,
  ADD INDEX `course_grade_category` (`courseId` ASC, `gradeCategory` ASC);
  ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `course_user` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `userId` char(21) COLLATE utf8_unicode_ci DEFAULT NULL,
    `courseId` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `canViewCourse` tinyint(1) DEFAULT '0',
    `canViewContentSource` tinyint(1) DEFAULT '0',
    `canEditContent` tinyint(1) DEFAULT '0',
    `canPublishContent` tinyint(1) DEFAULT '0',
    `canViewUnassignedContent` tinyint(1) DEFAULT '0',
    `canProctor` tinyint(1) DEFAULT '0',
    `canViewAndModifyGrades` tinyint(1) DEFAULT '0',
    `canViewActivitySettings` tinyint(1) DEFAULT '0',
    `canModifyCourseSettings` tinyint(1) DEFAULT '0',
    `canViewUsers` tinyint(1) DEFAULT '0',
    `canManageUsers` tinyint(1) DEFAULT '0',
    `canModifyRoles` tinyint(1) DEFAULT '0',
    `isOwner` tinyint(1) DEFAULT '0',
    `sectionPermissionOnly` int(255) DEFAULT NULL,
    `roleLabels` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `userDrive` (`userId`,`courseId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `enrollment` 
  CHANGE COLUMN `driveId` `courseId` VARCHAR(255) NULL DEFAULT NULL ,
  CHANGE COLUMN `empId` `empId` VARCHAR(32) NULL DEFAULT NULL ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `event` 
  ADD COLUMN `activityCid` CHAR(64) NULL AFTER `doenetId`,
  ADD COLUMN `pageNumber` INT(11) NULL AFTER `pageCid`,
  ADD COLUMN `variantIndex` INT(11) NULL AFTER `variant`,
  CHANGE COLUMN `doenetId` `doenetId` VARCHAR(255) NOT NULL DEFAULT '' AFTER `verb`,
  CHANGE COLUMN `contentId` `pageCid` CHAR(64) NOT NULL ;
  
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `experiment` 
  CHANGE COLUMN `waitingContentId` `waitingCid` CHAR(21) NULL DEFAULT NULL ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `initial_renderer_state` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `cid` char(64) COLLATE utf8_unicode_ci NOT NULL,
    `variantIndex` int(11) NOT NULL,
    `rendererState` mediumtext COLLATE utf8_unicode_ci,
    `coreInfo` mediumtext COLLATE utf8_unicode_ci,
    PRIMARY KEY (`id`),
    UNIQUE KEY `cid-variantIndex` (`cid`,`variantIndex`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `ipfs_to_upload` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `cid` varchar(64) COLLATE utf8_unicode_ci DEFAULT NULL,
    `fileType` varchar(16) COLLATE utf8_unicode_ci DEFAULT NULL,
    `sizeInBytes` int(11) DEFAULT NULL,
    `timestamp` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `page_state` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `userId` char(21) COLLATE utf8_unicode_ci NOT NULL,
    `deviceName` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
    `doenetId` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
    `cid` char(64) COLLATE utf8_unicode_ci NOT NULL,
    `pageNumber` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
    `attemptNumber` int(11) DEFAULT NULL,
    `saveId` char(21) COLLATE utf8_unicode_ci DEFAULT NULL,
    `coreInfo` mediumtext COLLATE utf8_unicode_ci,
    `coreState` mediumtext COLLATE utf8_unicode_ci,
    `rendererState` mediumtext COLLATE utf8_unicode_ci,
    `timestamp` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `userId-doenetId-pageNumber-attemptNumber` (`userId`,`doenetId`,`pageNumber`,`attemptNumber`),
    KEY `saveId` (`saveId`),
    KEY `cid` (`cid`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `pages` (
    `courseId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
    `containingDoenetId` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
    `doenetId` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
    `label` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'Untitled',
    `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
    PRIMARY KEY (`containingDoenetId`,`doenetId`),
    KEY `doenetId` (`doenetId`),
    CONSTRAINT `pages_ibfk_1` FOREIGN KEY (`containingDoenetId`) REFERENCES `course_content` (`doenetId`) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  DROP TABLE IF EXISTS `support_files`;
  ";

$result = $conn->query($sql); 

$sql = " 
  CREATE TABLE `support_files` (
    `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `userId` char(21) COLLATE utf8_unicode_ci DEFAULT '0',
    `cid` char(80) COLLATE utf8_unicode_ci DEFAULT '0',
    `doenetId` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
    `fileType` varchar(32) COLLATE utf8_unicode_ci DEFAULT NULL,
    `description` varchar(256) COLLATE utf8_unicode_ci DEFAULT NULL,
    `asFileName` varchar(256) COLLATE utf8_unicode_ci DEFAULT NULL,
    `sizeInBytes` mediumint(11) DEFAULT NULL,
    `widthPixels` int(11) DEFAULT NULL,
    `heightPixels` int(11) DEFAULT NULL,
    `timestamp` datetime DEFAULT NULL,
    `isListed` tinyint(1) NOT NULL DEFAULT '0',
    `isPublic` tinyint(1) NOT NULL DEFAULT '0',
    PRIMARY KEY (`id`),
    KEY `userId` (`userId`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `user` 
  DROP COLUMN `studentId`,
  CHANGE COLUMN `userId` `userId` CHAR(21) NOT NULL ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `user_assignment` 
  DROP COLUMN `contentId`,
  ADD COLUMN `isUnassigned` bit(1) NOT NULL DEFAULT b'0' AFTER `creditOverride`
  CHANGE COLUMN `doenetId` `doenetId` VARCHAR(255) NOT NULL DEFAULT '' ,
  CHANGE COLUMN `numberOfAttemptsAllowedOverride` `numberOfAttemptsAllowedAdjustment` INT(11) NULL DEFAULT NULL ,
  CHANGE COLUMN `userId` `userId` CHAR(21) NOT NULL ,
  DROP INDEX `assignment-userId` ,
  ADD UNIQUE INDEX `doenetId-userId` (`doenetId` ASC, `userId` ASC);
  ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `user_assignment_attempt` 
  DROP COLUMN `generatedVariant`,
  DROP COLUMN `assignedVariant`,
  DROP COLUMN `contentId`,
  CHANGE COLUMN `doenetId` `doenetId` VARCHAR(255) NOT NULL DEFAULT '' ,
  DROP INDEX `userid-assignmentid-attemptnum` ,
  ADD UNIQUE INDEX `userid-doenetId-attemptNumber` (`userId` ASC, `doenetId` ASC, `attemptNumber` ASC);
  ;
  
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `user_assignment_attempt_item` 
  DROP COLUMN `generatedVariant`,
  DROP COLUMN `contentId`,
  CHANGE COLUMN `doenetId` `doenetId` VARCHAR(255) NOT NULL DEFAULT '' ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `user_assignment_attempt_item_submission` 
  DROP COLUMN `contentId`,
  CHANGE COLUMN `doenetId` `doenetId` VARCHAR(255) NOT NULL ,
  CHANGE COLUMN `userId` `userId` CHAR(21) NOT NULL ,
  CHANGE COLUMN `attemptNumber` `attemptNumber` INT(11) NOT NULL ,
  CHANGE COLUMN `itemNumber` `itemNumber` INT(11) NOT NULL ,
  CHANGE COLUMN `submissionNumber` `submissionNumber` INT(11) NOT NULL ,
  CHANGE COLUMN `stateVariables` `componentsSubmitted` MEDIUMTEXT NULL DEFAULT NULL COMMENT 'JSON of information about the answer component(s) submitted' ,
  CHANGE COLUMN `credit` `credit` FLOAT NULL DEFAULT NULL ;
  
  ";

$result = $conn->query($sql); 

$sql = " 
  ALTER TABLE `user_device` 
  DROP INDEX `deviceName_email` ;
    
";

$result = $conn->query($sql); 


$response_arr = array(
  "success"=>$success,
  );

// set response code - 200 OK
http_response_code(200);

// make it json format
echo json_encode($response_arr);
$conn->close();



?>
