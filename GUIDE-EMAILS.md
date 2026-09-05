# Guide e-mails — secunabalde.com
## Zoho Mail + Cloudflare DNS · Pôle IT

Objectif : 3 boîtes professionnelles qui envoient **et** reçoivent depuis @secunabalde.com, avec une protection complète contre l'usurpation d'identité (indispensable pour un candidat).

| Adresse | Usage | Qui la consulte |
|---|---|---|
| `contact@secunabalde.com` | Contacts généraux du public | Équipe |
| `secuna@secunabalde.com` | Adresse personnelle de M. Baldé | M. Baldé uniquement |
| `cabinet@secunabalde.com` | Institutionnel + presse | Cabinet / pôle IT |

> **Prérequis** : le domaine enregistré et actif sur Cloudflare (étapes 1-2 du GUIDE-DEPLOIEMENT.md).

---

## Étape 1 — Créer le compte Zoho Mail

1. Aller sur **zoho.com/mail** → « Business Email » → créer le compte administrateur avec votre e-mail du pôle IT.
2. **Activer immédiatement la 2FA** sur ce compte admin (Zoho OneAuth ou application TOTP).
3. Choisir l'offre : **Mail Lite** (≈ 1 €/boîte/mois) — ou l'offre gratuite « Forever Free » (5 boîtes, webmail seulement) si elle est proposée : suffisante pour démarrer, on peut passer à Lite plus tard sans rien casser.
4. « Add your domain » → saisir `secunabalde.com`.

## Étape 2 — Prouver la propriété du domaine

Zoho affiche un code de vérification (TXT). Dans **Cloudflare → DNS → Records → Add record** :

| Type | Nom | Contenu | Proxy |
|---|---|---|---|
| TXT | `@` | `zoho-verification=zbXXXXXXXX.zmverify.zoho.com` *(code exact affiché par Zoho)* | DNS only |

Retour dans Zoho → « Verify ». (Propagation : quelques minutes en général.)

## Étape 3 — Créer les 3 boîtes

Dans Zoho Admin → Users : créer `contact`, `secuna`, `cabinet`.

- Mot de passe **fort et unique** pour chaque boîte (généré par Bitwarden).
- **2FA obligatoire** sur les 3 boîtes — surtout `secuna@`.
- Optionnel mais recommandé : créer des **alias** (gratuits) sur la boîte cabinet :
  `imprensa@` et `presse@` → alias de `cabinet@secunabalde.com` (les journalistes lusophones et francophones tomberont toujours juste).

## Étape 4 — Les enregistrements DNS dans Cloudflare

⚠️ **Important** : reprendre les valeurs **exactement telles qu'affichées dans la console Zoho** — les serveurs varient selon le centre de données (`.com` ou `.eu`). Valeurs habituelles :

**Réception (MX)** — supprimer d'abord tout MX existant :

| Type | Nom | Contenu | Priorité | Proxy |
|---|---|---|---|---|
| MX | `@` | `mx.zoho.com` | 10 | DNS only |
| MX | `@` | `mx2.zoho.com` | 20 | DNS only |
| MX | `@` | `mx3.zoho.com` | 50 | DNS only |

**Anti-usurpation (SPF + DKIM + DMARC)** :

| Type | Nom | Contenu | Proxy |
|---|---|---|---|
| TXT | `@` | `v=spf1 include:zohomail.com ~all` *(ou `include:zohomail.eu` si compte EU)* | DNS only |
| TXT | `zmail._domainkey` | *(longue clé DKIM générée dans Zoho Admin → Email Authentication → DKIM → secunabalde.com)* | DNS only |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:cabinet@secunabalde.com; fo=1; pct=100` | DNS only |

Ce que ça fait :
- **SPF** : seuls les serveurs Zoho ont le droit d'envoyer pour secunabalde.com ;
- **DKIM** : chaque message est signé cryptographiquement ;
- **DMARC `p=quarantine`** : tout faux e-mail « secunabalde.com » part en spam chez le destinataire, et vous recevez des rapports sur `cabinet@`.

📅 **Après 2-3 semaines sans problème** : durcir en remplaçant `p=quarantine` par `p=reject` (les faux e-mails sont alors purement refusés — protection maximale).

## Étape 5 — Tests (à faire tous les trois)

1. **Réception** : envoyer un e-mail depuis un Gmail vers chacune des 3 boîtes → doit arriver dans le webmail Zoho (mail.zoho.com).
2. **Envoi** : répondre depuis chaque boîte → doit arriver dans le Gmail, expéditeur « @secunabalde.com ».
3. **Authentification** : depuis `cabinet@`, envoyer un e-mail vide à `check-auth@verifier.port25.com` → le rapport automatique doit dire `SPF check: pass` et `DKIM check: pass`.
4. **Note de délivrabilité** : envoyer un message à l'adresse affichée par **mail-tester.com** → viser 9/10 ou 10/10.

## Étape 6 — Confort et sécurité au quotidien

- **Mobile** : application « Zoho Mail » (Android/iOS) — connexion + 2FA sur chaque téléphone concerné.
- **Signatures** : installer les signatures HTML fournies dans le dossier `emails/` (voir ci-dessous).
- **Règles d'or pour toute l'équipe** :
  - Ne jamais communiquer un mot de passe par e-mail ou WhatsApp ;
  - Toute demande « urgente » de paiement/identifiants reçue par e-mail = appel téléphonique de vérification d'abord ;
  - `secuna@` ne sert jamais à s'inscrire sur des sites ou réseaux sociaux (utiliser `contact@`) — l'adresse personnelle du candidat doit rester hors des bases de données qui fuitent.

## Installer les signatures

Dossier `emails/` : `signature-secuna.html`, `signature-cabinet.html`, `signature-contact.html`.

Dans Zoho Mail (webmail) → ⚙️ Settings → **Signatures** → New signature → cliquer l'icône `</>` (code HTML) → coller le contenu du fichier correspondant → associer la signature à l'adresse → Save. Vérifier avec un envoi test vers un Gmail (rendu correct sur mobile et ordinateur).

---

### Récapitulatif

| Poste | Coût |
|---|---|
| Zoho Mail Lite × 3 boîtes | ≈ 36 €/an (ou 0 € en offre gratuite) |
| Enregistrements DNS Cloudflare | 0 € |

En cas de blocage sur une étape, ouvrir cette page et reprendre au point exact — chaque étape est indépendante et peut être faite à des moments différents.
