<template>
  <div id="app">
    <Navbar app_name="123" />

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
  components: {
    Navbar,
    ItemList,
    ItemAdd
  }
};
</script>


