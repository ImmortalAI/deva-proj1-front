<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { ref } from 'vue';

const userStore = useUserStore();
const username = ref();
const password = ref();
const isFailed = ref(false);

async function login(){
    const response = await fetch("/api/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.value, password: password.value })
    });

    if(response.ok){
        const data = await response.json();
        userStore.username = data?.username;
    }
    else{
        isFailed.value = true;
        password.value = '';
    }
}
</script>

<template>
    <form>
        <label for="username">Имя пользователя:</label>
        <input v-model="username" name="username" type="text" placeholder="Username" />
        <label for="password">Пароль:</label>
        <input v-model="password" name="password" type="password" placeholder="Password" />
        <button @click.prevent="login">Login</button>
        <p v-if="isFailed">Неверный логин или пароль</p>
        <p>Зарегистрироваться <RouterLink to="/register">здесь</RouterLink></p>
    </form>
</template>