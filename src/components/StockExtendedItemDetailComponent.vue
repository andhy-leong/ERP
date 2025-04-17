<template>
  <div id="stock-extended-detail-parent-container">
    <div v-if="data">
      <p v-if="data">{{ data.nomProduit }}</p>
      <div id="stock-extended-detail-container">

        <div id="stock-extended-detail-horizontal-info-container">
          <div id="stock-extended-detail-unity">
            <p>Stock</p>
            <p>{{ data.qteEnStock }}{{ data.unite !== 'unite' ? ' ' + data.unite : '' }}</p>
          </div>
          <div id="stock-extended-detail-price">
            <p>Prix de vente</p>
            <p>{{ data.prix +"€"}}{{ data.unite !== 'unite' ? '/' + data.unite : '' }}</p>
          </div>
          <div id="stock-extended-detail-price-buy">
            <p>Prix achat</p>
            <p>{{ data.prixAchat+"€" }}{{ data.unite !== 'unite' ? '/' + data.unite : '' }}</p>
          </div>
        </div>

        <div id="stock-extended-detail-description">
          <h3>Description</h3>
          <p>{{data.description}}</p>
        </div>

      </div>
    </div>
    <p v-else>Cliquer sur un élément de la liste de gauche</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

defineProps({
  data: Object
})
</script>

<style scoped>
#stock-extended-detail-parent-container {
  flex: 1;
  background-color: #EDF0F7;
  display: flex;
  padding-left: 20px;
  flex-direction: column;
  border: 2px solid black;
}

#stock-extended-detail-horizontal-info-container {
  display: flex;
  flex-direction: row;
  gap:50px;

}

#stock-extended-detail-container {
  background: #FFFFFF;
  border-radius: 10px;
  padding:5px;
  height: 100%;
}
</style>
