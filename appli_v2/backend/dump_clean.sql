-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: music_vintageee
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `acheteur`
--

DROP TABLE IF EXISTS `acheteur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `acheteur` (
  `id_user` int(11) NOT NULL,
  `adresse` varchar(300) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  CONSTRAINT `acheteur_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `acheteur`
--

LOCK TABLES `acheteur` WRITE;
/*!40000 ALTER TABLE `acheteur` DISABLE KEYS */;
INSERT INTO `acheteur` VALUES (1,'',''),(2,'',''),(4,'',''),(5,'Achat direct en ligne','0600000000'),(6,'',''),(8,'Achat direct en ligne','0600000000'),(9,'Achat direct en ligne','0600000000'),(12,'Achat direct en ligne','0600000000'),(13,'JKDLSJK','983938'),(15,'JFHOUFHEOU','227126763'),(16,'Bejai paris','0555555'),(19,'Bejaia','0554873962');
/*!40000 ALTER TABLE `acheteur` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `description` varchar(255) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_user_id_foreign` (`user_id`),
  CONSTRAINT `activities_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (1,13,'review_added','Avis laissé sur le produit #8 (5/5)','2026-04-26 07:01:37','2026-04-26 07:01:37','2026-04-26 07:01:37'),(2,13,'order_placed','Commande #1 passée pour 70.00€','2026-04-26 07:03:33','2026-04-26 07:03:33','2026-04-26 07:03:33'),(3,13,'review_added','Avis laissé sur le produit #3 (5/5)','2026-04-26 07:06:16','2026-04-26 07:06:16','2026-04-26 07:06:16'),(4,13,'order_placed','Commande #2 passée pour 30.00€','2026-04-26 07:07:12','2026-04-26 07:07:12','2026-04-26 07:07:12'),(5,13,'review_added','Avis laissé sur le produit #8 (5/5)','2026-04-26 07:15:24','2026-04-26 07:15:24','2026-04-26 07:15:24'),(6,13,'review_added','Avis publié (5★) : \"AVIS A ENREGISTRER DANS ACTIVITE\"','2026-04-26 07:15:25','2026-04-26 07:15:25','2026-04-26 07:15:25'),(7,13,'cart_add','Ajouté au panier : produit a vendeur en urgence','2026-04-26 07:16:27','2026-04-26 07:16:27','2026-04-26 07:16:27'),(8,13,'order_placed','Commande #3 payée (20.00€)','2026-04-26 07:16:53','2026-04-26 07:16:53','2026-04-26 07:16:53'),(9,13,'order_placed','Commande de 20.00€ validée','2026-04-26 07:16:53','2026-04-26 07:16:53','2026-04-26 07:16:53'),(10,13,'cart_add','Ajouté au panier : loveI','2026-04-26 07:23:19','2026-04-26 07:23:19','2026-04-26 07:23:19'),(11,13,'order_placed','Commande #12 passée (EN_ATTENTE)','2026-04-26 07:26:07','2026-04-26 07:26:07','2026-04-26 07:26:07'),(12,13,'order_placed','Commande de 30.00€ validée','2026-04-26 07:26:07','2026-04-26 07:26:07','2026-04-26 07:26:07'),(13,13,'fav_add','Ajouté aux favoris : produit1 a verifier','2026-04-26 07:46:20','2026-04-26 07:46:20','2026-04-26 07:46:20'),(14,13,'fav_remove','Retiré des favoris : produit1 a verifier','2026-04-26 07:46:21','2026-04-26 07:46:21','2026-04-26 07:46:21'),(15,13,'fav_add','Ajouté aux favoris : michel jack','2026-04-26 07:46:22','2026-04-26 07:46:22','2026-04-26 07:46:22'),(16,13,'fav_add','Ajouté aux favoris : produit1 a verifier','2026-04-26 07:46:22','2026-04-26 07:46:22','2026-04-26 07:46:22'),(17,13,'fav_add','Ajouté aux favoris : produit a vendeur en urgence','2026-04-26 07:46:23','2026-04-26 07:46:23','2026-04-26 07:46:23'),(18,13,'fav_add','Ajouté aux favoris : loveI','2026-04-26 07:46:24','2026-04-26 07:46:24','2026-04-26 07:46:24'),(19,13,'fav_add','Ajouté aux favoris : LOL','2026-04-26 07:46:25','2026-04-26 07:46:25','2026-04-26 07:46:25'),(20,13,'fav_add','Ajouté aux favoris : Michel jckson poster','2026-04-26 07:46:27','2026-04-26 07:46:27','2026-04-26 07:46:27'),(21,16,'fav_add','Ajouté aux favoris : michel jack','2026-04-26 15:06:05','2026-04-26 15:06:05','2026-04-26 15:06:05'),(22,16,'fav_add','Ajouté aux favoris : produit1 a verifier','2026-04-26 15:06:07','2026-04-26 15:06:07','2026-04-26 15:06:07'),(23,16,'fav_add','Ajouté aux favoris : produit a vendeur en urgence','2026-04-26 15:06:08','2026-04-26 15:06:08','2026-04-26 15:06:08'),(24,16,'fav_add','Ajouté aux favoris : loveI','2026-04-26 15:06:10','2026-04-26 15:06:10','2026-04-26 15:06:10'),(25,16,'cart_add','Ajouté au panier : michel jack','2026-04-26 15:06:18','2026-04-26 15:06:18','2026-04-26 15:06:18'),(26,16,'review_added','Avis laissé sur le produit #8 (5/5)','2026-04-26 15:06:34','2026-04-26 15:06:34','2026-04-26 15:06:34'),(27,16,'review_added','Avis publié (5★) : \"Vraiment haja le top\"','2026-04-26 15:06:35','2026-04-26 15:06:35','2026-04-26 15:06:35'),(28,16,'order_placed','Commande #13 passée (EN_ATTENTE)','2026-04-26 15:07:35','2026-04-26 15:07:35','2026-04-26 15:07:35'),(29,16,'order_placed','Commande de 70.00€ validée','2026-04-26 15:07:36','2026-04-26 15:07:36','2026-04-26 15:07:36'),(30,16,'cart_add','Ajouté au panier : celia','2026-04-26 15:23:36','2026-04-26 15:23:36','2026-04-26 15:23:36'),(31,16,'fav_add','Ajouté aux favoris : celia','2026-04-26 15:23:41','2026-04-26 15:23:41','2026-04-26 15:23:41'),(39,16,'fav_add','Ajouté aux favoris : Michel jckson poster','2026-04-26 15:42:15','2026-04-26 15:42:15','2026-04-26 15:42:15'),(40,16,'fav_add','Ajouté aux favoris : produit a vendeur en urgence','2026-04-26 15:42:17','2026-04-26 15:42:17','2026-04-26 15:42:17'),(41,16,'fav_add','Ajouté aux favoris : LOL','2026-04-26 15:42:18','2026-04-26 15:42:18','2026-04-26 15:42:18'),(42,13,'fav_add','Ajouté aux favoris : produit1 a verifier','2026-04-26 15:59:09','2026-04-26 15:59:09','2026-04-26 15:59:09'),(43,13,'fav_add','Ajouté aux favoris : michel jack','2026-04-26 15:59:10','2026-04-26 15:59:10','2026-04-26 15:59:10'),(44,13,'review_added','Avis laissé sur le produit #8 (5/5)','2026-04-26 16:10:36','2026-04-26 16:10:36','2026-04-26 16:10:36'),(45,13,'review_added','Avis publié (5★) : \"ey cest ca la vie\"','2026-04-26 16:10:37','2026-04-26 16:10:37','2026-04-26 16:10:37'),(46,13,'cart_add','Ajouté au panier : celia','2026-04-26 16:12:01','2026-04-26 16:12:01','2026-04-26 16:12:01'),(47,13,'order_placed','Commande #15 passée (EN_ATTENTE)','2026-04-26 16:12:35','2026-04-26 16:12:35','2026-04-26 16:12:35'),(48,13,'order_placed','Commande de 30.00€ validée','2026-04-26 16:12:36','2026-04-26 16:12:36','2026-04-26 16:12:36'),(49,13,'cart_add','Ajouté au panier : celia','2026-04-26 18:44:10','2026-04-26 18:44:10','2026-04-26 18:44:10'),(50,19,'cart_add','Ajouté au panier : pressaage original','2026-04-30 20:19:44','2026-04-30 20:19:44','2026-04-30 20:19:44'),(51,19,'fav_add','Ajouté aux favoris : pressaage original','2026-04-30 20:19:45','2026-04-30 20:19:45','2026-04-30 20:19:45'),(52,19,'order_placed','Commande #49 passée (EN_ATTENTE)','2026-04-30 20:21:05','2026-04-30 20:21:05','2026-04-30 20:21:05'),(53,19,'order_placed','Commande de 200.00€ validée','2026-04-30 20:21:06','2026-04-30 20:21:06','2026-04-30 20:21:06'),(54,13,'cart_add','Ajouté au panier : HOI','2026-04-30 20:27:32','2026-04-30 20:27:32','2026-04-30 20:27:32'),(55,19,'review_added','Avis laissé sur le produit #8 (5/5)','2026-05-01 08:56:49','2026-05-01 08:56:49','2026-05-01 08:56:49'),(56,19,'review_added','Avis publié (5★) : \"avis achteur sur le produit michel jack\"','2026-05-01 08:56:50','2026-05-01 08:56:50','2026-05-01 08:56:50'),(57,15,'cart_add','Ajouté au panier : NOTIFICATON','2026-05-01 09:45:18','2026-05-01 09:45:18','2026-05-01 09:45:18'),(58,15,'order_placed','Commande #50 passée (EN_ATTENTE)','2026-05-01 09:45:49','2026-05-01 09:45:49','2026-05-01 09:45:49'),(59,15,'order_placed','Commande de 200.00€ validée','2026-05-01 09:45:50','2026-05-01 09:45:50','2026-05-01 09:45:50'),(60,13,'cart_add','Ajouté au panier : NOTIFICATON','2026-05-01 09:49:11','2026-05-01 09:49:11','2026-05-01 09:49:11'),(61,13,'order_placed','Commande #51 passée (EN_ATTENTE)','2026-05-01 09:49:37','2026-05-01 09:49:37','2026-05-01 09:49:37'),(62,13,'order_placed','Commande de 100.00€ validée','2026-05-01 09:49:39','2026-05-01 09:49:39','2026-05-01 09:49:39'),(63,13,'cart_add','Ajouté au panier : loveI','2026-05-01 10:18:56','2026-05-01 10:18:56','2026-05-01 10:18:56'),(64,13,'fav_add','Ajouté aux favoris : loveI','2026-05-01 10:18:57','2026-05-01 10:18:57','2026-05-01 10:18:57'),(65,13,'review_added','Avis laissé sur le produit #3 (5/5)','2026-05-01 10:19:03','2026-05-01 10:19:03','2026-05-01 10:19:03'),(66,13,'review_added','Avis publié (5★) : \"jndgjlzh\"','2026-05-01 10:19:04','2026-05-01 10:19:04','2026-05-01 10:19:04'),(67,13,'order_placed','Commande #52 passée (EN_ATTENTE)','2026-05-01 10:19:49','2026-05-01 10:19:49','2026-05-01 10:19:49'),(68,13,'order_placed','Commande de 30.00€ validée','2026-05-01 10:19:50','2026-05-01 10:19:50','2026-05-01 10:19:50'),(69,13,'cart_add','Ajouté au panier : produit1 a verifier','2026-05-01 10:20:19','2026-05-01 10:20:19','2026-05-01 10:20:19'),(70,13,'order_placed','Commande #53 passée (EN_ATTENTE)','2026-05-01 10:21:10','2026-05-01 10:21:10','2026-05-01 10:21:10'),(71,13,'order_placed','Commande de 30.00€ validée','2026-05-01 10:21:10','2026-05-01 10:21:10','2026-05-01 10:21:10'),(72,13,'fav_add','Ajouté aux favoris : HOI','2026-05-01 10:43:18','2026-05-01 10:43:18','2026-05-01 10:43:18');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admin_mv`
--

DROP TABLE IF EXISTS `admin_mv`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admin_mv` (
  `id_user` int(11) NOT NULL,
  PRIMARY KEY (`id_user`),
  CONSTRAINT `admin_mv_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_mv`
--

LOCK TABLES `admin_mv` WRITE;
/*!40000 ALTER TABLE `admin_mv` DISABLE KEYS */;
/*!40000 ALTER TABLE `admin_mv` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `annonce`
--

DROP TABLE IF EXISTS `annonce`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `annonce` (
  `id_annonce` int(11) NOT NULL AUTO_INCREMENT,
  `id_vendeur` int(11) NOT NULL,
  `id_admin` int(11) DEFAULT NULL,
  `titre` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `statut` enum('EN_ATTENTE','VALIDEE','REFUSEE','EXPIREE') DEFAULT 'EN_ATTENTE',
  `motif_refus` varchar(500) DEFAULT NULL,
  `date_soumission` datetime DEFAULT current_timestamp(),
  `date_traitement` datetime DEFAULT NULL,
  PRIMARY KEY (`id_annonce`),
  KEY `id_vendeur` (`id_vendeur`),
  KEY `id_admin` (`id_admin`),
  CONSTRAINT `annonce_ibfk_1` FOREIGN KEY (`id_vendeur`) REFERENCES `vendeur` (`id_user`),
  CONSTRAINT `annonce_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `admin_mv` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annonce`
--

LOCK TABLES `annonce` WRITE;
/*!40000 ALTER TABLE `annonce` DISABLE KEYS */;
INSERT INTO `annonce` VALUES (2,3,NULL,'love','love','VALIDEE',NULL,'2026-04-11 20:50:05','2026-04-11 20:55:34'),(3,3,NULL,'LOL','LOL','EN_ATTENTE',NULL,'2026-04-12 16:20:59',NULL),(4,5,NULL,'Michel jckson poster','yoo','EN_ATTENTE',NULL,'2026-04-24 19:12:28',NULL),(5,10,NULL,'produit a vendeur en urgence','jai pas de money','EN_ATTENTE',NULL,'2026-04-24 19:43:16',NULL),(6,11,NULL,'produit1 a verifier','produit a verifier','EN_ATTENTE',NULL,'2026-04-24 20:10:06',NULL),(7,15,NULL,'michel jack','produit new','VALIDEE',NULL,'2026-04-25 15:47:26','2026-04-25 15:48:22'),(8,16,NULL,'celia','prod','VALIDEE',NULL,'2026-04-26 16:22:01','2026-04-26 16:23:01'),(9,19,NULL,'pressaage original','yooooooooooooooo','VALIDEE',NULL,'2026-04-30 21:16:45','2026-04-30 21:18:11'),(10,19,NULL,'HOI','HIUOU','VALIDEE',NULL,'2026-04-30 21:26:07','2026-04-30 21:26:58'),(11,19,NULL,'NOTIFICATON','NVJOIV','VALIDEE',NULL,'2026-05-01 10:24:37','2026-05-01 10:25:17');
/*!40000 ALTER TABLE `annonce` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `annonce_produit`
--

DROP TABLE IF EXISTS `annonce_produit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `annonce_produit` (
  `id_annonce` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  PRIMARY KEY (`id_annonce`,`id_produit`),
  KEY `id_produit` (`id_produit`),
  CONSTRAINT `annonce_produit_ibfk_1` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`) ON DELETE CASCADE,
  CONSTRAINT `annonce_produit_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `annonce_produit`
--

LOCK TABLES `annonce_produit` WRITE;
/*!40000 ALTER TABLE `annonce_produit` DISABLE KEYS */;
INSERT INTO `annonce_produit` VALUES (2,3),(3,4),(4,5),(5,6),(6,7),(7,8),(8,9),(9,10),(10,11),(11,12);
/*!40000 ALTER TABLE `annonce_produit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avis`
--

DROP TABLE IF EXISTS `avis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `avis` (
  `id_avis` int(11) NOT NULL AUTO_INCREMENT,
  `id_produit` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `note` int(11) NOT NULL,
  `commentaire` text DEFAULT NULL,
  `date_avis` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_avis`),
  KEY `id_produit` (`id_produit`),
  KEY `id_user` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis`
--

LOCK TABLES `avis` WRITE;
/*!40000 ALTER TABLE `avis` DISABLE KEYS */;
INSERT INTO `avis` VALUES (1,8,0,5,'parfait','2026-04-25 17:14:16'),(2,8,0,5,'J\'aime bien','2026-04-25 19:11:57'),(3,8,0,5,'Tres bien','2026-04-25 19:29:25'),(4,8,13,5,'mlih','2026-04-25 20:00:26'),(5,8,13,5,'avis achteur celia','2026-04-26 08:01:37'),(6,3,13,5,'FFF ACHH','2026-04-26 08:06:16'),(7,8,13,5,'AVIS A ENREGISTRER DANS ACTIVITE','2026-04-26 08:15:24'),(8,8,16,5,'Vraiment haja le top','2026-04-26 16:06:34'),(9,8,13,5,'ey cest ca la vie','2026-04-26 17:10:36'),(10,3,1,5,'Superbe vinyle, son impeccable.','2026-04-16 20:48:58'),(11,4,1,5,'Un peu abîmé mais acceptable pour le prix.','2026-04-12 20:48:58'),(12,8,19,5,'avis achteur sur le produit michel jack','2026-05-01 09:56:49'),(13,3,13,5,'jndgjlzh','2026-05-01 11:19:03');
/*!40000 ALTER TABLE `avis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avis_visiteur`
--

DROP TABLE IF EXISTS `avis_visiteur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `avis_visiteur` (
  `id_avis` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_produit` int(11) NOT NULL,
  `visitor_id` varchar(64) NOT NULL,
  `pseudo` varchar(100) NOT NULL DEFAULT 'Visiteur',
  `note` int(11) NOT NULL,
  `commentaire` text DEFAULT NULL,
  `date_avis` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_avis`),
  KEY `avis_visiteur_visitor_id_index` (`visitor_id`),
  KEY `avis_visiteur_id_produit_index` (`id_produit`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avis_visiteur`
--

LOCK TABLES `avis_visiteur` WRITE;
/*!40000 ALTER TABLE `avis_visiteur` DISABLE KEYS */;
INSERT INTO `avis_visiteur` VALUES (1,8,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,'hi','2026-04-25 20:38:26','2026-04-25 20:38:26','2026-04-25 20:38:26'),(2,8,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',2,'n,b','2026-04-25 20:39:13','2026-04-25 20:39:13','2026-04-25 20:39:13'),(3,7,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,'lknlk','2026-04-25 20:52:17','2026-04-25 20:52:17','2026-04-25 20:52:17'),(4,7,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,'lknlk','2026-04-25 20:52:20','2026-04-25 20:52:20','2026-04-25 20:52:20'),(5,8,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,';,nkl','2026-04-25 20:53:03','2026-04-25 20:53:03','2026-04-25 20:53:03'),(6,8,'test','test',5,'test','2026-04-25 20:57:10','2026-04-25 20:57:10','2026-04-25 20:57:10'),(7,7,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,'merde','2026-04-25 21:01:20','2026-04-25 21:01:20','2026-04-25 21:01:20'),(8,7,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,'merde','2026-04-25 21:01:32','2026-04-25 21:01:32','2026-04-25 21:01:32'),(9,7,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,'merde','2026-04-25 21:01:37','2026-04-25 21:01:37','2026-04-25 21:01:37'),(10,7,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','Visiteur',5,'gg','2026-04-25 21:03:01','2026-04-25 21:03:01','2026-04-25 21:03:01'),(11,7,'v_af89d8fa-a318-4929-8284-ef013bcea991','Visiteur',5,'essaye','2026-04-26 06:40:08','2026-04-26 06:40:08','2026-04-26 06:40:08'),(12,8,'v_0934bba8-d89d-4dd4-abb3-36c36b82119c','Visiteur',5,'yoooah','2026-04-26 15:04:18','2026-04-26 15:04:18','2026-04-26 15:04:18'),(13,9,'v_a3d11e8c-5dac-4de7-b714-dda17adb4903','Visiteur',5,'yo','2026-04-30 20:02:37','2026-04-30 20:02:37','2026-04-30 20:02:37');
/*!40000 ALTER TABLE `avis_visiteur` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cassette`
--

DROP TABLE IF EXISTS `cassette`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cassette` (
  `id_produit` int(11) NOT NULL,
  `duree_min` int(11) DEFAULT NULL,
  `label` varchar(150) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_produit`),
  CONSTRAINT `cassette_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cassette`
--

LOCK TABLES `cassette` WRITE;
/*!40000 ALTER TABLE `cassette` DISABLE KEYS */;
INSERT INTO `cassette` VALUES (4,NULL,NULL,NULL),(9,NULL,NULL,NULL),(12,NULL,NULL,NULL);
/*!40000 ALTER TABLE `cassette` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorie`
--

DROP TABLE IF EXISTS `categorie`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorie` (
  `id_categorie` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `type_categorie` enum('CD','CASSETTE','VINYLE','POSTER','INSTRUMENT') NOT NULL,
  PRIMARY KEY (`id_categorie`),
  UNIQUE KEY `nom` (`nom`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorie`
--

LOCK TABLES `categorie` WRITE;
/*!40000 ALTER TABLE `categorie` DISABLE KEYS */;
INSERT INTO `categorie` VALUES (1,'CD','CD'),(2,'Cassette Audio','CASSETTE'),(3,'Vinyle','VINYLE'),(4,'Poster','POSTER'),(5,'Instrument','INSTRUMENT');
/*!40000 ALTER TABLE `categorie` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cds`
--

DROP TABLE IF EXISTS `cds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cds` (
  `id_produit` int(11) NOT NULL,
  `nb_pistes` int(11) DEFAULT NULL,
  `label` varchar(150) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_produit`),
  CONSTRAINT `cds_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cds`
--

LOCK TABLES `cds` WRITE;
/*!40000 ALTER TABLE `cds` DISABLE KEYS */;
INSERT INTO `cds` VALUES (11,NULL,NULL,NULL);
/*!40000 ALTER TABLE `cds` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande`
--

DROP TABLE IF EXISTS `commande`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commande` (
  `id_commande` int(11) NOT NULL AUTO_INCREMENT,
  `id_acheteur` int(11) NOT NULL,
  `id_panier` int(11) DEFAULT NULL,
  `date_commande` datetime DEFAULT current_timestamp(),
  `statut` enum('EN_ATTENTE','CONFIRMEE','EXPEDIEE','LIVREE','ANNULEE','REMBOURSEE') DEFAULT 'EN_ATTENTE',
  `montant_total` decimal(10,2) NOT NULL,
  `adresse_livraison` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_commande`),
  KEY `id_acheteur` (`id_acheteur`),
  KEY `id_panier` (`id_panier`),
  CONSTRAINT `commande_ibfk_1` FOREIGN KEY (`id_acheteur`) REFERENCES `acheteur` (`id_user`),
  CONSTRAINT `commande_ibfk_2` FOREIGN KEY (`id_panier`) REFERENCES `panier` (`id_panier`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande`
--

LOCK TABLES `commande` WRITE;
/*!40000 ALTER TABLE `commande` DISABLE KEYS */;
INSERT INTO `commande` VALUES (1,5,2,'2026-04-24 19:09:51','EN_ATTENTE',30.00,NULL,NULL),(2,8,3,'2026-04-24 19:51:56','CONFIRMEE',80.00,NULL,NULL),(3,12,5,'2026-04-24 20:12:49','CONFIRMEE',30.00,NULL,NULL),(4,9,6,'2026-04-24 20:40:54','EN_ATTENTE',30.00,NULL,NULL),(5,13,7,'2026-04-25 15:33:57','ANNULEE',30.00,NULL,NULL),(6,13,7,'2026-04-25 15:49:36','LIVREE',70.00,NULL,NULL),(7,13,7,'2026-04-25 19:24:42','LIVREE',70.00,NULL,NULL),(8,13,7,'2026-04-25 19:43:23','LIVREE',70.00,NULL,NULL),(12,13,7,'2026-04-26 08:26:07','EN_ATTENTE',30.00,NULL,NULL),(13,16,8,'2026-04-26 16:07:35','LIVREE',70.00,NULL,NULL),(15,13,7,'2026-04-26 17:12:35','EN_ATTENTE',30.00,NULL,NULL),(16,1,10,'2025-09-20 18:03:00','CONFIRMEE',60.00,NULL,NULL),(17,1,10,'2025-09-24 19:15:00','CONFIRMEE',60.00,NULL,NULL),(18,1,10,'2025-10-22 08:56:00','CONFIRMEE',90.00,NULL,NULL),(19,1,10,'2025-10-02 08:00:00','CONFIRMEE',30.00,NULL,NULL),(20,1,10,'2025-10-08 09:33:00','CONFIRMEE',120.00,NULL,NULL),(21,1,10,'2025-11-24 08:16:00','CONFIRMEE',60.00,NULL,NULL),(22,1,10,'2025-11-02 20:19:00','CONFIRMEE',120.00,NULL,NULL),(23,1,10,'2025-12-22 19:32:00','CONFIRMEE',60.00,NULL,NULL),(24,1,10,'2025-12-02 20:45:00','CONFIRMEE',60.00,NULL,NULL),(25,1,10,'2025-12-13 14:54:00','CONFIRMEE',60.00,NULL,NULL),(26,1,10,'2025-12-26 15:26:00','CONFIRMEE',30.00,NULL,NULL),(27,1,10,'2026-01-25 10:02:00','CONFIRMEE',60.00,NULL,NULL),(28,1,10,'2026-01-07 20:55:00','CONFIRMEE',90.00,NULL,NULL),(29,1,10,'2026-01-14 19:16:00','CONFIRMEE',30.00,NULL,NULL),(30,1,10,'2026-01-06 16:02:00','CONFIRMEE',30.00,NULL,NULL),(31,1,10,'2026-01-15 08:42:00','CONFIRMEE',60.00,NULL,NULL),(32,1,10,'2026-02-28 21:34:00','CONFIRMEE',60.00,NULL,NULL),(33,1,10,'2026-02-24 13:19:00','CONFIRMEE',30.00,NULL,NULL),(34,1,10,'2026-02-28 12:07:00','CONFIRMEE',60.00,NULL,NULL),(35,1,10,'2026-02-21 09:14:00','CONFIRMEE',60.00,NULL,NULL),(36,1,10,'2026-03-15 20:34:00','CONFIRMEE',60.00,NULL,NULL),(37,1,10,'2026-03-01 13:02:00','CONFIRMEE',60.00,NULL,NULL),(38,1,10,'2026-03-18 15:15:00','CONFIRMEE',60.00,NULL,NULL),(39,1,10,'2026-03-06 13:35:00','CONFIRMEE',60.00,NULL,NULL),(40,1,10,'2026-03-13 16:49:00','CONFIRMEE',30.00,NULL,NULL),(41,1,10,'2026-03-27 21:58:00','CONFIRMEE',90.00,NULL,NULL),(42,1,10,'2026-04-24 14:47:00','CONFIRMEE',60.00,NULL,NULL),(43,1,10,'2026-04-26 18:32:00','CONFIRMEE',60.00,NULL,NULL),(44,1,10,'2026-04-11 20:50:00','CONFIRMEE',60.00,NULL,NULL),(45,1,10,'2026-04-16 08:59:00','CONFIRMEE',60.00,NULL,NULL),(46,1,10,'2026-04-13 19:47:00','CONFIRMEE',120.00,NULL,NULL),(47,1,10,'2026-04-06 17:14:00','CONFIRMEE',90.00,NULL,NULL),(48,1,10,'2026-04-19 21:53:00','CONFIRMEE',120.00,NULL,NULL),(49,19,11,'2026-04-30 21:21:05','LIVREE',200.00,NULL,NULL),(50,15,12,'2026-05-01 10:45:49','LIVREE',200.00,NULL,NULL),(51,13,7,'2026-05-01 10:49:37','LIVREE',100.00,NULL,NULL),(52,13,7,'2026-05-01 11:19:49','EN_ATTENTE',30.00,NULL,NULL),(53,13,7,'2026-05-01 11:21:10','EN_ATTENTE',30.00,NULL,NULL);
/*!40000 ALTER TABLE `commande` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `commande_produit`
--

DROP TABLE IF EXISTS `commande_produit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `commande_produit` (
  `id_commande` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `statut` enum('EN_PREPARATION','EXPEDIE','LIVRE','ANNULE') DEFAULT 'EN_PREPARATION',
  PRIMARY KEY (`id_commande`,`id_produit`),
  KEY `id_produit` (`id_produit`),
  CONSTRAINT `commande_produit_ibfk_1` FOREIGN KEY (`id_commande`) REFERENCES `commande` (`id_commande`) ON DELETE CASCADE,
  CONSTRAINT `commande_produit_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `commande_produit`
--

LOCK TABLES `commande_produit` WRITE;
/*!40000 ALTER TABLE `commande_produit` DISABLE KEYS */;
INSERT INTO `commande_produit` VALUES (1,3,1,30.00,'EN_PREPARATION'),(2,5,1,60.00,'EN_PREPARATION'),(2,6,1,20.00,'LIVRE'),(3,7,1,30.00,'LIVRE'),(4,7,1,30.00,'EN_PREPARATION'),(5,7,1,30.00,'ANNULE'),(6,8,1,70.00,'LIVRE'),(7,8,1,70.00,'LIVRE'),(8,8,1,70.00,'LIVRE'),(12,3,1,30.00,'EN_PREPARATION'),(13,8,1,70.00,'LIVRE'),(15,9,1,30.00,'EN_PREPARATION'),(16,3,2,30.00,'EXPEDIE'),(17,4,2,30.00,'EXPEDIE'),(18,3,1,30.00,'EXPEDIE'),(18,4,2,30.00,'LIVRE'),(19,3,1,30.00,'EXPEDIE'),(20,3,2,30.00,'EXPEDIE'),(20,4,2,30.00,'LIVRE'),(21,4,2,30.00,'LIVRE'),(22,3,2,30.00,'EN_PREPARATION'),(22,4,2,30.00,'LIVRE'),(23,3,2,30.00,'LIVRE'),(24,3,1,30.00,'LIVRE'),(24,4,1,30.00,'EN_PREPARATION'),(25,3,2,30.00,'LIVRE'),(26,4,1,30.00,'EXPEDIE'),(27,3,1,30.00,'LIVRE'),(27,4,1,30.00,'LIVRE'),(28,3,1,30.00,'LIVRE'),(28,4,2,30.00,'LIVRE'),(29,4,1,30.00,'LIVRE'),(30,4,1,30.00,'LIVRE'),(31,4,2,30.00,'LIVRE'),(32,3,2,30.00,'LIVRE'),(33,3,1,30.00,'EXPEDIE'),(34,3,2,30.00,'LIVRE'),(35,4,2,30.00,'EXPEDIE'),(36,3,2,30.00,'EXPEDIE'),(37,3,1,30.00,'LIVRE'),(37,4,1,30.00,'LIVRE'),(38,4,2,30.00,'LIVRE'),(39,4,2,30.00,'EXPEDIE'),(40,4,1,30.00,'EXPEDIE'),(41,3,1,30.00,'LIVRE'),(41,4,2,30.00,'LIVRE'),(42,3,1,30.00,'LIVRE'),(42,4,1,30.00,'LIVRE'),(43,4,2,30.00,'LIVRE'),(44,4,2,30.00,'LIVRE'),(45,4,2,30.00,'LIVRE'),(46,3,2,30.00,'EN_PREPARATION'),(46,4,2,30.00,'LIVRE'),(47,3,1,30.00,'EXPEDIE'),(47,4,2,30.00,'EN_PREPARATION'),(48,3,2,30.00,'EXPEDIE'),(48,4,2,30.00,'EN_PREPARATION'),(49,10,5,40.00,'LIVRE'),(50,12,2,100.00,'LIVRE'),(51,12,1,100.00,'LIVRE'),(52,3,1,30.00,'EN_PREPARATION'),(53,7,1,30.00,'EN_PREPARATION');
/*!40000 ALTER TABLE `commande_produit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoris`
--

DROP TABLE IF EXISTS `favoris`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favoris` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favoris_unique` (`id_user`,`id_produit`),
  KEY `id_produit` (`id_produit`),
  CONSTRAINT `favoris_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  CONSTRAINT `favoris_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoris`
--

LOCK TABLES `favoris` WRITE;
/*!40000 ALTER TABLE `favoris` DISABLE KEYS */;
INSERT INTO `favoris` VALUES (1,5,3,'2026-04-24 18:10:38','2026-04-24 18:10:38'),(7,16,5,'2026-04-26 15:42:15','2026-04-26 15:42:15'),(8,16,6,'2026-04-26 15:42:16','2026-04-26 15:42:16'),(9,16,4,'2026-04-26 15:42:18','2026-04-26 15:42:18'),(10,13,7,'2026-04-26 15:59:09','2026-04-26 15:59:09'),(11,13,8,'2026-04-26 15:59:11','2026-04-26 15:59:11'),(12,1,3,'2026-04-28 19:48:58','2026-04-28 19:48:58'),(13,1,4,'2026-04-28 19:48:58','2026-04-28 19:48:58'),(14,19,10,'2026-04-30 20:19:45','2026-04-30 20:19:45'),(15,13,3,'2026-05-01 10:18:58','2026-05-01 10:18:58'),(16,13,11,'2026-05-01 10:43:18','2026-05-01 10:43:18');
/*!40000 ALTER TABLE `favoris` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instrument`
--

DROP TABLE IF EXISTS `instrument`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `instrument` (
  `id_produit` int(11) NOT NULL,
  PRIMARY KEY (`id_produit`),
  CONSTRAINT `instrument_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instrument`
--

LOCK TABLES `instrument` WRITE;
/*!40000 ALTER TABLE `instrument` DISABLE KEYS */;
INSERT INTO `instrument` VALUES (6);
/*!40000 ALTER TABLE `instrument` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2026_04_25_223906_create_buyer_system_tables',1),(2,'2026_04_26_075808_create_acheteur_activities_and_reviews_tables',2),(3,'2026_04_26_123039_fix_user_role_enum',3);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `id_user` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `type` varchar(255) DEFAULT 'info',
  `est_lue` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_user` (`id_user`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,2,'Nouvelle annonce à valider','Le vendeur ID #3 a publié \'Test Poster\'. Annonce #1.','info',0,'2026-04-11 19:44:17','2026-04-11 19:44:17'),(2,2,'Nouvelle annonce à valider','Le vendeur ID #3 a publié \'love\'. Annonce #2.','info',0,'2026-04-11 19:50:05','2026-04-11 19:50:05'),(3,3,'Modération de l\'annonce','Votre annonce \'loveI\' a été validée et est maintenant en ligne.','success',0,'2026-04-11 19:55:35','2026-04-11 19:55:35'),(4,2,'Nouvelle annonce à valider','Le vendeur ID #3 a publié \'LOL\'. Annonce #3.','info',0,'2026-04-12 15:20:59','2026-04-12 15:20:59'),(5,2,'Nouvelle annonce à valider','Le vendeur ID #5 a publié \'Michel jckson poster\'. Annonce #4.','info',0,'2026-04-24 18:12:28','2026-04-24 18:12:28'),(6,2,'Nouvelle annonce à valider','Le vendeur ID #10 a publié \'produit a vendeur en urgence\'. Annonce #5.','info',0,'2026-04-24 18:43:16','2026-04-24 18:43:16'),(7,2,'Nouvelle annonce à valider','Le vendeur ID #11 a publié \'produit1 a verifier\'. Annonce #6.','info',0,'2026-04-24 19:10:06','2026-04-24 19:10:06'),(8,2,'Nouvelle annonce à valider','Le vendeur ID #15 a publié \'michel jack\'. Annonce #7.','info',0,'2026-04-25 14:47:26','2026-04-25 14:47:26'),(9,2,'Nouvelle annonce à valider','Le vendeur ID #16 a publié \'celia\'. Annonce #8.','info',0,'2026-04-26 15:22:01','2026-04-26 15:22:01'),(10,2,'Nouvelle annonce à valider','Le vendeur ID #19 a publié \'pressaage original\'. Annonce #9.','info',0,'2026-04-30 20:16:46','2026-04-30 20:16:46'),(11,2,'Nouvelle annonce à valider','Le vendeur ID #19 a publié \'HOI\'. Annonce #10.','info',0,'2026-04-30 20:26:07','2026-04-30 20:26:07'),(12,2,'Nouvelle annonce à valider','Le vendeur ID #19 a publié \'NOTIFICATON\'. Annonce #11.','info',0,'2026-05-01 09:24:37','2026-05-01 09:24:37'),(13,19,'Produit validé ✅','Votre produit \"NOTIFICATON\" a été approuvé par l\'administration. Il est maintenant visible sur la marketplace !','success',1,'2026-05-01 09:25:17','2026-05-01 09:25:17'),(14,19,'Nouvelle commande reçue 🛒','Vendeur celia a commandé \"NOTIFICATON\" pour 200,00 €. Commande #50.','order',1,'2026-05-01 09:45:49','2026-05-01 09:45:49'),(15,19,'Nouvelle commande reçue 🛒','achteur celia a commandé \"NOTIFICATON\" pour 100,00 €. Commande #51.','order',1,'2026-05-01 09:49:37','2026-05-01 09:49:37'),(16,3,'Nouvelle commande reçue 🛒','achteur celiachanger a commandé \"loveI\" pour 30,00 €. Commande #52.','order',0,'2026-05-01 10:19:49','2026-05-01 10:19:49'),(17,11,'Nouvelle commande reçue 🛒','achteur celiachanger a commandé \"produit1 a verifier\" pour 30,00 €. Commande #53.','order',0,'2026-05-01 10:21:10','2026-05-01 10:21:10');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `order_items` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) unsigned NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_items_order_id_foreign` (`order_id`),
  CONSTRAINT `order_items_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,8,1,'2026-04-26 07:03:33','2026-04-26 07:03:33'),(2,2,3,1,'2026-04-26 07:07:12','2026-04-26 07:07:12'),(3,3,6,1,'2026-04-26 07:16:53','2026-04-26 07:16:53');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'en attente',
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_user_id_foreign` (`user_id`),
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,13,70.00,'en attente','0774978945','BéJAIA','2026-04-26 07:03:33','2026-04-26 07:03:33'),(2,13,30.00,'en attente','09271984697','CELK','2026-04-26 07:07:12','2026-04-26 07:07:12'),(3,13,20.00,'payée','_\"è&ç_\'èà\"','kjf','2026-04-26 07:16:53','2026-04-26 07:16:53');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `paiement`
--

DROP TABLE IF EXISTS `paiement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `paiement` (
  `id_paiement` int(11) NOT NULL AUTO_INCREMENT,
  `id_commande` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `mode_paiement` enum('CARTE','VIREMENT','PAYPAL','SIMULATION') NOT NULL,
  `statut` enum('EN_ATTENTE','VALIDE','ECHOUE') DEFAULT 'EN_ATTENTE',
  `date_paiement` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_paiement`),
  KEY `id_commande` (`id_commande`),
  CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`id_commande`) REFERENCES `commande` (`id_commande`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `paiement`
--

LOCK TABLES `paiement` WRITE;
/*!40000 ALTER TABLE `paiement` DISABLE KEYS */;
INSERT INTO `paiement` VALUES (1,1,30.00,'SIMULATION','VALIDE','2026-04-24 19:09:51'),(2,2,80.00,'SIMULATION','VALIDE','2026-04-24 19:51:56'),(3,3,30.00,'SIMULATION','VALIDE','2026-04-24 20:12:49'),(4,4,30.00,'SIMULATION','VALIDE','2026-04-24 20:40:54'),(5,5,30.00,'SIMULATION','ECHOUE','2026-04-25 15:33:57'),(6,6,70.00,'SIMULATION','VALIDE','2026-04-25 15:49:36'),(7,7,70.00,'SIMULATION','ECHOUE','2026-04-25 19:24:42'),(8,8,70.00,'SIMULATION','VALIDE','2026-04-25 19:43:23'),(9,12,30.00,'SIMULATION','VALIDE','2026-04-26 08:26:07'),(10,13,70.00,'SIMULATION','VALIDE','2026-04-26 16:07:35'),(12,15,30.00,'SIMULATION','VALIDE','2026-04-26 17:12:35'),(13,16,60.00,'SIMULATION','VALIDE','2025-09-20 18:03:00'),(14,17,60.00,'SIMULATION','VALIDE','2025-09-24 19:15:00'),(15,18,90.00,'SIMULATION','VALIDE','2025-10-22 08:56:00'),(16,19,30.00,'SIMULATION','VALIDE','2025-10-02 08:00:00'),(17,20,120.00,'SIMULATION','VALIDE','2025-10-08 09:33:00'),(18,21,60.00,'SIMULATION','VALIDE','2025-11-24 08:16:00'),(19,22,120.00,'SIMULATION','VALIDE','2025-11-02 20:19:00'),(20,23,60.00,'SIMULATION','VALIDE','2025-12-22 19:32:00'),(21,24,60.00,'SIMULATION','VALIDE','2025-12-02 20:45:00'),(22,25,60.00,'SIMULATION','VALIDE','2025-12-13 14:54:00'),(23,26,30.00,'SIMULATION','VALIDE','2025-12-26 15:26:00'),(24,27,60.00,'SIMULATION','VALIDE','2026-01-25 10:02:00'),(25,28,90.00,'SIMULATION','VALIDE','2026-01-07 20:55:00'),(26,29,30.00,'SIMULATION','VALIDE','2026-01-14 19:16:00'),(27,30,30.00,'SIMULATION','VALIDE','2026-01-06 16:02:00'),(28,31,60.00,'SIMULATION','VALIDE','2026-01-15 08:42:00'),(29,32,60.00,'SIMULATION','VALIDE','2026-02-28 21:34:00'),(30,33,30.00,'SIMULATION','VALIDE','2026-02-24 13:19:00'),(31,34,60.00,'SIMULATION','VALIDE','2026-02-28 12:07:00'),(32,35,60.00,'SIMULATION','VALIDE','2026-02-21 09:14:00'),(33,36,60.00,'SIMULATION','VALIDE','2026-03-15 20:34:00'),(34,37,60.00,'SIMULATION','VALIDE','2026-03-01 13:02:00'),(35,38,60.00,'SIMULATION','VALIDE','2026-03-18 15:15:00'),(36,39,60.00,'SIMULATION','VALIDE','2026-03-06 13:35:00'),(37,40,30.00,'SIMULATION','VALIDE','2026-03-13 16:49:00'),(38,41,90.00,'SIMULATION','VALIDE','2026-03-27 21:58:00'),(39,42,60.00,'SIMULATION','VALIDE','2026-04-24 14:47:00'),(40,43,60.00,'SIMULATION','VALIDE','2026-04-26 18:32:00'),(41,44,60.00,'SIMULATION','VALIDE','2026-04-11 20:50:00'),(42,45,60.00,'SIMULATION','VALIDE','2026-04-16 08:59:00'),(43,46,120.00,'SIMULATION','VALIDE','2026-04-13 19:47:00'),(44,47,90.00,'SIMULATION','VALIDE','2026-04-06 17:14:00'),(45,48,120.00,'SIMULATION','VALIDE','2026-04-19 21:53:00'),(46,49,200.00,'SIMULATION','VALIDE','2026-04-30 21:21:05'),(47,50,200.00,'SIMULATION','VALIDE','2026-05-01 10:45:49'),(48,51,100.00,'SIMULATION','VALIDE','2026-05-01 10:49:37'),(49,52,30.00,'SIMULATION','VALIDE','2026-05-01 11:19:49'),(50,53,30.00,'SIMULATION','VALIDE','2026-05-01 11:21:10');
/*!40000 ALTER TABLE `paiement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `panier`
--

DROP TABLE IF EXISTS `panier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `panier` (
  `id_panier` int(11) NOT NULL AUTO_INCREMENT,
  `id_acheteur` int(11) NOT NULL,
  PRIMARY KEY (`id_panier`),
  UNIQUE KEY `id_acheteur` (`id_acheteur`),
  CONSTRAINT `panier_ibfk_1` FOREIGN KEY (`id_acheteur`) REFERENCES `acheteur` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `panier`
--

LOCK TABLES `panier` WRITE;
/*!40000 ALTER TABLE `panier` DISABLE KEYS */;
INSERT INTO `panier` VALUES (10,1),(4,2),(2,5),(1,6),(3,8),(6,9),(5,12),(7,13),(12,15),(8,16),(11,19);
/*!40000 ALTER TABLE `panier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `panier_produit`
--

DROP TABLE IF EXISTS `panier_produit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `panier_produit` (
  `id_panier` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_panier`,`id_produit`),
  KEY `id_produit` (`id_produit`),
  CONSTRAINT `panier_produit_ibfk_1` FOREIGN KEY (`id_panier`) REFERENCES `panier` (`id_panier`) ON DELETE CASCADE,
  CONSTRAINT `panier_produit_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `panier_produit`
--

LOCK TABLES `panier_produit` WRITE;
/*!40000 ALTER TABLE `panier_produit` DISABLE KEYS */;
INSERT INTO `panier_produit` VALUES (1,3,10,30.00),(4,5,1,60.00);
/*!40000 ALTER TABLE `panier_produit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `poster`
--

DROP TABLE IF EXISTS `poster`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `poster` (
  `id_produit` int(11) NOT NULL,
  PRIMARY KEY (`id_produit`),
  CONSTRAINT `poster_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `poster`
--

LOCK TABLES `poster` WRITE;
/*!40000 ALTER TABLE `poster` DISABLE KEYS */;
INSERT INTO `poster` VALUES (3),(5),(7),(8);
/*!40000 ALTER TABLE `poster` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produit`
--

DROP TABLE IF EXISTS `produit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `produit` (
  `id_produit` int(11) NOT NULL AUTO_INCREMENT,
  `id_categorie` int(11) NOT NULL,
  `id_vendeur` int(11) NOT NULL,
  `titre` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `prix` decimal(10,2) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `decennie` varchar(10) DEFAULT NULL,
  `annee` year(4) DEFAULT NULL,
  `artiste` varchar(200) DEFAULT NULL,
  `rarete` enum('COMMUN','RARE','TRES_RARE','COLLECTOR') DEFAULT 'COMMUN',
  `etat` enum('NEUF','BON','ACCEPTABLE','ABIME') DEFAULT 'BON',
  `statut` varchar(50) DEFAULT 'EN_ATTENTE',
  `est_disponible` tinyint(1) DEFAULT 1,
  `date_ajout` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_produit`),
  KEY `id_categorie` (`id_categorie`),
  KEY `id_vendeur` (`id_vendeur`),
  CONSTRAINT `produit_ibfk_1` FOREIGN KEY (`id_categorie`) REFERENCES `categorie` (`id_categorie`),
  CONSTRAINT `produit_ibfk_2` FOREIGN KEY (`id_vendeur`) REFERENCES `vendeur` (`id_user`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produit`
--

LOCK TABLES `produit` WRITE;
/*!40000 ALTER TABLE `produit` DISABLE KEYS */;
INSERT INTO `produit` VALUES (3,4,3,'loveI','love',30.00,-2,NULL,NULL,NULL,'RARE','BON','VALIDEE',1,'2026-04-11 20:50:05'),(4,2,3,'LOL','LOL',30.00,1,NULL,NULL,NULL,'RARE','ACCEPTABLE','VALIDEE',1,'2026-04-12 16:20:59'),(5,4,5,'Michel jckson poster','yoo',60.00,1,NULL,NULL,NULL,'RARE','NEUF','VALIDEE',1,'2026-04-24 19:12:28'),(6,5,10,'produit a vendeur en urgence','jai pas de money',20.00,0,NULL,NULL,NULL,'RARE','ABIME','VALIDEE',1,'2026-04-24 19:43:16'),(7,4,11,'produit1 a verifier','produit a verifier',30.00,0,NULL,NULL,NULL,'RARE','ACCEPTABLE','VALIDEE',1,'2026-04-24 20:10:06'),(8,4,15,'michel jack','produit new',70.00,-2,NULL,NULL,NULL,'TRES_RARE','BON','VALIDEE',1,'2026-04-25 15:47:26'),(9,2,16,'celia','prod',30.00,0,NULL,NULL,NULL,'TRES_RARE','ACCEPTABLE','VALIDEE',1,'2026-04-26 16:22:01'),(10,3,19,'pressaage original','yooooooooooooooo',40.00,0,'2000',2000,'MILES DAVIS','TRES_RARE','ACCEPTABLE','VALIDEE',1,'2026-04-30 21:16:45'),(11,1,19,'HOI','HIUOU',60.00,3,NULL,NULL,NULL,'TRES_RARE','ACCEPTABLE','VALIDEE',1,'2026-04-30 21:26:07'),(12,2,19,'NOTIFICATON','NVJOIV',100.00,8,NULL,NULL,NULL,'TRES_RARE','ACCEPTABLE','VALIDEE',1,'2026-05-01 10:24:37');
/*!40000 ALTER TABLE `produit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produit_photo`
--

DROP TABLE IF EXISTS `produit_photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `produit_photo` (
  `id_photo` int(11) NOT NULL AUTO_INCREMENT,
  `id_produit` int(11) NOT NULL,
  `chemin` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id_photo`),
  KEY `id_produit` (`id_produit`),
  CONSTRAINT `produit_photo_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produit_photo`
--

LOCK TABLES `produit_photo` WRITE;
/*!40000 ALTER TABLE `produit_photo` DISABLE KEYS */;
INSERT INTO `produit_photo` VALUES (1,3,'uploads/products/1775940605_69dab3fdb3f88.jfif'),(2,4,'uploads/products/1776010859_69dbc66bc0623.jpg'),(3,5,'uploads/products/1777057948_69ebc09c94bf7.jpg'),(4,6,'uploads/products/1777059796_69ebc7d4d50e1.jpg'),(5,6,'uploads/products/1777059796_69ebc7d4d87ee.jfif'),(6,7,'uploads/products/1777061406_69ebce1e40296.jpg'),(7,8,'uploads/products/1777132046_69ece20e5a3d5.jpg'),(8,9,'uploads/products/1777220521_69ee3ba96cb20.jpg'),(9,10,'uploads/products/1777583806_69f3c6be0df50.jpeg'),(10,11,'uploads/products/1777584367_69f3c8ef7c2ad.jpg'),(11,12,'uploads/products/1777631077_69f47f65db875.jfif');
/*!40000 ALTER TABLE `produit_photo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reviews` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(10) unsigned NOT NULL,
  `contenu` text NOT NULL,
  `note` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_user_id_foreign` (`user_id`),
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,13,8,'avis achteur celia',5,'2026-04-26 07:01:37','2026-04-26 07:01:37'),(2,13,3,'FFF ACHH',5,'2026-04-26 07:06:16','2026-04-26 07:06:16'),(3,13,8,'AVIS A ENREGISTRER DANS ACTIVITE',5,'2026-04-26 07:15:24','2026-04-26 07:15:24'),(4,16,8,'Vraiment haja le top',5,'2026-04-26 15:06:34','2026-04-26 15:06:34'),(5,13,8,'ey cest ca la vie',5,'2026-04-26 16:10:36','2026-04-26 16:10:36'),(6,19,8,'avis achteur sur le produit michel jack',5,'2026-05-01 08:56:49','2026-05-01 08:56:49'),(7,13,3,'jndgjlzh',5,'2026-05-01 10:19:03','2026-05-01 10:19:03');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sellers`
--

DROP TABLE IF EXISTS `sellers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sellers` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `shop_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `categories` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sellers`
--

LOCK TABLES `sellers` WRITE;
/*!40000 ALTER TABLE `sellers` DISABLE KEYS */;
INSERT INTO `sellers` VALUES (1,13,'MA BOUTIQUE VENDEUSE CELIA','POSTERS','VINYLE','BEJAIA','2026-04-26 11:33:04','2026-04-26 11:33:04'),(2,16,'La meilleur the worst','tout n\'import quoi','viyles','bejaia','2026-04-26 15:09:14','2026-04-26 15:09:14');
/*!40000 ALTER TABLE `sellers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_notifications`
--

DROP TABLE IF EXISTS `user_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `message` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'unread',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `user_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_notifications`
--

LOCK TABLES `user_notifications` WRITE;
/*!40000 ALTER TABLE `user_notifications` DISABLE KEYS */;
INSERT INTO `user_notifications` VALUES (1,13,'Votre commande #1 est maintenant en attente.','unread','2026-04-26 07:03:33','2026-04-26 07:03:33'),(2,13,'Votre commande #2 est maintenant en attente.','unread','2026-04-26 07:07:12','2026-04-26 07:07:12'),(3,13,'Votre commande #3 a été enregistrée avec succès !','unread','2026-04-26 07:16:53','2026-04-26 07:16:53'),(4,13,'Votre commande #12 est enregistrée.','unread','2026-04-26 07:26:07','2026-04-26 07:26:07'),(5,16,'Votre commande #13 est enregistrée.','unread','2026-04-26 15:07:35','2026-04-26 15:07:35'),(7,13,'Votre commande #15 est enregistrée.','unread','2026-04-26 16:12:35','2026-04-26 16:12:35'),(8,19,'Votre commande #49 est enregistrée.','unread','2026-04-30 20:21:05','2026-04-30 20:21:05'),(9,15,'Votre commande #50 est enregistrée.','unread','2026-05-01 09:45:49','2026-05-01 09:45:49'),(10,13,'Votre commande #51 est enregistrée.','unread','2026-05-01 09:49:37','2026-05-01 09:49:37'),(11,13,'Votre commande #52 est enregistrée.','unread','2026-05-01 10:19:49','2026-05-01 10:19:49'),(12,13,'Votre commande #53 est enregistrée.','unread','2026-05-01 10:21:10','2026-05-01 10:21:10');
/*!40000 ALTER TABLE `user_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id_user` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(200) NOT NULL,
  `mdp` varchar(255) NOT NULL,
  `role` enum('ACHETEUR','VENDEUR','ADMIN','BOTH') DEFAULT 'ACHETEUR',
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'zehnati','alicia','alicia@gmail.com','$2y$10$LT8BxGjpB376xpORn8P8h.4MYvVcMUXQXlrN92fI7YK0PLmD6qNBa','ACHETEUR'),(2,'Admin','Gold','admin@gold.fr','$2y$10$TI/Q9McXnfBs.zJZy.Cv9.OusKX73BXbukR05DzaP.YWg23vFipLa','ADMIN'),(3,'dupont','jean','votre@gmail.com','$2y$10$WUE5sHWlXzBs1or6EVLo6eC8Qekm.WiW3stOFm2.Yo9R1I8KFtqwG','VENDEUR'),(4,'yi','yo','yo@gmail.com','$2y$10$OWKX.Xe621D9mlxKuPsP7uF23GubiZx32fwW50hrdIgTTEqZDcCjW','ACHETEUR'),(5,'achteur','Jean','achteur@gmail.com','$2y$10$j9di7h/Bn.WsyhLhzOw6uu55/8Tc66HBAPzbuzHRtXPZIM/B2C26.','VENDEUR'),(6,'Dupont','Jean','votrre@gmail.com','$2y$10$40lHWmdKI9JSYxN2quVkhOImaIxycbtk8u2Dimpho6xItiYY456OK','ACHETEUR'),(8,'AA','CELIA','AA@gmail.com','$2y$10$h9zg3tiEGKkan6x4nIbgK.DdieKUcjtgXHlfXW2k741Z1buY/EB/m','ACHETEUR'),(9,'a','vendeur','Vendeur@gmail.com','$2y$10$mavU1J0gP7c7DXjs9Sno6.SfZ730bdha0U37C1O7b6ZsW6Rj5.jiK','ACHETEUR'),(10,'VENDEUR','VENDEUR','VENDEUR2@gmail.com','$2y$10$4Xo3o.aBlzHFyALjqBMjgO3Inc5ASWYN8hmf0S.gHUrHwfyjoDqGq','VENDEUR'),(11,'vendeur','vendeurreel','vendeurreel@gmail.com','$2y$10$YhgdSCX8P9jxc5SmtYQ8E.VIwJUvy9ZChBUw8L2Dqag8aZuZXcBWC','VENDEUR'),(12,'achteur','achteurreel','achteurreel@gmail.com','$2y$10$ccf97TdFbUa863yJ.LrCkON.jVftibGTGnyUc1jMPAZDic6BfP1XS','ACHETEUR'),(13,'celiachanger','achteur','celiaach@gmail.com','$2y$10$QZF26FwKjL3h7uSkmWDATubPTDQQm9W8aTvw1vLAR13LNwEyemZQO','BOTH'),(15,'celia','Vendeur','celiavend@gmail.com','$2y$10$Cu8nnbnLlJ6HnJD4mwSW5u6GTme5eM12xadIXbJbvF4ozaRrR8es6','BOTH'),(16,'mazouzi','celia','unach@gmail.com','$2y$10$WTeCTMCnqfUuPKhjP45UrOx9chF3Q9mdCUbJAJQFe.wCilzpwBtpC','BOTH'),(19,'promax','vendeur','vend@gmail.com','$2y$10$tgchWd2jGbxsbfcsKiQbDOiN5wcGUGNpmh4EMKK9zlyIlyubDYVpW','BOTH');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendeur`
--

DROP TABLE IF EXISTS `vendeur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vendeur` (
  `id_user` int(11) NOT NULL,
  `nom_boutique` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie_principale` varchar(100) DEFAULT NULL,
  `localisation` varchar(150) DEFAULT NULL,
  `photo_profil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_user`),
  CONSTRAINT `vendeur_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendeur`
--

LOCK TABLES `vendeur` WRITE;
/*!40000 ALTER TABLE `vendeur` DISABLE KEYS */;
INSERT INTO `vendeur` VALUES (3,'YO','','JAZZ','bejaia',NULL),(5,'Jean achteur Boutique','','Vinyles','',NULL),(10,'Ma super boutique','','','paris',NULL),(11,'vendeurreel a essayer for real','','','paris',NULL),(12,'achteurreel achteur Boutique','','Vinyles','',NULL),(13,'MA BOUTIQUE VENDEUSE CELIA','POSTERS','VINYLE','BEJAIA',NULL),(15,'Vendeuse celia','','','paris',NULL),(16,'La meilleur the worst','tout n\'import quoi','viyles','bejaia','uploads/profiles/profile_16_1777220457.jfif'),(19,'Ma boutique','','','paris',NULL);
/*!40000 ALTER TABLE `vendeur` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vinyle`
--

DROP TABLE IF EXISTS `vinyle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `vinyle` (
  `id_produit` int(11) NOT NULL,
  `label` varchar(150) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_produit`),
  CONSTRAINT `vinyle_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vinyle`
--

LOCK TABLES `vinyle` WRITE;
/*!40000 ALTER TABLE `vinyle` DISABLE KEYS */;
INSERT INTO `vinyle` VALUES (10,'COLUMBIA','JAZZ');
/*!40000 ALTER TABLE `vinyle` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `visitor_activities`
--

DROP TABLE IF EXISTS `visitor_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `visitor_activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `visitor_id` varchar(64) NOT NULL,
  `type` varchar(50) NOT NULL,
  `label` varchar(255) DEFAULT NULL,
  `id_produit` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `visitor_activities_visitor_id_index` (`visitor_id`),
  KEY `visitor_activities_type_index` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `visitor_activities`
--

LOCK TABLES `visitor_activities` WRITE;
/*!40000 ALTER TABLE `visitor_activities` DISABLE KEYS */;
INSERT INTO `visitor_activities` VALUES (1,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','fav_add','Ajouté aux favoris : produit1 a verifier',7,'2026-04-25 20:32:55','2026-04-25 20:32:55'),(2,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','fav_add','Ajouté aux favoris : produit a vendeur en urgence',6,'2026-04-25 20:32:57','2026-04-25 20:32:57'),(3,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','fav_add','Ajouté aux favoris : produit1 a verifier',7,'2026-04-25 20:33:09','2026-04-25 20:33:09'),(4,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','fav_add','Ajouté aux favoris : michel jack',8,'2026-04-25 20:33:13','2026-04-25 20:33:13'),(5,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','fav_add','Ajouté aux favoris : Michel jckson poster',5,'2026-04-25 20:33:14','2026-04-25 20:33:14'),(6,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','cart_add','Ajouté au panier : michel jack',8,'2026-04-25 20:35:41','2026-04-25 20:35:41'),(7,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « michel jack » (5/5)',8,'2026-04-25 20:38:26','2026-04-25 20:38:26'),(8,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « michel jack » (2/5)',8,'2026-04-25 20:39:13','2026-04-25 20:39:13'),(9,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','cart_add','Ajouté au panier : produit1 a verifier',7,'2026-04-25 20:49:51','2026-04-25 20:49:51'),(10,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « produit1 a verifier » (5/5)',7,'2026-04-25 20:52:17','2026-04-25 20:52:17'),(11,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « produit1 a verifier » (5/5)',7,'2026-04-25 20:52:20','2026-04-25 20:52:20'),(12,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « michel jack » (5/5)',8,'2026-04-25 20:53:03','2026-04-25 20:53:03'),(13,'test','review','Avis laissé sur « michel jack » (5/5)',8,'2026-04-25 20:57:10','2026-04-25 20:57:10'),(14,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « produit1 a verifier » (5/5)',7,'2026-04-25 21:01:20','2026-04-25 21:01:20'),(15,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « produit1 a verifier » (5/5)',7,'2026-04-25 21:01:32','2026-04-25 21:01:32'),(16,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « produit1 a verifier » (5/5)',7,'2026-04-25 21:01:37','2026-04-25 21:01:37'),(17,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis laissé sur « produit1 a verifier » (5/5)',7,'2026-04-25 21:03:01','2026-04-25 21:03:01'),(18,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','review','Avis publié (5★) : \"gg\"',7,'2026-04-25 21:03:02','2026-04-25 21:03:02'),(19,'v_a68c06ef-9c97-40f3-8ff1-461b70e2b1f9','fav_add','Ajouté aux favoris : produit a vendeur en urgence',6,'2026-04-25 21:03:17','2026-04-25 21:03:17'),(20,'v_af89d8fa-a318-4929-8284-ef013bcea991','cart_add','Ajouté au panier : michel jack',8,'2026-04-26 06:39:54','2026-04-26 06:39:54'),(21,'v_af89d8fa-a318-4929-8284-ef013bcea991','cart_add','Ajouté au panier : produit1 a verifier',7,'2026-04-26 06:39:57','2026-04-26 06:39:57'),(22,'v_af89d8fa-a318-4929-8284-ef013bcea991','review','Avis laissé sur « produit1 a verifier » (5/5)',7,'2026-04-26 06:40:08','2026-04-26 06:40:08'),(23,'v_af89d8fa-a318-4929-8284-ef013bcea991','review','Avis publié (5★) : \"essaye\"',7,'2026-04-26 06:40:09','2026-04-26 06:40:09'),(24,'v_af89d8fa-a318-4929-8284-ef013bcea991','fav_add','Ajouté aux favoris : michel jack',8,'2026-04-26 06:40:22','2026-04-26 06:40:22'),(25,'v_0934bba8-d89d-4dd4-abb3-36c36b82119c','fav_add','Ajouté aux favoris : michel jack',8,'2026-04-26 15:03:04','2026-04-26 15:03:04'),(26,'v_0934bba8-d89d-4dd4-abb3-36c36b82119c','review','Avis laissé sur « michel jack » (5/5)',8,'2026-04-26 15:04:18','2026-04-26 15:04:18'),(27,'v_0934bba8-d89d-4dd4-abb3-36c36b82119c','review','Avis publié (5★) : \"yoooah\"',8,'2026-04-26 15:04:19','2026-04-26 15:04:19'),(28,'v_0934bba8-d89d-4dd4-abb3-36c36b82119c','cart_add','Ajouté au panier : michel jack',8,'2026-04-26 15:04:27','2026-04-26 15:04:27'),(29,'v_1abede4f-dbcd-40e4-843f-2abf553958b4','fav_add','Ajouté aux favoris : michel jack',8,'2026-04-26 16:25:50','2026-04-26 16:25:50'),(30,'v_1abede4f-dbcd-40e4-843f-2abf553958b4','cart_add','Ajouté au panier : michel jack',8,'2026-04-26 16:25:52','2026-04-26 16:25:52'),(31,'v_a3d11e8c-5dac-4de7-b714-dda17adb4903','review','Avis laissé sur « celia » (5/5)',9,'2026-04-30 20:02:37','2026-04-30 20:02:37'),(32,'v_a3d11e8c-5dac-4de7-b714-dda17adb4903','review','Avis publié (5★) : \"yo\"',9,'2026-04-30 20:02:38','2026-04-30 20:02:38');
/*!40000 ALTER TABLE `visitor_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `vw_annonces_en_attente`
--

DROP TABLE IF EXISTS `vw_annonces_en_attente`;
/*!50001 DROP VIEW IF EXISTS `vw_annonces_en_attente`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_annonces_en_attente` AS SELECT
 1 AS `id_annonce`,
  1 AS `titre`,
  1 AS `statut`,
  1 AS `date_soumission`,
  1 AS `vendeur_nom`,
  1 AS `nom_boutique` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_commandes`
--

DROP TABLE IF EXISTS `vw_commandes`;
/*!50001 DROP VIEW IF EXISTS `vw_commandes`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_commandes` AS SELECT
 1 AS `id_commande`,
  1 AS `date_commande`,
  1 AS `statut`,
  1 AS `montant_total`,
  1 AS `acheteur_nom`,
  1 AS `email`,
  1 AS `statut_paiement` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `vw_produits`
--

DROP TABLE IF EXISTS `vw_produits`;
/*!50001 DROP VIEW IF EXISTS `vw_produits`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `vw_produits` AS SELECT
 1 AS `id_produit`,
  1 AS `titre`,
  1 AS `prix`,
  1 AS `decennie`,
  1 AS `artiste`,
  1 AS `rarete`,
  1 AS `etat`,
  1 AS `categorie`,
  1 AS `vendeur_nom`,
  1 AS `nom_boutique` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_annonces_en_attente`
--

/*!50001 DROP VIEW IF EXISTS `vw_annonces_en_attente`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_annonces_en_attente` AS select `a`.`id_annonce` AS `id_annonce`,`a`.`titre` AS `titre`,`a`.`statut` AS `statut`,`a`.`date_soumission` AS `date_soumission`,concat(`u`.`nom`,' ',`u`.`prenom`) AS `vendeur_nom`,`v`.`nom_boutique` AS `nom_boutique` from ((`annonce` `a` join `vendeur` `v` on(`v`.`id_user` = `a`.`id_vendeur`)) join `users` `u` on(`u`.`id_user` = `v`.`id_user`)) where `a`.`statut` = 'EN_ATTENTE' order by `a`.`date_soumission` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_commandes`
--

/*!50001 DROP VIEW IF EXISTS `vw_commandes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_commandes` AS select `co`.`id_commande` AS `id_commande`,`co`.`date_commande` AS `date_commande`,`co`.`statut` AS `statut`,`co`.`montant_total` AS `montant_total`,concat(`u`.`nom`,' ',`u`.`prenom`) AS `acheteur_nom`,`u`.`email` AS `email`,`pa`.`statut` AS `statut_paiement` from (((`commande` `co` join `acheteur` `ac` on(`ac`.`id_user` = `co`.`id_acheteur`)) join `users` `u` on(`u`.`id_user` = `ac`.`id_user`)) left join `paiement` `pa` on(`pa`.`id_commande` = `co`.`id_commande`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_produits`
--

/*!50001 DROP VIEW IF EXISTS `vw_produits`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_produits` AS select `p`.`id_produit` AS `id_produit`,`p`.`titre` AS `titre`,`p`.`prix` AS `prix`,`p`.`decennie` AS `decennie`,`p`.`artiste` AS `artiste`,`p`.`rarete` AS `rarete`,`p`.`etat` AS `etat`,`c`.`nom` AS `categorie`,concat(`u`.`nom`,' ',`u`.`prenom`) AS `vendeur_nom`,`v`.`nom_boutique` AS `nom_boutique` from (((`produit` `p` join `categorie` `c` on(`c`.`id_categorie` = `p`.`id_categorie`)) join `vendeur` `v` on(`v`.`id_user` = `p`.`id_vendeur`)) join `users` `u` on(`u`.`id_user` = `v`.`id_user`)) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-01 13:34:18
