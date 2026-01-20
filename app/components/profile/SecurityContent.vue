<script setup lang="ts">
import type { SessionWithActivitiesResource } from "@clerk/types";

interface Props {
    hasPassword: boolean;
    hasTotpEnabled: boolean;
    sessions: SessionWithActivitiesResource[];
    currentSessionId: string | null;
    loadingSessions: boolean;
    revokingSession: string | null;
    enablingTotp: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    "change-password": [];
    "enable-totp": [];
    "disable-totp": [];
    "revoke-session": [session: SessionWithActivitiesResource];
    "delete-account": [];
}>();

const showAllSessions = ref(false);
const maxVisibleSessions = 3;

function formatSessionInfo(session: SessionWithActivitiesResource) {
    const activity = session.latestActivity;
    if (!activity) {
        return {
            device: "Unknown device",
            location: "Unknown location",
            lastActive: new Date(session.lastActiveAt).toLocaleString(),
        };
    }

    const browser = activity.browserName || "Unknown browser";
    const os = activity.deviceType || "";
    const city = activity.city || "";
    const country = activity.country || "";
    const location = [city, country].filter(Boolean).join(", ");

    return {
        device: [browser, os].filter(Boolean).join(" on "),
        location: location || "Unknown location",
        lastActive: new Date(session.lastActiveAt).toLocaleString(),
    };
}

const visibleSessions = computed(() => {
    if (showAllSessions.value) return props.sessions;
    return props.sessions.slice(0, maxVisibleSessions);
});
</script>

<template>
    <div>
        <!-- Password -->
        <div v-if="hasPassword" class="flex items-center py-4 border-b border-neutral-100">
            <span class="text-sm text-neutral-500 w-40">Password</span>
            <span class="text-sm text-neutral-900 flex-1">••••••••</span>
            <UiButton variant="ghost" size="sm" @click="emit('change-password')">
                Change password
            </UiButton>
        </div>

        <!-- Two-Factor Authentication -->
        <div class="flex items-center py-4 border-b border-neutral-100">
            <span class="text-sm text-neutral-500 w-40">Two-factor auth</span>
            <div class="flex-1">
                <UiBadge v-if="hasTotpEnabled" variant="success" size="sm">Enabled</UiBadge>
                <span v-else class="text-sm text-neutral-500">Not enabled</span>
            </div>
            <UiButton
                v-if="hasTotpEnabled"
                variant="ghost"
                size="sm"
                @click="emit('disable-totp')"
            >
                Disable
            </UiButton>
            <UiButton
                v-else
                variant="ghost"
                size="sm"
                :loading="enablingTotp"
                @click="emit('enable-totp')"
            >
                Enable
            </UiButton>
        </div>

        <!-- Active Sessions -->
        <div class="flex py-4 border-b border-neutral-100">
            <span class="text-sm text-neutral-500 w-40 pt-1">Active sessions</span>
            <div class="flex-1">
                <div v-if="loadingSessions" class="py-2">
                    <UiSpinner />
                </div>
                <div v-else-if="sessions.length === 0" class="text-sm text-neutral-500 py-1">
                    No active sessions
                </div>
                <div v-else>
                    <div
                        v-for="session in visibleSessions"
                        :key="session.id"
                        class="flex items-center py-2 px-3 bg-neutral-50 rounded-lg mb-2 last:mb-0"
                    >
                        <div class="flex-1">
                            <div class="flex items-center gap-2">
                                <span class="text-sm font-medium text-neutral-900">
                                    {{ formatSessionInfo(session).device }}
                                </span>
                                <UiBadge v-if="session.id === currentSessionId" size="sm" variant="success">
                                    Current
                                </UiBadge>
                            </div>
                            <span class="text-xs text-neutral-500">
                                {{ formatSessionInfo(session).location }} · Last active {{ formatSessionInfo(session).lastActive }}
                            </span>
                        </div>
                        <UiButton
                            v-if="session.id !== currentSessionId"
                            variant="ghost"
                            size="sm"
                            :loading="revokingSession === session.id"
                            @click="emit('revoke-session', session)"
                        >
                            Sign out
                        </UiButton>
                    </div>
                    <button
                        v-if="sessions.length > maxVisibleSessions"
                        @click="showAllSessions = !showAllSessions"
                        class="text-sm text-neutral-500 hover:text-neutral-700 mt-2"
                    >
                        {{ showAllSessions ? 'Show less' : `Show ${sessions.length - maxVisibleSessions} more` }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Account -->
        <div class="flex items-center py-4">
            <div class="w-40">
                <span class="text-sm text-neutral-500">Delete account</span>
                <p class="text-xs text-neutral-400">Permanently delete your account</p>
            </div>
            <div class="flex-1"></div>
            <button
                class="text-sm text-red-600 hover:text-red-700 font-medium"
                @click="emit('delete-account')"
            >
                Delete account
            </button>
        </div>
    </div>
</template>
