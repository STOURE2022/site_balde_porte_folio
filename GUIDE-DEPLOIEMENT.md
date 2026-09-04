# Guide de déploiement — Phase 1
## secunabalde.com · Pôle IT

> État au 4 septembre 2026 : le domaine **secunabalde.com est libre** (vérifié auprès du registre .com).
> À faire rapidement — un nom de domaine libre peut être pris par n'importe qui.

---

## Étape 1 — Enregistrer le domaine (≈ 12–15 €/an) — URGENT

Registrar recommandé : **OVH** (ovh.com, interface en français) ou **Namecheap** (namecheap.com, un peu moins cher).

1. Créer un compte au nom du pôle IT (avec une adresse e-mail sécurisée que vous contrôlez).
2. Rechercher `secunabalde.com` → l'ajouter au panier → payer 1 an (ou 2-3 ans pour la tranquillité).
3. Dès l'achat, dans les réglages du domaine :
   - ✅ Activer la **double authentification (2FA)** sur le compte registrar ;
   - ✅ Activer le **verrouillage du domaine** (protection contre les transferts) ;
   - ✅ Activer la **confidentialité WHOIS** (masque vos coordonnées personnelles) ;
   - ✅ Activer le **renouvellement automatique** (un domaine de candidat qui expire en campagne = catastrophe).

## Étape 2 — Créer le compte Cloudflare (gratuit)

Cloudflare gère le DNS, le HTTPS, la protection contre les attaques (DDoS) et l'hébergement.

1. Créer un compte sur **cloudflare.com** → activer la **2FA** immédiatement.
2. « Ajouter un site » → saisir `secunabalde.com` → choisir l'offre **Free**.
3. Cloudflare affiche **2 serveurs de noms** (ex. `ana.ns.cloudflare.com` / `bob.ns.cloudflare.com`).
4. Retourner chez le registrar (OVH/Namecheap) → réglages DNS du domaine → **remplacer les serveurs DNS** par ceux de Cloudflare.
5. Attendre l'activation (de quelques minutes à quelques heures).

## Étape 3 — Mettre le site en ligne (Cloudflare Pages, gratuit)

1. Dans le tableau de bord Cloudflare : **Workers & Pages → Create → Pages → Upload assets** (téléversement direct).
2. Nom du projet : `secunabalde`.
3. Glisser-déposer **tout le contenu du dossier du site** (`index.html`, `404.html`, `_headers`, `css/`, `js/`, `assets/`).
4. Le site est en ligne sur `secunabalde.pages.dev` → vérifier que tout s'affiche.
5. Onglet **Custom domains** → ajouter `secunabalde.com` et `www.secunabalde.com` → Cloudflare configure le DNS et le HTTPS automatiquement.

> Le fichier `_headers` (déjà prêt dans le dossier) applique automatiquement les en-têtes de sécurité (anti-clickjacking, HTTPS forcé, politique de sécurité du contenu). La page `404.html` s'affiche pour les adresses inexistantes.

**Pour chaque mise à jour du site ensuite** : mode édition → « ⬇ Exporter le site » → remplacer `index.html` dans le dossier → re-glisser-déposer le dossier dans Pages (une nouvelle version est publiée en quelques secondes, avec possibilité de revenir à la version précédente).

## Étape 4 — Les e-mails professionnels (Zoho Mail, ≈ 1 €/boîte/mois)

1. Créer un compte sur **zoho.com/mail** → offre « Mail Lite » (ou l'offre gratuite jusqu'à 5 boîtes si elle est proposée dans votre région) → activer la **2FA**.
2. Ajouter le domaine `secunabalde.com` → Zoho demande de prouver la propriété : copier l'enregistrement **TXT** fourni dans **Cloudflare → DNS → Add record**.
3. Créer les 3 boîtes :
   - `contact@secunabalde.com` — contacts généraux
   - `secuna@secunabalde.com` — adresse personnelle de M. Baldé
   - `cabinet@secunabalde.com` — activités institutionnelles
4. Ajouter dans Cloudflare les enregistrements fournis par Zoho :
   - **MX** (réception du courrier) ;
   - **SPF** (TXT : `v=spf1 include:zohomail.com ~all`) ;
   - **DKIM** (TXT fourni par Zoho — signature des messages) ;
   - **DMARC** (TXT sur `_dmarc` : `v=DMARC1; p=quarantine; rua=mailto:cabinet@secunabalde.com`).

> SPF + DKIM + DMARC empêchent quiconque d'envoyer de faux e-mails « au nom de » secunabalde.com — indispensable pour un candidat.

## Étape 5 — Vérifications finales (checklist)

- [ ] `https://secunabalde.com` et `https://www.secunabalde.com` affichent le site (cadenas HTTPS visible)
- [ ] `https://secunabalde.com/page-inexistante` affiche la page 404 élégante
- [ ] Envoi/réception d'un e-mail test sur les 3 boîtes
- [ ] Test anti-usurpation : envoyer un mail à `check-auth@verifier.port25.com` depuis `cabinet@` → le rapport doit indiquer SPF pass et DKIM pass
- [ ] 2FA activée sur : registrar, Cloudflare, Zoho
- [ ] Mots de passe forts et uniques, stockés dans un gestionnaire (Bitwarden, gratuit)
- [ ] Renouvellement automatique du domaine activé

## Récapitulatif des coûts

| Poste | Fournisseur | Coût |
|---|---|---|
| Domaine .com | OVH / Namecheap | ≈ 12–15 €/an |
| DNS + sécurité + hébergement | Cloudflare (Free) | 0 € |
| 3 boîtes e-mail | Zoho Mail | ≈ 0–36 €/an |
| **Total** | | **≈ 15–50 €/an** |

---

*Prochaines phases : version portugaise (langue officielle de la Guinée-Bissau) + sections campagne (actualités, programme, presse, agenda) — Phase 2 ; administration en ligne avec mot de passe — Phase 3.*
