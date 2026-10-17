<template>
  <div id="app" class="erp-app-container">
    <header class="erp-navbar" v-if="isLoggedIn">
      <!-- Marque & Statut Station -->
      <div class="nav-left">
        <div class="brand-badge">
          <div class="brand-logo">⛽</div>
          <div class="brand-text">
            <span class="brand-title">ERP TOTAL-HUB</span>
            <small class="brand-sub">Station-Service & Retail</small>
          </div>
        </div>

        <!-- Widget Statut Station -->
        <BaseWidget type="StationStatus" />
      </div>

      <!-- Navigation principale entre Opérations et Pilotage Gérant -->
      <nav class="nav-center">
        <router-link to="/grid" class="nav-tab" active-class="active">
          <span class="tab-icon">🛒</span>
          <span>Opérations & Caisse</span>
        </router-link>

        <router-link to="/gerant" class="nav-tab" active-class="active">
          <span class="tab-icon">📊</span>
          <span>Pilotage & Direction</span>
        </router-link>
      </nav>

      <!-- Profil Utilisateur & Déconnexion -->
      <div class="nav-right">
        <!-- Date et heure live -->
        <div class="clock-display">
          <span class="clock-time">{{ liveTime }}</span>
          <span class="clock-date">{{ liveDate }}</span>
        </div>

        <!-- Profil Employé Connecté -->
        <div class="user-profile-badge">
          <div class="user-avatar">
            {{ userInitials }}
          </div>
          <div class="user-details">
            <span class="user-fullname">{{ userFullName }}</span>
            <span class="user-role-badge" :class="{ gerant: currentUser?.isGerant === 1 }">
              {{ currentUser?.role || (currentUser?.isGerant === 1 ? 'Direction' : 'Opérateur') }}
            </span>
          </div>
        </div>

        <!-- Bouton Déconnexion -->
        <button @click="logout" class="btn-logout" title="Fermer la session">
          <span class="logout-icon">⎋</span>
          <span class="logout-text">Quitter</span>
        </button>
      </div>
    </header>

    <main class="erp-main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import BaseWidget from "@/components/header-widget/BaseWidget.vue";

const router = useRouter();
const route = useRoute();

interface UserProfile {
  idEmploye: number;
  identifiant: string;
  nom: string;
  prenom: string;
  isGerant: number;
  role?: string;
}

const currentUser = ref<UserProfile | null>(null);
const liveTime = ref('');
const liveDate = ref('');
let timerId: any = null;

const checkUser = () => {
  const raw = localStorage.getItem('user');
  if (raw) {
    try {
      currentUser.value = JSON.parse(raw);
    } catch {
      currentUser.value = null;
    }
  } else {
    currentUser.value = null;
  }
};

const updateClock = () => {
  const now = new Date();
  liveTime.value = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  liveDate.value = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
};

onMounted(() => {
  checkUser();
  updateClock();
  timerId = setInterval(updateClock, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});

router.afterEach(() => {
  checkUser();
});

const isLoggedIn = computed(() => {
  return route.path !== '/' && currentUser.value !== null;
});

const userFullName = computed(() => {
  if (!currentUser.value) return 'Non identifié';
  return `${currentUser.value.prenom || ''} ${currentUser.value.nom || ''}`.trim() || currentUser.value.identifiant;
});

const userInitials = computed(() => {
  if (!currentUser.value) return '??';
  const p = currentUser.value.prenom ? currentUser.value.prenom.charAt(0) : '';
  const n = currentUser.value.nom ? currentUser.value.nom.charAt(0) : '';
  return (p + n).toUpperCase() || 'U';
});

const logout = () => {
  localStorage.removeItem('user');
  currentUser.value = null;
  router.push('/');
};
</script>

<style>
/* Style global de l'application ERP */
.erp-app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: #f1f5f9;
  font-family: 'Inter', sans-serif;
}

.erp-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  color: #ffffff;
  padding: 8px 16px;
  height: 60px;
  box-sizing: border-box;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 50;
  gap: 16px;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo {
  font-size: 24px;
  background: #1e293b;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #334155;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #38bdf8;
}

.brand-sub {
  font-size: 10px;
  color: #94a3b8;
}

.nav-center {
  display: flex;
  background: #1e293b;
  border-radius: 8px;
  padding: 4px;
  gap: 4px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.15s ease;
}

.nav-tab:hover {
  color: #ffffff;
}

.nav-tab.active {
  background: #3b82f6;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.tab-icon {
  font-size: 14px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.clock-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  border-right: 1px solid #334155;
  padding-right: 14px;
}

.clock-time {
  font-size: 13px;
  font-weight: 800;
  font-family: monospace;
  color: #e2e8f0;
}

.clock-date {
  font-size: 10px;
  color: #94a3b8;
  text-transform: capitalize;
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 0 0 2px #1e293b;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-fullname {
  font-size: 12px;
  font-weight: 700;
  color: #f8fafc;
}

.user-role-badge {
  font-size: 9px;
  font-weight: 700;
  background: #334155;
  color: #94a3b8;
  padding: 1px 6px;
  border-radius: 4px;
  display: inline-block;
  margin-top: 2px;
}

.user-role-badge.gerant {
  background: #fef3c7;
  color: #92400e;
}

.btn-logout {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: #334155;
  color: #f1f5f9;
  border: 1px solid #475569;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #ef4444;
  border-color: #dc2626;
  color: white;
}

.logout-icon {
  font-size: 14px;
}

.erp-main-content {
  flex: 1;
  height: calc(100vh - 60px);
  padding: 8px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
