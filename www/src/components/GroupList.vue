<template>
  <div>
    <div class="card mt-3" v-bind:key="group.group_id" v-for="group in get_data">
      <div class="card-header">
        <h6>
          {{group.group_name}}
          <a
            v-if="allMarked(group.items)"
            v-on:click="remove_group(group.group_id)"
            class="float-right padding-fixed"
          >
            <TrashcanSvg />
          </a>
        </h6>
      </div>
      <div class="card-body">
        <ItemList :group="group" />
        <ItemAdd :groupId="group.group_id" />
      </div>
    </div>

    <GroupAdd />
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import GroupAdd from "@/components/GroupAdd.vue";
import ItemList from "@/components/ItemList.vue";
import ItemAdd from "@/components/ItemAdd.vue";
import TrashcanSvg from "@/components/TrashcanSvg.vue";

export default {
  name: "GroupList",
  components: {
    GroupAdd,
    ItemList,
    ItemAdd,
    TrashcanSvg
  },
  computed: {
    ...mapGetters(["get_data"])
  },
  methods: {
    ...mapActions(["remove_group"]),
    allMarked(items) {
      let result = true;
      for (let i = 0; i < items.length; i++) {
        result &= items[i].marked;
      }
      return result;
    }
  }
};
</script>