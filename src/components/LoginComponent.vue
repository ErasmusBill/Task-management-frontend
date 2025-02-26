<script setup>
import { ref, reactive } from 'vue';
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
      <h1 class="text-3xl font-semibold text-blue-600 text-center mb-6">Welcome Back</h1>
      <form @submit="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label for="username" class="text-gray-700 font-medium block">Username</label>
          <input
            type="text"
            id="username"
            v-model="loginForm.username"
            placeholder="Enter your username"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            :class="{'border-red-300 bg-red-50': loginForm.errors.username}"
          />
          <p v-if="loginForm.errors.username" class="text-red-500 text-sm">{{ loginForm.errors.username }}</p>
        </div>
        <div class="space-y-2">
          <label for="password" class="text-gray-700 font-medium block">Password</label>
          <input
            type="password"
            id="password"
            v-model="loginForm.password"
            placeholder="Enter your password"
            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            :class="{'border-red-300 bg-red-50': loginForm.errors.password}"
          />
          <p v-if="loginForm.errors.password" class="text-red-500 text-sm">{{ loginForm.errors.password }}</p>
        </div>
        <p v-if="loginForm.errors.server" class="text-red-500 text-sm">{{ loginForm.errors.server }}</p>
        <button
          type="submit"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition"
          :class="{'opacity-70 cursor-not-allowed': loginForm.isSubmitting}"
          :disabled="loginForm.isSubmitting"
        >
          {{ loginForm.isSubmitting ? 'Logging in...' : 'Log In' }}
        </button>
        <p class="mt-6 text-center text-sm text-gray-600">
          Don't have an account?
          <RouterLink to="/signup" class="font-medium text-blue-600 hover:text-blue-500">Sign up</RouterLink>
        </p>
      </form>
    </div>
  </div>
</template>