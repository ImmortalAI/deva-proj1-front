<template>
    <div class="w-full h-full flex flex-col gap-3">
        <div class="flex items-center justify-between">
            <Button>{{ editorStore.project_data?.summary_file_id == null ? 'Создать' : 'Пересоздать' }}
                нейро-конспект</Button>
        </div>
        <MdEditor v-model="editorText" previewOnly :theme="theming.isDark ? 'dark' : 'light'" language="ru" />
    </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { ref } from 'vue';
import { config, MdEditor } from 'md-editor-v3';
import { Button } from 'primevue';
import 'md-editor-v3/lib/style.css';
import RU from '@vavt/cm-extension/dist/locale/ru'
import { useEditorStore } from '@/stores/editor';
const editorText = ref('');
const theming = useTheme();

const editorStore = useEditorStore();

config({
    editorConfig: {
        languageUserDefined: {
            'ru': RU
        }
    }
});

</script>