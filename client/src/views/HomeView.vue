<template>
    <a-layout>
      <a-layout-content style="padding: 50px 50px 0 50px">
        <div class="container">
          <a-typography-title :level="2" style="margin-bottom: 30px">Task Manager</a-typography-title>
          <a-card title="Add/Edit Task" style="margin-bottom: 20px">
            <a-form layout="vertical">
              <a-form-item label="Title">
                <a-input v-model:value="formState.title" placeholder="Task title" />
              </a-form-item>
              <a-form-item label="Description">
                <a-textarea v-model:value="formState.description" placeholder="Task description" />
              </a-form-item>
              <a-form-item v-if="editingTask" label="Status">
                <a-switch
                  v-model:checked="formState.completed"
                  checked-children="Completed"
                  un-checked-children="Pending"
                />
              </a-form-item>
              <a-space>
                <a-button type="primary" @click="submitForm">
                  {{ editingTask ? 'Update Task' : 'Add Task' }}
                </a-button>
                <a-button v-if="editingTask" @click="cancelEdit">Cancel</a-button>
              </a-space>
            </a-form>
          </a-card>

          <a-card title="Task List">
            <a-table :columns="columns" :data-source="tasks" :row-key="record => record._id">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'completed'">
                  <a-tag :color="record.completed ? 'green' : 'orange'">
                    {{ record.completed ? 'Completed' : 'Pending' }}
                  </a-tag>
                </template>
                <template v-if="column.key === 'actions'">
                  <a-space>
                    <a-button size="small" @click="toggleStatus(record)">Toggle Status</a-button>
                    <a-button size="small" @click="editTask(record)">Edit</a-button>
                    <a-button size="small" danger @click="deleteTask(record._id)">Delete</a-button>
                  </a-space>
                </template>
              </template>
            </a-table>
          </a-card>
        </div>
      </a-layout-content>
    </a-layout>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import axios from 'axios';

const tasks = ref([]);
const editingTask = ref(null);

const formState = reactive({
  title: '',
  description: '',
  completed: false
});

const columns = [
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    width: '25%'
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: '35%'
  },
  {
    title: 'Status',
    key: 'completed',
    width: '15%'
  },
  {
    title: 'Actions',
    key: 'actions',
    width: '25%'
  }
];

const fetchTasks = async () => {
  try {
    const response = await axios.get('/api/tasks');
    tasks.value = response.data;
  } catch (error) {
    message.error('Failed to load tasks');
    console.error(error);
  }
};

onMounted(() => {
  fetchTasks();
});

const submitForm = async () => {
  try {
    if (editingTask.value) {
      await axios.put(`/api/tasks/${editingTask.value._id}`, formState);
      message.success('Task updated');
    } else {
      await axios.post('/api/tasks', formState);
      message.success('Task added');
    }
    await fetchTasks();
    resetForm();
  } catch (error) {
    message.error('Failed to save task');
    console.error(error);
  }
};

const editTask = (task) => {
  editingTask.value = task;
  formState.title = task.title;
  formState.description = task.description;
  formState.completed = task.completed;
};

const cancelEdit = () => {
  editingTask.value = null;
  resetForm();
};

const resetForm = () => {
  formState.title = '';
  formState.description = '';
  formState.completed = false;
  editingTask.value = null;
};

const toggleStatus = async (task) => {
  try {
    await axios.patch(`/api/tasks/${task._id}/toggle`);
    message.success('Status toggled');
    await fetchTasks();
  } catch (error) {
    message.error('Failed to toggle status');
    console.error(error);
  }
};

const deleteTask = async (id) => {
  try {
    await axios.delete(`/api/tasks/${id}`);
    message.success('Task deleted');
    await fetchTasks();
  } catch (error) {
    message.error('Failed to delete task');
    console.error(error);
  }
};
</script>

<style lang="sass" scoped>
.container
  max-width: 1200px
  margin: 0 auto
</style>