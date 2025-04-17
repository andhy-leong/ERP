<template>
  <GridItem id="comptabilite-gerant-container">
    <h3>Comptabilité</h3>
    <div id="comptabilite-gerant-content">
      <div id="comptabilite-gerant-chiffre">
        <div id="comptabilite-gerant-chiffre-affaire" class="comptabilite-gerant">
          <p class="comptabilite-gerant-text-presentation">CHIFFRE D'AFFAIRES</p>
          <p class="comptabilite-gerant-montant">{{ chiffreAffaires }}€</p>
        </div>
        <div id="comptabilite-gerant-pertes">
          <p class="comptabilite-gerant-text-presentation" >PERTES</p>
          <p class="comptabilite-gerant-montant">{{ pertes }}€</p>
        </div>
        <div id="comptabilite-gerant-tresorerie">
          <p class="comptabilite-gerant-text-presentation">TRESORERIE</p>
          <p class="comptabilite-gerant-montant">{{ tresorerie }}€</p>
        </div>
      </div>
      <div id="comptabilite-gerant-ajout-perte-container">
        <input type="text" placeholder="Search..." id="comptabilite-gerant-recherche" />
        <input type="text" placeholder="amout..." id="comptabilite-gerant-montant-perte" v-model="nouvellePerte"/>
        <button id="comptabilite-gerant-validation-button" @click="ajouterPerte">Ajouter perte</button>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GridItem from "@/components/GridItem.vue";

const chiffreAffaires = ref(150000000);
const pertes = ref(3.01);
const tresorerie = ref(3000000000);
const nouvellePerte = ref('');

const ajouterPerte = () => {
  const montant = parseFloat(nouvellePerte.value);
  if (!isNaN(montant)) {
    pertes.value += montant;
    nouvellePerte.value = '';
  }
};
</script>

<style>
#comptabilite-gerant-container {
  padding-left: 10px;
}

#comptabilite-gerant-content{
  background-color: white;
  height: 65%;
  width:97% ;
  border-radius:5px;
  padding: 5px;
}

#comptabilite-gerant-chiffre{
  display:flex;
  flex-direction: row;
  gap: 10px;
}

/** TODO faire en sorte que ça ressemble à la maquette après **/
#comptabilite-gerant-ajout-perte-container{
  display: flex;
  flex-direction: row;
  gap: 10px;
  height: 50px;
}

.comptabilite-gerant-text-presentation{
  font-size: smaller;
  color: grey;
}

#comptabilite-gerant-montant-perte {
  width: 100px;
}
</style>