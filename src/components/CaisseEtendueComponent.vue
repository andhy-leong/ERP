<template>
  <GridItem>
    <div class="caisse-extended">
      <!-- Caisse à gauche -->
      <div class="caisse-extended-left">
        <CaisseComponent
          :listeProduit="listeProduitCopy"
          :isCaisseExtended="true"
          :encaissementActive="encaissementActive"
          :montantRestant="montantRestant"
          :paiements="paiements"
          @encaisser="activerEncaissement"
          @mise-a-jour-liste="miseAJourListeProduit"
        />
      </div>

      <!-- Panneau client et encaissement à droite -->
      <div class="caisse-extended-right">
        <!-- Barre retour rapide -->
        <div class="top-bar">
          <button @click="retournerGrid" class="btn-retour">← Retour aux opérations</button>
          <span class="mode-badge">Encaissement & Fidélité</span>
        </div>

        <!-- Encadré Client -->
        <div class="client-box">
          <div class="client-header-row">
            <h4>Compte Client / Carte Énergie</h4>
            <button v-if="clientSelectionne.idClient" @click="supprimerClientSelectionne" class="btn-detach">
              Détacher client
            </button>
          </div>

          <div v-if="clientSelectionne.idClient" class="client-selected-card">
            <div class="client-avatar">
              👤
            </div>
            <div class="client-details">
              <strong>{{ clientSelectionne.nomClient }} {{ clientSelectionne.prenomClient }}</strong>
              <small>ID #{{ clientSelectionne.idClient }} • {{ clientSelectionne.telephoneClient || 'Tél non renseigné' }}</small>
              <div class="card-balance-badge" v-if="clientSelectionne.numeroCarteEnergie">
                ⚡ Carte: {{ clientSelectionne.numeroCarteEnergie }} (Solde: {{ (clientSelectionne.soldeCarteEnergie || 0).toFixed(2) }}€)
              </div>
            </div>
          </div>

          <div v-else class="client-search-wrapper">
            <input 
              type="search" 
              placeholder="Rechercher client (nom, tél, carte énergie)..." 
              v-model="searchQuery"
              :disabled="paiements.length > 0 || encaissementActive"
              class="client-search-input"
            />
            
            <div class="liste-clients-result" v-if="listeClient.length > 0 && !clientSelectionne.idClient">
              <div 
                v-for="client in listeClient" 
                :key="client.idClient" 
                class="client-mini-card"
                @click="selectionnerClient(client)"
              >
                <div class="c-info">
                  <span class="c-name">{{ client.nomClient }} {{ client.prenomClient }}</span>
                  <span class="c-meta">ID {{ client.idClient }} • {{ client.telephoneClient }}</span>
                </div>
                <span class="c-solde" v-if="client.soldeCarteEnergie">
                  {{ client.soldeCarteEnergie.toFixed(2) }}€
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Zone Encaissement -->
        <div class="encaissement-panel" v-if="encaissementActive">
          <!-- Monnaie à rendre -->
          <div v-if="montantRestant < 0" class="rendu-monnaie-box">
            <h3>Monnaie à rendre au client</h3>
            <div class="montant-rendu">{{ formatCurrency(Math.abs(montantRestant)) }}</div>
            <button @click="validerRendu" class="btn-valider-rendu">Rendu effectué (Clôturer le ticket)</button>
          </div>

          <div v-else>
            <!-- Choix des modes de paiement -->
            <div v-if="!encaissementTermine">
              <div class="modes-paiement">
                <h4>Sélectionnez le mode :</h4>
                <div class="payment-buttons">
                  <button 
                    :class="{ active: modePaiement === 'Carte Bancaire' }"
                    @click="selectionnerPaiement('Carte Bancaire')"
                  >
                    💳 Carte Bancaire
                  </button>
                  <button 
                    :class="{ active: modePaiement === 'Carte Énergie' }"
                    @click="selectionnerPaiement('Carte Énergie')"
                  >
                    ⚡ Carte Énergie
                  </button>
                  <button 
                    :class="{ active: modePaiement === 'Espèces' }"
                    @click="selectionnerPaiement('Espèces')"
                  >
                    💶 Espèces
                  </button>
                </div>
              </div>

              <!-- Clavier numérique pour saisie du montant -->
              <div class="pad-container" v-if="modePaiement">
                <div class="pad-header">
                  <span>Paiement {{ modePaiement }}</span>
                  <div class="ecran-montant">{{ montantEntre || '0.00' }} €</div>
                </div>

                <div class="boutons-pad">
                  <button v-for="n in 9" :key="n" @click="ajouterChiffre(n)" class="btn-pad">{{ n }}</button>
                  <button @click="ajouterChiffre('.')" class="btn-pad">.</button>
                  <button @click="ajouterChiffre(0)" class="btn-pad">0</button>
                  <button @click="effacerUn" class="btn-pad btn-action">⌫</button>
                  <button @click="effacer" class="btn-pad btn-danger">C</button>
                  <button @click="validerPaiement" class="btn-pad btn-valider">Valider ✓</button>
                </div>
              </div>
            </div>

            <!-- Ticket et confirmation de succès -->
            <div v-if="encaissementTermine" class="succes-box">
              <div class="succes-icon">✓</div>
              <h3>Paiement Enregistré avec Succès !</h3>
              <p>La transaction a été intégrée au journal des ventes de l'ERP.</p>
              <div class="ticket-summary">
                <div><span>Total réglé :</span> <strong>{{ totalPrix.toFixed(2) }}€</strong></div>
                <div><span>Modes de règlement :</span> {{ paiements.map(p => p.mode).join(', ') }}</div>
                <div v-if="clientSelectionne.idClient"><span>Client :</span> {{ clientSelectionne.nomClient }} {{ clientSelectionne.prenomClient }}</div>
              </div>
              <button @click="retournerGrid" class="btn-nouveau-ticket">Nouveau Ticket / Opération suivante →</button>
            </div>
          </div>
        </div>

        <div v-else class="panneau-aide">
          <p>👉 Ajoutez les articles à gauche, puis cliquez sur <strong>"Paiement"</strong> pour débuter l'encaissement.</p>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script>
import GridItem from "@/components/GridItem.vue";
import CaisseComponent from "@/components/CaisseComponent.vue";
import { fetchClients, insertTransactionCaisse } from "@/services/erpService";

export default {
  components: { CaisseComponent, GridItem },
  props: {
    listeProduit: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchQuery: "",
      clientSelectionne: { idClient: null, nomClient: "", prenomClient: "", telephoneClient: "", emailClient: "", soldeCarteEnergie: 0, numeroCarteEnergie: "" },
      listeClient: [],
      modePaiement: null,
      montantEntre: "",
      paiements: [],
      montantRestant: 0,
      encaissementActive: false,
      encaissementTermine: false,
      listeProduitCopy: [...(this.listeProduit || [])]
    };
  },
  computed: {
    totalPrix() {
      return this.listeProduitCopy.reduce((sum, item) => sum + (item.prix * item.quantite), 0);
    }
  },
  watch: {
    searchQuery: {
      async handler(newQuery) {
        if (!newQuery || newQuery.trim() === "") {
          this.listeClient = [];
        } else {
          try {
            this.listeClient = await fetchClients(newQuery);
          } catch (e) {
            console.error("Erreur recherche clients", e);
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    miseAJourListeProduit(nouvelleListe) {
      this.listeProduitCopy = [...nouvelleListe];
      if (this.encaissementActive) {
        const totalPaye = this.paiements.reduce((sum, p) => sum + p.montant, 0);
        this.montantRestant = Math.round((this.totalPrix - totalPaye) * 100) / 100;
      }
    },
    activerEncaissement() {
      if (this.listeProduitCopy.length === 0) return;
      this.encaissementActive = true;
      const totalPaye = this.paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
      this.montantRestant = Math.round((this.totalPrix - totalPaye) * 100) / 100;
      this.selectionnerPaiement('Carte Bancaire');
    },
    selectionnerPaiement(mode) {
      this.modePaiement = mode;
      this.montantEntre = this.montantRestant > 0 ? this.montantRestant.toFixed(2) : "0.00";
    },
    ajouterChiffre(n) {
      if (n === '.' && this.montantEntre.includes('.')) return;
      if (this.montantEntre.includes('.') && this.montantEntre.split('.')[1].length >= 2) return;
      if (this.montantEntre === '0.00' || this.montantEntre === '0') {
        this.montantEntre = n.toString();
      } else {
        this.montantEntre += n.toString();
      }
    },
    effacerUn() {
      this.montantEntre = this.montantEntre.slice(0, -1);
    },
    effacer() {
      this.montantEntre = "";
    },
    validerPaiement() {
      if (!this.montantEntre || isNaN(Number(this.montantEntre))) return;

      const montantPaye = parseFloat(this.montantEntre);
      if (montantPaye <= 0) return;

      this.paiements.push({
        mode: this.modePaiement,
        montant: montantPaye
      });

      const totalPaye = this.paiements.reduce((sum, p) => sum + p.montant, 0);
      this.montantRestant = Math.round((this.totalPrix - totalPaye) * 100) / 100;

      if (this.montantRestant <= 0.001) {
        this.enregistrerTransaction();
      } else {
        this.montantEntre = this.montantRestant.toFixed(2);
      }
    },
    async enregistrerTransaction() {
      try {
        let employeId = 1;
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          employeId = user.idEmploye || 1;
        }

        const transactionData = {
          dateTransaction: new Date().toISOString().split('T')[0],
          heureTransaction: new Date().toLocaleTimeString(),
          idClient: this.clientSelectionne?.idClient ?? null,
          prixTotal: this.totalPrix,
          idEmploye: employeId,
          estRemboursement: false,
          produits: this.listeProduitCopy.map(produit => ({
            idProduit: produit.idProduit,
            nomProduit: produit.nomProduit,
            prix: produit.prix,
            qteAchete: produit.quantite,
          })),
          paiements: this.paiements.map(paiement => ({
            mode: paiement.mode,
            montant: paiement.montant,
          })),
        };

        await insertTransactionCaisse(transactionData);
        this.encaissementTermine = true;
      } catch (err) {
        console.error("Erreur enregistrement transaction:", err);
        alert("Erreur lors de l'enregistrement de la transaction");
      }
    },
    validerRendu() {
      this.enregistrerTransaction();
    },
    formatCurrency(value) {
      return Number(value).toFixed(2) + " €";
    },
    retournerGrid() {
      this.encaissementTermine = false;
      this.encaissementActive = false;
      this.montantRestant = 0;
      this.montantEntre = "";
      this.paiements = [];
      this.listeProduitCopy = [];
      this.$emit('retour-grid', []);
    },
    selectionnerClient(client) {
      this.clientSelectionne = { ...client };
      this.searchQuery = "";
      this.listeClient = [];
    },
    supprimerClientSelectionne() {
      this.clientSelectionne = { idClient: null, nomClient: "", prenomClient: "", telephoneClient: "", emailClient: "", soldeCarteEnergie: 0, numeroCarteEnergie: "" };
    }
  }
};
</script>

<style scoped>
.caisse-extended {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  gap: 16px;
  padding: 12px;
  background: #f1f5f9;
  box-sizing: border-box;
}

.caisse-extended-left {
  height: 100%;
}

.caisse-extended-right {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
  overflow-y: auto;
  gap: 14px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-retour {
  background: #e2e8f0;
  color: #1e293b;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

.mode-badge {
  font-size: 11px;
  font-weight: 700;
  color: #2563eb;
  background: #dbeafe;
  padding: 3px 8px;
  border-radius: 12px;
}

.client-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.client-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.client-header-row h4 {
  margin: 0;
  font-size: 13px;
  color: #334155;
}

.btn-detach {
  background: transparent;
  color: #ef4444;
  font-size: 11px;
  padding: 2px 6px;
}

.client-selected-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #ffffff;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
}

.client-avatar {
  font-size: 24px;
}

.client-details strong {
  display: block;
  font-size: 14px;
  color: #0f172a;
}

.client-details small {
  font-size: 11px;
  color: #64748b;
}

.card-balance-badge {
  font-size: 11px;
  font-weight: 600;
  color: #166534;
  background: #dcfce7;
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 4px;
  display: inline-block;
}

.client-search-input {
  width: 100%;
  padding: 8px 10px;
  font-size: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.liste-clients-result {
  max-height: 140px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-top: 6px;
  background: white;
}

.client-mini-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
}

.client-mini-card:hover {
  background: #f8fafc;
}

.c-name {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  display: block;
}

.c-meta {
  font-size: 10px;
  color: #64748b;
}

.c-solde {
  font-size: 12px;
  font-weight: 700;
  color: #16a34a;
}

.modes-paiement h4 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #334155;
}

.payment-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}

.payment-buttons button {
  padding: 10px 6px;
  font-size: 12px;
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.payment-buttons button.active {
  background: #1e293b;
  color: white;
  border-color: #1e293b;
}

.pad-container {
  margin-top: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px;
}

.pad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ecran-montant {
  font-size: 20px;
  font-weight: 800;
  color: #2563eb;
  background: #ffffff;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
}

.boutons-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.btn-pad {
  padding: 12px;
  font-size: 16px;
  font-weight: 700;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #1e293b;
}

.btn-pad:hover {
  background: #e2e8f0;
}

.btn-action {
  background: #f1f5f9;
}

.btn-danger {
  background: #fee2e2;
  color: #dc2626;
}

.btn-valider {
  background: #25a249;
  color: white;
}

.btn-valider:hover {
  background: #1e833a;
}

.rendu-monnaie-box {
  background: #eff6ff;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.montant-rendu {
  font-size: 28px;
  font-weight: 900;
  color: #1d4ed8;
  margin: 10px 0;
}

.btn-valider-rendu {
  background: #1d4ed8;
  color: white;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 13px;
}

.succes-box {
  text-align: center;
  padding: 20px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
}

.succes-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #22c55e;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: 0 auto 12px;
}

.ticket-summary {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  margin: 14px 0;
  text-align: left;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.btn-nouveau-ticket {
  background: #16a34a;
  color: white;
  padding: 10px 18px;
  border-radius: 6px;
  font-size: 13px;
}

.panneau-aide {
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}
</style>