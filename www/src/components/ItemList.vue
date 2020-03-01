<template>
  <div id="list">
    <ul class="list-group">
      <li
        v-for="item in item_list"
        :key="item.entry_id"
        v-bind:class="{ active: item.marked != 0 }"
        v-on:click="mark(item)"
        class="list-group-item text-truncate"
      >
        <s v-if="item.marked !=0">
          <span>{{ item.item_name }}</span>
        </s>
        <span v-else>{{ item.item_name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { mapActions } from "vuex";

export default {
  name: "ItemList",
  methods: {
    ...mapActions({
      mark: "mark_item"
    })
  },
  computed: {
    ...mapGetters({
      item_list: "get_item_list"
    })
  }
};
</script>