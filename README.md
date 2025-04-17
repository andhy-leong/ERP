# Projet 4E - ERP

#vuejs #typescript #router

## 📌 Project Description

This is a simple Vue.js project that demonstrates the use of Vue Router and TypeScript. The project contains two pages, the home page and the about page. The home page contains a simple message and a button that navigates to the about page. The about page contains a simple message and a button that navigates back to the home page.

To navigate between the pages, the project uses Vue Router. The project also uses TypeScript to define the types of the data and methods used in the components.

### 📂 Architecture

The project is structured as follows:

```plaintext
📦 Projet Vue.js
├── 📁 build/             # Dossier de build (optionel)
├── 📁 dist/              # Dossier généré après le build de l'application (non versionné)
├── 📂 public/            # Contient les fichiers statiques non traités par Webpack ⛔
│   ├── favicon.ico       # Icône de l'application web
│   └── index.html        # Fichier HTML principal où Vue est injecté
├── 📁 node_modules/      # Dépendances installées via npm (non versionné)
│
├── 📂 src/               
│   ├── 📁 assets/        # Ressources statiques (images, styles globaux...)
│   ├── 📁 components/    # Composants Vue réutilisables (ex : boutons, header, footer...)
│   ├── 📂 router/        # Configuration de Vue Router
│   │   └── index.ts      # Définition des routes de l'application
│   ├── 📂 views/         # Contient les pages de l'application
│   │   ├── AboutPage.vue # Page "À propos" (exemple)
│   │   └── HomePage.vue  # Page d'accueil (exemple)
│   ├── 📁 services/      # Logique métier (gestion des appels API, base de données, ...)
│   ├── App.vue           # Composant racine
│   ├── main.ts           # Point d'entrée de l'application ⛔
│   └── shims-vue.d.ts    # Fichier de configuration TypeScript ⛔
│
├── babel.config.js       # Configuration Babel, transpilation de JavaScript ⛔
├── package.json          # Fichier de configuration du projet et des dépendances npm ⛔
├── package-lock.json     # Version exacte des dépendances ⛔
├── tsconfig.json         # Configuration TypeScript ⛔
├── tsconfig.node.json    # Config TypeScript spécifique aux outils de build ⛔
└── vue.config.ts         # Configuration spécifique à Vue.js ⛔
```
⛔ : ne pas modifier

Note that the project does not contain any API calls. The services folder is included to demonstrate where the API calls would be placed.

## ⚙️ Project setup

Execute the following commands to setup the project for the first time.


```
npm install
```

### 🔍 Check the configuration

Once the project is setup, check the configuration by running the following command.

```
npx vue-tsc --noEmit
```

### 🏗️ Compiles and hot-reloads for development

This command will start the development server. You can access the application at `http://localhost:8080/`.

```
npm run serve
```

### 🚀 Compiles and minifies for production

Only run the following command when you are ready to deploy the application.

```
npm run build
```

### 🛠️ Lints and fixes files

Use the following command to lint and fix the files.

```
npm run lint
```
