<script setup>
import { ref, onMounted, computed } from 'vue';

// Props for optional filtering
const props = defineProps({
  filterStatus: {
    type: String,
    default: null
  },
  filterAssignee: {
    type: [Number, String],
    default: null
  }
});

// Emit events for task actions
const emit = defineEmits(['edit-task', 'delete-task', 'view-task']);

// Sample tasks data (would come from API in real implementation)
const tasks = ref([]);
const isLoading = ref(true);
const error = ref(null);

// Status options with colors (same as in the form component)
const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'on_hold', label: 'On Hold', color: 'bg-purple-100 text-purple-800' },
  { value: 'canceled', label: 'Canceled', color: 'bg-red-100 text-red-800' }
];

// Delete confirmation modal
const showDeleteModal = ref(false);
const taskToDelete = ref(null);
const isDeleting = ref(false);

// Pagination
const currentPage = ref(1);
const pageSize = ref(5);
const totalPages = computed(() => Math.ceil(filteredTasks.value.length / pageSize.value));

// Task detail modal
const selectedTask = ref(null);
const showDetailModal = ref(false);

// Filters
const searchQuery = ref('');

// Get status color class
const getStatusColor = (status) => {
  const statusOption = statusOptions.find(option => option.value === status);
  return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
};

// Get user name by ID
const getUserName = (userId) => {
  const users = [
    { id: 1, username: 'John Smith' },
    { id: 2, username: 'Sarah Johnson' },
    { id: 3, username: 'Michael Rodriguez' },
    { id: 4, username: 'Emma Williams' },
    { id: 5, username: 'David Lee' },
  ];
  
  const user = users.find(user => user.id === userId);
  return user ? user.username : 'Unassigned';
};

// Computed filtered tasks
const filteredTasks = computed(() => {
  return tasks.value.filter(task => {
    // Apply status filter if provided
    if (props.filterStatus && task.status !== props.filterStatus) {
      return false;
    }
    
    // Apply assignee filter if provided
    if (props.filterAssignee && parseInt(task.assigned_to) !== parseInt(props.filterAssignee)) {
      return false;
    }
    
    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) || 
        task.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
});

// Computed paginated tasks
const paginatedTasks = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredTasks.value.slice(startIndex, endIndex);
});

// Load tasks data
const fetchTasks = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Sample data that would come from an API
    tasks.value = [
      { 
        id: 1, 
        title: 'Create wireframes for dashboard', 
        description: 'Design initial wireframes for the analytics dashboard based on the requirements document.',
        status: 'completed',
        assigned_to: 1,
        created_at: '2025-02-10T14:23:45'
      },
      { 
        id: 2, 
        title: 'Implement user authentication', 
        description: 'Integrate OAuth2 for user authentication and authorization.',
        status: 'in_progress',
        assigned_to: 3,
        created_at: '2025-02-15T09:12:30'
      },
      { 
        id: 3, 
        title: 'Optimize database queries', 
        description: 'Review and optimize slow-performing queries to improve application response time.',
        status: 'pending',
        assigned_to: 5,
        created_at: '2025-02-18T11:45:00'
      },
      { 
        id: 4, 
        title: 'Fix layout issues on mobile', 
        description: 'Address responsive design issues on smaller screen sizes.',
        status: 'on_hold',
        assigned_to: 2,
        created_at: '2025-02-20T16:33:20'
      },
      { 
        id: 5, 
        title: 'Write API documentation', 
        description: 'Create comprehensive documentation for all API endpoints.',
        status: 'canceled',
        assigned_to: 4,
        created_at: '2025-02-05T10:15:40'
      },
      { 
        id: 6, 
        title: 'Set up CI/CD pipeline', 
        description: 'Configure GitHub Actions for continuous integration and deployment.',
        status: 'in_progress',
        assigned_to: 3,
        created_at: '2025-02-22T08:05:15'
      },
      { 
        id: 7, 
        title: 'Create user onboarding flow', 
        description: 'Design and implement the onboarding experience for new users.',
        status: 'pending',
        assigned_to: 1,
        created_at: '2025-02-14T13:40:10'
      }
    ];
  } catch (err) {
    console.error('Error fetching tasks:', err);
    error.value = 'Failed to load tasks. Please try again later.';
  } finally {
    isLoading.value = false;
  }
};

// Handle edit task
const handleEditTask = (task) => {
  emit('edit-task', task);
};

// Handle view task details
const handleViewTask = (task) => {
  selectedTask.value = task;
  showDetailModal.value = true;
};

// Handle delete confirmation
const handleDeleteConfirm = (task) => {
  taskToDelete.value = task;
  showDeleteModal.value = true;
};

// Handle delete task
const handleDeleteTask = async () => {
  if (!taskToDelete.value) return;
  
  isDeleting.value = true;
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Remove from tasks list (in a real app, would call API)
    tasks.value = tasks.value.filter(task => task.id !== taskToDelete.value.id);
    
    // Emit event
    emit('delete-task', taskToDelete.value.id);
    
    // Close modal
    showDeleteModal.value = false;
    taskToDelete.value = null;
    
    // Adjust page if needed
    if (paginatedTasks.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  } catch (err) {
    console.error('Error deleting task:', err);
  } finally {
    isDeleting.value = false;
  }
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Load data on mount
onMounted(() => {
  fetchTasks();
});
</script>

<template>
  <div class="bg-gray-100 min-h-screen p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6">
        <div class="flex items-center mb-4 md:mb-0">
          <div class="bg-blue-100 p-3 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Task Management</h1>
        </div>
        
        <!-- Search bar -->
        <div class="relative w-full md:w-72">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search tasks..."
            class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            v-model="searchQuery"
          />
        </div>
      </div>
      
      <!-- Status filter buttons -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button
          class="px-4 py-1.5 rounded-full text-sm font-medium border-2 hover:bg-blue-50 transition-colors"
          :class="props.filterStatus === null ? 'border-blue-500 text-blue-700' : 'border-gray-200 text-gray-600'"
          @click="$emit('update:filterStatus', null)"
        >
          All Tasks
        </button>
        <button
          v-for="status in statusOptions"
          :key="status.value"
          class="px-4 py-1.5 rounded-full text-sm font-medium border-2 hover:opacity-80 transition-colors"
          :class="[
            status.color, 
            props.filterStatus === status.value ? 'border-blue-500' : 'border-transparent'
          ]"
          @click="$emit('update:filterStatus', status.value)"
        >
          {{ status.label }}
        </button>
      </div>
      
      <!-- Loading state -->
      <div v-if="isLoading" class="py-32 flex justify-center">
        <div class="flex flex-col items-center">
          <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-500">Loading tasks...</p>
        </div>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="py-12 flex justify-center">
        <div class="bg-red-50 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>{{ error }}</p>
          <button 
            @click="fetchTasks" 
            class="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 font-medium focus:outline-none"
          >
            Try Again
          </button>
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else-if="filteredTasks.length === 0" class="py-16 flex justify-center">
        <div class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="text-lg font-medium text-gray-700 mb-1">No tasks found</h3>
          <p class="text-gray-500 mb-4">Try adjusting your search or filters</p>
          <button 
            @click="searchQuery = ''; $emit('update:filterStatus', null); $emit('update:filterAssignee', null);" 
            class="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-md text-blue-700 font-medium focus:outline-none"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      <!-- Tasks List -->
      <div v-else class="overflow-hidden rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Assigned To
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Created
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="task in paginatedTasks" :key="task.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900 line-clamp-1">{{ task.title }}</div>
                  <div class="text-sm text-gray-500 line-clamp-1 hidden sm:block">{{ task.description }}</div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span :class="[getStatusColor(task.status), 'px-2 py-1 text-xs font-medium rounded-full']">
                  {{ statusOptions.find(option => option.value === task.status)?.label || task.status }}
                </span>
              </td>
              <td class="px-6 py-4 hidden md:table-cell">
                <div class="text-sm text-gray-500">{{ getUserName(task.assigned_to) }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                {{ formatDate(task.created_at) }}
              </td>
              <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                <div class="flex items-center justify-end space-x-2">
                  <!-- View Button -->
                  <button 
                    @click="handleViewTask(task)"
                    class="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                    title="View Details"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  
                  <!-- Edit Button -->
                  <button 
                    @click="handleEditTask(task)"
                    class="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                    title="Edit Task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <!-- Delete Button -->
                  <button 
                    @click="handleDeleteConfirm(task)"
                    class="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                    title="Delete Task"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="filteredTasks.length > 0" class="flex items-center justify-between mt-6">
        <div class="text-sm text-gray-500">
          Showing {{ ((currentPage - 1) * pageSize) + 1 }} to {{ Math.min(currentPage * pageSize, filteredTasks.length) }} of {{ filteredTasks.length }} tasks
        </div>
        
        <div class="flex space-x-2">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1 rounded border"
            :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            Previous
          </button>
          <button 
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 rounded border"
            :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            Next
          </button>
        </div>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
          <p class="text-gray-700 mb-6">
            Are you sure you want to delete the task "<span class="font-medium">{{ taskToDelete?.title }}</span>"? This action cannot be undone.
          </p>
          <div class="flex justify-end space-x-3">
            <button 
              @click="showDeleteModal = false; taskToDelete = null"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button 
              @click="handleDeleteTask"
              class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
              :disabled="isDeleting"
            >
              <svg v-if="isDeleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isDeleting ? 'Deleting...' : 'Delete Task' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Task Detail Modal -->
      <div v-if="showDetailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
        <div class="bg-white rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-xl font-bold text-gray-900">Task Details</h3>
            <button 
              @click="showDetailModal = false; selectedTask = null"
              class="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div v-if="selectedTask" class="space-y-6">
            <div>
              <div class="flex justify-between items-center">
                <h4 class="text-lg font-medium text-gray-900">{{ selectedTask.title }}</h4>
                <span :class="[getStatusColor(selectedTask.status), 'px-3 py-1 text-xs font-medium rounded-full']">
                  {{ statusOptions.find(option => option.value === selectedTask.status)?.label || selectedTask.status }}
                </span>
              </div>
              <p class="mt-2 text-gray-800 whitespace-pre-line">{{ selectedTask.description }}</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-500 mb-1">Assigned To</p>
                <p class="font-medium">{{ getUserName(selectedTask.assigned_to) }}</p>
              </div>
              
              <div class="bg-gray-50 p-4 rounded-lg">
                <p class="text-sm text-gray-500 mb-1">Created On</p>
                <p class="font-medium">{{ formatDate(selectedTask.created_at) }}</p>
              </div>
            </div>
            
            <div class="pt-4 flex justify-end space-x-3 border-t">
              <button 
                @click="handleEditTask(selectedTask); showDetailModal = false"
                class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
              >
                Edit Task
              </button>
              <button 
                @click="showDetailModal = false"
                class="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>