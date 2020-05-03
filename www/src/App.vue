<template>
  <div id="app">
    <Navbar />
    <div class="container">
      <GroupList />
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import GroupList from "@/components/GroupList.vue";

export default {
  name: "App",
  mounted() {
    this.$store.dispatch("subscribe_to_events");
  },
  components: {
    Navbar,
    GroupList
  }
};
</script>


