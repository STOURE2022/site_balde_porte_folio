# Site officiel — Secuna Baldé

Site portfolio premium **bilingue (portugais / français)** avec **mode édition intégré** : vous pouvez modifier les textes, changer les photos et ajouter des sections sans toucher au code.

## Structure

```
index.html        → la page principale (PORTUGAIS — langue officielle)
fr/index.html     → la version française
css/style.css     → le design (commun aux deux langues)
js/main.js        → animations et navigation
js/editor.js      → le mode édition
assets/           → photos (portrait, visuel environnement)
404.html          → page d'erreur
_headers          → en-têtes de sécurité (Cloudflare Pages / Netlify)
GUIDE-DEPLOIEMENT.md → guide de mise en ligne (Phase 1)
```

## Langues

- Le sélecteur **PT | FR** est dans le menu de navigation.
- **Chaque langue se modifie séparément** : ouvrez la page PT ou la page FR, activez le mode édition, modifiez, exportez. Le fichier exporté depuis la page française doit remplacer `fr/index.html` ; celui exporté depuis la page portugaise remplace `index.html` à la racine.

## Ouvrir le site

Double-cliquez sur `index.html` — il s'ouvre dans votre navigateur.

## Activer le mode édition

Trois façons, au choix :

1. **Raccourci clavier** : `Ctrl + Shift + E`
2. **5 clics rapides** sur le monogramme doré « SB » en haut à gauche
3. Ouvrir le site avec `?edition` à la fin de l'adresse (ex. `index.html?edition`), puis cliquer sur le bouton « ✎ Mode édition »

## Ce que vous pouvez faire en mode édition

| Action | Comment |
|---|---|
| Modifier un texte | Cliquez directement sur le texte et tapez |
| Changer une photo | Cliquez sur la photo, choisissez un fichier |
| Modifier un lien / e-mail | `Ctrl + clic` sur le lien, saisissez la nouvelle adresse |
| Ajouter une section | Bouton « ➕ Ajouter une section » (texte, texte + image, ou galerie photos, en style clair/sombre/vert) |
| Ajouter des photos | Créez une section « Galerie photos », puis « + Ajouter une photo » |
| Déplacer / supprimer une section ajoutée | Boutons ↑ ↓ ✕ en haut à droite de la section |

Les nouvelles sections sont automatiquement ajoutées au menu de navigation.

## Sauvegarde et publication

- **Sauvegarde automatique** : vos modifications sont enregistrées dans le navigateur (elles restent visibles sur cet ordinateur, même après fermeture).
- **⬇ Exporter le site** : télécharge un nouveau `index.html` avec toutes vos modifications intégrées. **Remplacez** l'ancien `index.html` du dossier par ce fichier — c'est cette version qu'il faut mettre en ligne (avec les dossiers `css`, `js` et `assets`).
- **↩ Tout réinitialiser** : revient à la version d'origine (les modifications non exportées sont perdues).

## Mise en ligne

Pour publier sur www.secunabalde.com, transférez chez l'hébergeur : `index.html` (la version exportée), `css/`, `js/` et `assets/`.
