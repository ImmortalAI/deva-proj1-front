<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { reactive, ref } from 'vue';
import { RouterLink } from 'vue-router'

const userStore = useUserStore();
const username = ref();
const password = ref();
const repeatPassword = ref();
const failed = reactive({ isFailed: false, msg: "" });

async function register() {
    if (password.value !== repeatPassword.value) {
        failed.isFailed = true;
        failed.msg = "Пароли не совпадают";
        return;
    }

    const response = await fetch("/api/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.value, password: password.value })
    });

    if (response.ok) {
        const data = await response.json();
        userStore.username = data?.username;
    }
    else {
        failed.isFailed = true;
        failed.msg = "Неверный логин или пароль";
    }
}
</script>

<template>
    <form>
        <label for="username">Имя пользователя:</label>
        <input v-model="username" name="username" type="text" placeholder="Username" autocomplete="username" />
        <label for="password">Пароль:</label>
        <input v-model="password" name="password" type="password" placeholder="Password"
            autocomplete="current-password" />
        <label for="repeat-password">Повторите пароль:</label>
        <input v-model="repeatPassword" name="repeat-password" type="password" placeholder="Repeat Password"
            autocomplete="current-password" />
        <button @click.prevent="register">Login</button>
        <p v-if="failed.isFailed">{{ failed.msg }}</p>
        <p>Уже есть аккаунт? <RouterLink to="/login">Вход.</RouterLink>
        </p>
    </form>
</template>