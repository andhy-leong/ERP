<template>
  <div class="grid">

    <component
        v-for="(item, index) in currentLayout"
        :is="item.type || 'div'"
        :key="index"
        v-bind="item"
        :listeProduit="listeProduit"
        @retirer-produit="retirerProduit"
        @valider-achat="ouvrirGrandeCaisse"
        @aggrandir-pompe="aggrandirPompe"
        @retour="retourVueDefault"
        @retour-grid="revenirAuGrid"
        @mise-a-jour-liste="miseAJourListeProduit"
        @page-extend-stock="ouvrirStock"
        @ouvrir-incidents="ouvrirIncidents"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import CaisseComponent from "@/components/CaisseComponent.vue";
import ListePompeExtended from "@/components/ListePompeExtended.vue";
import ListeIncidentsComponent from "@/components/ListeIncidentsComponent.vue";
import CarteEnergieComponent from "@/components/CarteEnergieComponent.vue";
import StocksComponent from "@/components/StocksComponent.vue";
import ListePompeComponent from "@/components/ListePompeComponent.vue";
import StockGerantComponent from "@/components/StockGerantComponent.vue";
import ProduitGerantComponent from "@/components/ProduitGerantComponent.vue";
import EmpGerantComponent from "@/components/EmpGerantComponent.vue";
import TableReleveComponent from "@/components/TableReleveComponent.vue";
import CarteCreditEnergieComponent from "@/components/CarteCreditEnergieComponent.vue";
import ComptabiliteGerantComponent from "@/components/ComptabiliteGerantComponent.vue";
import BilanGerantComponent from "@/components/BilanGerantComponent.vue";
import CaisseEtendueComponent from "@/components/CaisseEtendueComponent.vue";
import StockExtendedComponent from "@/components/StockExtendedComponent.vue";
import IncidentNiv1Niv2 from "@/views/IncidentNiv1Niv2.vue";

// Information de l'employé connecté
const nomEmploye = ref('');

onMounted(() => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    // Afficher le prénom et le nom au lieu de l'identifiant
    if (user.prenom && user.nom) {
      nomEmploye.value = `${user.prenom} ${user.nom}`;
    } else {
      console.log(user);
      // Fallback sur l'identifiant si nom/prénom ne sont pas disponibles
      nomEmploye.value = 'aaaaa';
    }
  }
});

const layouts = {
  default: [
    { type: CaisseComponent, width: 3, height: 4, index: 1 },
    { type: ListePompeComponent, width: 3, height: 1, index: 4 },
    { type: ListeIncidentsComponent, width: 1, height: 3, index: 10 },
    { type: CarteEnergieComponent, width: 2, height: 2, index: 11 },
    { type: StocksComponent, width: 2, height: 1, index: 23 },
  ],
  expandedA: [
    { type: ListePompeExtended, width: 6, height: 4, index: 1 }
  ],
  caisseEtendueLayout: [
    { type: CaisseEtendueComponent, width: 6, height: 4, index: 1 }
  ],
  gerant: [
    {type: CaisseComponent, width: 3, height: 2, index:1},
    {type: ListePompeComponent, width: 3, height: 1,index: 4},
    {type: StockGerantComponent, width:2, height: 1,index:10},
    {type: EmpGerantComponent,width:1,height: 1,index:12},
    {type:TableReleveComponent,width:2,height:2,index:13},
    {type: ListeIncidentsComponent, width: 1, height: 2,index:15},
    {type:ProduitGerantComponent,width:2,height:1,index:16},
    {type:CarteCreditEnergieComponent,width:1,height:1,index:18},
    {type:ComptabiliteGerantComponent,width:2,height:1,index:22},
    {type:BilanGerantComponent,width:1,height: 1,index:24}
  ],
  stocksExtended: [
    {type: StockExtendedComponent, width:6, height:4,index: 1}
  ],
  incidentsExtended: [
    {type: IncidentNiv1Niv2, width:6, height:4,index: 1}
  ]
};

const currentLayout = ref(layouts.default);
const listeProduit = ref([]);

const miseAJourListeProduit = (nouvelleListe: any[]) => {
  listeProduit.value = [...nouvelleListe];
};

//  const getComponentStyle = (item) => {
//    if (item.fullWidth) {
//      return {
//        gridColumn: '1 / -1',
//        gridRow: 'span ' + item.height,
//        width: '100%'
//      };
//  }

//  return {
//    gridColumn: 'span ' + item.width,
//    gridRow: 'span ' + item.height
//  };
// };

const retirerProduit = (index: number) => {
  listeProduit.value.splice(index, 1);
};

const ouvrirGrandeCaisse = () => {
  currentLayout.value = layouts.caisseEtendueLayout;
};

const aggrandirPompe = () => {
  console.log("Aggrandissement de la pompe...");
  currentLayout.value = layouts.expandedA;
};

const retourVueDefault = () => {
  currentLayout.value = layouts.default;
};

const revenirAuGrid = (nouvelleListe: any[]) => {
  listeProduit.value = [...nouvelleListe];
  currentLayout.value = layouts.default;
};
const ouvrirStock = () => {
  currentLayout.value = layouts.stocksExtended;
}

const ouvrirIncidents = () => {
  currentLayout.value = layouts.incidentsExtended;
};
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 40px;
}

.header-right {
  font-weight: 500;
  padding: 5px 10px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 10px;
  padding: 0;
  flex-grow: 1;
  height: calc(100vh - 100px);
    width: 100%;
}

.expanded-layout {
  grid-template-columns: 1fr;
  padding: 0;
  margin: 0;
  max-width: 100%;
}

.expanded-layout > :deep(*) {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
