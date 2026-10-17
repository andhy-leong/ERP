<template>
  <div id="stock-extended-list-container">
    <div class="list-head">
      <h3>Inventaire Global</h3>
      <span class="count-badge">{{ filteredItems.length }} articles</span>
    </div>

    <input 
      type="search" 
      v-model="searchQuery" 
      placeholder="Rechercher produit..." 
      id="stock-extended-search-bar" 
    />

    <div id="stock-extended-item-container">
      <p v-if="loading" class="stock-extended-center-message">Chargement...</p>
      <div v-else-if="filteredItems.length > 0">
        <StockExtendedItemListContentComponent
          v-for="item in filteredItems"
          :key="item.idProduit"
          :item="item"
          @select="sendData"
        />
      </div>
      <p v-else class="stock-extended-center-message">Aucun article trouvé</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineEmits } from 'vue';
import StockExtendedItemListContentComponent from "@/components/StockExtendedItemListContentComponent.vue";
import { fetchProduits } from "@/services/erpService";

const items = ref([]);
const loading = ref(true);
const searchQuery = ref('');

const emit = defineEmits(['select']);

const sendData = (item) => {
  emit("select", item);
};

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return items.value;
  const q = searchQuery.value.toLowerCase().trim();
  return items.value.filter(i => 
    i.nomProduit.toLowerCase().includes(q) ||
    i.categorie?.toLowerCase().includes(q) ||
    i.codeProduit?.toString().includes(q)
  );
});

onMounted(async () => {
  try {
    items.value = await fetchProduits();
    if (items.value.length > 0) {
      sendData(items.value[0]);
    }
  } catch (err) {
    console.error("Erreur chargement stocks", err);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
#stock-extended-list-container {
  flex: 1;
  background-color: #ffffff;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  display: flex;
  flex-direction: column;
}

.list-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.list-head h3 {
  margin: 0;
  font-size: 15px;
  color: #1e293b;
}

.count-badge {
  font-size: 11px;
  color: #64748b;
  background: #f1f5f9;
  padding: 2px 8px;
  border-radius: 10px;
}

#stock-extended-search-bar {
  width: 100%;
  padding: 8px 10px;
  margin-bottom: 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12px;
}

#stock-extended-item-container {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stock-extended-center-message {
  text-align: center;
  font-size: 12px;
  color: #64748b;
  padding: 20px;
}
</style>