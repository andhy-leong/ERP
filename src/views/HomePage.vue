<template>
  <div class="home-page">
    <h1>Bienvenue sur la page d'accueil !</h1>
    <p>Ceci est la page principale de l'application Vue.js.</p>
    <div class="navigation-links">
      <router-link to="/about" class="nav-link">Aller à la page À propos</router-link>
      <router-link to="/pompes" class="nav-link">Voir les pompes à carburant</router-link>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'HomePage',
};
</script>

<style scoped>
.home-page {
  text-align: center;
  margin-top: 50px;
}

.navigation-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.nav-link {
  margin: 10px;
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #2980b9;
}
</style>
