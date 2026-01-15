<script setup lang="ts">
const route = useRoute();
const { products } = useProducts();

// Persist collapsed state
const isCollapsed = useState("sidebar-collapsed", () => false);

// Get the current product slug from route
const currentSlug = computed(() => route.params.slug as string | undefined);

// Get navigation items for a specific product
function getProductNavigation(slug: string) {
  return [
    {
      name: "Feature Requests",
      href: `/${slug}/feature-requests`,
      icon: "inbox",
    },
    { name: "Messages", href: `/${slug}/messages`, icon: "envelope" },
    { name: "Contacts", href: `/${slug}/contacts`, icon: "users" },
    { name: "Feedback", href: `/${slug}/feedback`, icon: "chat" },
    {
      name: "Settings",
      href: `/${slug}/settings`,
      icon: "settings",
      children: [
        { name: "Product", href: `/${slug}/settings` },
        { name: "Gmail", href: `/${slug}/settings/gmail` },
        { name: "Help Scout", href: `/${slug}/settings/helpscout` },
      ],
    },
  ];
}

// Track which sections are expanded
const expandedSections = useState<string[]>("sidebar-expanded", () => [
  "Settings",
]);

function isActive(href: string) {
  return route.path.startsWith(href);
}

function isExactActive(href: string) {
  return route.path === href;
}

function isProductActive(slug: string) {
  return currentSlug.value === slug;
}

function isSectionActive(item: { href: string; children?: { href: string }[] }) {
  if (item.children) {
    return item.children.some(
      (child) =>
        route.path === child.href || route.path.startsWith(child.href + "/")
    );
  }
  return isActive(item.href);
}

function toggleSection(name: string) {
  const index = expandedSections.value.indexOf(name);
  if (index === -1) {
    expandedSections.value.push(name);
  } else {
    expandedSections.value.splice(index, 1);
  }
}

function isSectionExpanded(name: string) {
  return expandedSections.value.includes(name);
}

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<template>
  <aside
    :class="[
      'bg-white min-h-[calc(100vh-56px)] transition-all duration-200 flex flex-col flex-shrink-0',
      isCollapsed ? 'w-16' : 'w-60',
    ]"
  >
    <!-- Navigation -->
    <nav class="flex-1 p-3 space-y-1 overflow-hidden scrollbar-thin">
      <!-- Dashboard -->
      <NuxtLink
        to="/dashboard"
        :class="[
          'relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
          isExactActive('/dashboard')
            ? 'text-neutral-900 bg-neutral-50'
            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
          isCollapsed ? 'justify-center' : '',
        ]"
        :title="isCollapsed ? 'Dashboard' : undefined"
      >
        <span
          v-if="isExactActive('/dashboard')"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-500 rounded-l"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-5 h-5 flex-shrink-0"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
        <span v-if="!isCollapsed" class="whitespace-nowrap">Dashboard</span>
      </NuxtLink>

      <!-- Profile section -->
      <div>
        <button
          type="button"
          :class="[
            'relative w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150',
            route.path.startsWith('/profile') || route.path.startsWith('/team')
              ? 'text-neutral-900 bg-neutral-50'
              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
            isCollapsed ? 'justify-center' : '',
          ]"
          :title="isCollapsed ? 'Profile' : undefined"
          @click="isCollapsed ? (isCollapsed = false) : toggleSection('Profile')"
        >
          <span
            v-if="route.path.startsWith('/profile') || route.path.startsWith('/team')"
            class="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-500 rounded-l"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5 flex-shrink-0"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          <template v-if="!isCollapsed">
            <span class="flex-1 text-left whitespace-nowrap">Profile</span>
            <svg
              :class="[
                'w-4 h-4 transition-transform duration-150',
                isSectionExpanded('Profile') ? 'rotate-180' : '',
              ]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </template>
        </button>

        <!-- Profile children -->
        <div
          v-if="!isCollapsed && isSectionExpanded('Profile')"
          class="mt-1 ml-8 space-y-0.5"
        >
          <NuxtLink
            to="/profile"
            :class="[
              'block px-3 py-1.5 text-sm rounded-md transition-colors duration-150',
              isActive('/profile')
                ? 'text-neutral-900 font-medium'
                : 'text-neutral-500 hover:text-neutral-900',
            ]"
          >
            Profile
          </NuxtLink>
          <NuxtLink
            to="/team"
            :class="[
              'block px-3 py-1.5 text-sm rounded-md transition-colors duration-150',
              isActive('/team')
                ? 'text-neutral-900 font-medium'
                : 'text-neutral-500 hover:text-neutral-900',
            ]"
          >
            Team
          </NuxtLink>
        </div>
      </div>

      <!-- Products section -->
      <div class="pt-5 mt-5">
        <div
          v-if="!isCollapsed"
          class="px-3 pb-2 text-xs font-medium text-neutral-400 uppercase tracking-wider"
        >
          Products
        </div>

        <!-- Product list -->
        <div v-for="product in products" :key="product.id" class="space-y-0.5">
          <!-- Product link -->
          <NuxtLink
            :to="`/${product.slug}/feature-requests`"
            :class="[
              'relative w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 text-left',
              isProductActive(product.slug)
                ? 'text-neutral-900 bg-neutral-50'
                : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900',
              isCollapsed ? 'justify-center' : '',
            ]"
            :title="isCollapsed ? product.name : undefined"
          >
            <span
              v-if="isProductActive(product.slug)"
              class="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-500 rounded-l"
            />
            <span
              class="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-md text-xs font-semibold bg-neutral-100 text-neutral-600"
            >
              {{ product.name.charAt(0).toUpperCase() }}
            </span>
            <template v-if="!isCollapsed">
              <div class="flex-1 min-w-0">
                <span class="block truncate">{{ product.name }}</span>
                <span class="text-xs text-neutral-400">
                  {{ product.featureRequestCount || 0 }} requests
                </span>
              </div>
            </template>
          </NuxtLink>

          <!-- Product sub-navigation -->
          <div
            v-if="!isCollapsed && isProductActive(product.slug)"
            class="ml-8 space-y-0.5 mt-1"
          >
            <template
              v-for="navItem in getProductNavigation(product.slug)"
              :key="navItem.name"
            >
              <!-- Item with children (Settings) -->
              <div v-if="navItem.children">
                <button
                  type="button"
                  :class="[
                    'w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors duration-150',
                    isSectionActive(navItem)
                      ? 'text-neutral-900 font-medium'
                      : 'text-neutral-500 hover:text-neutral-900',
                  ]"
                  @click="toggleSection(`${product.slug}-${navItem.name}`)"
                >
                  <span class="flex-1 text-left">{{ navItem.name }}</span>
                  <svg
                    :class="[
                      'w-3.5 h-3.5 transition-transform duration-150',
                      isSectionExpanded(`${product.slug}-${navItem.name}`) ? 'rotate-180' : '',
                    ]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                <!-- Settings children -->
                <div
                  v-if="isSectionExpanded(`${product.slug}-${navItem.name}`)"
                  class="ml-4 space-y-0.5 mt-0.5"
                >
                  <NuxtLink
                    v-for="child in navItem.children"
                    :key="child.href"
                    :to="child.href"
                    :class="[
                      'block px-3 py-1.5 text-sm rounded-md transition-colors duration-150',
                      isActive(child.href)
                        ? 'text-neutral-900 font-medium'
                        : 'text-neutral-500 hover:text-neutral-900',
                    ]"
                  >
                    {{ child.name }}
                  </NuxtLink>
                </div>
              </div>

              <!-- Simple nav item -->
              <NuxtLink
                v-else
                :to="navItem.href"
                :class="[
                  'block px-3 py-1.5 text-sm rounded-md transition-colors duration-150',
                  isActive(navItem.href)
                    ? 'text-neutral-900 font-medium'
                    : 'text-neutral-500 hover:text-neutral-900',
                ]"
              >
                {{ navItem.name }}
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Collapse toggle -->
    <div class="p-3">
      <button
        type="button"
        :class="[
          'w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 rounded-lg transition-colors duration-150',
          isCollapsed ? 'justify-center' : '',
        ]"
        @click="toggleSidebar"
      >
        <svg
          :class="[
            'w-5 h-5 transition-transform duration-150',
            isCollapsed ? 'rotate-180' : '',
          ]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
          />
        </svg>
        <span v-if="!isCollapsed" class="whitespace-nowrap">Collapse</span>
      </button>
    </div>
  </aside>
</template>
