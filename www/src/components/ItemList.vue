<template>
  <div id="list">
    <ul class="list-group">
      <li
        v-for="item in item_list"
        :key="item.entry_id"
        v-bind:class="{'list-group-item-success': item.marked != 0 }"
        v-on:click="mark(item)"
        class="list-group-item text-truncate"
      >
        <span v-if="item.marked != 0">
          <s>{{ item.item_name }}</s>
          <a v-on:click="remove_item(item)" class="float-right padding-fixed">
            <TrashcanSvg />
          </a>
        </span>
        <span v-else>{{ item.item_name }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import TrashcanSvg from "@/components/TrashcanSvg.vue";

export default {
  name: "ItemList",
  props: {
    group: Object
  },
  methods: {
    ...mapActions({
      mark: "mark_item"
    }),
    ...mapActions(["remove_item"])
  },
  computed: {
    item_list() {
      if (this.group) {
        return this.group.items;
      } else {
        return [];
      }
    }
  },
  components: {
    TrashcanSvg
  }
};
</script>

<style scoped>
.padding-fixed {
  margin-top: -4px;
  margin-bottom: -4px;
}
</style>