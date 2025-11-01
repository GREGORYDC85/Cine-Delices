-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: cine_delices
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `code_category` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`code_category`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Entrée'),(2,'Plat'),(3,'Dessert');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `code_comment` int NOT NULL AUTO_INCREMENT,
  `description` text NOT NULL,
  `code_user` int DEFAULT NULL,
  `code_recipe` int DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_approved` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`code_comment`),
  KEY `code_user` (`code_user`),
  KEY `code_recipe` (`code_recipe`),
  CONSTRAINT `comment_ibfk_1` FOREIGN KEY (`code_user`) REFERENCES `site_user` (`code_user`) ON DELETE CASCADE,
  CONSTRAINT `comment_ibfk_2` FOREIGN KEY (`code_recipe`) REFERENCES `recipe` (`code_recipe`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (4,'C\'est très bon !',6,17,'2025-03-26 18:34:07',1),(5,'Excellent !',10,17,'2025-03-26 21:08:51',1),(7,'J\'adore ! ?',6,15,'2025-04-04 18:29:53',1),(9,'excellent !\n',1,17,'2025-04-14 17:58:01',1),(10,'Excellent ! ',1,33,'2025-04-27 17:16:06',1),(12,'Excellent ! ?',1,16,'2025-06-13 14:53:46',1),(13,'Très bon ! ?',1,28,'2025-06-13 21:13:51',0),(14,'Très bonne recette, je recommande ! ?',14,28,'2025-06-22 12:08:26',0);
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contains`
--

DROP TABLE IF EXISTS `contains`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contains` (
  `code_recipe` int NOT NULL,
  `code_ingredient` int NOT NULL,
  `quantity` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`code_recipe`,`code_ingredient`),
  KEY `code_ingredient` (`code_ingredient`),
  CONSTRAINT `contains_ibfk_1` FOREIGN KEY (`code_recipe`) REFERENCES `recipe` (`code_recipe`) ON DELETE CASCADE,
  CONSTRAINT `contains_ibfk_2` FOREIGN KEY (`code_ingredient`) REFERENCES `ingredient` (`code_ingredient`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contains`
--

LOCK TABLES `contains` WRITE;
/*!40000 ALTER TABLE `contains` DISABLE KEYS */;
INSERT INTO `contains` VALUES (15,1,'800g'),(15,2,'1 moyen'),(15,3,'2 gousses'),(15,4,'1 litre'),(15,5,'100 ml'),(15,6,'au goût'),(15,7,'au goût'),(16,7,'1 pincée'),(16,9,'200g'),(16,10,'1 feuille'),(16,11,'50g'),(16,12,'1 pièce'),(16,13,'1 c. à soupe'),(17,15,'2 grandes feuilles'),(17,16,'1 poignée'),(17,17,'6 unités'),(17,18,'¼ de concombre'),(17,19,'1 petite carotte'),(17,20,'1 c. à soupe'),(17,21,'2 c. à soupe'),(18,22,'2 c. à soupe'),(18,23,'50 cl'),(18,24,'100 g en dés'),(18,25,'1 c. à café réhydratée'),(18,26,'1 tige émincée'),(19,27,'500 g en cubes'),(19,28,'3 moyennes coupées en dés'),(19,29,'2 coupées en rondelles'),(19,30,'1 gros émincé'),(19,31,'2 gousses hachées'),(19,32,'75 cl'),(19,33,'1 branche'),(19,34,'1 feuille'),(20,35,'200 g'),(20,36,'60 cl'),(20,37,'150 g (en tranches)'),(20,38,'1 coupé en deux'),(20,39,'4 tranches'),(20,40,'2 feuilles'),(20,41,'50 g'),(20,42,'60 g'),(21,3,'2 gousses hachées'),(21,6,'30 g'),(21,27,'600 g en morceaux'),(21,33,'1 branche'),(21,34,'1 feuille'),(21,43,'75 cl'),(21,44,'200 g émincés'),(21,45,'2 cuillères à soupe'),(22,50,'500 g de blancs de poulet'),(22,51,'4 c. à soupe'),(22,52,'2 c. à soupe'),(22,53,'1 c. à café, râpé'),(22,54,'1 c. à soupe'),(23,55,'1 c. à soupe'),(23,56,'400 g'),(23,57,'1 rouleau'),(23,58,'2'),(23,59,'100 g'),(23,60,'1 c. à café'),(23,61,'1/2 c. à café'),(24,58,'3'),(24,62,'1/2 c. à café'),(24,63,'500 g'),(24,64,'80 g'),(25,59,'50 g'),(25,66,'100 g'),(25,67,'160 ml'),(25,68,'6 boules'),(25,69,'Pour saupoudrer'),(26,58,'2'),(26,59,'50 g'),(26,64,'250 g'),(26,70,'20 cl'),(26,71,'1 sachet'),(26,72,'Pour friture'),(26,73,'Pour saupoudrer'),(28,74,'300g'),(28,75,'2 pains'),(28,76,'1 en rondelle'),(28,77,'Quelques feuilles'),(28,78,'2 tranches'),(28,79,'1/2 émincé'),(28,80,'2 cuillères à soupe'),(28,81,'1/2 cuillère à café'),(28,82,'1/4 cuillère à café'),(28,83,'1/4 cuillère à café'),(28,84,'1 cuillère à soupe'),(28,85,'Au goût'),(29,86,'1 boule'),(29,87,'6 c. à soupe'),(29,88,'200g'),(29,89,'100g'),(29,90,'100g émincés'),(29,91,'1'),(29,92,'1 c. à soupe'),(29,93,'1 c.à café'),(30,7,'1 pincée'),(30,8,'1 pincée'),(30,59,'1 pincée'),(30,84,'1 c.à soupe'),(30,94,'400g'),(30,95,'1'),(30,96,'2'),(30,97,'400g'),(30,98,'1 boite'),(30,99,'2 c. à soupe'),(30,100,'Quelques feuilles'),(30,101,'à saupoudrer'),(31,70,'50 ml'),(31,73,'40 g'),(31,102,'200 g'),(31,103,'100 ml'),(31,104,'250 g'),(31,105,'100 g'),(31,106,'2 c. à soupe'),(31,108,'1 c. à café'),(31,109,'jaune'),(32,17,'39'),(32,84,'un filet'),(32,85,'à votre convenance'),(32,110,'24'),(32,111,'un bouquet'),(32,112,'12'),(33,7,'1 pincée'),(33,8,'1 pincée'),(33,84,'1 c. à soupe'),(33,113,'200g'),(33,114,'150g'),(33,115,'1 moyen'),(33,116,'1 petit'),(33,117,'quelques brins'),(34,7,'1 pincée'),(34,8,'1 pincée'),(34,45,'100g'),(34,65,'1/2 sachet'),(34,69,'50g'),(34,72,'Pour la cuisson'),(34,81,'1/2 c. à café'),(34,118,'250g'),(34,119,'150ml');
/*!40000 ALTER TABLE `contains` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingredient`
--

DROP TABLE IF EXISTS `ingredient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient` (
  `code_ingredient` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`code_ingredient`)
) ENGINE=InnoDB AUTO_INCREMENT=120 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient`
--

LOCK TABLES `ingredient` WRITE;
/*!40000 ALTER TABLE `ingredient` DISABLE KEYS */;
INSERT INTO `ingredient` VALUES (1,'Potiron'),(2,'Oignons'),(3,'Ail'),(4,'Bouillon de legumes'),(5,'Creme fraiche'),(6,'Beurre'),(7,'Sel'),(8,'Poivre'),(9,'Riz japonais'),(10,'Feuilles de nori'),(11,'Saumon grille'),(12,'Prune salee'),(13,'Thon mayo'),(14,'Sel'),(15,'Laitue'),(16,'Epinards'),(17,'Tomates cerises'),(18,'Concombres'),(19,'Carottes rapees'),(20,'Noix'),(21,'Vinaigrette'),(22,'Pate de miso'),(23,'Dashi'),(24,'Tofu'),(25,'Algues wakame'),(26,'Oignons verts'),(27,'Boeuf'),(28,'Pommes de terre'),(29,'Carottes'),(30,'Oignons'),(31,'Ail'),(32,'Bouillon de boeuf'),(33,'Thym'),(34,'Laurier'),(35,'Nouilles ramen'),(36,'Bouillon'),(37,'Porc braise'),(38,'Oeuf mollet'),(39,'Narutomaki'),(40,'Algues nori'),(41,'Pousses de bambou'),(42,'Champignons shiitake'),(43,'Vin rouge'),(44,'Champignons'),(45,'Farine'),(46,'Beurre'),(47,'Ail'),(48,'Thym'),(49,'Laurier'),(50,'Poulet'),(51,'Sauce soja'),(52,'Miel'),(53,'Gingembre'),(54,'Huile de sesame'),(55,'Graines de sesame'),(56,'Puree de potiron'),(57,'Pate brisee'),(58,'Oeufs'),(59,'Sucre'),(60,'Cannelle'),(61,'Muscade'),(62,'Gingembre en poudre'),(63,'Creme de marrons'),(64,'Farine'),(65,'Levure chimique'),(66,'Farine de riz gluant'),(67,'Eau'),(68,'Glace'),(69,'Fecule de mais'),(70,'Lait'),(71,'Levure'),(72,'Huile pour friture'),(73,'Sucre glace'),(74,'Viande hachée'),(75,'Pain à burger'),(76,'Tomate'),(77,'Salade verte'),(78,'Cheddar'),(79,'Oignon rouge'),(80,'Sauce à l\'ail'),(81,'Paprika'),(82,'Cumin'),(83,'Coriandre moulue'),(84,'Huile d\'olive'),(85,'Sel et poivre'),(86,'Pâte à pizza'),(87,'Sauce tomate maison'),(88,'Mozzarella râpée'),(89,'Pepperoni'),(90,'Champignons de Paris'),(91,'Poivron vert'),(92,'Huile d’olive'),(93,'Origan séché'),(94,'Spaghettis'),(95,'Oignon'),(96,'Gousse d\'ail'),(97,'Boeuf haché'),(98,'Tomates concassées'),(99,'Concentré de tomate'),(100,'Basilic frais'),(101,'Parmesan'),(102,'Biscuit pattes de chat'),(103,'Café noir refroidi'),(104,'Mascarpone'),(105,'Nutella'),(106,'Cacao en poudre non sucré'),(107,'Oeuf (jaune)'),(108,'Vanille liquide'),(109,'Oeuf'),(110,'Billes de mozzarella'),(111,'Feuilles de basilic'),(112,'Pics à brochettes'),(113,'Ananas frais'),(114,'Crevettes cuites'),(115,'Avocat'),(116,'Concombre'),(117,'coriandre fraiche'),(118,'Crevettes crues décortiquées'),(119,'Eau gazeuse très froide');
/*!40000 ALTER TABLE `ingredient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `liked_recipe`
--

DROP TABLE IF EXISTS `liked_recipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `liked_recipe` (
  `code_user` int NOT NULL,
  `code_recipe` int NOT NULL,
  `date_like` date DEFAULT (curdate()),
  PRIMARY KEY (`code_user`,`code_recipe`),
  KEY `code_recipe` (`code_recipe`),
  CONSTRAINT `liked_recipe_ibfk_1` FOREIGN KEY (`code_user`) REFERENCES `site_user` (`code_user`) ON DELETE CASCADE,
  CONSTRAINT `liked_recipe_ibfk_2` FOREIGN KEY (`code_recipe`) REFERENCES `recipe` (`code_recipe`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `liked_recipe`
--

LOCK TABLES `liked_recipe` WRITE;
/*!40000 ALTER TABLE `liked_recipe` DISABLE KEYS */;
INSERT INTO `liked_recipe` VALUES (1,16,'2025-05-15'),(1,17,'2025-04-11'),(1,20,'2025-04-11'),(1,28,'2025-04-04'),(1,33,'2025-04-27'),(6,15,'2025-03-28'),(6,17,'2025-03-28'),(6,20,'2025-04-04'),(6,26,'2025-03-27'),(10,17,'2025-03-26'),(10,29,'2025-04-05'),(11,16,'2025-04-04'),(14,28,'2025-06-22');
/*!40000 ALTER TABLE `liked_recipe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe`
--

DROP TABLE IF EXISTS `recipe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe` (
  `code_recipe` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `picture` text,
  `total_time` int DEFAULT NULL,
  `servings` int DEFAULT NULL,
  `author` varchar(255) DEFAULT NULL,
  `description` text,
  `instruction` text,
  `code_category` int DEFAULT NULL,
  PRIMARY KEY (`code_recipe`),
  KEY `fk_category` (`code_category`),
  CONSTRAINT `fk_category` FOREIGN KEY (`code_category`) REFERENCES `category` (`code_category`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe`
--

LOCK TABLES `recipe` WRITE;
/*!40000 ALTER TABLE `recipe` DISABLE KEYS */;
INSERT INTO `recipe` VALUES (15,'Soupe au potiron','soupe_potiron.jpg',45,4,'Harry Potter','Une soupe automnale inspirée du festin de Poudlard.','1. Épluchez le potiron, retirez les graines et coupez-le en petits cubes.\n2. Émincez l\'oignon et hachez l\'ail.\n3. Faites revenir l\'oignon et l\'ail dans une casserole avec un peu de beurre jusqu\'à ce qu\'ils soient dorés.\n4. Ajoutez les morceaux de potiron, puis versez le bouillon de légumes.\n5. Salez, poivrez et laissez mijoter pendant 25 à 30 minutes jusqu\'à ce que le potiron soit tendre.\n6. Mixez la soupe jusqu\'à obtenir une texture lisse.\n7. Ajoutez la crème fraîche juste avant de servir pour plus d\'onctuosité.',NULL),(16,'Onigiri de Naruto','onigiri.jpg',15,2,'Naruto','Des boulettes de riz japonaises garnies.','1. Faites cuire le riz japonais à la vapeur ou à la casserole selon les instructions du paquet.\n2. Une fois cuit, laissez le riz tiédir un peu pour pouvoir le manipuler.\n3. Humidifiez vos mains avec un peu d\'eau et ajoutez une pincée de sel.\n4. Prenez une portion de riz, formez une boule ou un triangle avec les mains.\n5. Insérez au centre un peu de garniture : saumon grillé émietté, thon mayo ou prune salée.\n6. Refermez le riz autour de la garniture et resserrez la forme.\n7. Enveloppez l\'onigiri avec une bande de feuille de nori.\n8. Servez frais ou conservez dans un film plastique si besoin.',NULL),(17,'Salade elfiques de Lothlorien','salade_elfique.jpg',10,2,'Seigneur des Anneaux','Une salade fraiche et croquante digne des elfes.','1. Lavez soigneusement la laitue, les épinards et les autres légumes.\n2. Coupez les concombres en rondelles, râpez les carottes et coupez les tomates cerises en deux.\n3. Dans un grand saladier, mélangez la laitue, les épinards, les concombres, les carottes râpées et les tomates cerises.\n4. Ajoutez les noix pour une touche croquante.\n5. Préparez une vinaigrette en mélangeant de l\'huile d\'olive, du vinaigre balsamique, du sel et du poivre.\n6. Versez la vinaigrette sur la salade juste avant de servir et mélangez délicatement.\n7. Servez frais, en accompagnement ou en plat léger.',NULL),(18,'Soupe miso de Dragon Ball','soupe_miso.jpg',20,4,'Dragon Ball','Une soupe traditionnelle japonaise.','1. Faites chauffer le dashi dans une casserole à feu moyen.\n2. Une fois chaud, ajoutez la pâte de miso et mélangez bien jusqu\'à ce qu\'elle soit complètement dissoute.\n3. Coupez le tofu en petits cubes et ajoutez-les dans la soupe.\n4. Ajoutez les algues wakame réhydratées et les oignons verts finement émincés.\n5. Laissez mijoter 2 à 3 minutes à feu doux, sans faire bouillir.\n6. Servez chaud dans des bols japonais, idéalement avec une cuillère à soupe et des baguettes.',NULL),(19,'Ragoût de Sam Gamegie','ragout_sam.jpg',120,6,'Seigneur des Anneaux','Un ragout robuste comme aime Sam.','1. Faites revenir les morceaux de boeuf dans une cocotte avec un peu d\'huile jusqu\'à ce qu\'ils soient bien dorés.\n2. Ajoutez les oignons émincés et l\'ail haché. Faites revenir quelques minutes.\n3. Ajoutez les carottes en rondelles et les pommes de terre coupées en morceaux.\n4. Saupoudrez de farine, mélangez bien, puis ajoutez le bouillon de boeuf chaud.\n5. Ajoutez le thym, le laurier, du sel et du poivre.\n6. Couvrez et laissez mijoter à feu doux pendant environ 2 heures, jusqu\'à ce que la viande soit fondante.\n7. Servez chaud, avec du pain pour saucer !',NULL),(20,'Ramen de Naruto','ramen_naruto.jpg',30,2,'Naruto','Un bol de ramen comme au Ichiraku.','1. Faites cuire les nouilles ramen selon les instructions du paquet. Égouttez et réservez.\n2. Préparez le bouillon (miso, soja ou tonkotsu) et gardez-le bien chaud.\n3. Dans une poêle, faites revenir le porc braisé (ou chashu) jusqu\'à ce qu\'il soit bien caramélisé.\n4. Faites cuire les oeufs mollets (6 minutes dans l\'eau bouillante), puis plongez-les dans de la sauce soja sucrée pour les mariner.\n5. Disposez les nouilles dans un bol, ajoutez le bouillon chaud par-dessus.\n6. Ajoutez ensuite les tranches de porc, un demi oeuf mariné, des tranches de narutomaki, des champignons shiitake, du maïs, des algues nori et des pousses de bambou.\n7. Parsemez de ciboule ou d\'oignons verts hachés avant de servir bien chaud.',NULL),(21,'Boeuf sauce au vin de Gusteau','boeuf_vin.jpg',150,5,'Ratatouille','Un plat raffiné digne de Gusteau.','1. Coupez le boeuf en gros cubes et faites-le revenir dans une cocotte avec un peu d\'huile pour le faire dorer.\n2. Retirez la viande et faites revenir les oignons émincés, l\'ail et les champignons dans la même cocotte.\n3. Remettez la viande, saupoudrez de farine, mélangez bien et laissez cuire 2 minutes.\n4. Versez le vin rouge, ajoutez le thym, le laurier, salez et poivrez.\n5. Couvrez et laissez mijoter à feu doux pendant 2h à 2h30, jusqu\'à ce que la viande soit fondante.\n6. Servez chaud avec des pommes de terre vapeur ou des tagliatelles fraîches.',NULL),(22,'Poulet caramélisé de Son Goku','poulet_caramel.jpg',25,3,'Dragon Ball Z','Un plat énergisant pour un Saiyan.','1. Coupez les morceaux de poulet en cubes ou lanières selon votre préférence.\n2. Faites chauffer un peu d\'huile dans une poêle et faites revenir le poulet jusqu\'à ce qu\'il soit bien doré.\n3. Ajoutez la sauce soja, le miel et le gingembre râpé dans la poêle.\n4. Mélangez bien pour enrober tous les morceaux de poulet.\n5. Laissez caraméliser à feu moyen pendant quelques minutes en remuant régulièrement.\n6. Servez chaud avec du riz ou des nouilles sautées.',NULL),(23,'Tarte au potiron de Poudlard','tarte_potiron.jpg',40,6,'Harry Potter','Un dessert parfait pour Halloween.','1. Préchauffez votre four à 180°C (th.6).\n2. Étalez la pâte brisée dans un moule à tarte et piquez-la avec une fourchette.\n3. Dans un saladier, mélangez la purée de potiron, les oeufs, le sucre, la cannelle et la muscade.\n4. Versez la préparation sur la pâte.\n5. Saupoudrez de graines de sésame pour une touche croquante.\n6. Faites cuire au four pendant environ 35 à 40 minutes, jusqu\'à ce que la garniture soit prise.\n7. Laissez refroidir avant de servir.',NULL),(24,'Gâteau aux marrons des Hobbits','gateau_marrons.jpg',35,6,'Seigneur des Anneaux','Un gateau moelleux aux marrons et au miel.','1. Prechauffez votre four a 180°C.\n2. Dans un saladier, melangez la creme de marrons avec les oeufs un a un.\n3. Ajoutez la farine et le gingembre en poudre, puis melangez jusqu\'a obtenir une pate homogene.\n4. Versez la preparation dans un moule beurré.\n5. Faites cuire pendant 30 a 35 minutes, jusqu\'a ce que le gateau soit bien dore.\n6. Laissez refroidir avant de demouler. Servez avec un peu de creme fouettee ou une infusion comme les Hobbits aiment !',NULL),(25,'Mochis glacés de Bulma','mochis_glaces.jpg',60,6,'Dragon Ball Z','Des mochis rafraîchissants pour l\'été.','1. Dans un bol, mélangez la farine de riz gluant, le sucre et l\'eau.\n2. Faites chauffer la préparation au micro-ondes pendant 1 minute, puis sortez-la et mélangez.\n3. Répétez ce processus (1 minute + mélange) encore 2 fois jusqu\'à obtenir une pâte épaisse et collante.\n4. Saupoudrez de la fécule de maïs sur une surface propre.\n5. Étalez la pâte dessus à l\'aide d\'un rouleau à pâtisserie, en ajoutant un peu de fécule pour éviter que ça colle.\n6. Découpez des cercles dans la pâte à l\'aide d\'un emporte-pièce ou d\'un verre retourné.\n7. Déposez une boule de glace au centre de chaque disque, puis refermez en pinçant les bords pour former une boule.\n8. Enveloppez chaque mochi dans du film plastique et placez-les au congélateur pendant au moins 2 heures.\n9. Sortez-les 2 à 3 minutes avant de servir pour qu\'ils soient tendres.',NULL),(26,'Beignets de la Belle et la Bête','beignets.jpg',40,6,'Disney','Des beignets dorés et croustillants féériques.','1. Dans un saladier, mélangez la farine, la levure, le sucre et une pincée de sel.\n2. Ajoutez les oeufs un à un, puis incorporez le lait petit à petit en mélangeant pour éviter les grumeaux.\n3. Faites chauffer de l\'huile dans une friteuse ou une casserole à 170-180°C.\n4. À l\'aide de deux cuillères ou d\'une poche à douille, déposez des petites boules de pâte dans l\'huile chaude.\n5. Faites frire jusqu\'à ce que les beignets soient bien dorés et gonflés.\n6. Égouttez-les sur du papier absorbant, puis saupoudrez-les de sucre glace.\n7. Servez tièdes pour un moment tout droit sorti du château enchanté !',NULL),(28,'Burger de Tatooine','tatooine-burger.jpg',25,1,'Obi-Chef Kenobi','Un burger juteux aux épices venues tout droit de la planète Tatooine.','1. Mélanger la viande hachée avec une pincée d’épices (paprika, cumin, coriandre).\n2. Former deux steaks et les faire cuire à feu moyen 4 minutes de chaque côté.\n3. Pendant ce temps, faire griller les pains à burger.\n4. Tartiner la base avec une sauce à l’ail façon Tatooine.\n5. Ajouter salade, tomate, steak, fromage fondant et oignons rouges.\n6. Refermer, piquer d’un sabre laser… euh… d’un cure-dent, et servir chaud !\n',2),(29,'Pizza des Tortues Ninjas','pizza.jpg',45,6,'Michelangelo','Une pizza à pâte moelleuse garnie de pepperoni, mozzarella fondue, poivrons, champignons et une sauce tomate maison. Elle ferait saliver Michelangelo et ses frères !','1.Préchauffe ton four à 220°C.\n\n2.Étale la pâte à pizza sur une plaque recouverte de papier cuisson.\n\n3.Répartis la sauce tomate sur la pâte.\n\n4.Ajoute la mozzarella râpée.\n\n5.Dispose les tranches de pepperoni, les champignons, les poivrons.\n\n6.Arrose d’un filet d’huile d’olive et saupoudre d’origan.\n\n7.Enfourne pendant 12 à 15 minutes jusqu’à ce que le fromage soit bien fondu et doré.\n\n8.Coupe en parts égales et mange directement dans le salon comme une vraie tortue ninja ??\n\n',NULL),(30,'Pâtes à la Bolognaise façon Tante May','spiderman_pates.jpg',45,4,'Tante May','Un plat réconfortant que Tante May aurait cuisiné pour Peter Parker, avec une sauce mijotée pleine d\'amour.','1. Faire revenir l\'oignon et l’ail hachés dans un filet d\'huile d\'olive.\n2. Ajouter le boeuf haché et faire dorer.\n3. Incorporer les tomates concassées et le concentré de tomate.\n4. Assaisonner avec sel, poivre, une pincée de sucre et du basilic.\n5. Laisser mijoter 30 minutes à feu doux.\n6. Cuire les spaghetti, les égoutter.\n7. Servir chaud avec du parmesan.',NULL),(31,'Tiramisu','tiramisu.jpg',50,5,'Garfield','Un tiramisu revisité avec des biscuits en forme de patte de chat, du Nutella, et une crème au mascarpone qui ferait ronronner Garfield lui-même.','1. Tremper des biscuits \"pattes de chat\" dans un mélange de café froid et de lait.\n2. Déposer une couche de biscuits au fond.\n3. Ajouter une couche de crème mascarpone au Nutella.\n4. Recommencer les couches.\n5. Saupoudrer de cacao, ajouter un biscuit chaton sur le dessus.\n6. Mettre au frais 4h... si Garfield ne passe pas avant !\n',NULL),(32,'Brochettes Alderaan','brochettes.jpg',15,4,'Chef Leia Organa','Des brochettes fraîches et élégantes à base de tomates cerises, mozzarella et basilic, parfaites pour un apéro galactique ! Une touche de finesse venue tout droit de la planète Alderaan.','1 . Rincer les tomates et couper la mozzarella en cubes.\n\n2 . Piquer tomate, basilic et mozza sur des mini pics.\n\n3 . Ajouter un filet d’huile d’olive.\n\n4 . Servir bien frais, avec un brin de Force.',NULL),(33,'Salade tropicale de l\'île de Motunui','salade_viana.jpg',25,2,'Viana','Une salade colorée et rafraîchissante aux saveurs exotiques inspirée de l\'univers de Vaiana. Ananas, crevettes, avocat et concombre sont réunis dans un mélange frais et léger, parfait pour une entrée ensoleillée.','1 . Décortiquez et faites revenir les crevettes dans un peu d\'huile d\'olive jusqu\'à ce qu\'elles soient dorées.\n\n2 . Coupez l\'ananas, l\'avocat et le concombre en petits dés.\n\n3 . Mélangez les fruits et légumes dans un grand saladier.\n\n4 . Ajoutez les crevettes refroidies.\n\n5 . Arrosez de jus de citron vert, salez, poivrez et parsemez de coriandre fraîche.\n\n6 . Servez bien frais.',NULL),(34,'Beignets de crevettes de Tortuga','beignet_crevette.jpg',35,2,'Jack Sparrow','Directement inspirés des tavernes animées de Tortuga dans Pirates des Caraïbes, ces beignets croustillants de crevettes aux épices évoquent les saveurs exotiques que Jack Sparrow aurait pu déguster entre deux aventures !','1 . Dans un bol, mélangez la farine, la fécule de maïs, la levure, l’eau gazeuse très froide, et une pincée de sel pour former une pâte légère.\n\n2 . Assaisonnez les crevettes avec du sel, du poivre et du paprika.\n\n3 . Faites chauffer l’huile dans une grande casserole ou une friteuse.\n\n4 . Trempez les crevettes dans la pâte puis faites-les frire jusqu\'à ce qu\'elles soient dorées.\n\n5 . Égouttez sur du papier absorbant et servez chaud avec une sauce pimentée ou une mayonnaise citronnée.',NULL);
/*!40000 ALTER TABLE `recipe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_category`
--

DROP TABLE IF EXISTS `recipe_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_category` (
  `code_recipe` int NOT NULL,
  `code_category` int NOT NULL,
  PRIMARY KEY (`code_recipe`,`code_category`),
  KEY `code_category` (`code_category`),
  CONSTRAINT `recipe_category_ibfk_1` FOREIGN KEY (`code_recipe`) REFERENCES `recipe` (`code_recipe`) ON DELETE CASCADE,
  CONSTRAINT `recipe_category_ibfk_2` FOREIGN KEY (`code_category`) REFERENCES `category` (`code_category`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_category`
--

LOCK TABLES `recipe_category` WRITE;
/*!40000 ALTER TABLE `recipe_category` DISABLE KEYS */;
INSERT INTO `recipe_category` VALUES (15,1),(16,1),(17,1),(18,1),(32,1),(33,1),(34,1),(19,2),(20,2),(21,2),(22,2),(28,2),(29,2),(30,2),(23,3),(24,3),(25,3),(26,3),(31,3);
/*!40000 ALTER TABLE `recipe_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recipe_work`
--

DROP TABLE IF EXISTS `recipe_work`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recipe_work` (
  `code_recipe` int NOT NULL,
  `code_work` int NOT NULL,
  PRIMARY KEY (`code_recipe`,`code_work`),
  KEY `code_work` (`code_work`),
  CONSTRAINT `recipe_work_ibfk_1` FOREIGN KEY (`code_recipe`) REFERENCES `recipe` (`code_recipe`) ON DELETE CASCADE,
  CONSTRAINT `recipe_work_ibfk_2` FOREIGN KEY (`code_work`) REFERENCES `work` (`code_work`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recipe_work`
--

LOCK TABLES `recipe_work` WRITE;
/*!40000 ALTER TABLE `recipe_work` DISABLE KEYS */;
INSERT INTO `recipe_work` VALUES (15,1),(23,1),(16,2),(20,2),(17,3),(19,3),(24,3),(18,4),(22,4),(25,4),(21,5),(26,6),(29,7),(28,8),(32,8),(30,9),(31,10),(33,11),(34,12);
/*!40000 ALTER TABLE `recipe_work` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `site_user`
--

DROP TABLE IF EXISTS `site_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `site_user` (
  `code_user` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `pseudo` varchar(255) DEFAULT NULL,
  `description` text,
  `gender` enum('Homme','Femme','Autre') DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  PRIMARY KEY (`code_user`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `site_user`
--

LOCK TABLES `site_user` WRITE;
/*!40000 ALTER TABLE `site_user` DISABLE KEYS */;
INSERT INTO `site_user` VALUES (1,'Drivon Collin','Gregory','Grego','Admin','Homme','1985-02-03','gdrivoncollin@gmail.com','$2b$10$Gpnd/BiN2sepr3tkh/6p.upVw.jgRI0G1Asx8zgW76QWQ6G48enWW','admin'),(6,'Drivon','Maud','Annick','Spécialiste des desserts','Femme','1958-09-27','montourcierannick@yahoo.fr','$2b$10$J3xvPAMSWWbAMyM3GS1TgurP7C.AGCq4ayC59Dcu3fw730XNzhFkG','user'),(10,'Atigui','Samir','Sam','Cuisinier débutant','Homme','1979-11-28','samir@gmail.com','$2b$10$quKCgmxan1hs099K6dHDIessjbAA7nvD2eX/gcj8I.zUBxExwJ7Ua','user'),(11,'Drivon','Eloise','Eloise','Experte en dessert ! ?','Femme','2009-07-09','eloisedrivon@gmail.com','$2b$10$c./hqUKj1pSrmAfc/NJGD.kXIpt8M2tPMPlgo7pkUAiJSpWc28mmC','user'),(12,NULL,NULL,NULL,NULL,NULL,NULL,'toto@toto.com','$2b$10$/9AERLhIs/V46ezVYHHnaehS7FyZ5mEDeKuKE/daGRC5pGwwAgPNe','user'),(14,'Loichot','Mickael','Obi one','Amoureux de la cuisine !','Homme','1984-07-26','mickael.loichot53@gmail.com','$2b$10$S/v3jHg4idUZeMaITJrm5.icWbgAUTHwZssIAxJc4hBobIc/4xMta','user');
/*!40000 ALTER TABLE `site_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `to_link`
--

DROP TABLE IF EXISTS `to_link`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `to_link` (
  `code_recipe` int NOT NULL,
  `code_work` int NOT NULL,
  PRIMARY KEY (`code_recipe`,`code_work`),
  KEY `code_work` (`code_work`),
  CONSTRAINT `to_link_ibfk_1` FOREIGN KEY (`code_recipe`) REFERENCES `recipe` (`code_recipe`) ON DELETE CASCADE,
  CONSTRAINT `to_link_ibfk_2` FOREIGN KEY (`code_work`) REFERENCES `work` (`code_work`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `to_link`
--

LOCK TABLES `to_link` WRITE;
/*!40000 ALTER TABLE `to_link` DISABLE KEYS */;
/*!40000 ALTER TABLE `to_link` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `work`
--

DROP TABLE IF EXISTS `work`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `work` (
  `code_work` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  PRIMARY KEY (`code_work`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `work`
--

LOCK TABLES `work` WRITE;
/*!40000 ALTER TABLE `work` DISABLE KEYS */;
INSERT INTO `work` VALUES (1,'Harry Potter'),(2,'Naruto'),(3,'Seigneur des Anneaux'),(4,'Dragon Ball'),(5,'Ratatouille'),(6,'Disney'),(7,'Tortues Ninjas'),(8,'Star Wars'),(9,'Spiderman'),(10,'Garflied le Film'),(11,'Viana'),(12,'Pirates de Caraîbes');
/*!40000 ALTER TABLE `work` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-28 15:08:28
