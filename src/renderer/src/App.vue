<script setup>
import { ref, onMounted } from "vue";
const tasks = ref("");
const task = ref("");
onMounted(async () => {
  tasks.value = await window.electron.ipcRenderer.invoke("getTasks");
});
const addNewTask = async () => {
  if (task.value) {
    window.electron.ipcRenderer.invoke("addNewTask", task.value);
    task.value = "";
    tasks.value = await window.electron.ipcRenderer.invoke("getTasks");
  }
};

const removeTask = async (id) => {
  window.electron.ipcRenderer.invoke("removeTask", id);
  tasks.value = await window.electron.ipcRenderer.invoke("getTasks");
};
</script>

<template>
  <div class="content">
    <div class="content__title">Todo List</div>
    <div class="input__block">
      <div class="input__wrapper">
        <input v-model="task" type="text" placeholder="Введите задачу" />
        <button @keyup.enter="addNewTask" @click="addNewTask">Добавить</button>
      </div>
      <div class="task__wrapper">
        <div v-for="todo in tasks" :key="todo.id" class="task__block">
          <div class="task__title">{{ todo.name }}</div>
          <button class="task__delete" @click="removeTask(todo.id)">Удалить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  font-size: 16px;
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
</style>
