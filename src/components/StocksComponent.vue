<template>
  <GridItem>
    <div class="stocks">
      <h2 @click="$emit('page-extend-stock')">Stocks</h2>
      <div class="produits-list">
        <p v-if="loading" class="stock-center-message">Chargement...</p>
        <p v-if="error" class="error stock-center-message">{{ error }}</p>
        <div v-for="(produit, index) in listeProduit" :key="index" class="produit">
          <div class="produit-header">
            <div :class="['etat', getEtatClass(produit)]"></div>
            <span class="produit-name">{{ produit.nomProduit }}</span>
          </div>
          <div class="produit-status">
            <span>Stock: {{ produit.qteEnStock }}{{ produit.unite !== 'unite' ? ' ' + produit.unite : '' }}</span>
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";

const listeProduit = ref([]);
const loading = ref(true);
const error = ref(null);

const getEtatClass = (produit) => {
  if (produit.unite === 'unite') {
    if (produit.qteEnStock <= 0) return "rupture";
    if (produit.qteEnStock < 5) return "quantite-faible";
    return "disponible";
  } else if (produit.unite === 'litre') {
    if (produit.qteEnStock <= 0) return "rupture";
    if (produit.qteEnStock < 50) return "quantite-faible";
    return "disponible";
  } else if (produit.unite === 'kg') {
    if (produit.qteEnStock <= 0) return "rupture";
    if (produit.qteEnStock < 10) return "quantite-faible";
    return "disponible";
  }
  // Pour les autres unités, on utilise la même logique que pour les unités
  if (produit.qteEnStock <= 0) return "rupture";
  if (produit.qteEnStock < 5) return "quantite-faible";
  return "disponible";
};

onMounted(async () => {
  try {
    const response = await fetch("https://linserv-info-01/~pk203743/S401/fetchProduits.php");
    listeProduit.value = await response.json();
    console.log(listeProduit.value);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style>
.stocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  padding: 0 10px;
}

.stocks label {
  margin-top: 10px;
  margin-left: 10px;
  font-weight: bold;
}

.stocks .produits-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex-grow: 1;
  max-height: 100%;
  height: 0;
}

.stocks .produit {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  padding: 10px;
  border: 2px solid var(--base-400);
  border-radius: 8px;
  background-color: var(--primary-color);
  margin-top: 2px;
}

.stocks .produit-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stocks .produit-name {
  font-weight: bold;
  font-size: 16px;
}

.stocks .produit-status {
  font-size: 12px;
}

.stocks .etat {
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background-color: var(--primary-color);
}

.stocks .etat.disponible {
  background-color: var(--accent-green);
}

.stocks .etat.quantite-faible {
  background-color: var(--accent-orange);
}

.stocks .etat.rupture {
  background-color: var(--accent-red);
}

.stock-center-message {
  text-align: center;
  margin-top: 20px;
}

.error {
  color: red;
}
</style>