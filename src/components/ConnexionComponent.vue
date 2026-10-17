<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-circle">
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#25A249" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 22h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2Z"/>
            <path d="M18 10h4v10a2 2 0 0 1-2 2h-2"/>
            <path d="M7 6h4"/>
            <circle cx="9" cy="12" r="2"/>
          </svg>
        </div>
        <h1>ERP Station & Services</h1>
        <p class="subtitle">Système de gestion intégrée — Opérations, Caisse & Direction</p>
      </div>

      <div v-if="errorMessage" class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>{{ errorMessage }}</span>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="identifiant">Identifiant d'accès</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              id="identifiant"
              type="text" 
              v-model="identifiant" 
              placeholder="ex: admin ou employe" 
              required 
              autocomplete="username"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="mdp">Mot de passe</label>
          <div class="input-wrapper">
            <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              id="mdp"
              type="password" 
              v-model="mdp" 
              placeholder="••••••••" 
              required 
              autocomplete="current-password"
            />
          </div>
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading">Connexion en cours...</span>
          <span v-else>Accéder à l'ERP →</span>
        </button>
      </form>

      <div class="demo-section">
        <div class="demo-divider">
          <span>Comptes préconfigurés (Accès Rapide)</span>
        </div>
        <div class="demo-buttons">
          <button type="button" class="btn-demo gerant" @click="quickLogin('admin', 'admin123')">
            <span class="demo-role">👔 Profil Gérant</span>
            <span class="demo-creds">admin / admin123</span>
          </button>
          <button type="button" class="btn-demo caissier" @click="quickLogin('employe', 'employe123')">
            <span class="demo-role">🛒 Profil Caissier</span>
            <span class="demo-creds">employe / employe123</span>
          </button>
        </div>
      </div>

      <div class="login-footer">
        <span>Mode autonome connecté • Données persistantes locales</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '@/services/erpService';

const identifiant = ref('');
const mdp = ref('');
const errorMessage = ref('');
const loading = ref(false);

const router = useRouter();

const handleLogin = async () => {
  if (!identifiant.value || !mdp.value) {
    errorMessage.value = "Veuillez renseigner tous les champs requis.";
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    const result = await loginUser(identifiant.value, mdp.value);

    if (result.success && result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
      
      if (result.user.isGerant === 1) {
        router.push('/gerant');
      } else {
        router.push('/grid');
      }
    } else {
      errorMessage.value = result.error || "Identifiant ou mot de passe invalide.";
    }
  } catch (err) {
    errorMessage.value = "Erreur de connexion au service d'authentification.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const quickLogin = (user: string, pass: string) => {
  identifiant.value = user;
  mdp.value = pass;
  handleLogin();
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 120px);
  padding: 20px;
  background: radial-gradient(circle at 50% 20%, #f0f4f8 0%, #d9e2ec 100%);
  font-family: 'Inter', sans-serif;
}

.login-card {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.12), 0 1px 3px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
  padding: 36px 32px;
  box-sizing: border-box;
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-circle {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: #e6f7ec;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(37, 162, 73, 0.15);
}

.login-header h1 {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
}

.error-banner {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 10px 14px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 11px 12px 11px 40px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  background-color: #f8fafc;
  transition: all 0.2s ease;
  font-weight: 500;
  color: #1e293b;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #25a249;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(37, 162, 73, 0.15);
}

.btn-login {
  margin-top: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.2s ease;
}

.btn-login:hover:not(:disabled) {
  background: #000000;
  transform: translateY(-1px);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.demo-section {
  margin-top: 24px;
}

.demo-divider {
  position: relative;
  text-align: center;
  margin-bottom: 14px;
}

.demo-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.demo-divider span {
  position: relative;
  background: #ffffff;
  padding: 0 12px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.btn-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-demo:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  transform: translateY(-1px);
}

.demo-role {
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.demo-creds {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
}
</style>
