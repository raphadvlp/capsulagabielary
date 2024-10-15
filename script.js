const videoElement = document.getElementById("video");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const uploadButton = document.getElementById("uploadButton");
const timerDisplay = document.getElementById("timer");

let mediaRecorder;
let recordedChunks = [];
let timerInterval;
let recordingTime = 0;

startButton.addEventListener("click", async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  videoElement.srcObject = stream;

  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/mp4" });
    const videoUrl = URL.createObjectURL(blob);
    recordedChunks = [];
    uploadButton.disabled = false;

    // Exibir vídeo gravado
    const recordedVideo = document.createElement("video");
    recordedVideo.src = videoUrl;
    recordedVideo.controls = true;
    document.body.appendChild(recordedVideo);

    // Parar o timer
    clearInterval(timerInterval);
  };

  mediaRecorder.start();
  recordingTime = 0;
  timerDisplay.innerText = `Tempo: ${recordingTime}s`;

  // Iniciar o timer
  timerInterval = setInterval(() => {
    recordingTime++;
    timerDisplay.innerText = `Tempo: ${recordingTime}s`;

    if (recordingTime >= 60) {
      // Limite de 60 segundos
      stopRecording();
    }
  }, 1000);

  startButton.disabled = true;
  stopButton.disabled = false;
  uploadButton.disabled = true;
});

stopButton.addEventListener("click", stopRecording);

function stopRecording() {
  mediaRecorder.stop();
  startButton.disabled = false;
  stopButton.disabled = true;
}

uploadButton.addEventListener("click", async () => {
  const blob = new Blob(recordedChunks, { type: "video/mp4" });
  await uploadToFirebase(blob);
});

// Função para upload para o Firebase
async function uploadToFirebase(file) {
  const storageRef = firebase.storage().ref(); // Acesso ao storage
  const videoRef = storageRef.child(`videos/${Date.now()}.mp4`);

  try {
    const snapshot = await videoRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    alert(`Upload bem-sucedido! URL: ${downloadURL}`);
  } catch (error) {
    console.error("Erro no upload para Firebase:", error);
    alert("Erro ao enviar o vídeo.");
  }
}
