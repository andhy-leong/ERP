<template>
  <div id="app">
    <header>
        <BaseWidget type="StationStatus"/>
        <BaseWidget type="Documents"/>
        <BaseWidget type="Calendar" />
        <BaseWidget type="Task" />
    </header>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script>
import BaseWidget from "@/components/header-widget/BaseWidget.vue";

export default {
  name: 'App',
  components: {BaseWidget},
};
</script>

<style>
header {
  background-color: var(--primary-color);
  border-bottom: 1px solid var(--base-900);
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 50px;
}

header a {
  margin: 0 15px;
  text-decoration: none;
  font-weight: bold;
}

header a:hover {
  text-decoration: underline;
}
</style>
