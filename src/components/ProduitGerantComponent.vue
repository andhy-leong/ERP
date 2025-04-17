<template>
  <GridItem id="produits-container">
    <h3>🛒Produits</h3>
    <input type="text" id="produits-search">
    <div id="produits-list-container">
      <p v-if="loading">Chargement...</p>
      <p v-if="error">{{error}}</p>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";

interface Produit {
  id: number;
  nomProduit: string;
  qteEnStock: number;
}

const items = ref<Produit[]>([]);
const error = ref<string | null>(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await fetch("https://linserv-info-01/~pk203743/S401/fetchProduits.php");
    items.value = await response.json();
    console.log(items.value);
  } catch(err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue';
  } finally {
    loading.value = false;
  }
});
</script>

<style>
#produits-container{
  padding-left:10px;
}

#produits-search{
  width: 95%;
}
</style>