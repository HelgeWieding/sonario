<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-50 py-12 px-4">
    <div class="max-w-sm w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-12 h-12 bg-accent-500 rounded-xl mb-4">
          <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 9.5L5 4l3.5 3.5h7L19 4l3 5.5c0 6.5-4 11-10 11S2 16 2 9.5z"/>
            <ellipse cx="8.5" cy="12" rx="1.5" ry="2" class="fill-accent-700"/>
            <ellipse cx="15.5" cy="12" rx="1.5" ry="2" class="fill-accent-700"/>
            <path d="M12 15l-1 1.5h2L12 15z" class="fill-accent-700"/>
          </svg>
        </div>
        <h1 class="text-2xl font-semibold text-neutral-900">Sonario</h1>
        <p class="mt-2 text-sm text-neutral-500">AI-powered feature request management</p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-xl shadow-card p-6">
        <slot />
      </div>
    </div>
  </div>
</template>
