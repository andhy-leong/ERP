<template>
  <GridItem id="emp-container">
    <h3>👤Employés</h3>
    <div id="emp-list-container" >
      <div class="emp-item" v-for="(emp,index) in employes" :key="index">
        <div class="emp-item-icon-name">
          <img :src="emp.img" alt="icon utilisateur" width="35px" height="35px" />
          <p>{{emp.nom +" "+ emp.prenom}}</p>
        </div>
        <p class="emp-item-horaire">{{emp.heureDebutTravail}} - {{emp.heureFinTravail}}</p>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GridItem from "@/components/GridItem.vue";
import UtilisateurIcon from "@/assets/utilisateur.png";

interface Employe {
  nom: string;
  prenom: string;
  heureDebutTravail: string;
  heureFinTravail: string;
  img: string;
}

const employes = ref<Employe[]>([
  {nom: "Doe", prenom: "John", heureDebutTravail: "8:00AM", heureFinTravail: "12:00AM", img: UtilisateurIcon},
  {nom: "Doe", prenom: "John", heureDebutTravail: "8:00AM", heureFinTravail: "12:00AM", img: UtilisateurIcon},
]);
</script>

<style>
#emp-container{
  padding-left:5px;
  overflow-y: auto;
}

.emp-item{
  background-color: white;
  border-radius: 20px;
  padding:15px;
  margin-bottom: 5px;
  border: solid 1px black;
  width:87%;
}

.emp-item-icon-name{
  display: flex;
  flex-direction: row;
  row-gap: 10px;
}

.emp-item-horaire{
  color:gray;
}


</style>