<template>
  <div id="stock-extended-list-container">

    <h3>🔋Stocks</h3>
    <input type="text" id="stock-extended-search-bar" />

    <div id="stock-extended-item-container">
      <p v-if="loading" class="stock-extended-center-message">Chargement...</p>
      <p v-if="error" class="error stock-extended-center-message">{{ error }}</p>

      <div v-if="items.length > 0">
        <StockExtendedItemListContentComponent
            v-for="item in items"
            :key="item.id"
            :item="item"
            @select="sendData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue';
import StockExtendedItemListContentComponent from "@/components/StockExtendedItemListContentComponent.vue";

const items = ref([]);
const loading = ref(true);
const error = ref(null);

const emit = defineEmits(['select']);

const sendData = (item) => {
  emit("select", item);
};

onMounted(async () => {
  try {
    const response = await fetch("https://linserv-info-01/~pk203743/S401/fetchProduits.php");
    items.value = await response.json();
    console.log(items.value);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
#stock-extended-list-container {
  flex: 1;
  background-color: #EDF0F7;
  padding: 10px;
  border: 2px solid black;
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
  margin-bottom: 20px;
}
</style>