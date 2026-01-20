<script setup lang="ts">
import type {
    UserResource,
    EmailAddressResource,
    ExternalAccountResource,
} from "@clerk/types";

interface Props {
    user: UserResource;
    initials: string;
    openEmailMenuId: string | null;
    openAccountMenuId: string | null;
    settingPrimaryEmail: boolean;
    removingEmail: boolean;
    disconnectingAccount: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
    "update-profile": [];
    "add-email": [];
    "toggle-email-menu": [emailId: string];
    "set-primary-email": [emailId: string];
    "remove-email": [email: EmailAddressResource];
    "connect-account": [];
    "toggle-account-menu": [accountId: string];
    "disconnect-account": [account: ExternalAccountResource];
}>();

function getProviderName(provider: string): "google" | "github" | null {
    if (provider === "google" || provider === "github") {
        return provider;
    }
    return null;
}
</script>

<template>
    <div>
        <!-- Profile -->
        <div class="flex items-center py-4 border-b border-neutral-100">
            <span class="text-sm text-neutral-500 w-40">Profile</span>
            <div class="flex items-center gap-3 flex-1">
                <UiAvatar :src="user.imageUrl" :initials="initials" size="md" />
                <span class="font-medium text-neutral-900">{{ user.fullName || "User" }}</span>
            </div>
            <UiButton variant="ghost" size="sm" @click="emit('update-profile')">
                Update profile
            </UiButton>
        </div>

        <!-- Email addresses -->
        <div
            v-for="email in user.emailAddresses"
            :key="email.id"
            class="flex items-center py-3 border-b border-neutral-100"
        >
            <span class="text-sm text-neutral-500 w-40">
                {{ email.id === user.emailAddresses[0]?.id ? 'Email addresses' : '' }}
            </span>
            <div class="flex items-center gap-2 flex-1">
                <span class="text-sm text-neutral-900">{{ email.emailAddress }}</span>
                <UiBadge v-if="email.id === user.primaryEmailAddressId" size="sm">Primary</UiBadge>
            </div>
            <UiDropdownMenu
                v-if="email.id !== user.primaryEmailAddressId"
                :open="openEmailMenuId === email.id"
                :items="[
                    { label: 'Set as primary', action: () => emit('set-primary-email', email.id), disabled: settingPrimaryEmail },
                    { label: 'Remove', action: () => emit('remove-email', email), danger: true, disabled: removingEmail },
                ]"
                @toggle="emit('toggle-email-menu', email.id)"
            />
            <UiButton
                v-if="email.id === user.emailAddresses[0]?.id"
                variant="ghost"
                size="sm"
                @click="emit('add-email')"
            >
                + Add
            </UiButton>
        </div>

        <!-- Connected accounts -->
        <div
            v-for="(account, index) in user.externalAccounts"
            :key="account.id"
            class="flex items-center py-3 border-b border-neutral-100 last:border-0"
        >
            <span class="text-sm text-neutral-500 w-40">
                {{ index === 0 ? 'Connected accounts' : '' }}
            </span>
            <div class="flex items-center gap-2 flex-1">
                <IconsOAuthIcon v-if="getProviderName(account.provider)" :provider="getProviderName(account.provider)!" />
                <span class="text-sm text-neutral-900">{{ account.emailAddress }}</span>
            </div>
            <UiDropdownMenu
                :open="openAccountMenuId === account.id"
                :items="[{ label: 'Disconnect', action: () => emit('disconnect-account', account), danger: true, disabled: disconnectingAccount }]"
                @toggle="emit('toggle-account-menu', account.id)"
            />
            <UiButton
                v-if="index === 0"
                variant="ghost"
                size="sm"
                @click="emit('connect-account')"
            >
                + Add
            </UiButton>
        </div>

        <!-- No connected accounts -->
        <div v-if="user.externalAccounts.length === 0" class="flex items-center py-3">
            <span class="text-sm text-neutral-500 w-40">Connected accounts</span>
            <span class="text-sm text-neutral-500 flex-1">No connected accounts</span>
            <UiButton variant="ghost" size="sm" @click="emit('connect-account')">+ Add</UiButton>
        </div>
    </div>
</template>
