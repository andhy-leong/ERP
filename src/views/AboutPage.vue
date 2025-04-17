<template>
  <div class="about-page">
    <h1>À propos</h1>
    <p>Voici une page d'exemple pour découvrir Vue Router.</p>
    <router-link to="/">Revenir à l'accueil</router-link>
  </div>
</template>

<script lang="ts">
export default {
  name: 'AboutPage',
};
</script>

<style scoped>
.about-page {
  text-align: center;
  margin-top: 50px;
}
</style>
