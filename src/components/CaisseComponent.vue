<template>
  <GridItem>
    <div class="caisse">
      <div class="liste-produit">
        <div v-for="(produit, index) in produitsLocaux" :key="index" class="produit">
          <span class="nom">{{ produit.nomProduit }} x{{produit.quantite}}</span>
          <span class="prix">{{ produit.prix.toFixed(2)*produit.quantite }}€</span>
          <button v-if="!encaissementActive" @click="retirerProduit(index)" class="retirer">Retirer</button>
        </div>
      </div>

      <div class="search">
        <input
            type="search"
            placeholder="Search"
            class="search-bar"
            v-model="searchQuery"
            @keyup.enter="rechercherProduit"
            :disabled="paiements.length > 0 || encaissementActive"
            :class="{ 'search-bar-disabled': paiements.length > 0 || encaissementActive }"
        />
      </div>

      <div class="total">
        <div class="totaux">
          <label>Prix total : {{ totalPrix.toFixed(2) }}€</label>

          <div v-if="encaissementActive">
            <label class="reste">Reste à payer : {{ montantRestant.toFixed(2) }}€</label>
          </div>

          <div v-for="(paiement, index) in paiements" :key="index" class="paiement-ligne">
            <label class="montant-paye">{{ paiement.mode }} : -{{ paiement.montant.toFixed(2) }}€</label>
          </div>
        </div>

        <button v-if="!isCaisseExtended && !encaissementActive" @click="$emit('valider-achat')" class="valider">Valider ></button>
        <button v-if="isCaisseExtended && !encaissementActive" @click="$emit('encaisser')" class="encaisser" :disabled="produitsLocaux.length === 0">Encaisser</button>
      </div>
    </div>
  </GridItem>
</template>

<script>
import GridItem from "@/components/GridItem.vue";

export default {
  components: { GridItem },
  props: {
    listeProduit: {
      type: Array,
      required: false
    },
    isCaisseExtended: Boolean,
    encaissementActive: Boolean,
    montantRestant: Number,
    paiements: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: "",
      produitsDisponibles: [],
      produitsLocaux: [...this.listeProduit]
    };
  },
  watch: {
    listeProduit: {
      handler(newValue) {
        this.produitsLocaux = [...newValue];
      },
      deep: true
    }
  },
  async mounted() {
    try {
      const response = await fetch("https://linserv-info-01/~rb306608/S401/fetchProduitCaisse.php");
      const data = await response.json();
      console.log(data);
      this.produitsDisponibles = data.map(produit => ({
        idProduit: produit.idProduit,
        nomProduit: produit.nomProduit,
        codeProduit: produit.codeProduit,
        prix: produit.prix,
      }));

      console.log("Produits disponibles :", this.produitsDisponibles);
    } catch (err) {
      console.error("Erreur lors de la récupération des produits:", err);
    }
  },
  computed: {
    totalPrix() {
      return this.produitsLocaux.reduce((sum, produit) => sum + produit.prix * produit.quantite, 0);
    },
  },
  methods: {
    rechercherProduit() {
      const produitTrouve = this.produitsDisponibles.find(produit =>
          produit.codeProduit.toString().includes(this.searchQuery)
      );

      if (produitTrouve) {
        this.ajouterOuMettreAJourProduit(produitTrouve);
      } else {
        console.warn("Produit non trouvé !");
      }

      this.searchQuery = "";
    },

    ajouterOuMettreAJourProduit(produit) {
      const indexProduit = this.produitsLocaux.findIndex(p => p.codeProduit === produit.codeProduit);

      if (indexProduit !== -1) {
        this.produitsLocaux[indexProduit].quantite++;
      } else {
        this.produitsLocaux.push({ ...produit, quantite: 1, idProduit: produit.idProduit });
      }

      this.$emit("mise-a-jour-liste", this.produitsLocaux);
    },
    retirerProduit(index) {
      this.produitsLocaux.splice(index, 1);

      this.$emit('mise-a-jour-liste', this.produitsLocaux);
    }
  }
};
</script>

<style>
.caisse {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.caisse .liste-produit {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--base-900);
  margin: 10px;
}

.caisse .produit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--base-600);
}

.produit button {
  background-color: var(--base-200);
  color: var(--base-900);
  border: 1px solid var(--base-900);
}

.caisse .nom {
  flex: 1;
}

.caisse .prix {
  margin-right: 10px;
}

.caisse .search {
  margin: 10px;
}

.caisse .search-bar {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

.caisse .search-bar-disabled {
  background-color: #f0f0f0;
  color: #a0a0a0;
  cursor: not-allowed;
  border: 1px solid #ccc;
}

.caisse .total {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid var(--base-900);
  background: var(--primary-color);
  margin: 0 10px 10px;
}

.total button {
  padding: 20px 30px;
}

.caisse .totaux {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.produit button {
  background-color: var(--base-200);
  color: var(--base-900);
  border: 1px solid var(--base-900);
}

.caisse .total {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid var(--base-900);
  background: var(--primary-color);
  margin: 0 10px 10px;
}

.caisse .paiement-ligne {
  color: #2D3648; /* Couleur pour les paiements */
  margin-top: 5px;
}

.caisse .montant-paye {
  color: #25A249;
}

.caisse .reste {
  color: #34AFF7;
}

.caisse .encaisser:disabled {
  background-color: #E0E0E0;
  color: #A0A0A0;
  cursor: not-allowed;
}
</style>
