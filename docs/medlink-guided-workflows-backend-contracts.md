# MedLink — contrats backend requis pour les parcours guidés

Ce document décrit uniquement les contrats absents constatés dans les contrôleurs actuels. Il ne constitue pas une implémentation fictive. Les noms d’URL sont des propositions à confirmer côté backend.

## 1. Onboarding administrateur

Le frontend peut déterminer une configuration minimale à partir des données déjà persistées :

- `GET /directory-service/cliniques`
- `GET /praticien-service/specialites/getall`
- `GET /directory-service/blocs`
- `GET /praticien-service/praticiens/getAll`
- `GET /directory-service/affectations-praticiens`

Il peut créer les mêmes ressources et affecter des praticiens à une clinique. Il n’existe toutefois aucun état explicite « relu et activé » ni brouillon d’onboarding.

Contrat minimal optionnel si le métier exige une activation explicite ou une reprise multi-session :

```text
GET  /api/admin/organization/setup
PUT  /api/admin/organization/setup
POST /api/admin/organization/setup/activate
```

Le serveur doit persister la version, l’étape, les références sélectionnées et vérifier toutes les relations lors de l’activation. Aucune relation spécialité–clinique ou spécialité–bloc ne peut être affichée tant qu’elle n’existe pas dans le domaine backend.

## 2. Contexte et horaires du praticien connecté

Les contrôleurs actuels ne permettent pas au frontend de résoudre de façon sûre le praticien courant et ne modélisent que des créneaux individuels. Un vrai onboarding hebdomadaire nécessite :

```text
GET /api/praticien/me/context
GET /api/praticien/me/working-hours
PUT /api/praticien/me/working-hours
GET /api/praticien/me/appointments?from=...&to=...
```

Le backend doit déduire le praticien du `sub` Keycloak et renvoyer uniquement ses cliniques/affectations. Le modèle d’horaires doit supporter au minimum le jour, plusieurs intervalles, la clinique, la zone horaire et une version pour la concurrence optimiste. La validation des chevauchements et de propriété doit être autoritaire côté serveur.

## 3. Recherche et réservation Patient

Les listes existantes de spécialités, praticiens, cliniques et affectations sont réservées à l’administration. Le workflow Flowable accepte encore un `patientId` venant du navigateur. Le parcours Patient ne peut donc pas être activé en production sans une façade sécurisée :

```text
GET  /api/patient/booking/specialties
GET  /api/patient/booking/specialties/{specialtyId}/clinics
GET  /api/patient/booking/clinics/{clinicId}/specialties/{specialtyId}/practitioners
GET  /api/patient/booking/practitioners/{practitionerId}/slots?clinicId=...&from=...&to=...
POST /api/patient/appointments
```

La commande finale devrait contenir uniquement les choix fonctionnels autorisés, par exemple :

```json
{
  "slotId": 42,
  "reason": "Consultation",
  "idempotencyKey": "UUID"
}
```

Le serveur doit :

1. déduire le patient du JWT ;
2. vérifier l’affectation praticien–clinique ;
3. reverrouiller et revalider le créneau ;
4. garantir l’idempotence ;
5. démarrer/continuer le processus Flowable ;
6. renvoyer un statut explicite `PENDING` ou `CONFIRMED`.

Les endpoints `/me` sont également requis pour les rendez-vous, dossiers et documents du patient. Un identifiant fourni par une URL frontend ne doit jamais servir de contrôle d’autorisation.
