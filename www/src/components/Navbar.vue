<template>
  <div
    id="listr-navbar"
    class="d-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow"
  >
    <h5 class="my-0 mr-md-auto font-weight-normal">{{ app_name }}</h5>
  </div>
</template>

<script>
export default {
  name: "Navbar",
  data: function() {
    return {
      app_name: "Listr"
    };
  }
};
</script>