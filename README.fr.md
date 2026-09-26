# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![Démonstration de la transcription, de la traduction et d’AI Insights dans ledad](docs/assets/ledad-demo.gif)

Démonstration de l’interface avec des données d’exemple.

Application web qui utilise le microphone du navigateur pour transcrire et traduire la parole en temps réel, et résumer les sujets de conversation avec AI Insights.

Technologies utilisées : Next.js 16, React 19, TypeScript, les API OpenAI.

## Fonctionnalités principales

- Entrée audio depuis le microphone du navigateur
- Transcriptions préliminaires à faible latence et versions finales toutes les 60 secondes
- Traduction des transcriptions préliminaires et finales
- Résumés par sujet et sujet actuel dans la langue source
- Changement de la langue source et de la langue cible
- Commandes pour démarrer, arrêter et effacer une session

## Utilisation

Cliquez sur l’icône d’engrenage (`Settings`) en haut à droite, réglez les paramètres suivants et appuyez sur `Save`. Les paramètres sont enregistrés dans ce navigateur.

- `Source language` / `Translation language` : anglais (`en`), japonais (`ja`), chinois (`zh`) ou français (`fr`). Par défaut : anglais → japonais. Le panneau de contrôle en bas affiche le sens de traduction sélectionné.
- `Transcription` : OpenAI.
- `Text size` : S, M ou L (M par défaut).
- `Prompt` : sujet ou contexte de l’enregistrement pour la transcription OpenAI.
- `Keywords` : noms propres, termes techniques ou sigles pour guider l’orthographe, un par ligne.

Ouvrir les paramètres lorsque la session n’est pas inactive demande de confirmer son arrêt. La taille du texte s’applique immédiatement après l’enregistrement ; les autres paramètres prennent effet au démarrage de la prochaine session.

Appuyez sur `Stop` pour arrêter l'entrée microphone et la connexion Realtime.

OpenAI valide le tampon audio et met à jour les traductions automatiquement toutes les 15 secondes.

Appuyez sur l’icône de gomme (`Clear`) en bas à droite du panneau principal pour effacer l’historique affiché sans arrêter la session.

Le panneau gauche `AI Insights` affiche `All Topics`, qui regroupe les discussions sur un même sujet, et un `Current Topic` distinct. Cliquez sur un titre pour développer son résumé. Sur les écrans étroits, les sujets apparaissent au-dessus de la transcription.

Pendant l’écoute, l’application vérifie les changements chaque minute et résume les transcriptions et traductions affichées avec `gpt-6-luna`. Les résumés sont affichés dans la langue de traduction. Le bouton d’actualisation à côté de `AI Insights` permet de régénérer le résumé même si le contenu n’a pas changé. Il est désactivé pendant le traitement, et le dernier résumé reste visible après l’arrêt. Les résumés sont fournis à titre indicatif.

## Prérequis

- Node.js
- Clé API OpenAI

## Navigateurs pris en charge

Utilisez la dernière version stable de Chrome, Edge, Firefox ou Safari (y compris Safari sur iOS). Internet Explorer et les navigateurs obsolètes ne sont pas pris en charge.

L’accès au microphone exige également un contexte sécurisé (HTTPS ou `localhost`) et l’autorisation du navigateur.

## Installation

Créez `.env.local` et ajoutez votre clé API OpenAI.

```bash
OPENAI_API_KEY=your_api_key
```

Installez les dépendances.

```bash
npm install
```

Démarrez le serveur de développement.

```bash
npm run dev
```

Ouvrez cette URL dans votre navigateur.

```txt
http://localhost:3000
```

## Notes

- Vous devez autoriser l'accès au microphone dans le navigateur.
- Les sessions s’arrêtent automatiquement après 30 minutes. Appuyez à nouveau sur `Start` pour continuer.
- La clé API OpenAI est utilisée uniquement côté serveur et n’est pas exposée au navigateur.
- L'utilisation de l'API OpenAI peut entraîner des frais.

[Historique des modifications](CHANGELOG.md)
