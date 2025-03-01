<template>
  <div class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="bg-white rounded-lg py-6 px-6 shadow-2xl w-full max-w-2xl">
      <h1 class="text-3xl font-bold text-gray-800">Create New Task</h1>

      <div v-if="apiError" class="mb-6 bg-red-100 border-l-4 border-red-500 p-4 rounded">
        <p class="text-red-700">{{ apiError }}</p>
      </div>

      <div v-if="showSuccess" class="mb-6 bg-green-100 border-l-4 border-green-500 p-4 rounded">
        <p class="text-green-700">Task created successfully! Redirecting to dashboard...</p>
      </div>

      <form @submit.prevent="handleSubmitTask" class="space-y-5">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
          <input
            type="text"
            id="title"
            placeholder="Enter a descriptive title"
            v-model="task.title"
            class="border-2 focus:border-blue-500 focus:ring-blue-500 rounded-lg w-full py-2 px-4 text-gray-700"
          />
          <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
        </div>

        <div>
          <label for="assigned_to" class="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
          <select
            id="assigned_to"
            v-model="task.assigned_to"
            class="border-2 focus:border-blue-500 focus:ring-blue-500 rounded-lg w-full py-2 px-4 text-gray-700"
          >
            <option value="" disabled>Select team member</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.username }}
            </option>
          </select>
          <p v-if="errors.assigned_to" class="mt-1 text-sm text-red-600">{{ errors.assigned_to }}</p>
        </div>

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            id="status"
            v-model="task.status"
            class="border-2 focus:border-blue-500 focus:ring-blue-500 rounded-lg w-full py-2 px-4 text-gray-700"
          >
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="description"
            placeholder="Provide details about what needs to be done"
            v-model="task.description"
            class="border-2 focus:border-blue-500 focus:ring-blue-500 rounded-lg w-full py-2 px-4 text-gray-700"
            rows="4"
          ></textarea>
          <p v-if="errors.description" class="mt-1 text-sm text-red-600">{{ errors.description }}</p>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button type="button" @click="handleCancel" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">Cancel</button>
          <button type="submit" class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Task' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { API_BASE_URL } from './urls';

const router = useRouter();


const task = ref({
  title: '',
  description: '',
  status: 'pending',
  assigned_to: ''
});

const errors = reactive({
  title: '',
  description: '',
  assigned_to: ''
});

const apiError = ref('');
const showSuccess = ref(false);
const isSubmitting = ref(false);
const users = ref([]);

const statusOptions = ref([
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'canceled', label: 'Canceled' }
]);

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }
    
    const response = await axios.get(`${API_BASE_URL}/list-users/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    users.value = response.data.results || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    if (error.response?.status === 401) {
      apiError.value = 'Unauthorized access. Redirecting to login...';
      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_id');
        router.push({ name: 'login' });
      }, 2000);
    } else {
      apiError.value = error.response?.data?.detail || error.message || 'Failed to load users. Please try again.';
    }
  }
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach(key => { errors[key] = ''; });

  if (!task.value.title?.trim()) {
    errors.title = 'Task title is required.';
    isValid = false;
  }
  
  if (!task.value.assigned_to) {
    errors.assigned_to = 'Assigning to a user is required.';
    isValid = false;
  }
  
  if (!task.value.description?.trim()) {
    errors.description = 'Description is required.';
    isValid = false;
  }
  
  return isValid;
};

const handleSubmitTask = async () => {
  apiError.value = '';
  
  if (!validateForm()) return;

  isSubmitting.value = true;

  try {
    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      apiError.value = 'Authentication token or user ID not found. Please log in again.';
      setTimeout(() => router.push({ name: 'login' }), 2000);
      return;
    }

    const payload = {
      ...task.value,
      created_by: parseInt(userId)  // Ensure this is a number
    };

    console.log('Payload being sent:', payload);  // Log the payload for debugging

    const response = await axios.post(
      `${API_BASE_URL}/taskservices/task-create/`, 
      payload,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    showSuccess.value = true;
    setTimeout(() => {
      router.push({ name: 'dashboard' });
    }, 2000);
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      apiError.value = error.response.data.detail || 'Error creating task. Please check your input.';
    } else {
      apiError.value = 'Network error. Please try again later.';
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  router.push({ name: 'dashboard' });
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>