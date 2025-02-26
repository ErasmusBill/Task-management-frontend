<script setup>

</script>

<template>
     <body class="bg-gray-100">
    <!-- Sidebar -->
    <div class="fixed inset-y-0 left-0 w-64 bg-blue-900 text-white shadow-lg">
        <nav class="p-6">
            <ul class="space-y-4">
                <li>
                    <a href="#" class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300">
                        <i class="fas fa-plus mr-3"></i>
                        <span>Add Task</span>
                    </a>
                </li>
                <li>
                    <a href="#" class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300">
                        <i class="fas fa-key mr-3"></i>
                        <span>Change Password</span>
                    </a>
                </li>
                <li>
                    <a href="#" class="flex items-center p-3 rounded-lg hover:bg-blue-700 transition duration-300">
                        <i class="fas fa-sign-out-alt mr-3"></i>
                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="ml-64 p-8">
        <h1 class="text-2xl font-bold mb-6">Task Management Dashboard</h1>
        <p class="text-gray-700">Welcome to your task management system. Use the sidebar to navigate.</p>
    </div>
    </body>
</template>