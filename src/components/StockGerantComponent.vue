<template>
  <GridItem class="stock-gerant-card">
    <div class="stock-content">
      <div class="stock-header">
        <div class="s-title">
          <span class="icon">⚠️</span>
          <h3>Alertes Stocks Critiques</h3>
        </div>
        <span class="critical-badge">{{ criticalItems.length }} en alerte</span>
      </div>

      <div class="stock-items-scroll">
        <p v-if="loading" class="center-msg">Vérification des niveaux...</p>
        <p v-else-if="criticalItems.length === 0" class="center-msg dispo-ok">
          ✅ Tous les stocks sont au-dessus du seuil d'alerte.
        </p>
        <div v-else class="items-list">
          <div v-for="item in criticalItems" :key="item.idProduit" class="critical-item-row">
            <div class="crit-left">
              <span class="dot-red"></span>
              <div>
                <strong>{{ item.nomProduit }}</strong>
                <small>Seuil mini: {{ item.seuilCritique }} {{ item.unite }}</small>
              </div>
            </div>
            <div class="crit-right">
              <span class="qte-restante">{{ item.qteEnStock }} {{ item.unite }}</span>
              <button class="btn-reappro" @click="reapprovisionner(item)">+ Réappro</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { fetchProduits, updateStockProduit } from "@/services/erpService";
import { ProduitData } from "@/data/mockDatabase";

const items = ref<ProduitData[]>([]);
const loading = ref(true);

const loadData = async () => {
  loading.value = true;
  try {
    items.value = await fetchProduits();
  } catch (err) {
    console.error("Erreur chargement stocks gerant", err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});

const criticalItems = computed(() => {
  return items.value.filter(item => item.qteEnStock <= item.seuilCritique);
});

const reapprovisionner = async (item: ProduitData) => {
  const ajout = item.unite === 'litre' ? 2000 : 20;
  await updateStockProduit(item.idProduit, ajout);
  await loadData();
};
</script>

<style scoped>
.stock-gerant-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.stock-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.s-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.s-title h3 {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
}

.critical-badge {
  font-size: 10px;
  font-weight: 700;
  color: #b91c1c;
  background: #fee2e2;
  padding: 2px 6px;
  border-radius: 4px;
}

.stock-items-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px;
}

.center-msg {
  text-align: center;
  font-size: 12px;
  color: #64748b;
  padding: 16px;
}

.dispo-ok {
  color: #16a34a;
  font-weight: 600;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.critical-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 6px;
}

.crit-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.crit-left strong {
  display: block;
  font-size: 12px;
  color: #9f1239;
}

.crit-left small {
  font-size: 10px;
  color: #881337;
}

.dot-red {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e11d48;
}

.crit-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qte-restante {
  font-size: 11px;
  font-weight: 800;
  color: #be123c;
}

.btn-reappro {
  background: #0284c7;
  color: white;
  padding: 3px 8px;
  font-size: 10px;
  border-radius: 4px;
  cursor: pointer;
}
</style>