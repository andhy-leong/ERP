<template>
  <GridItem>
  <div class="pompe-container" :class="{ 
    'active': pompe.status === 'active',
    'in-use': pompe.status === 'in-use',
    'waiting-payment': pompe.status === 'waiting-payment'
  }">
    <!-- Contenu de la pompe -->
    <div class="pompe-content">
      <!-- Titre de la pompe centré avec indicateur d'état -->
      <div class="pompe-titre">
        <span class="status-indicator" :class="getStatusClass(pompe.status)"></span>
        <span>Pompe {{ pompe.numero }}</span>
      </div>
      
      <!-- Carburants disponibles (toujours visibles, même avec historique) -->
      <div v-if="pompe.type !== 'ELECTRIK' && pompe.status === 'active'" class="carburants-list">
        <div v-for="(carburant, index) in pompe.carburants" :key="index" 
             class="carburant-item" 
             :class="{ 'selected': carburant === pompe.selectedCarburant }"
             @click="selectCarburant(index)">
          {{ carburant }}
        </div>
      </div>
      <div v-else-if="pompe.type === 'ELECTRIK'" class="carburant-item disabled">
        ELECTRIK
      </div>
      
      <!-- Bouton Retour (visible uniquement quand l'historique est affiché) -->
      <div v-if="showHistorique" class="pompe-actions retour-button">
        <button class="btn btn-secondary" @click="toggleHistorique">Retour</button>
      </div>
      
      <!-- Affichage conditionnel : soit l'historique, soit la quantité/détails -->
      <div v-if="showHistorique && pompe.historique" class="pompe-historique">
        <table>
          <thead>
            <tr>
              <th @click="sortHistorique('type')">Type</th>
              <th @click="sortHistorique('quantite')">Qté (en L)</th>
              <th @click="sortHistorique('total')">Total (en €)</th>
              <th @click="sortHistorique('heure')">Heure</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(transaction, index) in pompe.historique" :key="index">
              <td>{{ transaction.type }}</td>
              <td>{{ transaction.quantite }}</td>
              <td class="total-cell">
                {{ transaction.total }}
                <span class="payment-type">{{ transaction.typePaiement || 'Carte' }}</span>
              </td>
              <td>{{ transaction.heure }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Si l'historique n'est pas affiché, montrer la quantité ou les détails -->
      <div v-else>
        <!-- Zone de quantité pour les pompes actives -->
        <div v-if="pompe.status === 'active'" class="pompe-quantite">
          <label for="quantite">Quantité : </label>
          <div class="input-group">
            <input type="number" id="quantite" v-model="quantiteInput" placeholder="Entrez la quantité" class="form-control">
            <button class="btn btn-secondary" @click="demarrerUtilisation">Démarrer</button>
          </div>
        </div>
        
        <!-- Affichage des détails en cours d'utilisation -->
        <div v-if="pompe.status === 'in-use' && pompe.details" class="pompe-details in-use">
          <div class="detail-item">
            <div>{{ pompe.selectedCarburant || pompe.type }} : {{ pompe.details.quantite }}L</div>
            <div>Total : {{ pompe.details.montant }}€</div>
          </div>
        </div>
        
        <!-- Affichage des détails en attente de paiement -->
        <div v-if="pompe.status === 'waiting-payment' && pompe.details" class="pompe-details waiting-payment">
          <div class="detail-item">
            <div>{{ pompe.selectedCarburant || pompe.type }} : {{ pompe.details.quantite }}L</div>
            <div>Total : {{ pompe.details.montant }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Pied de pompe avec boutons d'action -->
    <div class="pompe-footer">
      <div v-if="pompe.incident" class="incident-alert">
        <div class="incident-icon"></div>
        <div class="incident-info">
          <div>Incident {{ pompe.incident.numero }}</div>
          <div>{{ pompe.incident.details }}</div>
        </div>
      </div>
      
      <!-- Boutons d'action uniquement si l'historique n'est pas affiché -->
      <div v-if="!showHistorique" class="pompe-actions">
        <button v-if="(pompe.status === 'active' || pompe.status === 'in-use' || pompe.status === 'waiting-payment') && pompe.actions?.creer" class="btn btn-danger" @click="creerIncident">Créer incident</button>
        <button v-if="pompe.status === 'in-use' && pompe.actions?.arreter" class="btn btn-secondary" @click="arreterPompe">Arrêter</button>
        <button v-if="pompe.status === 'waiting-payment' && pompe.actions?.payer" class="btn btn-primary" @click="payerCarburant">Payer</button>
        <button v-if="pompe.historique" class="btn btn-info" @click="toggleHistorique">Historique</button>
      </div>
    </div>

    <!-- Ajoutez ceci dans la section template de PompeComponent.vue, juste avant la balise de fermeture </div> finale -->
    <div v-if="showStopConfirmation" class="confirmation-modal">
      <div class="confirmation-content">
        <h2>Êtes-vous sûr ?</h2>
        <p>La pompe était encore en utilisation. Il reste {{ remainingAmount }}€ de carburant utilisable.</p>
        <p>Voulez-vous annuler l'arrêt, ou arrêter la pompe et rendre la monnaie ?</p>
        
        <div class="confirmation-buttons">
          <button class="btn btn-secondary" @click="cancelStop">Annuler</button>
          <button class="btn btn-primary" @click="processRefund('Crédit Énergie')">Rembourser en crédit énergie</button>
        </div>
        <div class="confirmation-buttons">
          <button class="btn btn-primary" @click="processRefund('Espèce')">Rembourser en espèce</button>
          <button class="btn btn-primary" @click="processRefund('Carte Bancaire')">Rembourser en CB</button>
        </div>
      </div>
    </div>

    <!-- Ajoutez ce formulaire modal pour la création d'incident -->
    <div v-if="showIncidentModal" class="incident-modal">
      <div class="incident-modal-content">
        <h2>Créer un incident</h2>
        <form @submit.prevent="submitIncident">
          <div class="form-group">
            <label for="incident-description">Description:</label>
            <textarea 
              id="incident-description" 
              v-model="incidentDescription" 
              required
              placeholder="Décrivez le problème rencontré..."
              rows="4"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="incident-niveau">Niveau de gravité:</label>
            <select id="incident-niveau" v-model="incidentNiveau" required>
              <option value="1">1 - Mineur</option>
              <option value="2">2 - Modéré</option>
              <option value="3">3 - Majeur</option>
            </select>
          </div>
          
          <div class="modal-buttons">
            <button type="button" class="btn btn-secondary" @click="cancelIncident">Annuler</button>
            <button type="submit" class="btn btn-danger">Créer l'incident</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </GridItem>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from 'vue';
import GridItem from "@/components/GridItem.vue";

// Définir les interfaces pour les types de données
interface Transaction {
  type: string;
  quantite: string;
  total: string;
  heure: string;
  typePaiement?: string;
}

interface Incident {
  numero: number;
  details: string;
  niveau?: number;
}

interface PompeActions {
  creer: boolean;
  arreter: boolean;
  payer: boolean;
  historique: boolean;
}

interface PompeDetails {
  sp95?: string;
  total?: string;
  quantite: string;
  montant: string;
}

interface Pompe {
  numero: number;
  type: string;
  status: string;
  carburants: string[];
  selectedCarburant: string;
  details: PompeDetails | null;
  historique: Transaction[] | null;
  incident: Incident | null;
  actions: PompeActions | null;
}

// Création du composant avec un nom explicite
const PompeComponent = defineComponent({
  name: 'PompeComponent',
  components: {GridItem},
  props: {
    pompeId: {
      type: Number,
      required: true
    },
    carburantsList: {
      type: Array as PropType<string[]>,
      required: false,
      default: () => []
    }
  },
  setup(props) {
    const pompe = ref<Pompe>({
      numero: props.pompeId,
      type: 'Standard',
      status: 'active', // active, inactive, error, in-use, waiting-payment
      carburants: props.carburantsList,
      selectedCarburant: props.carburantsList.length > 0 ? props.carburantsList[0] : '',
      details: null,
      historique: null,
      incident: null,
      actions: {
        creer: true,
        arreter: false,
        payer: false,
        historique: false
      }
    });
    
    const showHistorique = ref(false);
    const quantiteInput = ref('');
    const sortField = ref('');
    const sortOrder = ref('asc');
    
    // Variables pour le modal d'incident
    const showIncidentModal = ref(false);
    const incidentDescription = ref('');
    const incidentNiveau = ref('1');

    // Variables pour le popup de confirmation
    const showStopConfirmation = ref(false);
    const remainingAmount = ref('');

    // Récupérer les prix des carburants
    const carburantsPrix = ref<Record<string, number>>({});

    // Clé pour identifier les données dans localStorage
    const getPompeStorageKey = (pompeId: number) => `pompe_state_${pompeId}`;

    // Fonction pour sauvegarder l'état de la pompe
    const savePompeState = () => {
      const stateToSave = {
        status: pompe.value.status,
        selectedCarburant: pompe.value.selectedCarburant,
        details: pompe.value.details,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(getPompeStorageKey(props.pompeId), JSON.stringify(stateToSave));
      console.log(`État de la pompe ${props.pompeId} sauvegardé:`, stateToSave);
    };

    // Fonction pour charger l'état de la pompe depuis localStorage
    const loadPompeState = () => {
      try {
        const savedState = localStorage.getItem(getPompeStorageKey(props.pompeId));
        if (savedState) {
          const state = JSON.parse(savedState);
          console.log(`État chargé pour la pompe ${props.pompeId}:`, state);
          
          // Vérifier si l'état sauvegardé est récent (moins de 24h)
          const lastUpdated = new Date(state.lastUpdated);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            // Ne restaurer que si le statut est 'in-use' ou 'waiting-payment'
            if (state.status === 'in-use' || state.status === 'waiting-payment') {
              pompe.value.status = state.status;
              pompe.value.selectedCarburant = state.selectedCarburant;
              pompe.value.details = state.details;
              
              // Mettre à jour les actions disponibles
              if (pompe.value.actions) {
                pompe.value.actions.arreter = state.status === 'in-use';
                pompe.value.actions.payer = state.status === 'waiting-payment';
              }
              
              console.log(`État de la pompe ${props.pompeId} restauré depuis localStorage`);
              return true;
            }
          } else {
            // Supprimer les données trop anciennes
            localStorage.removeItem(getPompeStorageKey(props.pompeId));
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de l'état de la pompe ${props.pompeId}:`, error);
      }
      return false;
    };

    // Fonction pour supprimer l'état sauvegardé
    const clearPompeState = () => {
      localStorage.removeItem(getPompeStorageKey(props.pompeId));
      console.log(`État de la pompe ${props.pompeId} supprimé`);
    };

    // Fonction pour récupérer les données de la pompe depuis la BD
    const fetchPompeData = async () => {
      try {
        console.log(`Récupération des données pour la pompe ${props.pompeId}...`);
        const response = await fetch(`https://linserv-info-01/~lm308981/S401/fetchPompe.php?id=${props.pompeId}`);
        console.log('Réponse reçue de l\'API');
        
        const data = await response.json();
        console.log(`Données pour pompe ${props.pompeId}:`, data);
        
        if (data && !data.error) {
          pompe.value = {
            numero: data.numero,
            type: data.type,
            status: data.status,
            carburants: data.carburants,
            selectedCarburant: data.selectedCarburant,
            details: data.details,
            historique: data.historique,
            incident: data.incident,
            actions: data.actions
          };
          console.log(`Pompe ${props.pompeId} mise à jour avec les données de la BD`);
        } else {
          console.error(`Erreur lors de la récupération des données de la pompe ${props.pompeId}:`, data.error);
        }
      } catch (error) {
        console.error(`Erreur lors de la récupération des données de la pompe ${props.pompeId}:`, error);
      }
    };
    
    // Fonction pour obtenir la classe CSS basée sur le statut de la pompe
    const getStatusClass = (status: string) => {
      switch (status) {
        case 'active': return 'status-active';
        case 'inactive': return 'status-inactive';
        case 'error': return 'status-error';
        case 'in-use': return 'status-in-use';
        case 'waiting-payment': return 'status-waiting-payment';
        default: return '';
      }
    };
    
    // Fonction pour sélectionner un carburant
    const selectCarburant = (index: number) => {
      if (pompe.value.carburants[index]) {
        console.log(`Sélection du carburant: ${pompe.value.carburants[index]}`);
        pompe.value.selectedCarburant = pompe.value.carburants[index];
      }
    };
    
    // Fonction pour démarrer l'utilisation d'une pompe
    const demarrerUtilisation = () => {
      if (!quantiteInput.value || parseFloat(quantiteInput.value) <= 0) {
        alert("Veuillez entrer une quantité valide");
        return;
      }
      
      console.log(`Démarrage de l'utilisation de la pompe ${props.pompeId} avec ${quantiteInput.value}L de ${pompe.value.selectedCarburant}`);
      
      // Calculer le prix en fonction du carburant et de la quantité
      const quantite = parseFloat(quantiteInput.value);
      const prixTotal = calculerPrix(quantite, pompe.value.selectedCarburant);
      
      // Mise à jour de l'état de la pompe
      pompe.value.status = 'in-use';
      pompe.value.details = {
        quantite: quantiteInput.value,
        montant: prixTotal.toFixed(2)
      };
      
      // Mise à jour des actions possibles
      if (pompe.value.actions) {
        pompe.value.actions.arreter = true;
        pompe.value.actions.payer = false;
      }
      
      // Ajouter l'utilisation à l'historique
      const now = new Date();
      const heure = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (!pompe.value.historique) {
        pompe.value.historique = [];
      }
      
      pompe.value.historique.unshift({
        type: pompe.value.selectedCarburant,
        quantite: (pompe.value.details as unknown as PompeDetails)?.quantite || '0',
        total: (pompe.value.details as unknown as PompeDetails)?.montant?.replace('€', '') || '0',
        heure: heure,
        typePaiement: 'Carte'
      });
      
      // Réinitialiser l'entrée
      quantiteInput.value = '';
      
      // Après avoir mis à jour l'état
      savePompeState();
    };
    
    // Fonction pour calculer le montant restant
    // const calculateRemainingAmount = () => {
    //   // ...code existant...
    // };
    
    // Fonction pour arrêter une pompe en cours d'utilisation
    const arreterPompe = () => {
      if (pompe.value.status === 'in-use' && pompe.value.details) {
        console.log(`Arrêt simple de la pompe ${props.pompeId}`);
        
        // Mettre à jour l'état local
        pompe.value.status = 'active';
        pompe.value.details = null;
        
        // Réinitialiser toutes les actions
        if (pompe.value.actions) {
          pompe.value.actions.arreter = false;
          pompe.value.actions.payer = false;
          pompe.value.actions.creer = true;
        }
        
        // Sauvegarder l'état dans localStorage
        savePompeState();
        
        // Mettre à jour l'état dans la base de données
        updatePompeStateInDB(true);
      }
    };
    
    // Nouvelle fonction pour mettre à jour l'état de la pompe dans la BD
    const updatePompeStateInDB = (state :boolean) => {
      fetch(`https://linserv-info-01/~lm308981/S401/updatePompeState.php?pompeId=${props.pompeId}&state=${state}`, {
        method: 'GET'
      })
      .then(response => response.json())
      .then(data => {
        console.log(`État de la pompe ${props.pompeId} mis à jour dans la BD:`, data);
      })
      .catch(error => {
        console.error(`Erreur lors de la mise à jour de l'état de la pompe ${props.pompeId}:`, error);
      });
    };
    
    // Fonction pour payer le carburant
    const payerCarburant = () => {
      if (pompe.value.status !== 'waiting-payment' || !pompe.value.details) return;
      
      console.log(`Paiement pour la pompe ${props.pompeId}: ${pompe.value.details.montant}`);
      
      // Réinitialiser l'état de la pompe
      pompe.value.status = 'active';
      pompe.value.details = null;
      
      // Mettre à jour les actions disponibles
      if (pompe.value.actions) {
        pompe.value.actions.payer = false;
        pompe.value.actions.arreter = false;
      }
      
      alert("Paiement effectué avec succès !");
      
      // Une fois le paiement effectué, supprimer l'état sauvegardé
      clearPompeState();
    };
    
    // Fonction pour rembourser la pompe
    const rembourserPompe = async (methode: string) => {
      if (!pompe.value.details) return;
      
      try {
        console.log(`Remboursement de la pompe ${props.pompeId} par ${methode}`);
        
        // Récupérer l'ID de l'employé connecté
        let userData = null;
        try {
          const userDataStr = localStorage.getItem('user');
          if (userDataStr) {
            userData = JSON.parse(userDataStr);
            console.log('Données utilisateur récupérées:', userData);
          }
        } catch (e) {
          console.error("Erreur lors de la récupération des données utilisateur:", e);
        }
        
        const idEmploye = userData?.idEmploye || 1; // Utiliser 1 par défaut si aucun employé n'est connecté
        const montant = parseFloat((pompe.value.details as unknown as PompeDetails).montant.replace('€', ''));
        
        // Appel à l'API pour effectuer le remboursement
        const response = await fetch('https://linserv-info-01/~lm308981/S401/rembourserPompe.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pompeId: props.pompeId,
            methode: methode,
            montant: montant,
            idEmploye: idEmploye
          }),
        });
        
        const data = await response.json();
        console.log('Réponse du remboursement:', data);
        
        if (data.success) {
          // Réinitialiser l'état de la pompe
          pompe.value.status = 'active';
          pompe.value.details = null;
          
          // Mettre à jour les actions disponibles
          if (pompe.value.actions) {
            pompe.value.actions.payer = false;
            pompe.value.actions.arreter = false;
          }
          
          alert(`Remboursement effectué avec succès par ${methode} !`);
          
          // Rafraîchir les données de la pompe
          fetchPompeData();
        } else {
          alert(`Erreur lors du remboursement: ${data.error}`);
        }
      } catch (error) {
        console.error("Erreur lors du remboursement:", error);
        alert("Erreur lors du remboursement. Veuillez réessayer.");
      }
    };
    
    // Fonction pour ouvrir le modal de création d'incident
    const openIncidentModal = () => {
      showIncidentModal.value = true;
    };
    
    // Fonction pour fermer le modal de création d'incident
    const cancelIncident = () => {
      showIncidentModal.value = false;
      incidentDescription.value = '';
      incidentNiveau.value = '1';
    };
    
    // Fonction pour créer un incident
    const creerIncident = () => {
      showIncidentModal.value = true;
    };
    
    // Fonction pour basculer l'affichage de l'historique
    const toggleHistorique = () => {
      console.log(`Toggle historique pour la pompe ${props.pompeId}: ${!showHistorique.value}`);
      showHistorique.value = !showHistorique.value;
    };
    
    // Fonction pour trier l'historique des transactions
    const sortHistorique = (field: string) => {
      if (pompe.value.historique) {
        console.log(`Tri de l'historique par ${field}`);
        if (sortField.value === field) {
          // Inverser l'ordre de tri
          sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
        } else {
          // Nouveau champ de tri
          sortField.value = field;
          sortOrder.value = 'asc';
        }
        
        pompe.value.historique.sort((a: any, b: any) => {
          let valueA = a[field];
          let valueB = b[field];
          
          // Convertir en nombre si nécessaire
          if (field === 'quantite' || field === 'total') {
            valueA = parseFloat(valueA);
            valueB = parseFloat(valueB);
          }
          
          if (valueA < valueB) {
            return sortOrder.value === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return sortOrder.value === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
    };
    
    // Fonction pour annuler l'arrêt de la pompe
    const cancelStop = () => {
      showStopConfirmation.value = false;
    };

    // Fonction pour traiter le remboursement
    const processRefund = async (methode: string) => {
      await rembourserPompe(methode);
      showStopConfirmation.value = false;
    };
    
    // Récupérer les prix des carburants depuis la BD
    const fetchCarburantsPrix = async () => {
      try {
        const response = await fetch(`https://linserv-info-01/~lm308981/S401/fetchCarburantsPrix.php`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          const prixMap: Record<string, number> = {};
          data.forEach(item => {
            prixMap[item.nomProduit] = parseFloat(item.prix);
          });
          carburantsPrix.value = prixMap;
          console.log('Prix des carburants récupérés:', carburantsPrix.value);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des prix:', error);
      }
    };

    // Calculer le prix dynamiquement en fonction de la quantité et du carburant sélectionné
    const calculerPrix = (quantite: number, carburant: string): number => {
      const prixUnitaire = carburantsPrix.value[carburant] || 0;
      return prixUnitaire * quantite;
    };

    // Ajouter cette fonction pour soumettre un incident
    const submitIncident = async () => {
      if (!incidentDescription.value.trim()) {
        alert("Veuillez entrer une description pour l'incident.");
        return;
      }
      
      // Préparation des données
      const incidentData = {
        pompeId: props.pompeId,
        description: incidentDescription.value,
        niveau: parseInt(incidentNiveau.value)
      };
      
      console.log('Données à envoyer:', incidentData);
      
      try {
        // Requête POST avec les bons en-têtes
        const response = await fetch('https://linserv-info-01/~lm308981/S401/creerIncident.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(incidentData)
        });
        
        if (!response.ok) {
          console.error('Erreur HTTP:', response.status, response.statusText);
          alert(`Erreur HTTP: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        console.log('Réponse serveur:', data);
        
        if (data.success) {
          alert("Incident créé avec succès!");
          cancelIncident();
          fetchPompeData();
        } else {
          alert(`Erreur: ${data.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        console.error('Erreur lors de la création de l\'incident:', error);
        alert("Une erreur s'est produite lors de la création de l'incident.");
      }
    };

    onMounted(() => {
      console.log(`Composant pompe ${props.pompeId} monté, vérification de l'état sauvegardé...`);
      
      // Essayer de charger l'état depuis localStorage
      const stateLoaded = loadPompeState();
      
      // Si aucun état n'a été chargé, récupérer les données depuis la BD
      if (!stateLoaded) {
        console.log(`Aucun état sauvegardé trouvé pour la pompe ${props.pompeId}, récupération depuis la BD...`);
        fetchPompeData();
      }
      
      // Récupérer les prix des carburants
      fetchCarburantsPrix();
    });

    return {
      pompe,
      showHistorique,
      quantiteInput,
      getStatusClass,
      selectCarburant,
      demarrerUtilisation,
      arreterPompe,
      payerCarburant,
      toggleHistorique,
      sortHistorique,
      showIncidentModal,
      incidentDescription,
      incidentNiveau,
      openIncidentModal,
      cancelIncident,
      creerIncident,
      rembourserPompe,
      showStopConfirmation,
      remainingAmount,
      cancelStop,
      processRefund,
      submitIncident
    };
  }
});

// Export nommé du composant
export { PompeComponent };
// Export par défaut pour compatibilité avec le code existant
export default PompeComponent;
</script>

<style scoped>
.pompe-container {
  display: flex;
  flex-direction: column;
  height: 700px;
  border: 1px solid #454D5E;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: #EDF0F7;
  padding: 15px;
}

.pompe-titre {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 20px;
  color: #2D3648;
}

.status-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-active {
  background-color: #2ecc71;
}

.status-inactive {
  background-color: #95a5a6;
}

.status-error {
  background-color: #e74c3c;
}

.status-in-use {
  background-color: #f1c40f;
}

.status-waiting-payment {
  background-color: #2ecc71;
}

.carburants-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.carburant-item {
  padding: 2px 15px;
  background-color: transparent;
  border: 1px solid #2D3648;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  color: #2D3648;
}

.carburant-item:hover {
  background-color: rgba(45, 54, 72, 0.1);
}

.carburant-item.selected {
  background-color: #2D3648;
  color: white;
  font-weight: bold;
}

.carburant-item.disabled {
  background-color: transparent;
  color: #95a5a6;
  border-color: #95a5a6;
  cursor: not-allowed;
  opacity: 0.7;
  pointer-events: none;
}

.pompe-quantite {
  margin-top: 15px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
}

.input-group {
  display: flex;
  margin-top: 5px;
}

.form-control {
  flex: 1;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px 0 0 4px;
}

.input-group .btn {
  border-radius: 0 4px 4px 0;
}

.pompe-details {
  margin-top: 10px;
  margin-bottom: 10px;
}

.detail-item {
  font-size: 1.1em;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pompe-historique {
  margin-top: 0;
  flex: 1;
  min-height: calc(100% - 180px);
  overflow-y: auto;
  background-color: white;
  border-radius: 8px;
  padding: 8px;
}

.pompe-historique table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.pompe-historique th {
  background-color: #f8f9fa;
  font-weight: bold;
  color: #2D3648;
  padding: 8px 4px;
  text-align: center;
  cursor: pointer;
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.pompe-historique th:hover {
  background-color: #e9ecef;
}

.pompe-historique td {
  padding: 8px 4px;
  text-align: center;
  border-bottom: 1px solid #f1f1f1;
  background-color: white;
}

.total-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.payment-type {
  font-size: 0.7em;
  color: #95a5a6;
  margin-top: 2px;
}

.pompe-footer {
  margin-top: auto;
}

.pompe-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  padding: 5px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
  text-align: center;
}

.btn-block {
  display: block;
  width: 100%;
}

.btn-primary, .btn-secondary, .btn-info {
  background-color: #2D3648;
  color: white;
}

.btn-primary:hover, .btn-secondary:hover, .btn-info:hover {
  background-color: #1a2130;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.incident-alert {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: #EDF0F7;
  border: 1px solid #454D5E;
  border-radius: 8px;
  margin-bottom: 15px;
}

.incident-icon {
  font-size: 1.2em;
  margin-right: 10px;
  color: #e74c3c;
  width: 20px;
  height: 20px;
  transform: rotate(45deg);
  background-color: #e74c3c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.incident-info {
  font-weight: bold;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.incident-info div:first-child {
  color: #2D3648;
}

.incident-info div:last-child {
  color: #7f8c8d;
  font-size: 0.9em;
}

.pompe-details.in-use, .pompe-details.waiting-payment {
  background-color: transparent;
  border: none;
  padding: 0;
}

.retour-button {
  margin-top: 10px;
  margin-bottom: 10px;
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.confirmation-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.confirmation-content h2 {
  margin-top: 0;
  color: #2c3e50;
}

.confirmation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.confirmation-buttons button {
  flex-grow: 1;
  margin: 0 5px;
  padding: 8px 15px;
}

.btn-primary {
  background-color: #e74c3c;
  color: white;
  border: none;
}

.btn-secondary {
  background-color: #7f8c8d;
  color: white;
  border: none;
}

/* Styles pour le modal de création d'incident */
.incident-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.incident-modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group textarea, .form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style> 