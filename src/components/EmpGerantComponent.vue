<template>
  <GridItem id="emp-container">
    <div class="emp-card">
      <div class="emp-header">
        <div class="e-title">
          <span class="icon">👥</span>
          <h3>Équipe & Planning Station</h3>
        </div>
        <button class="btn-add-emp" @click="showAddEmpModal = true">+ Ajouter</button>
      </div>

      <div class="emp-scroll-list">
        <div 
          v-for="emp in employes" 
          :key="emp.idEmploye" 
          class="emp-row"
        >
          <div class="emp-avatar-wrapper">
            <span class="avatar-letter">{{ emp.prenom.charAt(0) }}{{ emp.nom.charAt(0) }}</span>
          </div>

          <div class="emp-info">
            <div class="name-role">
              <strong>{{ emp.prenom }} {{ emp.nom }}</strong>
              <span class="role-badge" :class="{ gerant: emp.isGerant === 1 }">
                {{ emp.role }}
              </span>
            </div>
            <div class="emp-contact">
              <span>🕒 {{ emp.heureDebutTravail }} - {{ emp.heureFinTravail }}</span>
              <span>📞 {{ emp.telephone }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Ajouter Employe -->
      <div v-if="showAddEmpModal" class="modal-backdrop">
        <div class="modal-emp-box">
          <h3>Enregistrer un collaborateur</h3>
          <form @submit.prevent="handleCreateEmploye">
            <div class="form-cols-2">
              <div>
                <label>Nom :</label>
                <input v-model="newEmp.nom" required placeholder="ex: Bernard" />
              </div>
              <div>
                <label>Prénom :</label>
                <input v-model="newEmp.prenom" required placeholder="ex: Lucas" />
              </div>
            </div>
            <div class="form-cols-2">
              <div>
                <label>Identifiant :</label>
                <input v-model="newEmp.identifiant" required placeholder="ex: lbernard" />
              </div>
              <div>
                <label>Mot de passe :</label>
                <input type="password" v-model="newEmp.motDePasse" required placeholder="••••••••" />
              </div>
            </div>
            <div class="form-cols-2">
              <div>
                <label>Rôle :</label>
                <select v-model="newEmp.role" required>
                  <option value="Caissier & Opérateur Station">Caissier & Opérateur</option>
                  <option value="Responsable Boutique">Responsable Boutique</option>
                  <option value="Gérant Adjoint">Gérant Adjoint</option>
                </select>
              </div>
              <div>
                <label>Est Gérant :</label>
                <select v-model.number="newEmp.isGerant">
                  <option :value="0">Non (Employé / Caissier)</option>
                  <option :value="1">Oui (Droits Gérant)</option>
                </select>
              </div>
            </div>
            <div class="form-cols-2">
              <div>
                <label>Début de shift :</label>
                <input type="time" v-model="newEmp.heureDebutTravail" required />
              </div>
              <div>
                <label>Fin de shift :</label>
                <input type="time" v-model="newEmp.heureFinTravail" required />
              </div>
            </div>
            <div class="modal-actions-row">
              <button type="button" class="btn-cancel" @click="showAddEmpModal = false">Annuler</button>
              <button type="submit" class="btn-save">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </GridItem>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import GridItem from "@/components/GridItem.vue";
import { fetchEmployes, addEmploye } from "@/services/erpService";
import { EmployeData } from "@/data/mockDatabase";

const employes = ref<EmployeData[]>([]);
const showAddEmpModal = ref(false);

const newEmp = ref({
  nom: '',
  prenom: '',
  identifiant: '',
  motDePasse: '123456',
  role: 'Caissier & Opérateur Station',
  isGerant: 0,
  heureDebutTravail: '08:00',
  heureFinTravail: '16:00',
  email: 'employe@station.fr',
  telephone: '06 00 00 00 00',
  actif: true
});

const loadEmployes = async () => {
  try {
    employes.value = await fetchEmployes();
  } catch (e) {
    console.error("Erreur chargement employes", e);
  }
};

onMounted(() => {
  loadEmployes();
});

const handleCreateEmploye = async () => {
  try {
    await addEmploye({ ...newEmp.value });
    showAddEmpModal.value = false;
    await loadEmployes();
    alert(`Collaborateur ${newEmp.value.prenom} ${newEmp.value.nom} ajouté avec succès !`);
  } catch (err) {
    console.error("Erreur ajout employe", err);
  }
};
</script>

<style scoped>
.emp-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
}

.emp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.e-title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.e-title h3 {
  margin: 0;
  font-size: 13px;
  color: #1e293b;
  font-weight: 700;
}

.btn-add-emp {
  background: #2563eb;
  color: white;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 4px;
}

.emp-scroll-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emp-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.emp-avatar-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
}

.emp-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.name-role {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.name-role strong {
  font-size: 12px;
  color: #0f172a;
}

.role-badge {
  font-size: 9px;
  padding: 2px 6px;
  border-radius: 10px;
  background: #e2e8f0;
  color: #475569;
  font-weight: 600;
}

.role-badge.gerant {
  background: #fef3c7;
  color: #92400e;
}

.emp-contact {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: #64748b;
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

.modal-emp-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  max-width: 420px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

.modal-emp-box h3 {
  margin: 0 0 12px 0;
  font-size: 15px;
}

.form-cols-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.modal-emp-box label {
  font-size: 11px;
  color: #475569;
  display: block;
  margin-bottom: 2px;
}

.modal-emp-box input, .modal-emp-box select {
  width: 100%;
  padding: 5px 8px;
  font-size: 12px;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  box-sizing: border-box;
}

.modal-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.btn-cancel {
  background: #e2e8f0;
  color: #334155;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
}

.btn-save {
  background: #2563eb;
  color: white;
  padding: 6px 14px;
  font-size: 12px;
  border-radius: 6px;
}
</style>