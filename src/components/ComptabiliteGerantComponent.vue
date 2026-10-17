<template>
  <GridItem id="comptabilite-gerant-container">
    <div class="compta-card">
      <div class="compta-header">
        <div class="c-title">
          <span class="icon">📈</span>
          <h3>Comptabilité & Trésorerie Live</h3>
        </div>
        <span class="badge-live">Temps Réel</span>
      </div>

      <div class="kpi-grid">
        <div class="kpi-item ca">
          <span class="kpi-label">Chiffre d'Affaires</span>
          <span class="kpi-value">{{ stats.chiffreAffaires.toFixed(2) }} €</span>
          <small>{{ stats.nombreVentes }} transactions</small>
        </div>
        <div class="kpi-item pertes">
          <span class="kpi-label">Pertes / Frais</span>
          <span class="kpi-value text-red">{{ stats.totalPertes.toFixed(2) }} €</span>
          <small>Dépréciations & pertes</small>
        </div>
        <div class="kpi-item tresorerie">
          <span class="kpi-label">Trésorerie Disponible</span>
          <span class="kpi-value text-green">{{ stats.tresorerie.toFixed(2) }} €</span>
          <small>Fonds de caisse inclus</small>
        </div>
      </div>

      <!-- Saisie d'une perte ou dépense -->
      <div class="ajout-perte-box">
        <span class="perte-title">Enregistrer une perte / avarie :</span>
        <div class="inputs-row">
          <input 
            type="text" 
            placeholder="Motif de la perte (ex: casse article, perte carburant)..." 
            v-model="motifPerte"
            class="input-motif"
          />
          <input 
            type="number" 
            step="0.01" 
            placeholder="Montant €" 
            v-model="montantPerte"
            class="input-montant"
          />
          <button class="btn-ajouter-perte" @click="handleAjouterPerte">
            + Enregistrer
          </button>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { getComptabiliteStats, addPerte } from "@/services/erpService";

const stats = ref({
  chiffreAffaires: 0,
  totalPertes: 0,
  tresorerie: 0,
  nombreVentes: 0,
  panierMoyen: 0,
  margeEstimee: 0
});

const motifPerte = ref('');
const montantPerte = ref('');

const loadStats = async () => {
  try {
    stats.value = await getComptabiliteStats();
  } catch (err) {
    console.error("Erreur stats compta", err);
  }
};

onMounted(() => {
  loadStats();
});

const handleAjouterPerte = async () => {
  const montant = parseFloat(montantPerte.value);
  if (isNaN(montant) || montant <= 0 || !motifPerte.value.trim()) {
    alert("Veuillez renseigner un motif et un montant valide.");
    return;
  }

  try {
    let auteur = 'Gérant';
    const userData = localStorage.getItem('user');
    if (userData) {
      const u = JSON.parse(userData);
      auteur = `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Gérant';
    }

    await addPerte(motifPerte.value, montant, auteur);
    motifPerte.value = '';
    montantPerte.value = '';
    await loadStats();
    alert(`Perte de ${montant.toFixed(2)}€ enregistrée dans le journal comptable.`);
  } catch (e) {
    console.error("Erreur enregistrement perte", e);
  }
};
</script>

<style scoped>
.compta-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.compta-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.c-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.c-title h3 {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
}

.badge-live {
  font-size: 10px;
  font-weight: 700;
  background: #dcfce7;
  color: #166534;
  padding: 2px 6px;
  border-radius: 10px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 12px;
}

.kpi-item {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
}

.kpi-label {
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 700;
}

.kpi-value {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
  margin: 2px 0;
}

.kpi-value.text-red { color: #dc2626; }
.kpi-value.text-green { color: #16a34a; }

.kpi-item small {
  font-size: 9px;
  color: #94a3b8;
}

.ajout-perte-box {
  padding: 8px 12px;
  background: #ffffff;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.perte-title {
  font-size: 10px;
  font-weight: 600;
  color: #64748b;
}

.inputs-row {
  display: flex;
  gap: 6px;
}

.input-motif {
  flex: 2;
  padding: 5px 8px;
  font-size: 11px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.input-montant {
  flex: 1;
  max-width: 90px;
  padding: 5px 8px;
  font-size: 11px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
}

.btn-ajouter-perte {
  background: #dc2626;
  color: white;
  padding: 5px 10px;
  font-size: 11px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}
</style>