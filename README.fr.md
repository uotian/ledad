# ledad

[日本語](README.ja.md) | [English](README.md) | [Français](README.fr.md) | [中文](README.zh.md)

Application web qui utilise le microphone du navigateur pour transcrire la parole en temps réel et la traduire dans une autre langue.

## Fonctionnalités principales

- Entrée audio depuis le microphone du navigateur
- Transcription vocale en temps réel
- Traduction du texte transcrit
- Changement de la langue source et de la langue cible
- Commandes pour démarrer, arrêter et effacer une session

## Utilisation

Choisissez la langue source et la langue cible dans le panneau de contrôle en bas de l'écran.

Appuyez sur `Start` pour demander l'autorisation d'utiliser le microphone et commencer la transcription. Quand la parole est reconnue, la transcription et la traduction s'affichent dans le panneau principal.

Appuyez sur `Stop` pour arrêter l'entrée microphone et la connexion Realtime.

Appuyez sur `Clear` pour effacer l'historique affiché.

## Prérequis

- Node.js
- Clé API OpenAI

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
- L'utilisation de l'API OpenAI peut entraîner des frais.
