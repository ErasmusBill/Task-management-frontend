<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// Router instance
const router = useRouter();

// Create a reactive form state object for login
const loginForm = reactive({
  username: '',
  password: '',
  errors: {
    username: '',
    password: '',
    server: ''
  },
  isSubmitting: false
});

// Compute completion percentage for form
const completionPercentage = computed(() => {
  let completed = 0;
  let total = 2; // Total number of required fields
  
  if (loginForm.username.trim()) completed++;
  if (loginForm.password.length >= 8) completed++;
  
  return Math.floor((completed / total) * 100);
});

// Login form validation function
const validateLoginForm = () => {
  loginForm.errors.username = '';
  loginForm.errors.password = '';
  loginForm.errors.server = '';

  let isValid = true;

  if (!loginForm.username.trim()) {
    loginForm.errors.username = 'Username is required';
    isValid = false;
  }

  if (!loginForm.password) {
    loginForm.errors.password = 'Password is required';
    isValid = false;
  } else if (loginForm.password.length < 8) {
    loginForm.errors.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  return isValid;
};

// Handle login submission with Axios
const handleLogin = async (event) => {
  event.preventDefault();
  loginForm.isSubmitting = true;

  if (!validateLoginForm()) {
    loginForm.isSubmitting = false;
    return;
  }

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login/', {
      username: loginForm.username,
      password: loginForm.password,
    });

    // Save tokens and user ID to localStorage
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    localStorage.setItem('user_id', response.data.user_id);  // Save user ID

    // Redirect to dashboard
    router.push('/dashboard');
  } catch (error) {
    // Check if the response contains an error message
    loginForm.errors.server = error.response?.data?.error || 'Login failed! Please check your credentials.';
  } finally {
    loginForm.isSubmitting = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-xl p-8 shadow-xl max-w-md w-full">
      <!-- Header with icon -->
      <div class="flex flex-col items-center mb-6">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 class="text-3xl font-semibold text-blue-600 text-center">Welcome Back</h1>
      </div>
      
      <!-- Progress indicator -->
      <div class="mb-6">
        <div class="flex justify-between text-sm text-gray-600 mb-1">
          <span>Completion</span>
          <span>{{ completionPercentage }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full" :style="`width: ${completionPercentage}%`"></div>
        </div>
      </div>
      
      <form @submit="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label for="username" class="text-gray-700 font-medium block flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Username
          </label>
          <input
            type="text"
            id="username"
            v-model="loginForm.username"
            placeholder="Enter your username"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            :class="{'border-red-300 bg-red-50': loginForm.errors.username}"
          />
          <p v-if="loginForm.errors.username" class="text-red-500 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ loginForm.errors.username }}
          </p>
        </div>
        
        <div class="space-y-2">
          <label for="password" class="text-gray-700 font-medium block flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Password
          </label>
          <input
            type="password"
            id="password"
            v-model="loginForm.password"
            placeholder="Enter your password"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            :class="{'border-red-300 bg-red-50': loginForm.errors.password}"
          />
          <p v-if="loginForm.errors.password" class="text-red-500 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {{ loginForm.errors.password }}
          </p>
        </div>
        
        <p v-if="loginForm.errors.server" class="text-red-500 text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ loginForm.errors.server }}
        </p>
        
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition flex items-center justify-center"
          :class="{'opacity-70 cursor-not-allowed': loginForm.isSubmitting}"
          :disabled="loginForm.isSubmitting"
        >
          <svg v-if="loginForm.isSubmitting" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          {{ loginForm.isSubmitting ? 'Logging in...' : 'Log In' }}
        </button>
        
        <p class="mt-6 text-center text-sm text-gray-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Don't have an account?
          <RouterLink to="/signup" class="font-medium text-blue-600 hover:text-blue-500 ml-1">Sign up</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>