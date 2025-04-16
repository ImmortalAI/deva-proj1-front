<template>
  <div class="container">
    <!-- Left section (60%) -->
    <div class="left-section">
      <!-- Picture block with minimal size -->
      <div class="image-block">
        <img
            :src="currentImage"
            alt="Display image"
            class="image-content"
        />
      </div>

      <!-- Timeline slider -->
      <div class="timeline-container">
        <Slider
            v-model="timelineValue"
            :min="0"
            :max="100"
            class="timeline-slider"
        />
      </div>
    </div>

    <!-- Right section (40%) -->
    <div class="right-section">
      <!-- Scrollable content -->
      <div class="scrollable-content" ref="scrollContainer">
        <div
            v-for="(item, index) in contentItems"
            :key="index"
            class="content-box"
            :class="{ 'active-box': index === activeIndex }"
            @click="setActive(index)"
        >
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
          <span class="time-marker">{{ item.time }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import Slider from 'primevue/slider';

// Sample data
interface ContentItem {
  title: string;
  description: string;
  time: string;
  image: string;
}

const contentItems = ref<ContentItem[]>([
  { title: 'Event 1', description: 'Description for event 1', time: '00:10', image: 'image1.jpg' },
  { title: 'Event 2', description: 'Description for event 2', time: '00:30', image: 'image2.jpg' },
  { title: 'Event 3', description: 'Description for event 3', time: '01:15', image: 'image3.jpg' },
  { title: 'Event 4', description: 'Description for event 4', time: '02:00', image: 'image4.jpg' },
  { title: 'Event 5', description: 'Description for event 5', time: '03:45', image: 'image5.jpg' },
  { title: 'Event 6', description: 'Description for event 6', time: '05:20', image: 'image6.jpg' },
  { title: 'Event 7', description: 'Description for event 7', time: '07:30', image: 'image7.jpg' },
]);

const timelineValue = ref(0);
const activeIndex = ref(0);
const currentImage = ref(contentItems.value[0].image);
const scrollContainer = ref<HTMLElement | null>(null);

// Convert time string to slider value (0-100)
const timeToValue = (time: string) => {
  const [minutes, seconds] = time.split(':').map(Number);
  return minutes * 60 + seconds;
};

// Initialize timeline max value based on last item
const maxTimeValue = timeToValue(contentItems.value[contentItems.value.length - 1].time);

// Update active item when slider changes
watch(timelineValue, (newValue) => {
  // Find the item closest to the current timeline position
  for (let i = 0; i < contentItems.value.length; i++) {
    const itemValue = timeToValue(contentItems.value[i].time);
    if (itemValue >= newValue) {
      activeIndex.value = i;
      currentImage.value = contentItems.value[i].image;
      scrollToActiveItem();
      break;
    }
  }
});

// Set active item and update timeline
const setActive = (index: number) => {
  activeIndex.value = index;
  timelineValue.value = timeToValue(contentItems.value[index].time);
  currentImage.value = contentItems.value[index].image;
};

// Scroll to the active item
const scrollToActiveItem = () => {
  if (scrollContainer.value) {
    const container = scrollContainer.value;
    const activeElement = container.children[activeIndex.value] as HTMLElement;
    container.scrollTo({
      top: activeElement.offsetTop - container.offsetTop - 20,
      behavior: 'smooth'
    });
  }
};

// Initialize with first item active
onMounted(() => {
  timelineValue.value = timeToValue(contentItems.value[0].time);
});
</script>

<style scoped>
.container {
  display: flex;
  height: 50vh;
  width: 100%;
}

.left-section {
  width: 60%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.right-section {
  width: 40%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.image-block {
  min-height: 300px; /* Minimal size */
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  background-color: #f5f5f5;
}

.image-content {
  max-width: 100%;
  max-height: 100%;
}

.timeline-container {
  width: 100%;
  padding: 20px 0;
}

.timeline-slider {
  width: 100%;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  height: calc(100vh - 400px); /* Matches timeline height */
}

.content-box {
  padding: 15px;
  margin-bottom: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.content-box:hover {
  background-color: #f9f9f9;
}

.active-box {
  background-color: #f0f7ff;
}

.time-marker {
  display: block;
  font-size: 0.8em;
  color: #666;
  margin-top: 5px;
}
</style>