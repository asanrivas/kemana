-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: demo.ansi.com.my    Database: fleet
-- ------------------------------------------------------
-- Server version	5.7.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `driver`
--

DROP TABLE IF EXISTS `driver`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `driver` (
  `d_id` int(11) NOT NULL AUTO_INCREMENT,
  `d_nric` varchar(45) DEFAULT NULL,
  `d_name` varchar(45) NOT NULL,
  `lg_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`d_id`),
  UNIQUE KEY `d_nric_UNIQUE` (`d_nric`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `driver`
--

LOCK TABLES `driver` WRITE;
/*!40000 ALTER TABLE `driver` DISABLE KEYS */;
INSERT INTO `driver` VALUES (3,'790208065313','Aizal bin Abdul Manan','male'),(4,'581001086503','Abdul Rahim bin Mohd Din','male'),(5,'840101105787','Ahmad Affandy bin Baharudin','male'),(6,'780206036085','Asmadi bin Mohd Noor','male'),(7,'850302145506','Hasnizah binti Mohd Yusof','female');
/*!40000 ALTER TABLE `driver` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lov_gender`
--

DROP TABLE IF EXISTS `lov_gender`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lov_gender` (
  `lg_id` varchar(45) NOT NULL,
  `lg_desc` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`lg_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lov_gender`
--

LOCK TABLES `lov_gender` WRITE;
/*!40000 ALTER TABLE `lov_gender` DISABLE KEYS */;
INSERT INTO `lov_gender` VALUES ('female','Female'),('male','Male');
/*!40000 ALTER TABLE `lov_gender` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lov_vehicle_condition`
--

DROP TABLE IF EXISTS `lov_vehicle_condition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lov_vehicle_condition` (
  `lvc_id` varchar(45) NOT NULL,
  `lvc_desc` varchar(45) NOT NULL,
  `lvc_class` varchar(45) NOT NULL,
  `lvc_order` int(11) DEFAULT NULL,
  PRIMARY KEY (`lvc_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lov_vehicle_condition`
--

LOCK TABLES `lov_vehicle_condition` WRITE;
/*!40000 ALTER TABLE `lov_vehicle_condition` DISABLE KEYS */;
INSERT INTO `lov_vehicle_condition` VALUES ('broke','Broke','uk-text-danger',4),('good','Good','uk-text-success',1),('service','In Service','uk-text-warning',2),('short','Short Distance','uk-text-warning',3);
/*!40000 ALTER TABLE `lov_vehicle_condition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lov_vehicle_type`
--

DROP TABLE IF EXISTS `lov_vehicle_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lov_vehicle_type` (
  `lvt_id` int(11) NOT NULL AUTO_INCREMENT,
  `lvt_code` varchar(45) NOT NULL,
  `lvt_desc` varchar(45) NOT NULL,
  `lvt_order` int(11) DEFAULT NULL,
  `lvt_active` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`lvt_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lov_vehicle_type`
--

LOCK TABLES `lov_vehicle_type` WRITE;
/*!40000 ALTER TABLE `lov_vehicle_type` DISABLE KEYS */;
INSERT INTO `lov_vehicle_type` VALUES (1,'bus','Bus',NULL,1),(2,'car','Car',NULL,1),(3,'lorry','Lorry',NULL,1),(4,'motorbike','Motorbike',NULL,1),(5,'van','Van',NULL,1);
/*!40000 ALTER TABLE `lov_vehicle_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `smartphone`
--

DROP TABLE IF EXISTS `smartphone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `smartphone` (
  `s_id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'usually NRIC',
  `s_number` varchar(45) DEFAULT NULL COMMENT 'status: paired, new',
  `s_activated` int(1) NOT NULL DEFAULT '0',
  `s_uuid` varchar(32) NOT NULL COMMENT 'random MD5',
  `d_id` int(11) NOT NULL,
  PRIMARY KEY (`s_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `smartphone`
--

LOCK TABLES `smartphone` WRITE;
/*!40000 ALTER TABLE `smartphone` DISABLE KEYS */;
INSERT INTO `smartphone` VALUES (10,'012-2954570',1,'26173c8d490a52185a4024ed406d89fe',3),(11,'012-2954570',1,'f84900b48bbcc280f7f93a25dfe3a9ff',4),(12,'011-2563221',1,'6ab4c28715779350a5802a0e31ffa8ec',5),(13,'013-6582321',1,'b65dbe9940b2d78851b84c06d24a91e3',6),(14,'014-7852147',1,'7b4f0aa36c64d059f06f9aff7594f06e',7);
/*!40000 ALTER TABLE `smartphone` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER s_uuid
  BEFORE INSERT ON `smartphone` FOR EACH ROW
  SET new.s_uuid = md5(uuid()) */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `vehicle`
--

DROP TABLE IF EXISTS `vehicle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicle` (
  `v_id` int(11) NOT NULL AUTO_INCREMENT,
  `v_registration` varchar(45) NOT NULL,
  `lvc_id` varchar(45) DEFAULT NULL,
  `lvt_id` int(11) NOT NULL,
  `d_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`v_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle`
--

LOCK TABLES `vehicle` WRITE;
/*!40000 ALTER TABLE `vehicle` DISABLE KEYS */;
INSERT INTO `vehicle` VALUES (2,'CU3388','good',2,3),(3,'KEP3095','good',2,4),(4,'WA4079Q','good',4,7),(5,'MEL6582','good',1,5),(6,'JTA1775','good',5,6);
/*!40000 ALTER TABLE `vehicle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicle_location`
--

DROP TABLE IF EXISTS `vehicle_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vehicle_location` (
  `vl_id` int(11) NOT NULL AUTO_INCREMENT,
  `vl_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `vl_location` varchar(45) NOT NULL,
  `vl_speed` varchar(45) DEFAULT NULL,
  `v_id` int(11) NOT NULL,
  PRIMARY KEY (`vl_id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicle_location`
--

LOCK TABLES `vehicle_location` WRITE;
/*!40000 ALTER TABLE `vehicle_location` DISABLE KEYS */;
INSERT INTO `vehicle_location` VALUES (51,'2018-09-07 00:47:22','2.9945361,101.7451057','0',2),(52,'2018-09-07 00:47:27','2.9945419,101.7451139','0',2),(53,'2018-09-07 00:47:32','2.9945357,101.745119','0',2),(80,'2018-09-07 01:09:51','2.313502,102.298284',NULL,3),(81,'2018-09-07 01:09:51','2.303726,102.316609',NULL,4),(82,'2018-09-07 01:09:51','2.314918,102.352143',NULL,5),(83,'2018-09-07 01:09:51','2.448259,102.172536',NULL,6),(84,'2018-09-07 01:15:10','2.9945396,101.7451035','0',2);
/*!40000 ALTER TABLE `vehicle_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'fleet'
--

--
-- Dumping routines for database 'fleet'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-09-07  1:32:29
