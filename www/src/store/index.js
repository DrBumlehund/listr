import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios";

Vue.use(Vuex)

// let origin = `${window.location.protocol}//${window.location.hostname}:8021`;
let origin = `${window.location.origin}`;


export default new Vuex.Store({
  state: {
    data: []
  },
  mutations: {
    SET_DATA(state, data) {
      state.data = data;
    },
    ADD_OR_UPDATE_GROUP(state, group) {
      let i = state.data.findIndex(
        (data_group) => data_group.group_id == Number(group.group_id)
      );
      if (i > -1) {
        // update group name
        state.data[i].group_name = group.group_name;
      } else {
        // add group
        state.data.push({
          group_id: group.group_id,
          group_name: group.group_name,
          items: []
        });
      }
    },
    ADD_OR_UPDATE_ITEM(state, item) {
      let group_idx = state.data.findIndex((data_group) => data_group.group_id == Number(item.group_id));
      if (group_idx == -1) {
        // invalid group
        state.data.push({ group_id: -100, group_name: "ERROR IN ADD_OR_UPDATE_ITEM", items: [item] })
      } else {
        // valid group
        let i = state.data[group_idx].items.findIndex(
          (list_item) => list_item.entry_id == Number(item.entry_id)
        );

        if (i > -1) {
          // update item
          if (item.item_name) {
            state.data[group_idx].items[i].item_name = String(item.item_name);
          }
          state.data[group_idx].items[i].marked = Number(item.marked);
        } else {
          // add item
          if (item.item_name) {
            state.data[group_idx].items.push(item);
          }
        }

      }
    },
    REMOVE_GROUP(state, group_id) {
      state.data = state.data.filter(group => group.group_id !== Number(group_id));
    },
    REMOVE_ITEM(state, item) {
      let i = state.data.findIndex((data_group) => data_group.group_id == Number(item.group_id));
      if (i !== -1) {
        state.data[i].items = state.data[i].items.filter(i => i.entry_id !== Number(item.entry_id));
      }
    }
  },
  actions: {
    add_group(context, group_name) {
      group_name = encodeURIComponent(group_name)
      axios
        .put(`${origin}/api/${group_name}`)
        .then((response) => {
          context.commit('ADD_OR_UPDATE_GROUP', response.data);
        })
    },
    add_item(context, item) {
      let group_id = item.group_id;
      let item_name = encodeURIComponent(item.item_name)
      axios
        .put(`${origin}/api/${group_id}/${item_name}`)
        .then((response) => {
          context.commit('ADD_OR_UPDATE_ITEM', response.data);
        })
    },
    mark_item(context, item) {
      let group_id = item.group_id;
      let marked = item.marked === 0 ? 1 : 0;
      axios
        .post(`${origin}/api/${group_id}/${item.entry_id}/${marked}`)
        .then((response) => {
          context.commit('ADD_OR_UPDATE_ITEM', response.data);
        });
    },
    subscribe_to_events(context) {
      let es = new EventSource(`${origin}/api/events`);
      es.onmessage = event => {
        let event_data = JSON.parse(event.data);

        if (event_data.event_name === "all_data") {
          context.commit('SET_DATA', event_data.payload);
        } else if (event_data.event_name === "update_group") {
          context.commit('ADD_OR_UPDATE_GROUP', event_data.payload);
        } else if (event_data.event_name === "update_item") {
          context.commit('ADD_OR_UPDATE_ITEM', event_data.payload);
        } else if (event_data.event_name === "delete_group") {
          context.commit('REMOVE_GROUP', event_data.payload);
        } else if (event_data.event_name === "delete_item") {
          context.commit('REMOVE_ITEM', event_data.payload);
        }

      };
    },
    remove_group(context, group_id) {
      axios
        .delete(`${origin}/api/${group_id}`)
        .then((response) => {
          if (response.status == 200) {
            context.commit('REMOVE_ITEM', group_id);
          }
        });
    },
    remove_item(context, item) {
      axios
        .delete(`${origin}/api/${item.group_id}/${item.entry_id}`)
        .then((response) => {
          if (response.status == 200) {
            context.commit('REMOVE_ITEM', { group_id: item.group_id, entry_id: item.entry_id });
          }
        });
    }
  },
  getters: {
    get_data(state) {
      return state.data;
    }
  }
})
