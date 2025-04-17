<template>
  <GridItem>
    <div class="caisse-extended">
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
      <div class="caisse-extended-right">
        <div class="client-info">
          <label>Nom client : {{ clientSelectionne.nomClient }} {{ clientSelectionne.prenomClient }}</label>
          <label>Id client : {{ clientSelectionne.idClient }}</label>

          <button v-if="clientSelectionne.idClient" @click="supprimerClientSelectionne" class="btn-supprimer">
            Supprimer le client selectionné
          </button>
        </div>
        <input type="search" placeholder="Rechercher un nom..." v-model="searchQuery"
               :disabled="paiements.length > 0 || encaissementActive"
               :class="{ 'search-bar-disabled': paiements.length > 0 || encaissementActive }"
        />

        <div class="liste-client">
          <div v-for="client in clientsFiltres" :key="client.idClient" class="client-card" @click="selectionnerClient(client)">
            <div class="client-column">
              <span class="client-header">CLIENT</span>
              <span class="client-value">{{ client.nomClient }} {{ client.prenomClient }}</span>
            </div>
            <div class="client-column">
              <span class="client-header">ID</span>
              <span class="client-value">{{ client.idClient }}</span>
            </div>
            <div class="client-column">
              <span class="client-header">TÉLÉPHONE</span>
              <span class="client-value">{{ client.telephoneClient ? client.telephoneClient : 'Non renseigné' }}</span>
            </div>
            <div class="client-column">
              <span class="client-header">EMAIL</span>
              <span class="client-value">{{ client.emailClient ? client.emailClient : 'Non renseigné' }}</span>
            </div>
          </div>
        </div>

        <div class="encaissement" v-if="encaissementActive">
          <div v-if="montantRestant < 0">
            <h3>Montant à rendre au client : {{ formatCurrency(Math.abs(montantRestant)) }}</h3>
            <button @click="validerRendu">Valider</button>
          </div>

          <div v-else>
            <div v-if="!encaissementTermine">
              <div class="modes-paiement">
                <h3>Sélectionnez le mode de paiement :</h3>
                <button @click="selectionnerPaiement('Carte Bancaire')">Carte Bancaire</button>
                <button @click="selectionnerPaiement('Carte Énergie')">Carte Énergie</button>
                <button @click="selectionnerPaiement('Espèces')">Espèces</button>
              </div>

              <div class="pad-numerique" :class="{ 'visible': modePaiement }">
                <h3>Montant pour {{ modePaiement }}</h3>
                <input type="text" v-model="montantEntre" class="ecran" />
                <div class="boutons">
                  <button v-for="n in 9" :key="n" @click="ajouterChiffre(n)">{{ n }}</button>
                  <button @click="ajouterChiffre('.')">.</button>
                  <button @click="ajouterChiffre(0)">0</button>
                  <button @click="effacerUn">←</button>
                  <button @click="effacer">X</button>
                  <button @click="validerPaiement">V</button>
                </div>
              </div>
            </div>

            <div v-if="encaissementTermine">
              <h3>Le client a été encaissé avec succès !</h3>
              <button @click="retournerGrid">Retour</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script>
import GridItem from "@/components/GridItem.vue";
import CaisseComponent from "@/components/CaisseComponent.vue";

export default {
  components: { CaisseComponent, GridItem },
  data() {
    return {
      searchQuery: "",
      clientSelectionne: { idClient: null, nomClient: "", prenomClient: "", telephoneClient: "", emailClient: "" },
      listeClient: [],
      modePaiement: null,
      montantEntre: "",
      paiements: [],
      montantRestant: 0,
      encaissementActive: false,
      encaissementTermine: false,
      listeProduitCopy: [...this.listeProduit]
    };
  },
  props: {
    listeProduit: {
      type: Array,
      default: () => []
    }
  },
  watch: {
    searchQuery: {
      handler(newQuery) {
        if (newQuery.trim() === "") {
          this.listeClient = [];
        } else {
          this.fetchClients(newQuery);
        }
      },
      immediate: true
    }
  },
  methods: {
    activerEncaissement() {
      this.encaissementActive = true;
      const totalPaye = this.paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
      this.montantRestant = this.totalPrix - totalPaye;
    },
    selectionnerPaiement(mode) {
      this.modePaiement = mode;
      this.montantEntre = this.montantRestant.toFixed(2);
    },
    ajouterChiffre(n) {
      if (n === '.' && this.montantEntre.includes('.')) return;
      if (this.montantEntre.includes('.') && this.montantEntre.split('.')[1].length >= 2) return;
      this.montantEntre += n.toString();
    },
    effacerUn() {
      this.montantEntre = this.montantEntre.slice(0, -1);
    },
    effacer() {
      this.montantEntre = "";
    },
    async enregistrerTransaction() {
      try {
        // Enregistrez la transaction dans la base de données
        const transactionData = {
          dateTransaction: new Date().toISOString().split('T')[0],
          heureTransaction: new Date().toISOString().split('T')[1].split('.')[0],
          idClient: this.clientSelectionne?.idClient ?? null,
          prixTotal: this.totalPrix,
          idEmploye: 1, // TODO
          estRemboursement: false,
          produits: this.listeProduitCopy.map(produit => ({
            idProduit: produit.idProduit,
            qteAchete: produit.quantite,
          })),
          paiements: this.paiements.map(paiement => ({
            modePaiement: paiement.mode,
            montant: paiement.montant,
          })),
        };
        console.log(transactionData);
        const response = await fetch("https://linserv-info-01/~rb306608/S401/insertTransactionCaisse.php", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transactionData),
        });

        const data = await response.json();
        console.log(data);  // Ajoutez cette ligne pour voir la réponse du serveur
        if (data.success) {
          console.log("Transaction enregistrée avec succès !");
        } else {
          console.error("Erreur lors de l'enregistrement de la transaction !");
        }

        this.encaissementTermine = true;
      } catch (err) {
        console.error("Erreur lors de l'enregistrement de la transaction:", err);
      }
    },
    validerPaiement() {
      if (!this.montantEntre || isNaN(this.montantEntre)) return;

      const montantPaye = parseFloat(this.montantEntre);
      this.paiements.push({
        mode: this.modePaiement,
        montant: montantPaye
      });

      const totalPaye = this.paiements.reduce((sum, paiement) => sum + paiement.montant, 0);
      this.montantRestant = this.totalPrix - totalPaye;

      this.montantRestant = Math.round(this.montantRestant * 100) / 100;


      if (Math.abs(this.montantRestant) < 0.01) {
        this.encaissementTermine = true;
        this.enregistrerTransaction();
      }

      this.modePaiement = null;
      this.montantEntre = "";
    },
    validerRendu() {
      this.montantRestant = 0;
      this.montantEntre = "";
      this.paiements = [];

      this.encaissementTermine = true;
    },
    formatCurrency(value) {
      return value.toFixed(2) + " €";
    },
    retournerGrid() {
      this.encaissementTermine = false;
      this.encaissementActive = false;
      this.montantRestant = 0;
      this.montantEntre = "";
      this.paiements = [];
      this.$emit('retour-grid', []);
    },
    async fetchClients(query = "") {
      try {
        const response = await fetch(`https://linserv-info-01/~rb306608/S401/fetchClientCaisse.php?searchQuery=${query}`);
        const data = await response.json();
        this.listeClient = data;
      } catch (err) {
        console.error("Erreur lors de la récupération des clients:", err);
      }
    },
    selectionnerClient(client) {
      this.clientSelectionne = client;
    },
    supprimerClientSelectionne() {
      this.clientSelectionne = { idClient: null, nomClient: "", prenomClient: "", telephoneClient: "", emailClient: "" };
    },
    miseAJourListeProduit(nouvelleListe) {
      this.listeProduitCopy = nouvelleListe;
    }
  },
  computed: {
    totalPrix() {
      return this.listeProduitCopy.reduce((sum, produit) => sum + produit.prix*produit.quantite, 0);
    },
    clientsFiltres() {
      return this.listeClient.filter(client =>
          client.nomClient.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          client.idClient.toString().includes(this.searchQuery)
      );
    }
  },
  mounted() {
    if (this.searchQuery.trim() !== "") {
      this.fetchClients();
    }
  },
};
</script>

<style>
.caisse-extended {
  display: flex;
  height: 100%;
}

.caisse-extended .caisse-extended-left {
  flex: 1;
  padding: 10px;
  display: flex;
}

.caisse-extended .caisse-extended-left > * {
  flex: 1;
  height: 100%;
}

.caisse-extended .caisse-extended-left .valider {
  display: none;
}

.caisse-extended .caisse-extended-right {
  flex: 1;
  padding: 10px;
}

.caisse-extended .client-info label {
  display: block;
  margin-bottom: 5px; /* Ajoute un peu d'espace entre les lignes */
}

.caisse-extended .btn-supprimer {
  background-color: #DA1E28;
  margin-bottom: 5px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.caisse-extended .liste-client {
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow-y: auto;
  min-height: 240px;
  max-height: 240px;
  background: white;
}

.caisse-extended .client-card {
  display: flex;
  padding: 15px;
  margin: 10px;
  border-radius: 10px;
  background-color: #EDF0F7;
}

.caisse-extended .client-column {
  flex: 1;
  padding: 10px;
}

.caisse-extended .client-header {
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.caisse-extended .client-value {
  font-size: 14px;
}

.caisse-extended .encaissement {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
  margin-top: 10px;
  flex-grow: 1;
}

.caisse-extended .modes-paiement {
  display: flex;
  gap: 10px;
}

.caisse-extended .modes-paiement button {
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #2D3648;
  color: white;
}

.caisse-extended .pad-numerique {
  width: 100%;
  opacity: 0;
  visibility: hidden;
  height: 0;
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease;
}

.caisse-extended .pad-numerique.visible {
  opacity: 1;
  visibility: visible;
  height: auto;
}

.caisse-extended .ecran {
  width: 100%;
  padding: 10px;
  font-size: 20px;
  text-align: right;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-bottom: 10px;
}

.caisse-extended .boutons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  width: 100%;
}

.caisse-extended .boutons button {
  padding: 10px;
  font-size: 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background: #2D3648;
  color: white;
}

.caisse-extended .boutons button:nth-child(13) {
  background: #DA1E28;
  grid-column: 1;
}

.caisse-extended .boutons button:nth-child(14) {
  background: #25A249;
  grid-column: 3;
}

.caisse-extended .search-bar-disabled {
  background-color: #f0f0f0;
  color: #a0a0a0;
  cursor: not-allowed;
  border: 1px solid #ccc;
}
</style>