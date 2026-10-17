<template>
  <GridItem id="carte-credit-button-container">
    <div class="card-credit-wrapper">
      <div class="card-credit-header">
        <span class="icon">💳</span>
        <h4>Services Carte Énergie</h4>
      </div>
      <div class="buttons-stack">
        <button class="action-btn primary" @click="ouvrirOffres">
          🏷️ Offres & Remises Fidélité
        </button>
        <button class="action-btn secondary" @click="rechargeRapide">
          ⚡ Recharger Carte Énergie
        </button>
        <button class="action-btn warning" @click="declarerPerte">
          🛡️ Déclaration Perte / Vol
        </button>
      </div>

      <!-- Modal Offres -->
      <div v-if="showModalOffres" class="modal-backdrop">
        <div class="modal-box">
          <h3>Programme de Remises Station</h3>
          <ul class="offres-list">
            <li><strong>-5 ct / L</strong> le week-end sur le Superéthanol E85</li>
            <li><strong>1 Lavage offert</strong> tous les 150L de carburant consommés</li>
            <li><strong>-10%</strong> sur les produits d'entretien boutique</li>
          </ul>
          <button class="btn-close-modal" @click="showModalOffres = false">Fermer</button>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref } from "vue";
import GridItem from "@/components/GridItem.vue";

const showModalOffres = ref(false);

const ouvrirOffres = () => {
  showModalOffres.value = true;
};

const rechargeRapide = () => {
  const montant = prompt("Montant du rechargement de crédit énergie (€) :", "50");
  if (montant && !isNaN(parseFloat(montant))) {
    alert(`Rechargement de ${montant}€ validé avec succès sur le compte fidélité !`);
  }
};

const declarerPerte = () => {
  const numCarte = prompt("Entrez le numéro de la carte à mettre en opposition :");
  if (numCarte) {
    alert(`La carte ${numCarte} a été immédiatement suspendue.`);
  }
};
</script>

<style scoped>
.card-credit-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  background: white;
  border-radius: 12px;
  box-sizing: border-box;
  justify-content: space-between;
}

.card-credit-header {
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 6px;
}

.card-credit-header h4 {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
}

.buttons-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: auto 0;
}

.action-btn {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
  border: 1px solid transparent;
  transition: transform 0.1s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}

.action-btn.secondary {
  background: #f0fdf4;
  color: #166534;
  border-color: #bbf7d0;
}

.action-btn.warning {
  background: #fef2f2;
  color: #991b1b;
  border-color: #fecaca;
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
  padding: 20px;
  max-width: 380px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-box h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
}

.offres-list {
  padding-left: 20px;
  font-size: 12px;
  color: #334155;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.btn-close-modal {
  width: 100%;
  background: #1e293b;
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
}
</style>