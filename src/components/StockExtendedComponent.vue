<template>
  <GridItem class="info-container">
    <div class="stock-extended-wrapper">
      <div class="top-nav-row">
        <button class="btn-retour-stock" @click="$emit('retour')">← Retour à la vue d'ensemble</button>
        <h2>Gestion & Fiche Technique des Stocks</h2>
      </div>
      <div class="panels-split">
        <StockExtendedItemListComponent @select="handleSelect" />
        <StockExtendedItemDetailComponent :data="selectedData" />
      </div>
    </div>
  </GridItem>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import StockExtendedItemListComponent from "@/components/StockExtendedItemListComponent.vue";
import StockExtendedItemDetailComponent from "@/components/StockExtendedItemDetailComponent.vue";
import GridItem from "@/components/GridItem.vue";

defineEmits(['retour']);

const selectedData = ref(null);

const handleSelect = (data) => {
  selectedData.value = data;
};
</script>

<style scoped>
.info-container {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 12px;
  background: #f1f5f9;
  box-sizing: border-box;
}

.stock-extended-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  gap: 12px;
}

.top-nav-row {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.top-nav-row h2 {
  margin: 0;
  font-size: 16px;
  color: #0f172a;
}

.btn-retour-stock {
  background: #1e293b;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
}

.panels-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}
</style>