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
      'bg-white border-r border-gray-200 min-h-[calc(100vh-65px)] transition-all duration-300 flex flex-col flex-shrink-0',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Navigation -->
    <nav class="flex-1 p-2 space-y-1 overflow-hidden">
      <!-- Dashboard -->
      <NuxtLink
        to="/dashboard"
        :class="[
          isActive('/dashboard')
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-50',
          'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
          isCollapsed ? 'justify-center' : '',
        ]"
        :title="isCollapsed ? 'Dashboard' : undefined"
      >
        <span class="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
        </span>
        <span v-if="!isCollapsed" class="whitespace-nowrap">Dashboard</span>
      </NuxtLink>

      <!-- Profile section (collapsible with Profile + Team) -->
      <div>
        <button
          type="button"
          :class="[
            route.path.startsWith('/profile') || route.path.startsWith('/team')
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50',
            'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
            isCollapsed ? 'justify-center' : '',
          ]"
          :title="isCollapsed ? 'Profile' : undefined"
          @click="
            isCollapsed ? (isCollapsed = false) : toggleSection('Profile')
          "
        >
          <span class="w-5 h-5 flex items-center justify-center flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </span>
          <template v-if="!isCollapsed">
            <span class="flex-1 text-left whitespace-nowrap">Profile</span>
            <svg
              :class="[
                'w-4 h-4 transition-transform',
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
          class="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1"
        >
          <NuxtLink
            to="/profile"
            :class="[
              isActive('/profile')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              'block px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap',
            ]"
          >
            Profile
          </NuxtLink>
          <NuxtLink
            to="/team"
            :class="[
              isActive('/team')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
              'block px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap',
            ]"
          >
            Team
          </NuxtLink>
        </div>
      </div>

      <!-- Products section -->
      <div class="border-t border-gray-200 my-2 pt-2">
        <div
          v-if="!isCollapsed"
          class="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider"
        >
          Your Products
        </div>

        <!-- Product list -->
        <div v-for="product in products" :key="product.id" class="space-y-1">
          <!-- Product link -->
          <NuxtLink
            :to="`/${product.slug}/feature-requests`"
            :class="[
              'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
              isProductActive(product.slug)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50',
              isCollapsed ? 'justify-center' : '',
            ]"
            :title="isCollapsed ? product.name : undefined"
          >
            <span
              class="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold"
            >
              {{ product.name.charAt(0).toUpperCase() }}
            </span>
            <template v-if="!isCollapsed">
              <div class="flex-1 min-w-0">
                <span class="block truncate">{{ product.name }}</span>
                <span class="text-xs text-gray-400"
                  >{{ product.featureRequestCount || 0 }} requests</span
                >
              </div>
              <svg
                v-if="!isProductActive(product.slug)"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-4 h-4 text-gray-400"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </template>
          </NuxtLink>

          <!-- Product sub-navigation (shown when this product is active) -->
          <div
            v-if="!isCollapsed && isProductActive(product.slug)"
            class="ml-4 pl-4 border-l border-gray-200 space-y-1"
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
                    isSectionActive(navItem)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                    'w-full flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors',
                  ]"
                  @click="toggleSection(`${product.slug}-${navItem.name}`)"
                >
                  <span class="flex-1 text-left whitespace-nowrap">{{
                    navItem.name
                  }}</span>
                  <svg
                    :class="[
                      'w-3 h-3 transition-transform',
                      isSectionExpanded(`${product.slug}-${navItem.name}`)
                        ? 'rotate-180'
                        : '',
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
                  class="mt-1 ml-3 pl-3 border-l border-gray-200 space-y-1"
                >
                  <NuxtLink
                    v-for="child in navItem.children"
                    :key="child.href"
                    :to="child.href"
                    :class="[
                      isActive(child.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                      'block px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap',
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
                  isActive(navItem.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700',
                  'block px-3 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap',
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
    <div class="p-2 border-t border-gray-200">
      <button
        type="button"
        class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
        :class="isCollapsed ? 'justify-center' : ''"
        @click="toggleSidebar"
      >
        <svg
          :class="[
            'w-5 h-5 transition-transform',
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
