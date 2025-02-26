<template>
    <div class="bg-gray-100 min-h-screen p-6">
      <div class="bg-white rounded-lg shadow-xl max-w-4xl mx-auto p-8">
        <!-- Back Button -->
        <div class="mb-6">
          <router-link 
            to="/list-task" 
            class="flex items-center text-blue-500 hover:text-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Tasks
          </router-link>
        </div>
  
        <!-- Task Details -->
        <div v-if="task" class="space-y-8">
          <!-- Task Title and Status -->
          <div class="flex justify-between items-start">
            <h1 class="text-3xl font-bold text-gray-900">{{ task.title }}</h1>
            <span :class="[getStatusColor(task.status), 'px-4 py-1.5 text-sm font-medium rounded-full']">
              {{ statusOptions.find(option => option.value === task.status)?.label || task.status }}
            </span>
          </div>
  
          <!-- Task Description -->
          <div>
            <h2 class="text-lg font-medium text-gray-900 mb-2">Description</h2>
            <p class="text-gray-700 whitespace-pre-line">{{ task.description }}</p>
          </div>
  
          <!-- Task Metadata -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Assigned To -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500 mb-1">Assigned To</p>
              <p class="font-medium text-gray-900">{{ getUserName(task.assigned_to) }}</p>
            </div>
  
            <!-- Created On -->
            <div class="bg-gray-50 p-4 rounded-lg">
              <p class="text-sm text-gray-500 mb-1">Created On</p>
              <p class="font-medium text-gray-900">{{ formatDate(task.created_at) }}</p>
            </div>
          </div>
  
          <!-- Actions -->
          <div class="flex justify-end space-x-4 border-t pt-6">
            <button 
              @click="handleEditTask(task)"
              class="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
            >
              Edit Task
            </button>
            <button 
              @click="handleDeleteConfirm(task)"
              class="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
            >
              Delete Task
            </button>
          </div>
        </div>
  
        <!-- Loading State -->
        <div v-else-if="isLoading" class="py-32 flex justify-center">
          <div class="flex flex-col items-center">
            <svg class="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-gray-500">Loading task details...</p>
          </div>
        </div>
  
        <!-- Error State -->
        <div v-else-if="error" class="py-12 flex justify-center">
          <div class="bg-red-50 text-red-700 px-6 py-4 rounded-lg max-w-md text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-red-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>{{ error }}</p>
            <button 
              @click="fetchTask" 
              class="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-700 font-medium focus:outline-none"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  // Get task ID from route
  const route = useRoute();
  const taskId = route.params.id;
  
  // Task data
  const task = ref(null);
  const isLoading = ref(true);
  const error = ref(null);
  
  // Status options with colors
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { value: 'on_hold', label: 'On Hold', color: 'bg-purple-100 text-purple-800' },
    { value: 'canceled', label: 'Canceled', color: 'bg-red-100 text-red-800' }
  ];
  
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
  
  // Fetch task details
  const fetchTask = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const tasks = [
        { 
          id: 1, 
          title: 'Create wireframes for dashboard', 
          description: 'Design initial wireframes for the analytics dashboard based on the requirements document.',
          status: 'completed',
          assigned_to: 1,
          created_at: '2025-02-10T14:23:45'
        },
        // Add more tasks as needed
      ];
      task.value = tasks.find(t => t.id === parseInt(taskId));
    } catch (err) {
      console.error('Error fetching task:', err);
      error.value = 'Failed to load task details. Please try again later.';
    } finally {
      isLoading.value = false;
    }
  };
  
  // Handle edit task
  const handleEditTask = (task) => {
    // Navigate to edit page or open edit modal
    console.log('Edit task:', task);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = (task) => {
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      // Handle delete logic
      console.log('Delete task:', task);
    }
  };
  
  // Fetch task on mount
  onMounted(() => {
    fetchTask();
  });
  </script>