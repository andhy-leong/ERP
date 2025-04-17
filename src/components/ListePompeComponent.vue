<template>
  <GridItem>
    <div class="liste-pompe" @click="$emit('aggrandir-pompe')">
      <div v-for="(pompe, index) in listeProduit" :key="index" class="pompe">
        <div class="pompe-header">
          <div :class="['etat', getEtatClass(pompe)]"></div>
          <h3>{{ pompe.nomPompe }}</h3>
        </div>

        <div class="carburant">
          <template v-if="pompe.enFonction && pompe.enUtilisation">
            <div class="utilisation">
              <span>{{ pompe.carburantUtilise }}</span>
              <span>Prix total: {{ calculerPrix(pompe.carburantUtilise) }}€</span>
            </div>
          </template>
          <template v-else>
            <ul>
              <li v-for="carburant in pompe.listeCarburantDisponible" :key="carburant">
                {{ carburant }}
              </li>
            </ul>
          </template>
        </div>

        <button v-show="pompe.enFonction"
            :class="getButtonClass(pompe)"
            @click="gererPompe(pompe)"
        >
          {{ getButtonText(pompe) }}
        </button>
      </div>
    </div>
  </GridItem>
</template>

<script>
import GridItem from "@/components/GridItem.vue";

export default {
  components: { GridItem },
  data() {
    return {
      listeProduit: [
        { nomPompe: "Pompe 1", listeCarburantDisponible: ["SP-95", "Ethanol", "Kérozène"], enFonction: true, enUtilisation: false, carburantUtilise: null },
        { nomPompe: "Pompe 2", listeCarburantDisponible: ["Électricité"], enFonction: false, enUtilisation: false, carburantUtilise: null },
        { nomPompe: "Pompe 3", listeCarburantDisponible: ["SP-95", "Ethanol", "Kérozène"], enFonction: true, enUtilisation: true, carburantUtilise: "SP-95" },
        { nomPompe: "Pompe 4", listeCarburantDisponible: ["SP-95", "Ethanol", "Kérozène"], enFonction: true, enUtilisation: false, carburantUtilise: null },
        { nomPompe: "Pompe 5", listeCarburantDisponible: ["SP-95", "Ethanol", "Kérozène"], enFonction: false, enUtilisation: false, carburantUtilise: null },
        { nomPompe: "Pompe 6", listeCarburantDisponible: ["SP-95", "Ethanol", "Kérozène"], enFonction: false, enUtilisation: false, carburantUtilise: null }
      ]
    };
  },
  methods: {
    getButtonText(pompe) {
      return pompe.enUtilisation ? "Arrêter" : "Payer";
    },
    getButtonClass(pompe) {
      return pompe.enUtilisation ? "arreter" : "payer";
    },
    gererPompe(pompe) {
      console.log(`Action sur la pompe: ${pompe.nomPompe}`);
    },
    calculerPrix(carburant) {
      const prixCarburants = { "SP-95": 1.80, "Ethanol": 0.90, "Kérozène": 3.00, "Électricité": 0.25 };
      return prixCarburants[carburant] ? (prixCarburants[carburant] * 50).toFixed(2) : "N/A";
    },
    getEtatClass(pompe) {
      // Logique pour définir l'état de la pompe
      if (!pompe.enFonction) return "incident";
      if (pompe.enUtilisation) return "utilisation";
      return "enFonction";
    }
  }
};
</script>

<style>
.liste-pompe {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding: 10px;
  height: calc(100% - 20px);
  white-space: nowrap;
}

.liste-pompe .pompe {
  background: var(--primary-color);
  border: 2px solid var(--base-400);
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 5px;
  width: 150px;
}


.liste-pompe .pompe-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.liste-pompe .pompe-header h3 {
  margin: 5px;
}

.liste-pompe .etat {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.liste-pompe .etat.enFonction {
  background-color: var(--accent-green);
}

.liste-pompe .etat.utilisation {
  background-color: var(--accent-orange);
}

.liste-pompe .etat.incident {
  background-color: var(--accent-red);
}

.liste-pompe .carburant {
  flex-grow: 1;
  font-weight: normal;

}

.liste-pompe .carburant ul {
  padding: 0 20px;
}

.liste-pompe .utilisation {
  display: flex;
  flex-direction: column;
  gap: 5px;
}



.liste-pompe button.arreter {
  background-color: var(--accent-red);
  color: var(--primary-color);
}

.liste-pompe button.incident {
  background-color: var(--accent-orange);
  color: white;
}
</style>