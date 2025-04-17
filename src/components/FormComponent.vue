<template>
  <GridItem :width="3" :height="2">
    <form @submit.prevent="handleSubmit">
      <label>
        Nom :
        <input v-model="formData.name" type="text" />
      </label>
    </form>
  </GridItem>
</template>

<script setup lang="ts">
import GridItem from "@/components/GridItem.vue";
import { ref } from 'vue';

const formData = ref({ name: ''});

const handleSubmit = () => {
  alert(`Nom soumis: ${formData.value.name}`);
}
</script>