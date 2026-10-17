<template>
  <GridItem>
    <div class="stocks-widget">
      <div class="stocks-header" @click="$emit('page-extend-stock')">
        <div class="s-head-left">
          <span class="icon">📦</span>
          <h3>Stocks & Niveaux</h3>
        </div>
        <span class="expand-tag">Détails ⤢</span>
      </div>

      <div class="produits-list" @click="$emit('page-extend-stock')">
        <p v-if="loading" class="stock-center-message">Chargement des stocks...</p>
        <div v-else v-for="produit in listeProduit" :key="produit.idProduit" class="produit-row">
          <div class="produit-meta">
            <span :class="['dot-etat', getEtatClass(produit)]"></span>
            <span class="produit-name">{{ produit.nomProduit }}</span>
          </div>
          <span class="produit-qty">
            {{ produit.qteEnStock }} {{ produit.unite }}
          </span>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { fetchProduits } from "@/services/erpService";

defineEmits(['page-extend-stock']);

const listeProduit = ref([]);
const loading = ref(true);

const getEtatClass = (produit) => {
  if (produit.qteEnStock <= produit.seuilCritique) return "rupture";
  if (produit.qteEnStock <= produit.seuilCritique * 1.5) return "quantite-faible";
  return "disponible";
};

onMounted(async () => {
  try {
    listeProduit.value = await fetchProduits();
  } catch (err) {
    console.error("Erreur chargement stocks", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.stocks-widget {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.stocks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
}

.s-head-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.s-head-left h3 {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
}

.expand-tag {
  font-size: 10px;
  color: #2563eb;
  background: #dbeafe;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.produits-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.produit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.produit-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.produit-name {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.produit-qty {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  white-space: nowrap;
}

.dot-etat {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-etat.disponible { background-color: #22c55e; }
.dot-etat.quantite-faible { background-color: #f59e0b; }
.dot-etat.rupture { background-color: #ef4444; }

.stock-center-message {
  text-align: center;
  font-size: 11px;
  color: #64748b;
  padding: 10px;
}
</style>