<template>
  <GridItem id="bilan-gerant-container">
    <h3>📁 Bilans</h3>
    <!-- Ajouter un v-for pour les bilans -->
    <div id="bilan-list-container" >
      <div class="bilan-info-container" v-for="(bilan,index) in bilans" :key="index">
        <img :src="bilan.img" alt="Image de fichier bilan" width="45px" height="45px"/>
        <h4>{{bilan.name}}</h4>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GridItem from "@/components/GridItem.vue";
import documentImg from "../assets/document.png";

interface Bilan {
  name: string;
  img: string;
}

const bilans = ref<Bilan[]>([
  {name: "Bilan n°X", img: documentImg},
  {name: "Bilan n°X", img: documentImg},
  {name: "Bilan n°X", img: documentImg},
  {name: "Bilan n°X", img: documentImg},
  {name: "Bilan n°X", img: documentImg},
]);
</script>

<style>
#bilan-gerant-container{
  padding-left: 10px;
  overflow-y: auto;
}

#bilan-list-container{
  column-gap: 50px;
}

.bilan-info-container{
  background-color: white;
  padding-left: 10px;
  margin-bottom: 5px;
  cursor: pointer;
  border-radius: 5px;
  border: solid 1px black;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
  height:60px;
  width:95%;
}

.bilan-info-container:hover {
  background-color: #ddd;
}

</style>