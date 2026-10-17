<template>
  <div class="grid" :class="{ 'expanded-mode': isExpanded }">
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
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
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

const props = defineProps<{
  mode?: 'caissier' | 'gerant';
}>();

const route = useRoute();
const nomEmploye = ref('');

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
    { type: CaisseComponent, width: 3, height: 2, index: 1 },
    { type: ListePompeComponent, width: 3, height: 1, index: 4 },
    { type: StockGerantComponent, width: 2, height: 1, index: 10 },
    { type: EmpGerantComponent, width: 1, height: 1, index: 12 },
    { type: TableReleveComponent, width: 2, height: 2, index: 13 },
    { type: ListeIncidentsComponent, width: 1, height: 2, index: 15 },
    { type: ProduitGerantComponent, width: 2, height: 1, index: 16 },
    { type: CarteCreditEnergieComponent, width: 1, height: 1, index: 18 },
    { type: ComptabiliteGerantComponent, width: 2, height: 1, index: 22 },
    { type: BilanGerantComponent, width: 1, height: 1, index: 24 }
  ],
  stocksExtended: [
    { type: StockExtendedComponent, width: 6, height: 4, index: 1 }
  ],
  incidentsExtended: [
    { type: IncidentNiv1Niv2, width: 6, height: 4, index: 1 }
  ]
};

const currentBaseLayout = computed(() => {
  if (route.path === '/gerant' || props.mode === 'gerant') {
    return layouts.gerant;
  }
  return layouts.default;
});

const currentLayout = ref(layouts.default);
const listeProduit = ref<any[]>([]);

const isExpanded = computed(() => {
  return currentLayout.value === layouts.expandedA ||
         currentLayout.value === layouts.caisseEtendueLayout ||
         currentLayout.value === layouts.stocksExtended ||
         currentLayout.value === layouts.incidentsExtended;
});

const syncLayout = () => {
  currentLayout.value = currentBaseLayout.value;
};

watch(() => route.path, () => {
  syncLayout();
});

onMounted(() => {
  syncLayout();
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.prenom && user.nom) {
        nomEmploye.value = `${user.prenom} ${user.nom}`;
      } else {
        nomEmploye.value = user.identifiant || 'Collaborateur';
      }
    } catch {
      nomEmploye.value = 'Collaborateur';
    }
  }
});

const miseAJourListeProduit = (nouvelleListe: any[]) => {
  listeProduit.value = [...nouvelleListe];
};

const retirerProduit = (index: number) => {
  listeProduit.value.splice(index, 1);
};

const ouvrirGrandeCaisse = () => {
  currentLayout.value = layouts.caisseEtendueLayout;
};

const aggrandirPompe = () => {
  currentLayout.value = layouts.expandedA;
};

const retourVueDefault = () => {
  currentLayout.value = currentBaseLayout.value;
};

const revenirAuGrid = (nouvelleListe: any[]) => {
  if (nouvelleListe) {
    listeProduit.value = [...nouvelleListe];
  }
  currentLayout.value = currentBaseLayout.value;
};

const ouvrirStock = () => {
  currentLayout.value = layouts.stocksExtended;
};

const ouvrirIncidents = () => {
  currentLayout.value = layouts.incidentsExtended;
};
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(4, 1fr);
  gap: 8px;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
}

.grid.expanded-mode {
  display: flex;
  height: 100%;
  width: 100%;
}

.grid.expanded-mode > :deep(*) {
  width: 100% !important;
  height: 100% !important;
}
</style>
