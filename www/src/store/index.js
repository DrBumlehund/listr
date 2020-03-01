import Vue from 'vue'
import Vuex from 'vuex'
import axios from "axios";

Vue.use(Vuex)

// let origin = `${window.location.protocol}//${window.location.hostname}:8021`;
let origin = `${window.location.origin}`;


export default new Vuex.Store({
  state: {
    item_list: []
  },
  mutations: {
    ADD_OR_UPDATE_ITEM(state, item) {
      let i = state.item_list.findIndex(
        (list_item) => list_item.entry_id == item.entry_id
      );
      if (i > -1) {
        if (item.item_name) {
          state.item_list[i].item_name = item.item_name;
        }
        state.item_list[i].marked = Number(item.marked);
      } else {
        if (item.item_name) {
          state.item_list.push(item);
        }
      }
    },
    REMOVE_ITEM(state, entry_id) {
      state.item_list = state.item_list.filter(item => item.entry_id !== entry_id);
    }
  },
  actions: {
    add_item_to_item_list(context, item) {
      item = encodeURIComponent(item)
      axios
        .put(`${origin}/api/${item}`)
        .then((response) => {
          context.commit('ADD_OR_UPDATE_ITEM', response.data);
        })
    },
    mark_item(context, item) {
      let marked = item.marked === 0 ? 1 : 0;
      axios
        .post(`${origin}/api/${item.entry_id}/${marked}`)
        .then((response) => {
          context.commit('ADD_OR_UPDATE_ITEM', response.data);
        });
    },
    subscribe_to_events(context) {
      let es = new EventSource(`${origin}/api/events`);
      es.onmessage = event => {
        let event_data = JSON.parse(event.data);
        if (event_data.event_name === "update_item") {
          context.commit('ADD_OR_UPDATE_ITEM', event_data.payload);
        }
        else if (event_data.event_name === "all_items") {
          event_data.payload.forEach(item => {
            context.commit('ADD_OR_UPDATE_ITEM', item);
          });
        }
        else if (event_data.event_name === "delete_item") {
          context.commit('REMOVE_ITEM', event_data.payload);
        }
      };
    }
  },
  getters: {
    get_item_list(state) {
      return state.item_list
    },
    get_unmarked(state) {
      return state.item_list.filter(item => item.marked === 0);
    },
    get_marked(state) {
      return state.item_list.filter(item => item.marked !== 0);
    }
  }
})
