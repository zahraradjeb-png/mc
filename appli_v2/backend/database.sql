-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : ven. 03 avr. 2026 à 02:24
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `music_vintage`
--

-- --------------------------------------------------------

--
-- Structure de la table `acheteur`
--

CREATE TABLE `acheteur` (
  `id_user` int(11) NOT NULL,
  `adresse` varchar(300) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `acheteur`
--

INSERT INTO `acheteur` (`id_user`, `adresse`, `telephone`) VALUES
(1, '', '');

-- --------------------------------------------------------

--
-- Structure de la table `admin_mv`
--

CREATE TABLE `admin_mv` (
  `id_user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `annonce`
--

CREATE TABLE `annonce` (
  `id_annonce` int(11) NOT NULL,
  `id_vendeur` int(11) NOT NULL,
  `id_admin` int(11) DEFAULT NULL,
  `titre` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `statut` enum('EN_ATTENTE','VALIDEE','REFUSEE','EXPIREE') DEFAULT 'EN_ATTENTE',
  `motif_refus` varchar(500) DEFAULT NULL,
  `date_soumission` datetime DEFAULT current_timestamp(),
  `date_traitement` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `annonce_produit`
--

CREATE TABLE `annonce_produit` (
  `id_annonce` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cassette`
--

CREATE TABLE `cassette` (
  `id_produit` int(11) NOT NULL,
  `duree_min` int(11) DEFAULT NULL,
  `label` varchar(150) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id_categorie` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `type_categorie` enum('CD','CASSETTE','VINYLE','POSTER','INSTRUMENT') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cds`
--

CREATE TABLE `cds` (
  `id_produit` int(11) NOT NULL,
  `nb_pistes` int(11) DEFAULT NULL,
  `label` varchar(150) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `favoris`
--

CREATE TABLE `favoris` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_user` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `id_user` int(11) NOT NULL,
  `titre` varchar(255) NOT NULL,
  `contenu` text NOT NULL,
  `type` varchar(255) DEFAULT 'info',
  `est_lue` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commande`
--

CREATE TABLE `commande` (
  `id_commande` int(11) NOT NULL,
  `id_acheteur` int(11) NOT NULL,
  `id_panier` int(11) DEFAULT NULL,
  `date_commande` datetime DEFAULT current_timestamp(),
  `statut` enum('EN_ATTENTE','CONFIRMEE','EXPEDIEE','LIVREE','ANNULEE','REMBOURSEE') DEFAULT 'EN_ATTENTE',
  `montant_total` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commande_produit`
--

CREATE TABLE `commande_produit` (
  `id_commande` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `statut` enum('EN_PREPARATION','EXPEDIE','LIVRE','ANNULE') DEFAULT 'EN_PREPARATION'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `instrument`
--

CREATE TABLE `instrument` (
  `id_produit` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `paiement`
--

CREATE TABLE `paiement` (
  `id_paiement` int(11) NOT NULL,
  `id_commande` int(11) NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `mode_paiement` enum('CARTE','VIREMENT','PAYPAL','SIMULATION') NOT NULL,
  `statut` enum('EN_ATTENTE','VALIDE','ECHOUE') DEFAULT 'EN_ATTENTE',
  `date_paiement` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `panier`
--

CREATE TABLE `panier` (
  `id_panier` int(11) NOT NULL,
  `id_acheteur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `panier_produit`
--

CREATE TABLE `panier_produit` (
  `id_panier` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `poster`
--

CREATE TABLE `poster` (
  `id_produit` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `produit`
--

CREATE TABLE `produit` (
  `id_produit` int(11) NOT NULL,
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
  `date_ajout` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `produit_photo`
--

CREATE TABLE `produit_photo` (
  `id_photo` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `chemin` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id_user` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(200) NOT NULL,
  `mdp` varchar(255) NOT NULL,
  `role` enum('ACHETEUR','VENDEUR','ADMIN') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id_user`, `nom`, `prenom`, `email`, `mdp`, `role`) VALUES
(1, 'zehnati', 'alicia', 'alicia@gmail.com', '$2y$10$LT8BxGjpB376xpORn8P8h.4MYvVcMUXQXlrN92fI7YK0PLmD6qNBa', 'ACHETEUR'),
(2, 'Admin', 'Gold', 'admin@gold.fr', '$2y$10$LT8BxGjpB376xpORn8P8h.4MYvVcMUXQXlrN92fI7YK0PLmD6qNBa', 'ADMIN');

-- --------------------------------------------------------

--
-- Structure de la table `vendeur`
--

CREATE TABLE `vendeur` (
  `id_user` int(11) NOT NULL,
  `nom_boutique` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `categorie_principale` varchar(100) DEFAULT NULL,
  `localisation` varchar(150) DEFAULT NULL,
  `photo_profil` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `vinyle`
--

CREATE TABLE `vinyle` (
  `id_produit` int(11) NOT NULL,
  `label` varchar(150) DEFAULT NULL,
  `genre` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id_avis` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `note` int(11) NOT NULL,
  `commentaire` text DEFAULT NULL,
  `date_avis` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vw_annonces_en_attente`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vw_annonces_en_attente` (
`id_annonce` int(11)
,`titre` varchar(200)
,`statut` enum('EN_ATTENTE','VALIDEE','REFUSEE','EXPIREE')
,`date_soumission` datetime
,`vendeur_nom` varchar(201)
,`nom_boutique` varchar(150)
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vw_commandes`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vw_commandes` (
`id_commande` int(11)
,`date_commande` datetime
,`statut` enum('EN_ATTENTE','CONFIRMEE','EXPEDIEE','LIVREE','ANNULEE','REMBOURSEE')
,`montant_total` decimal(10,2)
,`acheteur_nom` varchar(201)
,`email` varchar(200)
,`statut_paiement` enum('EN_ATTENTE','VALIDE','ECHOUE')
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vw_produits`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vw_produits` (
`id_produit` int(11)
,`titre` varchar(200)
,`prix` decimal(10,2)'rfdsg'
,`decennie` varchar(10)
,`artiste` varchar(200)
,`rarete` enum('COMMUN','RARE','TRES_RARE','COLLECTOR')
,`etat` enum('NEUF','BON','ACCEPTABLE','ABIME')
,`categorie` varchar(100)
,`vendeur_nom` varchar(201)
,`nom_boutique` varchar(150)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vw_annonces_en_attente`
--
DROP TABLE IF EXISTS `vw_annonces_en_attente`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_annonces_en_attente`  AS SELECT `a`.`id_annonce` AS `id_annonce`, `a`.`titre` AS `titre`, `a`.`statut` AS `statut`, `a`.`date_soumission` AS `date_soumission`, concat(`u`.`nom`,' ',`u`.`prenom`) AS `vendeur_nom`, `v`.`nom_boutique` AS `nom_boutique` FROM ((`annonce` `a` join `vendeur` `v` on(`v`.`id_user` = `a`.`id_vendeur`)) join `users` `u` on(`u`.`id_user` = `v`.`id_user`)) WHERE `a`.`statut` = 'EN_ATTENTE' ORDER BY `a`.`date_soumission` ASC ;

-- --------------------------------------------------------

--
-- Structure de la vue `vw_commandes`
--
DROP TABLE IF EXISTS `vw_commandes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_commandes`  AS SELECT `co`.`id_commande` AS `id_commande`, `co`.`date_commande` AS `date_commande`, `co`.`statut` AS `statut`, `co`.`montant_total` AS `montant_total`, concat(`u`.`nom`,' ',`u`.`prenom`) AS `acheteur_nom`, `u`.`email` AS `email`, `pa`.`statut` AS `statut_paiement` FROM (((`commande` `co` join `acheteur` `ac` on(`ac`.`id_user` = `co`.`id_acheteur`)) join `users` `u` on(`u`.`id_user` = `ac`.`id_user`)) left join `paiement` `pa` on(`pa`.`id_commande` = `co`.`id_commande`)) ;

-- --------------------------------------------------------

--
-- Structure de la vue `vw_produits`
--
DROP TABLE IF EXISTS `vw_produits`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vw_produits`  AS SELECT `p`.`id_produit` AS `id_produit`, `p`.`titre` AS `titre`, `p`.`prix` AS `prix`, `p`.`decennie` AS `decennie`, `p`.`artiste` AS `artiste`, `p`.`rarete` AS `rarete`, `p`.`etat` AS `etat`, `c`.`nom` AS `categorie`, concat(`u`.`nom`,' ',`u`.`prenom`) AS `vendeur_nom`, `v`.`nom_boutique` AS `nom_boutique` FROM (((`produit` `p` join `categorie` `c` on(`c`.`id_categorie` = `p`.`id_categorie`)) join `vendeur` `v` on(`v`.`id_user` = `p`.`id_vendeur`)) join `users` `u` on(`u`.`id_user` = `v`.`id_user`)) ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `acheteur`
--
ALTER TABLE `acheteur`
  ADD PRIMARY KEY (`id_user`);

--
-- Index pour la table `admin_mv`
--
ALTER TABLE `admin_mv`
  ADD PRIMARY KEY (`id_user`);

--
-- Index pour la table `annonce`
--
ALTER TABLE `annonce`
  ADD PRIMARY KEY (`id_annonce`),
  ADD KEY `id_vendeur` (`id_vendeur`),
  ADD KEY `id_admin` (`id_admin`);

--
-- Index pour la table `annonce_produit`
--
ALTER TABLE `annonce_produit`
  ADD PRIMARY KEY (`id_annonce`,`id_produit`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `cassette`
--
ALTER TABLE `cassette`
  ADD PRIMARY KEY (`id_produit`);

--
-- Index pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id_categorie`),
  ADD UNIQUE KEY `nom` (`nom`);

--
-- Index pour la table `cds`
--
ALTER TABLE `cds`
  ADD PRIMARY KEY (`id_produit`);

--
-- Index pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `favoris_unique` (`id_user`,`id_produit`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_user` (`id_user`);
-- Index pour la table `commande`
--
ALTER TABLE `commande`
  ADD PRIMARY KEY (`id_commande`),
  ADD KEY `id_acheteur` (`id_acheteur`),
  ADD KEY `id_panier` (`id_panier`);

--
-- Index pour la table `commande_produit`
--
ALTER TABLE `commande_produit`
  ADD PRIMARY KEY (`id_commande`,`id_produit`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `instrument`
--
ALTER TABLE `instrument`
  ADD PRIMARY KEY (`id_produit`);

--
-- Index pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD PRIMARY KEY (`id_paiement`),
  ADD KEY `id_commande` (`id_commande`);

--
-- Index pour la table `panier`
--
ALTER TABLE `panier`
  ADD PRIMARY KEY (`id_panier`),
  ADD UNIQUE KEY `id_acheteur` (`id_acheteur`);

--
-- Index pour la table `panier_produit`
--
ALTER TABLE `panier_produit`
  ADD PRIMARY KEY (`id_panier`,`id_produit`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `poster`
--
ALTER TABLE `poster`
  ADD PRIMARY KEY (`id_produit`);

--
-- Index pour la table `produit`
--
ALTER TABLE `produit`
  ADD PRIMARY KEY (`id_produit`),
  ADD KEY `id_categorie` (`id_categorie`),
  ADD KEY `id_vendeur` (`id_vendeur`);

--
-- Index pour la table `produit_photo`
--
ALTER TABLE `produit_photo`
  ADD PRIMARY KEY (`id_photo`),
  ADD KEY `id_produit` (`id_produit`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Index pour la table `vendeur`
--
ALTER TABLE `vendeur`
  ADD PRIMARY KEY (`id_user`);

--
-- Index pour la table `vinyle`
--
ALTER TABLE `vinyle`
  ADD PRIMARY KEY (`id_produit`);

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id_avis`),
  ADD KEY `id_produit` (`id_produit`),
  ADD KEY `id_user` (`id_user`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `annonce`
--
ALTER TABLE `annonce`
  MODIFY `id_annonce` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id_categorie` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `favoris`
--
ALTER TABLE `favoris`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `commande`
--
ALTER TABLE `commande`
  MODIFY `id_commande` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `paiement`
--
ALTER TABLE `paiement`
  MODIFY `id_paiement` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `panier`
--
ALTER TABLE `panier`
  MODIFY `id_panier` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `produit`
--
ALTER TABLE `produit`
  MODIFY `id_produit` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `produit_photo`
--
ALTER TABLE `produit_photo`
  MODIFY `id_photo` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id_avis` int(11) NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `acheteur`
--
ALTER TABLE `acheteur`
  ADD CONSTRAINT `acheteur_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Contraintes pour la table `admin_mv`
--
ALTER TABLE `admin_mv`
  ADD CONSTRAINT `admin_mv_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Contraintes pour la table `annonce`
--
ALTER TABLE `annonce`
  ADD CONSTRAINT `annonce_ibfk_1` FOREIGN KEY (`id_vendeur`) REFERENCES `vendeur` (`id_user`),
  ADD CONSTRAINT `annonce_ibfk_2` FOREIGN KEY (`id_admin`) REFERENCES `admin_mv` (`id_user`);

--
-- Contraintes pour la table `annonce_produit`
--
ALTER TABLE `annonce_produit`
  ADD CONSTRAINT `annonce_produit_ibfk_1` FOREIGN KEY (`id_annonce`) REFERENCES `annonce` (`id_annonce`) ON DELETE CASCADE,
  ADD CONSTRAINT `annonce_produit_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;

--
-- Contraintes pour la table `cassette`
--
ALTER TABLE `cassette`
  ADD CONSTRAINT `cassette_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;

--
-- Contraintes pour la table `cds`
--
ALTER TABLE `cds`
  ADD CONSTRAINT `cds_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;

--
-- Contraintes pour la table `favoris`
--
ALTER TABLE `favoris`
  ADD CONSTRAINT `favoris_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `favoris_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Contraintes pour la table `commande`
--
ALTER TABLE `commande`
  ADD CONSTRAINT `commande_ibfk_1` FOREIGN KEY (`id_acheteur`) REFERENCES `acheteur` (`id_user`),
  ADD CONSTRAINT `commande_ibfk_2` FOREIGN KEY (`id_panier`) REFERENCES `panier` (`id_panier`);

--
-- Contraintes pour la table `commande_produit`
--
ALTER TABLE `commande_produit`
  ADD CONSTRAINT `commande_produit_ibfk_1` FOREIGN KEY (`id_commande`) REFERENCES `commande` (`id_commande`) ON DELETE CASCADE,
  ADD CONSTRAINT `commande_produit_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`);

--
-- Contraintes pour la table `instrument`
--
ALTER TABLE `instrument`
  ADD CONSTRAINT `instrument_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paiement`
--
ALTER TABLE `paiement`
  ADD CONSTRAINT `paiement_ibfk_1` FOREIGN KEY (`id_commande`) REFERENCES `commande` (`id_commande`);

--
-- Contraintes pour la table `panier`
--
ALTER TABLE `panier`
  ADD CONSTRAINT `panier_ibfk_1` FOREIGN KEY (`id_acheteur`) REFERENCES `acheteur` (`id_user`) ON DELETE CASCADE;

--
-- Contraintes pour la table `panier_produit`
--
ALTER TABLE `panier_produit`
  ADD CONSTRAINT `panier_produit_ibfk_1` FOREIGN KEY (`id_panier`) REFERENCES `panier` (`id_panier`) ON DELETE CASCADE,
  ADD CONSTRAINT `panier_produit_ibfk_2` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`);

--
-- Contraintes pour la table `poster`
--
ALTER TABLE `poster`
  ADD CONSTRAINT `poster_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;

--
-- Contraintes pour la table `produit_photo`
--
ALTER TABLE `produit_photo`
  ADD CONSTRAINT `produit_photo_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;

--
-- Contraintes pour la table `produit`
--
ALTER TABLE `produit`
  ADD CONSTRAINT `produit_ibfk_1` FOREIGN KEY (`id_categorie`) REFERENCES `categorie` (`id_categorie`),
  ADD CONSTRAINT `produit_ibfk_2` FOREIGN KEY (`id_vendeur`) REFERENCES `vendeur` (`id_user`);

--
-- Contraintes pour la table `vendeur`
--
ALTER TABLE `vendeur`
  ADD CONSTRAINT `vendeur_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Contraintes pour la table `vinyle`
--
ALTER TABLE `vinyle`
  ADD CONSTRAINT `vinyle_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produit` (`id_produit`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
