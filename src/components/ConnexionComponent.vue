<template>
  <div>
    <input type="text" v-model="identifiant" placeholder="Identifiant" required />
    <input type="password" v-model="mdp" placeholder="Mot de passe" required />

    <button @click="afficherLogin">Se connecter</button>
  </div>
</template>


<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';

// Déclaration des variables réactives avec des types explicites
const identifiant = ref<string | null>(null);
const mdp = ref<string | null>(null);
const isGerant = ref<number | null>(null);
const nom = ref<string | null>(null);
const prenom = ref<string | null>(null);

const router = useRouter();

const afficherLogin = async () => {
  // Vérifie que les valeurs identifiant et mdp ne sont pas nulles ou vides
  if ((identifiant.value !== null && mdp.value !== null) && (identifiant.value !== "" && mdp.value !== "")) {
    // Appeler la fonction pour vérifier l'utilisateur avec les informations saisies
    const isValidUser = await connectAndQuery(identifiant.value, mdp.value);
    
    // Si l'utilisateur est valide, on procède à l'enregistrement et à la redirection
    if (isValidUser) {
      const userData = {
        identifiant: identifiant.value,
        mdp: mdp.value,
        isGerant: isGerant.value,
        nom: nom.value,
        prenom: prenom.value
      };
      
      // Stocke l'objet userData dans le localStorage (il faut le convertir en string)
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Logique de redirection en fonction du rôle de l'utilisateur
      if (isGerant.value === 1) {
        router.push('/gerant');
      } else {
        router.push('/grid');
      }
    } else {
      console.log("probleme car connectAndQuery marche pas")
      console.error("Identifiant ou mot de passe incorrect");
    }
  } else {
    console.error("Identifiant ou mot de passe manquant");
  }
};



const connectAndQuery = async (identifiant: string, mdp: string): Promise<boolean> => {
  try {
    const response = await fetch('https://linserv-info-01/~lt305227/S401/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: identifiant,
        password: mdp,
      }),
    });
    
    // Assure que la réponse est bien au format JSON
    const data = await response.text(); // Récupérer la réponse sous forme de texte brut
    console.log("Réponse brute de l'API:", data);
    
    // Parser la réponse uniquement si elle semble être du JSON
    try {
      const jsonData = JSON.parse(data);
      console.log("Réponse JSON analysée:", jsonData);
      
      if (jsonData.idEmploye && jsonData.estGerant !== undefined) {
        isGerant.value = jsonData.estGerant;
        nom.value = jsonData.nom;         
        prenom.value = jsonData.prenom;   
        return true;
      } else if (jsonData.error) {
        console.error("Erreur d'authentification:", jsonData.error);
        return false;
      } else {
        console.error("Format de réponse incorrect");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors du parsing JSON:", error);
      return false;
    }
  } catch (error) {
    console.error("Erreur lors de l'appel API:", error);
    return false;
  }
};
</script>
