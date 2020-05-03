<template>
  <div class="mt-4" id="input">
    <div class="input-group mb-3">
      <input
        v-model="group_name"
        v-on:keyup.enter="add"
        type="text"
        class="form-control"
        placeholder="group name"
        aria-label="group name"
        aria-describedby="basic-addon2"
      />
      <div class="input-group-append">
        <button v-on:click="add" class="btn btn-outline-secondary" type="button">Add Group</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "GroupAdd",
  data: function() {
    return {
      group_name: ""
    };
  },
  methods: {
    ...mapActions(["add_group"]),
    add() {
      if (this.group_name != "") {
        this.add_group(this.group_name);
        this.group_name = "";
      }
    }
  }
};
</script>