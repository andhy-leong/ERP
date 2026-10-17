<template>
  <GridItem>
    <div class="caisse">
      <div class="caisse-header">
        <div class="caisse-title">
          <span class="icon">🛒</span>
          <h3>Caisse Enregistreuse</h3>
        </div>
        <span class="article-count">{{ produitsLocaux.length }} article(s)</span>
      </div>

      <div class="liste-produit">
        <div v-if="produitsLocaux.length === 0" class="panier-vide">
          <span class="panier-vide-icon">🏷️</span>
          <p>Panier vide</p>
          <small>Recherchez un produit par nom ou code barre ci-dessous</small>
        </div>

        <div v-for="(produit, index) in produitsLocaux" :key="index" class="produit">
          <div class="produit-info">
            <span class="nom">{{ produit.nomProduit }}</span>
            <span class="unitaire">{{ produit.prix.toFixed(2) }}€ / {{ produit.unite || 'unité' }}</span>
          </div>

          <div class="quantite-controls" v-if="!encaissementActive">
            <button @click="diminuerQuantite(index)" class="btn-qte">-</button>
            <span class="qte-badge">{{ produit.quantite }}</span>
            <button @click="augmenterQuantite(index)" class="btn-qte">+</button>
          </div>
          <span v-else class="qte-badge">x{{ produit.quantite }}</span>

          <span class="prix">{{ (produit.prix * produit.quantite).toFixed(2) }}€</span>

          <button v-if="!encaissementActive" @click="retirerProduit(index)" class="retirer" title="Supprimer">
            ✕
          </button>
        </div>
      </div>

      <div class="search">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input
            type="search"
            placeholder="Rechercher produit (nom, carburant ou code)..."
            class="search-bar"
            v-model="searchQuery"
            @keyup.enter="rechercherProduit"
            :disabled="paiements.length > 0 || encaissementActive"
            :class="{ 'search-bar-disabled': paiements.length > 0 || encaissementActive }"
          />
          <button 
            type="button" 
            class="btn-search-add" 
            @click="rechercherProduit"
            :disabled="!searchQuery.trim() || paiements.length > 0 || encaissementActive"
          >
            Ajouter
          </button>
        </div>

        <!-- Suggestions rapides -->
        <div class="quick-picks" v-if="produitsDisponibles.length > 0 && !encaissementActive && !isCaisseExtended">
          <span 
            v-for="p in produitsDisponibles.slice(0, 4)" 
            :key="p.idProduit"
            class="quick-pick-tag"
            @click="ajouterOuMettreAJourProduit(p)"
          >
            + {{ p.nomProduit.split(' ')[0] }}
          </span>
        </div>
      </div>

      <div class="total">
        <div class="totaux">
          <div class="ligne-total-principal">
            <span class="total-label">Total :</span>
            <span class="total-montant">{{ totalPrix.toFixed(2) }}€</span>
          </div>

          <div v-if="encaissementActive" class="ligne-reste">
            <label class="reste">Reste : {{ montantRestant.toFixed(2) }}€</label>
          </div>

          <div v-for="(paiement, index) in paiements" :key="index" class="paiement-ligne">
            <label class="montant-paye">{{ paiement.mode }} : -{{ paiement.montant.toFixed(2) }}€</label>
          </div>
        </div>

        <div class="actions-caisse">
          <button 
            v-if="!isCaisseExtended && !encaissementActive" 
            @click="$emit('valider-achat')" 
            class="valider"
            :disabled="produitsLocaux.length === 0"
          >
            Encaisser →
          </button>
          <button 
            v-if="isCaisseExtended && !encaissementActive" 
            @click="$emit('encaisser')" 
            class="encaisser" 
            :disabled="produitsLocaux.length === 0"
          >
            Paiement
          </button>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script>
import GridItem from "@/components/GridItem.vue";
import { fetchProduits } from "@/services/erpService";

export default {
  components: { GridItem },
  props: {
    listeProduit: {
      type: Array,
      default: () => []
    },
    isCaisseExtended: Boolean,
    encaissementActive: Boolean,
    montantRestant: {
      type: Number,
      default: 0
    },
    paiements: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: "",
      produitsDisponibles: [],
      produitsLocaux: [...(this.listeProduit || [])]
    };
  },
  watch: {
    listeProduit: {
      handler(newValue) {
        if (newValue) {
          this.produitsLocaux = [...newValue];
        }
      },
      deep: true
    }
  },
  async mounted() {
    try {
      const data = await fetchProduits();
      this.produitsDisponibles = data.map(produit => ({
        idProduit: produit.idProduit || produit.id,
        nomProduit: produit.nomProduit,
        codeProduit: produit.codeProduit,
        prix: produit.prix,
        unite: produit.unite
      }));
    } catch (err) {
      console.error("Erreur lors de la récupération des produits de caisse:", err);
    }
  },
  computed: {
    totalPrix() {
      return this.produitsLocaux.reduce((sum, produit) => sum + (produit.prix * produit.quantite), 0);
    },
  },
  methods: {
    rechercherProduit() {
      if (!this.searchQuery.trim()) return;

      const query = this.searchQuery.toLowerCase().trim();
      
      // Recherche par code produit exact ou correspondance partielle sur le nom
      const produitTrouve = this.produitsDisponibles.find(produit =>
        produit.codeProduit.toString() === query ||
        produit.nomProduit.toLowerCase().includes(query)
      );

      if (produitTrouve) {
        this.ajouterOuMettreAJourProduit(produitTrouve);
      } else {
        alert(`Aucun produit trouvé pour "${this.searchQuery}"`);
      }

      this.searchQuery = "";
    },

    ajouterOuMettreAJourProduit(produit) {
      const indexProduit = this.produitsLocaux.findIndex(p => p.idProduit === produit.idProduit);

      if (indexProduit !== -1) {
        this.produitsLocaux[indexProduit].quantite++;
      } else {
        this.produitsLocaux.push({ 
          ...produit, 
          quantite: 1, 
          idProduit: produit.idProduit 
        });
      }

      this.$emit("mise-a-jour-liste", this.produitsLocaux);
    },

    augmenterQuantite(index) {
      this.produitsLocaux[index].quantite++;
      this.$emit("mise-a-jour-liste", this.produitsLocaux);
    },

    diminuerQuantite(index) {
      if (this.produitsLocaux[index].quantite > 1) {
        this.produitsLocaux[index].quantite--;
      } else {
        this.retirerProduit(index);
        return;
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

<style scoped>
.caisse {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.caisse-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.caisse-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.caisse-title h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.article-count {
  font-size: 11px;
  font-weight: 600;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 8px;
  border-radius: 12px;
}

.caisse .liste-produit {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  margin: 0;
  background: #ffffff;
}

.panier-vide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  text-align: center;
  padding: 20px;
}

.panier-vide-icon {
  font-size: 28px;
  margin-bottom: 6px;
}

.panier-vide p {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.panier-vide small {
  font-size: 11px;
  margin-top: 4px;
}

.caisse .produit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  gap: 8px;
}

.produit-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.caisse .nom {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.produit-info .unitaire {
  font-size: 10px;
  color: #64748b;
}

.quantite-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.btn-qte {
  width: 24px;
  height: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e2e8f0;
  color: #1e293b;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
}

.qte-badge {
  font-size: 12px;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.caisse .prix {
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  min-width: 55px;
  text-align: right;
}

.caisse .retirer {
  background: transparent;
  color: #94a3b8;
  border: none;
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.caisse .retirer:hover {
  color: #ef4444;
  background: #fee2e2;
}

.caisse .search {
  padding: 8px 10px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.search-input-wrapper {
  display: flex;
  gap: 6px;
  align-items: center;
}

.search-icon {
  font-size: 13px;
}

.caisse .search-bar {
  flex: 1;
  padding: 7px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 12px;
  background: #ffffff;
}

.btn-search-add {
  padding: 7px 12px;
  font-size: 12px;
  background: #2563eb;
  color: white;
  border-radius: 6px;
}

.btn-search-add:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

.quick-picks {
  display: flex;
  gap: 6px;
  margin-top: 6px;
  overflow-x: auto;
}

.quick-pick-tag {
  font-size: 10px;
  padding: 3px 8px;
  background: #e2e8f0;
  color: #334155;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
}

.quick-pick-tag:hover {
  background: #cbd5e1;
}

.caisse .total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-top: 2px solid #e2e8f0;
  background: #0f172a;
  color: #ffffff;
}

.ligne-total-principal {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
}

.total-montant {
  font-size: 20px;
  font-weight: 800;
  color: #ffffff;
}

.caisse .reste {
  color: #38bdf8;
  font-size: 12px;
}

.caisse .paiement-ligne {
  font-size: 11px;
  color: #4ade80;
}

.actions-caisse button {
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
}

.actions-caisse .valider {
  background: #25a249;
  color: white;
}

.actions-caisse .valider:hover:not(:disabled) {
  background: #1e833a;
}

.actions-caisse .valider:disabled,
.actions-caisse .encaisser:disabled {
  background: #475569;
  color: #94a3b8;
  cursor: not-allowed;
}

.actions-caisse .encaisser {
  background: #2563eb;
  color: white;
}
</style>
