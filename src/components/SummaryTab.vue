<template>
    <div class="w-full h-full flex flex-col gap-3">
        <div class="flex items-center justify-between h-1/12">
            <Button>{{ editorStore.project_data?.summary_id == null ? 'Создать' : 'Пересоздать' }}
                нейро-конспект
            </Button>
        </div>
        <div class="h-11/12">
            <MdEditor style="height: 100%;" v-model="editorStore.summaryFileContent" previewOnly :theme="theming.isDark ? 'dark' : 'light'" language="ru" :disabled="editorStore.project_data?.summary_id == null"/>
        </div>
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