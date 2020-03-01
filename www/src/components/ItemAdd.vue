<template>
  <div class="mt-3" id="input">
    <div class="input-group mb-3">
      <input
        v-model="item_name"
        v-on:keyup.enter="add"
        type="text"
        class="form-control"
        placeholder="Item name"
        aria-label="Item name"
        aria-describedby="basic-addon2"
      />
      <div class="input-group-append">
        <button v-on:click="add" class="btn btn-outline-secondary" type="button">Add</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ItemAdd",
  data: function() {
    return {
      item_name: ""
    };
  },
  methods: {
    add: function() {
      if (this.item_name != "") {
        this.$store.dispatch("add_item_to_item_list", this.item_name);
        this.item_name = "";
      }
    }
  }
};
</script>