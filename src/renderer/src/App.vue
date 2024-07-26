<script setup>
import { ref, computed } from "vue";
import Header from "./components/Header.vue";
import StarIcon from "./components/StarIcon.vue";
const tasks = ref([]);
const task = ref("");
const activeTab = ref("");

const refreshList = async () => {
  tasks.value = await window.electron.ipcRenderer.invoke("getTasks", activeTab.value);
};

const addNewTask = async () => {
  if (task.value) {
    window.electron.ipcRenderer.invoke("addNewTask", task.value, activeTab.value);
    task.value = "";
    refreshList();
    console.log(tasks.value);
  }
};

const removeTask = async (id) => {
  window.electron.ipcRenderer.invoke("removeTask", id, activeTab.value);
  refreshList();
};

async function addTaskGroup(taskGroup) {
  window.electron.ipcRenderer.invoke("addTaskGroup", taskGroup);
  refreshList();
}
async function removeTaskGroup(taskGroup) {
  window.electron.ipcRenderer.invoke("removeTaskGroup", taskGroup);
  refreshList();
}

async function changeTaskGroup(taskGroup) {
  activeTab.value = taskGroup;
  refreshList();
}

async function confirmTask(id) {
  window.electron.ipcRenderer.invoke("confirmTask", id, activeTab.value);
  refreshList();
}

async function claimStar(id) {
  window.electron.ipcRenderer.invoke("claimStar", id, activeTab.value);
  refreshList();
}

const numberOfConfirmed = computed(() => {
  return tasks.value.reduce((accum, task) => {
    return task.status == "done" ? accum + 1 : accum;
  }, 0);
});

const onlyDone = ref(false);
const onlyUndone = ref(false);
</script>

<template>
  <Header
    @changeTaskGroup="changeTaskGroup"
    @addTaskGroup="addTaskGroup"
    @removeTaskGroup="removeTaskGroup"
  />
  <div class="content">
    <div class="content__greetings">
      <div class="content__title">Todo List</div>
      <div class="content__nav">
        <div
          @click="
            onlyUndone = false;
            onlyDone = false;
          "
          :class="{ activeTab: !onlyUndone && !onlyDone }"
        >
          Все
        </div>
        <div
          @click="
            onlyUndone = true;
            onlyDone = false;
          "
          :class="{ activeTab: onlyUndone && !onlyDone }"
        >
          В процессе
        </div>
        <div
          @click="
            onlyDone = true;
            onlyUndone = false;
          "
          :class="{ activeTab: onlyDone && !onlyUndone }"
        >
          Готово
        </div>
      </div>
      <div class="task__stat">
        <div>Выполнено: {{ numberOfConfirmed }}</div>
        <div>Всего: {{ tasks.length }}</div>
      </div>
    </div>

    <div class="input__block" :class="{ disabled: !activeTab }">
      <div class="input__wrapper">
        <input v-model="task" type="text" placeholder="Введите задачу" />
        <button @click="addNewTask">Добавить</button>
      </div>
      <div class="task__wrapper">
        <div
          v-for="todo in tasks"
          :key="todo.id"
          class="task__block"
          :class="{
            none:
              (todo.status == 'done' && onlyUndone) || (todo.status == '' && onlyDone),
          }"
        >
          <div class="task__title" :class="{ confirmed: todo.status == 'done' }">
            {{ todo.name }}
          </div>
          <div class="buttonsGroup">
            <StarIcon :class="{ active: todo.star }" @click="claimStar(todo.id)" />
            <button class="task__confirm" @click="confirmTask(todo.id)">Выполнил</button>
            <button class="task__delete" @click="removeTask(todo.id)">Удалить</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.content__greetings {
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: space-between;
  padding-bottom: 10px;
}
.disabled {
  display: none !important;
}

.task__confirm {
  background-color: #737373;
  color: rgb(255, 255, 255);
  margin-right: 3px;
}

.task__confirm:hover {
  background-color: #575757;
}

.confirmed {
  text-decoration: line-through;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

.content {
  padding-top: 100px;
  background-color: #1e1e1e;
  color: #ffffff;
  padding: 100px 20px 20px 20px;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content__title {
  font-size: 24px;
  margin-bottom: 20px;
}

.input__block {
  margin-bottom: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.input__wrapper {
  display: flex;
  margin-bottom: 10px;
}

input {
  flex-grow: 1;
  padding: 8px;
  background-color: #2c2c2c;
  border: 1px solid #444;
  color: #ffffff;
}

button {
  padding: 8px 16px;
  background-color: #3a9185;
  color: white;
  border: none;
  cursor: pointer;
  transition: 0.3s;
  width: 120px;
  min-width: 120px;
  font-size: 16px;
  border-radius: 5px;
  margin-left: -5px;
}

button:hover {
  background-color: #2a6b63;
  color: black;
}

.task__wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-grow: 1;
  overflow-y: auto;
}

.task__block {
  background-color: #2c2c2c;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  transition: background-color 0.3s;
  overflow: hidden;
}

.task__delete {
  background-color: #b22130;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.task__delete:hover {
  background: #6a141d;
}

.task__block:hover {
  background-color: #3c3c3c;
}

.task__title {
  color: #ffffff;
  font-size: 16px;
  flex-grow: 1;
  padding: 12px;
}

input:focus-visible {
  outline: none;
}

.buttonsGroup {
  display: inline-flex;
  /* height: 100%; */
  gap: 10px;
  align-items: center;
}

.none {
  display: none;
}

.content__nav {
  display: flex;
  justify-content: space-between;
  background-color: #2c2c2c;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.content__nav > div {
  padding: 6px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-grow: 1;
  text-align: center;
}

.content__nav > div:hover {
  /* background-color: #3c3c3c; */
}

.activeTab {
  background-color: #3a9185;
  color: white;
}

.activeTab:hover {
  /* background-color: #2a6b63; */
}
</style>
