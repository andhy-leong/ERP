<template>
  <GridItem>
    <div class="pompe-container" :class="getStatusClass(pompe.status)">
      <!-- En-tête pompe -->
      <div class="pompe-header-card">
        <div class="pompe-badge">
          <span class="status-dot" :class="pompe.status"></span>
          <span class="pompe-numero">POMPE {{ pompe.numero }}</span>
        </div>
        <span class="status-tag" :class="pompe.status">{{ getStatusLabel(pompe.status) }}</span>
      </div>

      <!-- Corps pompe -->
      <div class="pompe-body">
        <!-- Vue Historique -->
        <div v-if="showHistorique" class="historique-view">
          <div class="historique-top">
            <h4>Dernières distributions</h4>
            <button class="btn-micro" @click="toggleHistorique">Retour</button>
          </div>
          <div class="table-scroll" v-if="pompe.historique && pompe.historique.length > 0">
            <table class="table-pompe">
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Type</th>
                  <th>Volume</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(tx, idx) in pompe.historique" :key="idx">
                  <td>{{ tx.heure }}</td>
                  <td>{{ tx.type }}</td>
                  <td>{{ tx.quantite }}</td>
                  <td><strong>{{ tx.total }}€</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="empty-hist">Aucune transaction enregistrée</p>
        </div>

        <!-- Vue standard d'exploitation -->
        <div v-else class="exploitation-view">
          <!-- Sélection du carburant si active -->
          <div v-if="pompe.type !== 'ELECTRIK'" class="carburant-selector">
            <button 
              v-for="carb in pompe.carburants" 
              :key="carb"
              class="carb-pill"
              :class="{ selected: carb === pompe.selectedCarburant }"
              :disabled="pompe.status !== 'active'"
              @click="selectCarburant(carb)"
            >
              {{ carb }}
            </button>
          </div>
          <div v-else class="electrik-badge">
            ⚡ BORNE RECHARGE HAUTE PUISSANCE
          </div>

          <!-- Pompe ACTIVE : saisie de volume à délivrer -->
          <div v-if="pompe.status === 'active'" class="state-active-box">
            <label>Quantité désirée :</label>
            <div class="input-action-row">
              <input 
                type="number" 
                v-model="quantiteInput" 
                placeholder="Litres (ex: 40)" 
                min="1" 
                max="120"
                class="input-qte"
              />
              <button class="btn-action-start" @click="demarrerLivraison">
                Démarrer ▶
              </button>
            </div>
            <div class="quick-preset-litres">
              <span @click="quantiteInput = '20'">20L</span>
              <span @click="quantiteInput = '40'">40L</span>
              <span @click="quantiteInput = '60'">60L</span>
              <span @click="quantiteInput = '80'">Plein (80L)</span>
            </div>
          </div>

          <!-- Pompe EN COURS D'UTILISATION -->
          <div v-if="pompe.status === 'in-use'" class="state-in-use-box">
            <div class="delivery-animation">
              <span class="anim-drop">💧</span>
              <span class="anim-text">Distribution en cours...</span>
            </div>
            <div class="meter-display">
              <div class="meter-item">
                <span class="m-label">Volume</span>
                <span class="m-val">{{ pompe.details?.quantite || '0.00' }} L</span>
              </div>
              <div class="meter-item">
                <span class="m-label">Montant</span>
                <span class="m-val highlight">{{ pompe.details?.montant || '0.00' }} €</span>
              </div>
            </div>
            <button class="btn-stop-delivery" @click="demanderArret">
              ■ Arrêter la pompe
            </button>
          </div>

          <!-- Pompe EN ATTENTE DE RÈGLEMENT -->
          <div v-if="pompe.status === 'waiting-payment'" class="state-waiting-box">
            <div class="waiting-title">⚠️ En attente de paiement</div>
            <div class="meter-display">
              <div class="meter-item">
                <span class="m-label">{{ pompe.selectedCarburant }}</span>
                <span class="m-val">{{ pompe.details?.quantite }} L</span>
              </div>
              <div class="meter-item">
                <span class="m-label">À régler</span>
                <span class="m-val price-big">{{ pompe.details?.montant }} €</span>
              </div>
            </div>
            <button class="btn-encaisser-pompe" @click="payerPompe">
              Encaisser au comptoir →
            </button>
          </div>

          <!-- Pompe EN INCIDENT -->
          <div v-if="pompe.status === 'incident'" class="state-incident-box">
            <div class="incident-badge-red">🚨 INCIDENT SIGNALÉ</div>
            <p class="incident-text">{{ pompe.incident?.details || 'Défaut capteur ou pistolet verrouillé' }}</p>
            <button class="btn-resolve-incident" @click="reinitialiserPompe">
              ✓ Acquitter & Réactiver
            </button>
          </div>
        </div>
      </div>

      <!-- Bas de pompe (Boutons annexes) -->
      <div class="pompe-footer">
        <button class="btn-footer" @click="toggleHistorique">
          {{ showHistorique ? 'Fermer Hist.' : '📋 Historique' }}
        </button>
        <button 
          v-if="pompe.status !== 'incident'" 
          class="btn-footer btn-warn" 
          @click="showIncidentModal = true"
        >
          ⚠️ Alerte
        </button>
      </div>

      <!-- Modal confirmation d'arrêt avec remboursement -->
      <div v-if="showStopConfirmation" class="modal-backdrop">
        <div class="modal-box">
          <h3>Arrêt avant fin de service</h3>
          <p>La pompe est interrompue. Reliquat restant : <strong>{{ remainingAmount }} €</strong></p>
          <div class="modal-choice-buttons">
            <button class="btn-refund" @click="executerRemboursement('Carte Bancaire')">Rembourser CB</button>
            <button class="btn-refund" @click="executerRemboursement('Espèces')">Rembourser Espèces</button>
            <button class="btn-refund" @click="executerRemboursement('Carte Énergie')">Crédit Énergie</button>
            <button class="btn-cancel" @click="showStopConfirmation = false">Annuler</button>
          </div>
        </div>
      </div>

      <!-- Modal de création d'incident -->
      <div v-if="showIncidentModal" class="modal-backdrop">
        <div class="modal-box">
          <h3>Signaler un incident sur la Pompe {{ pompe.numero }}</h3>
          <textarea 
            v-model="incidentDescription" 
            placeholder="Décrivez précisément l'avarie (ex: fuite pistolet, écran illisible, débit ralenti)..."
            rows="3"
            class="textarea-incident"
          ></textarea>
          <div class="select-row">
            <label>Niveau de gravité :</label>
            <select v-model="incidentNiveau">
              <option value="1">Niveau 1 - Mineur</option>
              <option value="2">Niveau 2 - Modéré (Arrêt recommandé)</option>
              <option value="3">Niveau 3 - Critique (Urgence sécurité)</option>
            </select>
          </div>
          <div class="modal-actions-row">
            <button class="btn-cancel" @click="showIncidentModal = false">Annuler</button>
            <button class="btn-danger-confirm" @click="soumettreIncident">Signaler l'incident</button>
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, PropType } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { 
  fetchPompe, 
  updatePompeState, 
  rembourserPompe, 
  creerIncidentPompe, 
  insertTransactionCaisse,
  fetchProduits
} from '@/services/erpService';
import { PompeData } from '@/data/mockDatabase';

export default defineComponent({
  name: 'PompeComponent',
  components: { GridItem },
  props: {
    pompeId: {
      type: Number,
      required: true
    },
    carburantsList: {
      type: Array as PropType<string[]>,
      default: () => []
    }
  },
  setup(props) {
    const pompe = ref<PompeData>({
      id: props.pompeId,
      numero: props.pompeId,
      type: 'Standard',
      status: 'active',
      carburants: props.carburantsList.length > 0 ? props.carburantsList : ['SP95-E10', 'Gazole B7', 'SP98'],
      selectedCarburant: 'SP95-E10',
      details: null,
      historique: [],
      incident: null,
      actions: { creer: true, arreter: false, payer: false, historique: true }
    });

    const showHistorique = ref(false);
    const quantiteInput = ref('35');
    const showStopConfirmation = ref(false);
    const remainingAmount = ref('0.00');
    const showIncidentModal = ref(false);
    const incidentDescription = ref('');
    const incidentNiveau = ref('2');
    const prixAuLitre = ref(1.85);

    const chargerDonneesPompe = async () => {
      try {
        const data = await fetchPompe(props.pompeId);
        if (data) {
          pompe.value = { ...data };
        }
        
        // Calculer prix actuel du carburant sélectionné
        const produits = await fetchProduits();
        const found = produits.find(p => p.nomProduit.toLowerCase().includes(pompe.value.selectedCarburant.toLowerCase().slice(0, 4)));
        if (found) {
          prixAuLitre.value = found.prix;
        }
      } catch (e) {
        console.error("Erreur chargement pompe", e);
      }
    };

    onMounted(() => {
      chargerDonneesPompe();
    });

    const selectCarburant = (carb: string) => {
      pompe.value.selectedCarburant = carb;
    };

    const demarrerLivraison = async () => {
      const qte = parseFloat(quantiteInput.value);
      if (isNaN(qte) || qte <= 0) return;

      const total = (qte * prixAuLitre.value).toFixed(2);
      const details = {
        quantite: qte.toFixed(2),
        montant: total,
        carburant: pompe.value.selectedCarburant
      };

      await updatePompeState(props.pompeId, 'in-use', details);
      pompe.value.status = 'in-use';
      pompe.value.details = details;

      // Simulation automatique: après 4 secondes de distribution, passe en attente de règlement
      setTimeout(async () => {
        if (pompe.value.status === 'in-use') {
          await updatePompeState(props.pompeId, 'waiting-payment', details);
          pompe.value.status = 'waiting-payment';
        }
      }, 4000);
    };

    const demanderArret = () => {
      const qteTotal = parseFloat(pompe.value.details?.quantite || '0');
      const moitie = (qteTotal * 0.4).toFixed(2);
      const montantReste = (parseFloat(moitie) * prixAuLitre.value).toFixed(2);
      remainingAmount.value = montantReste;
      showStopConfirmation.value = true;
    };

    const executerRemboursement = async (mode: string) => {
      const montant = parseFloat(remainingAmount.value) || 0;
      await rembourserPompe(props.pompeId, mode, montant);
      showStopConfirmation.value = false;
      await chargerDonneesPompe();
    };

    const payerPompe = async () => {
      if (!pompe.value.details) return;

      const total = parseFloat(pompe.value.details.montant);
      const qte = parseFloat(pompe.value.details.quantite);

      // Enregistre dans la caisse
      await insertTransactionCaisse({
        dateTransaction: new Date().toISOString().split('T')[0],
        heureTransaction: new Date().toLocaleTimeString(),
        idClient: null,
        prixTotal: total,
        idEmploye: 1,
        produits: [{
          idProduit: 1,
          nomProduit: `${pompe.value.selectedCarburant} (Pompe ${props.pompeId})`,
          prix: prixAuLitre.value,
          qteAchete: Math.round(qte)
        }],
        paiements: [{ mode: 'Carte Bancaire', montant: total }]
      });

      // Remet en service
      await updatePompeState(props.pompeId, 'active');
      pompe.value.status = 'active';
      pompe.value.details = null;
      await chargerDonneesPompe();
      alert(`Paiement de ${total.toFixed(2)}€ enregistré pour Pompe ${props.pompeId} !`);
    };

    const reinitialiserPompe = async () => {
      await updatePompeState(props.pompeId, 'active');
      pompe.value.status = 'active';
      pompe.value.incident = null;
    };

    const soumettreIncident = async () => {
      if (!incidentDescription.value) return;
      await creerIncidentPompe(props.pompeId, incidentDescription.value, parseInt(incidentNiveau.value));
      showIncidentModal.value = false;
      incidentDescription.value = '';
      await chargerDonneesPompe();
    };

    const toggleHistorique = () => {
      showHistorique.value = !showHistorique.value;
    };

    const getStatusClass = (st: string) => `pompe-${st}`;

    const getStatusLabel = (st: string) => {
      switch (st) {
        case 'active': return 'Disponible';
        case 'in-use': return 'En service';
        case 'waiting-payment': return 'À payer';
        case 'incident': return 'Incident';
        default: return st;
      }
    };

    return {
      pompe,
      showHistorique,
      quantiteInput,
      showStopConfirmation,
      remainingAmount,
      showIncidentModal,
      incidentDescription,
      incidentNiveau,
      selectCarburant,
      demarrerLivraison,
      demanderArret,
      executerRemboursement,
      payerPompe,
      reinitialiserPompe,
      soumettreIncident,
      toggleHistorique,
      getStatusClass,
      getStatusLabel
    };
  }
});
</script>

<style scoped>
.pompe-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  box-sizing: border-box;
}

.pompe-header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.pompe-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
}

.status-dot.active { background: #22c55e; }
.status-dot.in-use { background: #f59e0b; }
.status-dot.waiting-payment { background: #3b82f6; }
.status-dot.incident { background: #ef4444; }

.pompe-numero {
  font-size: 13px;
  font-weight: 800;
  color: #0f172a;
}

.status-tag {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-tag.active { background: #dcfce7; color: #166534; }
.status-tag.in-use { background: #fef3c7; color: #92400e; }
.status-tag.waiting-payment { background: #dbeafe; color: #1e40af; }
.status-tag.incident { background: #fee2e2; color: #991b1b; }

.pompe-body {
  flex: 1;
  padding: 10px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.carburant-selector {
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
  overflow-x: auto;
}

.carb-pill {
  font-size: 11px;
  padding: 4px 8px;
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  white-space: nowrap;
}

.carb-pill.selected {
  background: #1e293b;
  color: white;
  border-color: #1e293b;
}

.electrik-badge {
  background: #ecfeff;
  border: 1px solid #06b6d4;
  color: #0891b2;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  padding: 6px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.state-active-box {
  background: #f8fafc;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.state-active-box label {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 4px;
  display: block;
}

.input-action-row {
  display: flex;
  gap: 6px;
}

.input-qte {
  flex: 1;
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

.btn-action-start {
  background: #25a249;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

.quick-preset-litres {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.quick-preset-litres span {
  font-size: 10px;
  background: #e2e8f0;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
}

.meter-display {
  display: flex;
  justify-content: space-around;
  background: #0f172a;
  padding: 8px;
  border-radius: 6px;
  margin: 6px 0;
}

.meter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.m-label {
  font-size: 9px;
  color: #94a3b8;
  text-transform: uppercase;
}

.m-val {
  font-size: 15px;
  font-weight: 800;
  color: #ffffff;
}

.m-val.highlight {
  color: #f59e0b;
}

.m-val.price-big {
  color: #38bdf8;
  font-size: 18px;
}

.delivery-animation {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #d97706;
}

.btn-stop-delivery {
  width: 100%;
  background: #ef4444;
  color: white;
  padding: 6px;
  font-size: 12px;
  border-radius: 6px;
  margin-top: 4px;
}

.state-waiting-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 8px;
}

.waiting-title {
  font-size: 11px;
  font-weight: 700;
  color: #1d4ed8;
  text-align: center;
}

.btn-encaisser-pompe {
  width: 100%;
  background: #2563eb;
  color: white;
  padding: 7px;
  font-size: 12px;
  border-radius: 6px;
  margin-top: 4px;
}

.state-incident-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.incident-badge-red {
  font-size: 11px;
  font-weight: 800;
  color: #b91c1c;
}

.incident-text {
  font-size: 11px;
  color: #7f1d1d;
  margin: 4px 0;
}

.btn-resolve-incident {
  background: #16a34a;
  color: white;
  font-size: 11px;
  padding: 5px 10px;
  border-radius: 4px;
}

.pompe-footer {
  display: flex;
  justify-content: space-between;
  padding: 6px 10px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.btn-footer {
  background: transparent;
  color: #475569;
  font-size: 11px;
  padding: 2px 6px;
}

.btn-warn {
  color: #d97706;
}

.table-scroll {
  max-height: 120px;
  overflow-y: auto;
}

.table-pompe {
  width: 100%;
  font-size: 10px;
  border-collapse: collapse;
}

.table-pompe th, .table-pompe td {
  padding: 4px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-box {
  background: white;
  border-radius: 12px;
  padding: 18px;
  max-width: 360px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-box h3 {
  margin: 0 0 8px 0;
  font-size: 15px;
}

.modal-choice-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}

.btn-refund {
  background: #1e293b;
  color: white;
  padding: 8px;
  font-size: 12px;
  border-radius: 6px;
}

.btn-cancel {
  background: #e2e8f0;
  color: #334155;
  padding: 8px;
  font-size: 12px;
  border-radius: 6px;
}

.textarea-incident {
  width: 100%;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px;
  font-size: 12px;
  margin: 8px 0;
}

.select-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  margin-bottom: 10px;
}

.btn-danger-confirm {
  background: #dc2626;
  color: white;
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 6px;
}
</style>