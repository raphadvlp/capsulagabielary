// script.js

// Configurações do Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Inicializa o Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

const videoElement = document.getElementById("video");
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const uploadButton = document.getElementById("uploadButton");
const timerElement = document.getElementById("timer");

let mediaRecorder;
let videoChunks = [];
let countdown;
let timeRemaining = 60;

startButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
uploadButton.addEventListener("click", uploadVideo);

function startRecording() {
  videoChunks = [];
  timeRemaining = 60;
  timerElement.innerText = `Tempo restante: ${timeRemaining}s`;
  startButton.disabled = true;
  stopButton.disabled = false;
  uploadButton.disabled = true;

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "user" }, audio: true })
    .then((stream) => {
      videoElement.srcObject = stream;
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        videoChunks.push(event.data);
      };

      mediaRecorder.start();
      startTimer();
    })
    .catch((error) => {
      console.error("Erro ao acessar a câmera: ", error);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    });
}

function stopRecording() {
  mediaRecorder.stop();
  stopButton.disabled = true;
  uploadButton.disabled = false;
  clearInterval(countdown);
}

function startTimer() {
  countdown = setInterval(() => {
    timeRemaining--;
    timerElement.innerText = `Tempo restante: ${timeRemaining}s`;
    if (timeRemaining <= 0) {
      stopRecording();
    }
  }, 1000);
}

function uploadVideo() {
  const blob = new Blob(videoChunks, { type: "video/webm" });
  const storageRef = storage.ref(`videos/${Date.now()}.webm`);
  storageRef
    .put(blob)
    .then(() => {
      alert("Vídeo enviado com sucesso!");
      videoElement.srcObject = null; // Limpa o vídeo
      startButton.disabled = false; // Habilita o botão de iniciar gravação novamente
    })
    .catch((error) => {
      alert("Falha ao enviar o vídeo.");
      console.error("Erro ao enviar o vídeo: ", error);
    });
}
