<template>
    <div class="w-full h-full flex flex-col gap-3">
        <Dialog :visible="dialogVisible" header="Создание проекта" :style="{ width: '25rem' }" :position="'top'" modal
            :draggable="false" :closable="false">
            <span class="text-neutral-500 dark:text-neutral-400 block mb-8">Генерация конспекта.</span>
            <div class="flex items-center gap-4 mb-4">
                <Textarea id="user-prompt" class="flex-auto" autocomplete="off" v-model="user_prompt"
                    placeholder="Введите пожелания по конспекту"></Textarea>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Отменить" severity="secondary" @click="cancel"></Button>
                <Button type="button" label="Отправить" @click="createSummaryTask"></Button>
            </div>
        </Dialog>
        <div class="flex items-center justify-between h-1/12">
            <Button :disabled="editorStore.mediaFile == null || editorStore.summaryInProgress" @click="openDialog">
                {{ editorStore.project_data?.summary_id == null ? 'Создать' : 'Пересоздать' }}
                нейро-конспект
            </Button>
            <div class="relative inline-flex items-center justify-center w-24 h-24" v-if="editorStore.summaryInProgress" >
                <ProgressSpinner
                    style="height: 50px; margin: 0;" />
                <span class="absolute text-center text-surface-500 font-semibold text-sm">{{ Math.floor(editorStore.summaryTaskProgress) }}</span>
            </div>
        </div>
        <div class="h-11/12">
            <MdEditor style="height: 100%;" v-model="editorStore.summaryFileContent" previewOnly
                :theme="theming.isDark ? 'dark' : 'light'" language="ru" :disabled="editorDisabled"
                @onSave="saveSummary" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import { computed, ref } from 'vue';
import { config, MdEditor } from 'md-editor-v3';
import { Button } from 'primevue';
import 'md-editor-v3/lib/style.css';
import RU from '@vavt/cm-extension/dist/locale/ru'
import { useEditorStore } from '@/stores/editor';
import axiosI from '@/utils/axiosInstance'

const editorDisabled = computed(() => {
    return editorStore.project_data?.summary_id == null || editorStore.summaryInProgress;
});

const user_prompt = ref('');
const theming = useTheme();

const editorStore = useEditorStore();
const dialogVisible = ref(false);

function isValidUUID(str: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

function createSummaryTask() {
    editorStore.createTask({ task_type: 'summary', prompt: user_prompt.value });
    dialogVisible.value = false;
}
function openDialog() {
    user_prompt.value = '';
    dialogVisible.value = true;
}
function cancel() {
    dialogVisible.value = false;
}

async function saveSummary() {
    const blob = new Blob([editorStore.summaryFileContent], { type: 'text/markdown' })
    const formData = new FormData();
    formData.append('file', blob, 'summary.md');
    const response = await axiosI.post("/file", formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        params: {
            project_id: editorStore.project_id,
        },
    });
    await editorStore.loadProjectData();
}

config({
    editorConfig: {
        languageUserDefined: {
            'ru': RU
        }
    },
    markdownItConfig(md) {
        // Сохраняем оригинальный рендерер для image
        const defaultRender = md.renderer.rules.image || ((tokens, idx, options, env, self) => {
            return self.renderToken(tokens, idx, options);
        });


        md.renderer.rules.image = (tokens, idx, options, env, self) => {
            const token = tokens[idx];
            const srcIndex = token.attrIndex('src');
            if (srcIndex >= 0) {
                const src = token.attrs![srcIndex][1];
                //if (isValidUUID(src))
                    token.attrs![srcIndex][1] = `${import.meta.env.VITE_API_BASE_URL}/file/download/${src}`;
            }
            // Вызываем оригинал
            return defaultRender(tokens, idx, options, env, self);
        };
    }
});

</script>