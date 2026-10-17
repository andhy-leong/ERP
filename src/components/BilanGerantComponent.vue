<template>
  <GridItem id="bilan-gerant-container">
    <div class="bilan-card">
      <div class="bilan-header">
        <div class="b-title">
          <span class="icon">📁</span>
          <h3>Bilans & Rapports Financiers</h3>
        </div>
        <span class="sub-tag">Comptabilité</span>
      </div>

      <div class="bilan-list">
        <div 
          v-for="(bilan, index) in bilansDisponibles" 
          :key="index"
          class="bilan-item"
          @click="ouvrirBilan(bilan)"
        >
          <div class="b-item-left">
            <span class="doc-icon">📄</span>
            <div class="b-meta">
              <strong>{{ bilan.titre }}</strong>
              <small>{{ bilan.periode }} • {{ bilan.type }}</small>
            </div>
          </div>
          <span class="btn-consulter">Consulter →</span>
        </div>
      </div>

      <!-- Modal de consultation du bilan -->
      <div v-if="selectedBilan" class="modal-backdrop">
        <div class="modal-bilan-box">
          <div class="modal-bilan-header">
            <h3>{{ selectedBilan.titre }}</h3>
            <span class="badge-type">{{ selectedBilan.periode }}</span>
          </div>

          <div class="modal-bilan-body">
            <div class="bilan-stat-row">
              <span>Date de génération :</span>
              <strong>{{ todayDate }}</strong>
            </div>
            <div class="bilan-stat-row">
              <span>Établissement :</span>
              <strong>Station Services Hub Total</strong>
            </div>
            <div class="bilan-stat-row">
              <span>Chiffre d'Affaires Global :</span>
              <strong class="text-green">{{ stats.chiffreAffaires.toFixed(2) }} €</strong>
            </div>
            <div class="bilan-stat-row">
              <span>Pertes constatées :</span>
              <strong class="text-red">{{ stats.totalPertes.toFixed(2) }} €</strong>
            </div>
            <div class="bilan-stat-row">
              <span>Marge nette calculée :</span>
              <strong>{{ stats.margeEstimee.toFixed(2) }} €</strong>
            </div>
            <div class="bilan-stat-row">
              <span>Nombre de transactions auditées :</span>
              <strong>{{ stats.nombreVentes }} tickets</strong>
            </div>
          </div>

          <div class="modal-bilan-actions">
            <button class="btn-print" @click="imprimerBilan">🖨️ Imprimer / Exporter</button>
            <button class="btn-close" @click="selectedBilan = null">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { getComptabiliteStats } from "@/services/erpService";

interface BilanDoc {
  titre: string;
  periode: string;
  type: string;
}

const todayDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

const bilansDisponibles: BilanDoc[] = [
  { titre: "Rapport Z - Clôture journalière de caisse", periode: "Aujourd'hui", type: "Fiscal & Caisse" },
  { titre: "Bilan mensuel des ventes carburant & boutique", periode: "Mois en cours", type: "Comptable" },
  { titre: "Journal des encaissements par mode de règlement", periode: "Hebdomadaire", type: "Audit Trésorerie" },
  { titre: "Valorisation inventaire & rotation des stocks", periode: "Semaine S42", type: "Logistique" },
  { titre: "Registre des démarques & pertes exceptionnelles", periode: "Mois en cours", type: "Contrôle de gestion" }
];

const selectedBilan = ref<BilanDoc | null>(null);

const stats = ref({
  chiffreAffaires: 0,
  totalPertes: 0,
  tresorerie: 0,
  nombreVentes: 0,
  panierMoyen: 0,
  margeEstimee: 0
});

onMounted(async () => {
  stats.value = await getComptabiliteStats();
});

const ouvrirBilan = async (bilan: BilanDoc) => {
  stats.value = await getComptabiliteStats();
  selectedBilan.value = bilan;
};

const imprimerBilan = () => {
  window.print();
};
</script>

<style scoped>
.bilan-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.bilan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.b-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.b-title h3 {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
}

.sub-tag {
  font-size: 10px;
  color: #64748b;
  font-weight: 600;
}

.bilan-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bilan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bilan-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(2px);
}

.b-item-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doc-icon {
  font-size: 16px;
}

.b-meta {
  display: flex;
  flex-direction: column;
}

.b-meta strong {
  font-size: 11px;
  color: #0f172a;
}

.b-meta small {
  font-size: 10px;
  color: #64748b;
}

.btn-consulter {
  font-size: 10px;
  color: #2563eb;
  font-weight: 700;
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

.modal-bilan-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 440px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-bilan-header {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 10px;
  margin-bottom: 12px;
}

.modal-bilan-header h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
}

.badge-type {
  font-size: 10px;
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.modal-bilan-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 16px;
}

.bilan-stat-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #f1f5f9;
}

.text-green { color: #16a34a; }
.text-red { color: #dc2626; }

.modal-bilan-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn-print {
  background: #2563eb;
  color: white;
  padding: 6px 12px;
  font-size: 11px;
  border-radius: 6px;
}

.btn-close {
  background: #e2e8f0;
  color: #334155;
  padding: 6px 12px;
  font-size: 11px;
  border-radius: 6px;
}
</style>