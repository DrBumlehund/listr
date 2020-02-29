<template>
  <div id="list">
    <ul class="list-group">
      <li
        v-for="item in item_list"
        :key="item.entry_id"
        v-bind:class="{ active: item.marked != 0 }"
        v-on:click="mark(item.list_id, item.entry_id, item.marked)"
        class="list-group-item text-truncate"
      >{{ item.item_name }}</li>
    </ul>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ItemList",
  data() {
    return {
      item_list: null
    };
  },
  mounted() {
    var es = new EventSource("/api/events");

    es.onmessage = () => {
      this.update();
    };

    setInterval(() => this.update(), 15000); // update automatically every fifteen seconds

    this.update();
  },
  methods: {
    update: function() {
      axios.get(`${window.location.origin}/api/0`).then(response => {
        this.item_list = response.data;
      });
    },
    mark: function(list_id, entry_id, marked) {
      marked = marked != 0 ? 0 : 1; // flip the marked value
      axios
        .post(`${window.location.origin}/api/${list_id}/${entry_id}/${marked}`)
        .then(() => {
          this.update();
        });
    }
  }
};
</script>