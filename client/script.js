import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const mic = document.getElementById("mic");
const mic_off = document.getElementById("mic_off");

let loadInterval;

function loader(e) {
  e.textContent = '';

  loadInterval = setInterval(()=>{
    e.textContent +='.';

    if(e.textContent === '....') {
      e.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(()=>{
    if(index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    }
    else {
      clearInterval(interval); // used to stop setInterval method
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now()
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe (isAi, value, uniqueId) {
  return (
    `
      <div class="wrapper ${isAi && 'ai'}">
        <div class="chat">
          <div class="profile">
            <img 
              src="${isAi?bot:user}"
              alt="${isAi?"bot":"user"}"
            />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `
  )
}

const handelSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // user chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server

  const response = await fetch('https://comderai.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: data.get('prompt')
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong";

    alert(err);
  }
}

form.addEventListener('submit', handelSubmit);
form.addEventListener('keyup', (e)=>{
  if(e.keyCode===13) {
    handelSubmit(e);
  }
})

// const recognition = new SpeechRecognition();

// let canVC = window.webkitSpeechRecognition || window.SpeechRecognition;
// let speech = window.webkitSpeechRecognition;
let speech = true;
window.SpeechRecognition = window.webkitSpeechRecognition;
let recognition = new SpeechRecognition();
recognition.interimResults = true;


mic_off.addEventListener('click', ()=>{
  console.log(speech);
  if(speech==true) {
    mic_off.style.display = "none";
    mic.style.display = "unset";
    recognition.addEventListener('result', e => {
      const transcript = Array.from(e.results)
      .map(result => result[0])
      .map(result => result.transcript);
      document.getElementById('promptArea').value = transcript;
    })
    if (speech == true) recognition.start();
    recognition.addEventListener('soundend', ()=>{
      mic.style.display = 'none';
      mic_off.style.display = 'unset';
      recognition.stop();
    })
  }
  else {
    alert("Your browser does not support voice recording");
  }

})