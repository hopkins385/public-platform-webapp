<script setup lang="ts">
  const props = defineProps<{
    showVisualization: boolean;
  }>();

  const silenceThreshold = -50;
  const maxSilenceDuration = 800;

  const transcribedText = ref('');
  const isRecording = ref(false);
  const isUploading = ref(false);
  const uploadStatus = ref('');
  const visualizer = ref<HTMLCanvasElement | null>(null);

  let mediaRecorder: MediaRecorder | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let audioChunks: Blob[] = [];
  let animationFrame: number | null = null;
  let silenceTimer: NodeJS.Timeout | null = null;
  let silenceStart: number | null = null;
  let abortController: AbortController | null = null;

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // 16000 Hz .. 44100,
        },
        video: false,
      });

      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      if (props.showVisualization) {
        setupVisualization();
      }

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      });

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.onstop = handleStop;

      mediaRecorder.start();
      isRecording.value = true;

      startSilenceDetection(analyser);
    } catch (error) {
      console.error('Error accessing the microphone', error);
    }
  }

  function stopRecording() {
    if (!mediaRecorder || !isRecording.value) return;
    mediaRecorder.stop();
    isRecording.value = false;
    mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  }

  function handleDataAvailable(event: BlobEvent) {
    if (event.data.size < 1) return;
    audioChunks.push(event.data);
  }

  async function handleStop() {
    const audioBlob = new Blob(audioChunks, { type: 'audio/webm;codecs=opus' });
    audioChunks = [];
    stopSilenceDetection();
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
    }
    await sendAudioToAPI(audioBlob);
  }

  async function sendAudioToAPI(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audioFile', audioBlob, 'audio.webm');

    isUploading.value = true;
    uploadStatus.value = 'Processing...';

    abortController = new AbortController();

    try {
      const response = await $fetch('/api/transcribe/audio', {
        method: 'POST',
        body: formData,
        signal: abortController.signal,
      });
      uploadStatus.value = 'Upload successful!';
      transcribedText.value = response?.transcript || '';
      console.log('API response:', response);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        uploadStatus.value = 'Upload cancelled.';
      } else {
        uploadStatus.value = 'Upload failed.';
        console.error('Error sending audio to API:', error);
      }
    } finally {
      isUploading.value = false;
      abortController = null; // Clear the AbortController
    }
  }

  function startSilenceDetection(analyser: AnalyserNode) {
    silenceTimer = setInterval(() => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const decibels = 20 * Math.log10(average / 255);

      if (decibels < silenceThreshold) {
        if (!silenceStart) {
          silenceStart = Date.now();
        } else if (Date.now() - silenceStart > maxSilenceDuration) {
          stopRecording();
        }
      } else {
        silenceStart = null;
      }
    }, 100);
  }

  function stopSilenceDetection() {
    if (!silenceTimer) return;
    clearInterval(silenceTimer);
    silenceStart = null;
  }

  function cancelUpload() {
    if (!abortController) return;
    abortController.abort();
    uploadStatus.value = 'Upload cancelled.';
    isUploading.value = false;
  }

  function setupVisualization() {
    if (!analyser || !visualizer.value) return;

    const canvasCtx = visualizer.value.getContext('2d');
    if (!canvasCtx) return;

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyser || !canvasCtx || !visualizer.value) return;

      animationFrame = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(240, 240, 250)'; // Light blue-gray background
      canvasCtx.fillRect(0, 0, visualizer.value.width, visualizer.value.height);

      const barWidth = (visualizer.value.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * visualizer.value.height;

        // Create a blue-ish gradient based on the amplitude
        const blueValue = Math.floor(150 + (dataArray[i] / 255) * 105); // Range from 150 to 255
        const greenValue = Math.floor(190 + (dataArray[i] / 255) * 65); // Range from 190 to 255
        canvasCtx.fillStyle = `rgb(0, ${greenValue}, ${blueValue})`;

        canvasCtx.fillRect(x, visualizer.value.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
      }
    };

    draw();
  }

  watch(
    () => props.showVisualization,
    (newValue) => {
      if (newValue && isRecording.value) {
        setupVisualization();
      } else if (!newValue && animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    },
  );

  onBeforeUnmount(() => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (silenceTimer) {
      stopSilenceDetection();
    }
    if (abortController && isUploading.value) {
      cancelUpload();
    }
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
</script>

<template>
  <div>
    <div class="space-x-2 pb-2">
      <Button :disabled="isRecording" @click="startRecording">Start Recording</Button>
      <Button :disabled="!isRecording" @click="stopRecording">Stop Recording</Button>
    </div>
    <canvas v-if="showVisualization" ref="visualizer" width="300" height="100"></canvas>
    <div v-if="isUploading && uploadStatus" class="pt-4">{{ uploadStatus }}</div>
    <div v-if="!isRecording && !isUploading && transcribedText.length > 0" class="pt-4">
      Text: {{ transcribedText }}
    </div>
  </div>
</template>
