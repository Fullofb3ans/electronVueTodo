<script setup>
import { ref, onMounted } from "vue";
const tabs = ref("");
const taskGroup = ref("");
const showModal = ref(false);
const emits = defineEmits([
  "addTaskGroup",
  "changeTaskGroup",
  "getGroups",
  "removeTaskGroup",
]);
const activeTab = ref("");

onMounted(async () => {
  tabs.value = await window.electron.ipcRenderer.invoke("getGroups");
});

const addTaskGroup = async () => {
  emits("addTaskGroup", taskGroup.value);
  taskGroup.value = "";
  showModal.value = false;
  tabs.value = await window.electron.ipcRenderer.invoke("getGroups");
};

const changeTaskGroup = (tab) => {
  activeTab.value = tab;
  emits("changeTaskGroup", tab);
};

const removeTaskGroup = async (tab) => {
  console.log(tab);
  emits("removeTaskGroup", tab);
  tabs.value = await window.electron.ipcRenderer.invoke("getGroups");
};

const goModal = () => {
  showModal.value = !showModal.value;
};
</script>
<template>
  <div class="tabs">
    <div
      class="tab_wrapper"
      v-for="tab in tabs"
      :key="tab"
      @click="changeTaskGroup(tab)"
      :class="{ active: activeTab == tab }"
    >
      <div class="removeTabField" @click="removeTaskGroup(tab)">x</div>
      <button class="tabButton">
        {{ tab }}
      </button>
    </div>
    <button class="addGroup" @click="goModal">+</button>
  </div>
  <div v-if="showModal" class="modal">
    <div class="modal-content">
      <input v-model="taskGroup" type="text" placeholder="Введите имя группы" />
      <div class="modal-buttons">
        <button class="task__delete" @click="goModal">Отмена</button>
        <button class="add__group" @click="addTaskGroup">Добавить</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.tabs {
  display: flex;
  background-color: #1e1e1e;
  flex-wrap: wrap;
}

.add__group {
  background-color: #3a9185;
}

.add__group:hover {
  background-color: #245952;
}

.tab_wrapper {
  /* flex-grow: 1; */
  position: relative;
  min-width: 150px;
}

.tab_wrapper button {
  width: 100%;
  padding: 12px 24px;
  background-color: #2c2c2c;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.active {
  background-color: #3a9185;
  border-bottom: 2px solid #3a9185;
}

.removeTabField {
  position: absolute;
  top: 0;
  right: 0;
  padding: 4px 8px;
  background-color: #aa1e2c;
  color: white;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.removeTabField:hover {
  opacity: 1;
}

.addGroup {
  padding: 12px 24px;
  background-color: #3a9185;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.addGroup:hover {
  background-color: #2a6860;
}

.modal {
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background-color: #2c2c2c;
  padding: 30px;
  border-radius: 8px;
  width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content input {
  width: 100%;
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #444;
  background-color: #1e1e1e;
  color: white;
}

.modal-buttons {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.modal-buttons button {
  flex: 1;
  padding: 10px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.task__delete {
  background-color: #b22130;
}

.task__delete:hover {
  background-color: #6a141d;
}

input {
  outline: none;
}
</style>
