<template>
  <GridItem class="info-container">
    <StockExtendedItemListComponent @select="handleSelect" />
    <StockExtendedItemDetailComponent :data="selectedData" />
  </GridItem>
</template>

<script setup>
import { ref } from 'vue';
import StockExtendedItemListComponent from "@/components/StockExtendedItemListComponent.vue";
import StockExtendedItemDetailComponent from "@/components/StockExtendedItemDetailComponent.vue";
import GridItem from "@/components/GridItem.vue";

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
  flex-direction: row;
}

.info-container > * {
  margin: 5px;
  border-radius: 25px;
}
</style>