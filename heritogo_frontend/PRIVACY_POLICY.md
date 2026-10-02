# Politique de confidentialité — HeriTogo

**Dernière mise à jour :** 2 octobre 2026  
**Responsable du traitement :** HeriTogo, Lomé, Togo  
**Contact :** privacy@heritogo.tg

Cette politique décrit, en langage clair, quelles données nous utilisons, pourquoi, et quels sont vos droits (RGPD / Privacy by Design).

## 1. Qui collecte les données ?

HeriTogo est le responsable du traitement. Nous exploitons une plateforme de découverte du patrimoine togolais et de mise en relation entre voyageurs et guides locaux certifiés.

## 2. Quelles données sont collectées ?

Nous appliquons la **minimisation** : uniquement ce qui est nécessaire au service.

| Catégorie | Exemples | Base |
|---|---|---|
| Compte | Nom, e-mail, mot de passe (haché par le prestataire d’authentification, jamais en clair), rôle, langue, téléphone facultatif | Contrat |
| Profil public guide | Bio, zones, langues, tarifs, photo de profil | Contrat |
| Réservations | Dates, type de mission, messages, statut, paiement (référence, pas de numéro de carte) | Contrat |
| Géolocalisation | Position GPS **uniquement pendant** un scan, **en mémoire**, si vous avez consenti | Consentement |
| Notifications | Jeton / permission navigateur si vous activez les alertes | Consentement |
| KYC guides | Statut de vérification et identifiant de session chez le **prestataire tiers** (Stripe Identity ou équivalent). **Les pièces d’identité ne transitent pas et ne sont jamais stockées sur nos serveurs.** | Obligation légale / intérêt légitime (sécurité) |
| Technique | Cookies de session HttpOnly, langue, éventuellement thème | Intérêt légitime / consentement |

Nous **ne collectons pas** : historique de positions, cartes bancaires, copies de pièces d’identité.

Les photos du scanner sont envoyées au moteur d’analyse (Google Gemini) **le temps de l’identification**, puis non conservées chez HeriTogo.

## 3. Pourquoi (finalités) ?

- Faire fonctionner le compte, le scanner, la carte et les réservations.
- Mettre en relation voyageurs et guides, et assurer la **sécurité** de la communauté (guides vérifiés).
- Vous envoyer des notifications **uniquement si vous l’avez demandé**.
- Respecter nos obligations légales.

Nous ne vendons pas vos données. Pas de publicité comportementale.

## 4. Durée de conservation

- Compte et réservations : jusqu’à **suppression du compte** (effacement immédiat / hard delete).
- Position GPS : **éphémère**, jamais historisée en base.
- Historique de scans : uniquement **sur votre appareil** (vous pouvez le vider).
- Session KYC : conservée chez le prestataire selon sa propre politique ; HeriTogo ne garde qu’un identifiant de dossier et le statut.
- Cookies de session : 7 jours.

## 5. Transferts et sous-traitants

- Hébergement et authentification : Supabase (chiffrement en transit TLS, au repos côté infrastructure).
- Analyse d’image du scanner : Google Gemini (photo transmise le temps du traitement).
- KYC : prestataire d’identité (Stripe Identity lorsqu’il est configuré).
- E-mails transactionnels : prestataire d’envoi (ex. Resend).

## 6. Sécurité

- HTTPS / TLS en production.
- Mots de passe hachés (bcrypt / équivalent géré par Supabase Auth). Nous ne stockons aucun mot de passe en clair.
- Cookies de session **HttpOnly**, **Secure** en production, **SameSite=Lax**.
- Accès API authentifié ; les données d’un utilisateur ne sont exposées qu’à lui-même (et aux rôles nécessaires : guide, admin).

## 7. Vos droits

Vous pouvez à tout moment :

- **accéder** à vos informations (tableau de bord) ;
- **les rectifier** ;
- **retirer** le consentement géolocalisation ou notifications (Paramètres) ;
- **supprimer** votre compte (droit à l’oubli / suppression définitive).

Pour exercer un droit : depuis l’application, ou par e-mail à **privacy@heritogo.tg**.

## 8. Enfants

Le service n’est pas destiné aux moins de 16 ans.

## 9. Modifications

En cas de changement important, nous l’indiquerons dans l’application et mettrons à jour la date ci-dessus.
