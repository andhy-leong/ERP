<template>
  <GridItem id="carte-credit-button-container">
    <button class="full-button">Créer carte</button>
    <button class="full-button">Déclarer perte</button>
    <button class="full-button">Éditer offres</button>
  </GridItem>
</template>

<script setup lang="ts">
import GridItem from "@/components/GridItem.vue";
</script>

<style>
#carte-credit-button-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centre horizontalement */
  justify-content: center; /* Centre verticalement */
  width: 100%;
  gap: 10px; /* Espacement entre les boutons */
}

.full-button {
  flex-grow: 0.1; /* Réduit la hauteur des boutons */
  width: 90%; /* Ajuste la largeur */
  background-color: #2D3648;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  padding: 12px; /* Taille de bouton ajustée */
}

.full-button:hover {
  background-color: #222833; /* Couleur plus foncée au survol */
}
</style>