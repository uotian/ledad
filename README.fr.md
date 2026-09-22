# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

![Démonstration de la transcription et de la traduction en temps réel de ledad](docs/assets/ledad-demo.gif)

Démonstration de l’interface avec des données d’exemple.

Application web qui utilise le microphone du navigateur pour transcrire la parole en temps réel et la traduire dans une autre langue.

Technologies utilisées : Next.js 16, React 19, TypeScript et les API OpenAI Realtime et Responses.

## Fonctionnalités principales

- Entrée audio depuis le microphone du navigateur
- Transcriptions préliminaires à faible latence et versions finales toutes les 60 secondes
- Traduction des transcriptions préliminaires et finales
- Changement de la langue source et de la langue cible
- Commandes pour démarrer, arrêter, valider et effacer une session

## Utilisation

Cliquez sur l’icône d’engrenage (`Settings`) en haut à droite, réglez les paramètres suivants et appuyez sur `Save`. Les paramètres sont enregistrés dans ce navigateur.

- `Source language` / `Translation language` : anglais (`en`), japonais (`ja`), chinois (`zh`) ou français (`fr`). Par défaut : anglais → japonais. Le panneau de contrôle en bas affiche le sens de traduction sélectionné.
- `Text size` : S, M ou L (M par défaut).
- `Prompt` : sujet ou contexte de l’enregistrement pour la transcription.
- `Keywords` : noms propres, termes techniques ou sigles pour guider l’orthographe, un par ligne.

Ouvrir les paramètres lorsque la session n’est pas inactive demande de confirmer son arrêt. La taille du texte s’applique immédiatement après l’enregistrement ; les autres paramètres prennent effet au démarrage de la prochaine session.

Appuyez sur `Stop` pour arrêter l'entrée microphone et la connexion Realtime.

Appuyez sur `Commit` pour valider le tampon audio actuel et finaliser la transcription en cours pour la traduction. Pendant une session, le tampon audio est également validé automatiquement toutes les 15 secondes.

Appuyez sur l’icône de gomme (`Clear`) en bas à droite du panneau principal pour effacer l’historique affiché sans arrêter la session.

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
