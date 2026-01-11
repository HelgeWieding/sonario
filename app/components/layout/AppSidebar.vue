<script setup lang="ts">
const route = useRoute();
const { products, selectedProduct, selectProduct, deselectProduct } =
  useProducts();

// Persist collapsed state
const isCollapsed = useState("sidebar-collapsed", () => false);

// Show product list when no product is selected
const showProductList = computed(
  () => !selectedProduct.value && products.value.length > 0
);

const navigation = computed(() => {
  const slug = selectedProduct.value?.slug;

  const productRoutes = slug
    ? [
        {
          name: "Feature Requests",
          href: `/${slug}/feature-requests`,
          icon: "inbox",
        },
        { name: "Messages", href: `/${slug}/messages`, icon: "envelope" },
        { name: "Contacts", href: `/${slug}/contacts`, icon: "users" },
        { name: "Feedback", href: `/${slug}/feedback`, icon: "chat" },
      ]
    : [];

  if (!slug) {
    return [];
  }

  return [
    ...productRoutes,
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
});

// Track which sections are expanded
const expandedSections = useState<string[]>("sidebar-expanded", () => [
  "Settings",
]);

function isActive(href: string) {
  return route.path.startsWith(href);
}

function isSectionActive(item: (typeof navigation.value)[0]) {
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

function handleProductSelect(product: (typeof products.value)[0]) {
  selectProduct(product);
}

function handleBackToProducts() {
  deselectProduct();
}
</script>

<template>
  <aside
    :class="[
      'bg-white border-r border-gray-200 min-h-[calc(100vh-65px)] transition-all duration-300 flex flex-col flex-shrink-0',
      isCollapsed ? 'w-16' : 'w-64',
    ]"
  >
    <!-- Back button when product is selected -->
    <div
      v-if="selectedProduct && !isCollapsed"
      class="p-2 border-b border-gray-200"
    >
      <button
        type="button"
        class="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        @click="handleBackToProducts"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        <span>All Products</span>
      </button>
      <div class="mt-2 px-3 py-1">
        <span class="text-xs font-medium text-gray-400 uppercase tracking-wider"
          >Current Product</span
        >
        <p class="text-sm font-semibold text-gray-900 mt-1 truncate">
          {{ selectedProduct.name }}
        </p>
      </div>
    </div>

    <!-- Collapsed back button -->
    <div
      v-if="selectedProduct && isCollapsed"
      class="p-2 border-b border-gray-200"
    >
      <button
        type="button"
        class="w-full flex items-center justify-center px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        title="All Products"
        @click="handleBackToProducts"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-4 h-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-2 space-y-1 overflow-hidden">
      <Transition name="sidebar-slide" mode="out-in">
        <!-- Product List View -->
        <div v-if="showProductList" key="product-list" class="space-y-1">
          <!-- Dashboard and Profile at top -->
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
            <span
              class="w-5 h-5 flex items-center justify-center flex-shrink-0"
            >
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
                route.path.startsWith('/profile') ||
                route.path.startsWith('/team')
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
              <span
                class="w-5 h-5 flex items-center justify-center flex-shrink-0"
              >
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

          <!-- Products list below -->
          <div class="border-t border-gray-200 my-2 pt-2">
            <div
              v-if="!isCollapsed"
              class="px-3 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider"
            >
              Your Products
            </div>
            <button
              v-for="item in products"
              :key="item.id"
              type="button"
              :class="[
                'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
                'text-gray-600 hover:bg-gray-50',
                isCollapsed ? 'justify-center' : '',
              ]"
              :title="isCollapsed ? item.name : undefined"
              @click="handleProductSelect(item)"
            >
              <span
                class="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold"
              >
                {{ item.name.charAt(0).toUpperCase() }}
              </span>
              <template v-if="!isCollapsed">
                <div class="flex-1 min-w-0">
                  <span class="block truncate">{{ item.name }}</span>
                  <span class="text-xs text-gray-400"
                    >{{ item.featureRequestCount || 0 }} requests</span
                  >
                </div>
                <svg
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
            </button>
          </div>
        </div>

        <!-- Product Navigation View -->
        <div v-else key="product-nav" class="space-y-1">
          <template v-for="item in navigation" :key="item.name">
            <!-- Item with children -->
            <div v-if="item.children">
              <button
                type="button"
                :class="[
                  isSectionActive(item)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50',
                  'w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isCollapsed ? 'justify-center' : '',
                ]"
                :title="isCollapsed ? item.name : undefined"
                @click="
                  isCollapsed ? (isCollapsed = false) : toggleSection(item.name)
                "
              >
                <span
                  class="w-5 h-5 flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    v-if="item.icon === 'settings'"
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
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                </span>
                <template v-if="!isCollapsed">
                  <span class="flex-1 text-left whitespace-nowrap">{{
                    item.name
                  }}</span>
                  <svg
                    :class="[
                      'w-4 h-4 transition-transform',
                      isSectionExpanded(item.name) ? 'rotate-180' : '',
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

              <!-- Children -->
              <div
                v-if="!isCollapsed && isSectionExpanded(item.name)"
                class="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1"
              >
                <NuxtLink
                  v-for="child in item.children"
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

            <!-- Simple item without children -->
            <NuxtLink
              v-else
              :to="item.href"
              :class="[
                isActive(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50',
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isCollapsed ? 'justify-center' : '',
              ]"
              :title="isCollapsed ? item.name : undefined"
            >
              <span
                class="w-5 h-5 flex items-center justify-center flex-shrink-0"
              >
                <svg
                  v-if="item.icon === 'home'"
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
                <svg
                  v-else-if="item.icon === 'inbox'"
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
                    d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3"
                  />
                </svg>
                <svg
                  v-else-if="item.icon === 'envelope'"
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
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
                <svg
                  v-else-if="item.icon === 'users'"
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
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
                <svg
                  v-else-if="item.icon === 'chat'"
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
                    d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                  />
                </svg>
              </span>
              <span v-if="!isCollapsed" class="whitespace-nowrap">{{
                item.name
              }}</span>
            </NuxtLink>
          </template>
        </div>
      </Transition>
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

<style scoped>
/* Sidebar slide transition */
.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: all 0.25s ease-out;
}

.sidebar-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.sidebar-slide-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
