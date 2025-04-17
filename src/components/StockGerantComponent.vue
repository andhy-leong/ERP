<template>
  <GridItem class="stock-extended-list-container">
    <div >
      <h3>🔋Stocks</h3>
      <!-- TODO fait en sorte que cette vue montre seulement la liste des stocks en seuil critique -->
      <div id="stock-extended-item-container">
        <p v-if="loading" class="stock-extended-center-message">Chargement...</p>
        <p v-if="error" class="error stock-extended-center-message">{{ error }}</p>
        <StockExtendedItemListContentComponent
            v-for="item in items"
            :key="item.id"
            :item="item"
        />
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import StockExtendedItemListContentComponent from "@/components/StockExtendedItemListContentComponent.vue";

// Définition du type pour les items de stock
interface StockItem {
  id: number;
  nomProduit: string;
  qteEnStock: number;
  // Ajoutez ici les autres propriétés de votre item si nécessaire
}

// Création des références réactives
const items = ref<StockItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Chargement des données au montage du composant
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
.stock-extended-list-container {
  flex: 1;
  padding-left: 10px;
}

.stock-extended-center-message {
  justify-content: center;
  align-content: center;
}

#stock-extended-item-container {
  height: 100%;
}

#stock-extended-search-bar {
  width: 100%;
}
</style>