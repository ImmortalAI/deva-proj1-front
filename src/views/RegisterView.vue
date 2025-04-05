<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { reactive, ref } from 'vue';

const userStore = useUserStore();
const username = ref();
const password = ref();
const repeatPassword = ref();
const failed = reactive({ isFailed: false, msg: ""});

async function login(){
    if(password.value !== repeatPassword.value){
        failed.isFailed = true;
        failed.msg = "Пароли не совпадают";
        return;
    }

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
        failed.isFailed = true;
        failed.msg = "Неверный логин или пароль";
    }
}
</script>

<template>
    <form>
        <label for="username">Имя пользователя:</label>
        <input v-model="username" name="username" type="text" placeholder="Username" />
        <label for="password">Пароль:</label>
        <input v-model="password" name="password" type="password" placeholder="Password" />
        <label for="repeat-password">Повторите пароль:</label>
        <input v-model="repeatPassword" name="repeat-password" type="password" placeholder="Repeat Password" />
        <button @click.prevent="login">Login</button>
        <p v-if="failed.isFailed">{{ failed.msg }}</p>
    </form>
</template>