<template>
  <div id="app">
    <Navbar />
    <div class="container">
      <ItemList />
      <item-add />
    </div>
  </div>
</template>

<script>
import Navbar from "./components/Navbar.vue";
import ItemList from "./components/ItemList.vue";
import ItemAdd from "./components/ItemAdd.vue";

export default {
  name: "App",
  mounted() {
    this.$store.dispatch('subscribe_to_events');
  },
  components: {
    Navbar,
    ItemList,
    ItemAdd
  }
};
</script>


