<template>
  <div class="min-h-screen bg-gray-100 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <div class="w-full md:w-64 bg-blue-900 text-white shadow-lg">
      <div class="p-6">
        <h2 class="text-xl font-bold mb-6">Task Manager</h2>
        <nav>
          <ul class="space-y-2">
            <li>
              <router-link 
                to="/dashboard" 
                class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <i class="fas fa-tachometer-alt mr-3"></i>
                <span>Dashboard</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/add-task" 
                class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <i class="fas fa-plus mr-3"></i>
                <span>Add Task</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/update-profile" 
                class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <i class="fas fa-user-edit mr-3"></i>
                <span>Update Profile</span>
              </router-link>
            </li>
            <li>
              <router-link 
                to="/change-password" 
                class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                <i class="fas fa-key mr-3"></i>
                <span>Change Password</span>
              </router-link>
            </li>
            <li>
              <button 
                @click="handleLogout" 
                class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300 w-full text-left"
              >
                <i class="fas fa-sign-out-alt mr-3"></i>
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-x-hidden">
      <header class="bg-white shadow-sm p-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Task Management Dashboard</h1>
            <p class="text-gray-600">Welcome to your task management system. Use the sidebar to navigate.</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-gray-800 font-semibold">Welcome, {{ loggedInUser }}</div>
            <form @submit.prevent="searchTasks">
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search tasks..." 
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          </div>
        </div>
      </header>

      <div class="p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Recent Tasks</h2>
        <div class="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="task in tasks" :key="task.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ task.title }}</div>
                  <div class="text-sm text-gray-500">{{ task.description }}</div>
                </td>
                <td class="px-6 py-4">
                  <span :class="[statusOptions.find(opt => opt.value === task.status)?.color, 'px-2 py-1 text-xs font-medium rounded-full']">
                    {{ statusOptions.find(opt => opt.value === task.status)?.label || task.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ getUserName(task.assigned_to) }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ new Date(task.created_at).toLocaleDateString() }}</td>
                <td class="px-6 py-4">
                  <button @click="editTask(task)" class="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button @click="deleteTask(task.id)" class="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-between mt-4">
          <button @click="previousPage" :disabled="currentPage <= 1" class="bg-blue-500 text-white px-4 py-2 rounded">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage >= totalPages" class="bg-blue-500 text-white px-4 py-2 rounded">Next</button>
        </div>
      </div>

      <!-- Edit Modal -->
      <div v-if="editingTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 class="text-xl font-bold mb-4">Edit Task</h2>
          <form @submit.prevent="saveTask">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <input v-model="editingTask.title" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" required />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Description</label>
              <textarea v-model="editingTask.description" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm" rows="3"></textarea>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <select v-model="editingTask.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option v-for="option in statusOptions" :value="option.value">{{ option.label }}</option>
              </select>
            </div>
            <div class="flex justify-end">
              <button type="button" @click="editingTask = null" class="mr-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">Cancel</button>
              <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { API_BASE_URL } from '@/components/urls';

const router = useRouter();

const tasks = ref([]);
const users = ref([]);
const isLoading = ref(true);
const error = ref(null);
const editingTask = ref(null);
const searchQuery = ref('');
const loggedInUser = ref('');
const userId = localStorage.getItem('user_id'); // Assuming user ID is stored in localStorage
const currentPage = ref(1); // Current page for pagination
const totalPages = ref(1); // Total pages based on the API response

// Status options with colors
const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-purple-100 text-purple-800' },
  { value: 'canceled', label: 'Canceled', color: 'bg-red-100 text-red-800' }
];

// Load tasks data from the DRF API
const fetchTasks = async (page = 1) => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`${API_BASE_URL}/taskservices/task-list/?page=${page}`);
    tasks.value = response.data.results || [];
    totalPages.value = Math.ceil(response.data.count / 10); // Assuming you have a count field
  } catch (err) {
    console.error('Error fetching tasks:', err);
    error.value = 'Failed to load tasks. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Load users data from the DRF API
const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/list-users/`);
    users.value = response.data.results || []; // Adjust based on your API response structure
  } catch (err) {
    console.error('Error fetching users:', err);
  }
};

// Get username by user ID
const getUserName = (userId) => {
  const user = users.value.find(user => user.id === userId);
  return user ? user.username : 'Unknown';
};

// Search for tasks
const searchTasks = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await axios.get(`${API_BASE_URL}/taskservices/search-task?title=${searchQuery.value}`);
    tasks.value = response.data.results || [];
    totalPages.value = 1; // Reset to 1 page if searching
    currentPage.value = 1; // Reset current page
  } catch (err) {
    console.error('Error searching tasks:', err);
    error.value = 'Failed to search tasks. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Handle pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    fetchTasks(currentPage.value);
  }
};

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    fetchTasks(currentPage.value);
  }
};

// Delete a task
const deleteTask = async (taskId) => {
  try {
    await axios.delete(`${API_BASE_URL}/taskservices/task-delete/${taskId}/`);
    tasks.value = tasks.value.filter(task => task.id !== taskId);
  } catch (err) {
    console.error('Error deleting task:', err);
  }
};

// Edit a task
const editTask = (task) => {
  editingTask.value = { ...task }; // Clone the task for editing
};

// Save edited task
const saveTask = async () => {
  try {
    await axios.put(`${API_BASE_URL}/taskservices/task-update/${editingTask.value.id}/`, editingTask.value);
    const index = tasks.value.findIndex(task => task.id === editingTask.value.id);
    if (index !== -1) {
      tasks.value[index] = { ...editingTask.value }; // Update task in the local array
    }
  } catch (err) {
    console.error('Error saving task:', err);
  } finally {
    editingTask.value = null; // Close the edit modal
  }
};

// Handle logout
const handleLogout = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      await axios.post(`${API_BASE_URL}/logout/`, {
        refresh_token: refreshToken,
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
    }

    // Clear tokens from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    
    // Redirect to login page
    router.push({ name: 'login' });
  } catch (error) {
    console.error('Logout failed:', error);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    router.push({ name: 'login' });
  }
};

// Load data on mount
onMounted(() => {
  fetchTasks(); // Fetch tasks from the task-list endpoint
  fetchUsers(); // Fetch users when the component is mounted
  const username = localStorage.getItem('username');
  if (username) {
    loggedInUser.value = username;
  }
});
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>