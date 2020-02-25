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
import axios from "axios";

export default {
  name: "ItemAdd",
  data: function() {
    return {
      item_name: ""
    };
  },
  methods: {
    add: function() {
      axios
        .put(`${window.location.origin}/api/0/${this.item_name}`)
        .then(() => {
          this.item_name = "";
        });
    }
  }
};
</script>