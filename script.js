/* ---------------- GLOBAL ---------------- */

let currentUser = null;
const WEATHER_API_KEY = "32776fd38a8f41aea7163633262606";
/* ADMIN CREDENTIALS */


const ADMIN_EMAIL = "admin@agri.com";
const ADMIN_PASSWORD = "1234";

/*------------------ startVoice---------------- */
function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Speech recognition not supported");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    let language = document.getElementById("chatLanguage").value;

        if(language === "Hindi"){
            recognition.lang = "hi-IN";
        }
        else if(language === "Marathi"){
            recognition.lang = "mr-IN";
        }
        else{
            recognition.lang = "en-US";
        }

    recognition.start();

    recognition.onresult = function(event) {

        document.getElementById("userInput").value =
            event.results[0][0].transcript;
    };
}
/* ---------------- NAVIGATION ---------------- */

function showSection(id){

/* Block admin */
if(id === "admin" && currentUser !== "admin"){
alert("Access Denied! Admin only 🚫");
return;
}

/* Block analysis if not logged in */
if(id === "analysis" && currentUser === null){
alert("Please login first 🔐");
showSection("login");
return;
}

document.querySelectorAll(".section").forEach(section=>{
section.classList.remove("active");
});

document.getElementById(id).classList.add("active");

}


/* ---------------- IMAGE PREVIEW ---------------- */

function previewImage(event){

let reader=new FileReader();

reader.onload=function(){
let preview=document.getElementById("preview");
preview.src=reader.result;
preview.style.display="block";
};

reader.readAsDataURL(event.target.files[0]);

}



/* ---------------- ANALYZE IMAGE ---------------- */

function analyzeCrop(){

if(currentUser === null){
alert("Please login first to analyze crop 🔐");
showSection("login");
return;
}

let file=document.getElementById("cropImage").files[0];
let confirm = document.getElementById("confirmCrop").checked;

if(!file){
alert("Please upload a crop image");
return;
}

if(!confirm){
alert("Please confirm this is a crop image 🌱");
return;
}

/* Show loading */
document.getElementById("stageResult").innerText =
"🤖 Analyzing crop image...";

let img = document.createElement("img");

img.onload = function(){

/* Canvas */
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

canvas.width = img.width;
canvas.height = img.height;

ctx.drawImage(img, 0, 0);

let data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

let greenCount = 0;
let brownCount = 0;
let total = data.length / 4;

/* Analyze pixels */
for(let i = 0; i < data.length; i += 4){

let r = data[i];
let g = data[i+1];
let b = data[i+2];

if(g > r && g > b){
greenCount++;
}

if(r > g && g > b){
brownCount++;
}

}

let greenPercent = (greenCount / total) * 100;
let brownPercent = (brownCount / total) * 100;

console.log("Green:", greenPercent, "Brown:", brownPercent);

/* Decision */

let result;

if(greenPercent < 15){
result = {
stage:"Seedling Stage 🌱",
irrigation:"Light irrigation daily.",
fertilizer:"Use phosphorus fertilizer."
};
}
else if(greenPercent < 40){
result = {
stage:"Vegetative Stage 🌿",
irrigation:"Moderate watering every 2-3 days.",
fertilizer:"Apply nitrogen fertilizer."
};
}
else if(brownPercent < 10){
result = {
stage:"Healthy Growing Stage 🌾",
irrigation:"Maintain consistent moisture.",
fertilizer:"Balanced fertilizer required."
};
}
else{
result = {
stage:"Maturity Stage 🌾",
irrigation:"Reduce watering.",
fertilizer:"No fertilizer needed."
};
}

/* DISPLAY RESULT */

document.getElementById("resultImage").src = img.src;

document.getElementById("stageResult").innerText =
"Detected Stage: " + result.stage;

document.getElementById("irrigationResult").innerText =
"Irrigation: " + result.irrigation;

document.getElementById("fertilizerResult").innerText =
"Fertilizer: " + result.fertilizer;

generateAIRecommendation(
    result.stage,
    result.irrigation,
    result.fertilizer
);

document.getElementById("fullAnalysis").innerHTML =
"🤖 Generating AI recommendation...";

getAIRecommendation(result.stage)
.then(ai => {

document.getElementById("fullAnalysis").innerHTML = ai;

});

/* ✅ SAVE DATA (FIXED POSITION) */

let record = {
stage: result.stage,
irrigation: result.irrigation,
fertilizer: result.fertilizer,
time: new Date().toLocaleString()
};

let dataStorage = JSON.parse(localStorage.getItem("cropData")) || [];

dataStorage.push(record);

localStorage.setItem("cropData", JSON.stringify(dataStorage));

showSection("resultPage");

};

img.src = URL.createObjectURL(file);

}


/* ---------------- DOWNLOAD REPORT ---------------- */

async function downloadReport() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let stage = document.getElementById("stageResult").innerText;
    let irrigation = document.getElementById("irrigationResult").innerText;
    let fertilizer = document.getElementById("fertilizerResult").innerText;

    let image = document.getElementById("resultImage");

    doc.setFontSize(20);
    doc.text("AgriVision AI", 70, 20);

    doc.setFontSize(14);
    doc.text("Smart Agriculture Recommendation Report", 20, 35);

    doc.setFontSize(11);
    doc.text("Generated: " + new Date().toLocaleString(), 20, 45);

    // Add uploaded image
    if (image.src) {

        const img = new Image();

        img.crossOrigin = "Anonymous";

        img.src = image.src;

        await new Promise(resolve => {

            img.onload = function () {

                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.drawImage(img, 0, 0);

                const dataURL = canvas.toDataURL("image/jpeg");

                doc.addImage(dataURL, "JPEG", 20, 55, 60, 60);

                resolve();

            }

        });

    }

    doc.text(stage, 20, 130);
    doc.text(irrigation, 20, 145);
    doc.text(fertilizer, 20, 160);

    doc.setFontSize(13);

    doc.text("AI Powered by:",20,180);
    doc.text("Gemma 3 (Ollama)",60,180);

    doc.text("Weather Support: Live Weather API",20,190);

    doc.text("Multilingual AI Chatbot Enabled",20,200);

    doc.save("AgriVision_AI_Report.pdf");

}


/* ---------------- IRRIGATION ---------------- */

function getIrrigation(){

let value = document.getElementById("irrigationInput").value;

let result = "";

if(value === "low"){
result = "💧 Light irrigation daily is required for seedlings.";
}
else if(value === "medium"){
result = "💧 Moderate watering every 2-3 days is ideal.";
}
else{
result = "💧 Reduce irrigation as crop reaches maturity.";
}

document.getElementById("irrigationOutput").innerText = result;

}


/* ---------------- FERTILIZER ---------------- */

function getFertilizer(){

let value = document.getElementById("fertilizerInput").value;

let result = "";

if(value === "seed"){
result = "🌱 Use phosphorus-rich fertilizer.";
}
else if(value === "veg"){
result = "🌿 Apply nitrogen fertilizer for growth.";
}
else if(value === "flower"){
result = "🌸 Use potassium fertilizer.";
}
else{
result = "🌾 No fertilizer required at maturity.";
}

document.getElementById("fertilizerOutput").innerText = result;

}


/* ---------------- LOGIN ---------------- */

function login(){

let username = document.getElementById("username").value;
let password = document.getElementById("password").value;
let role = document.getElementById("role").value;

if(username === "" || password === ""){
document.getElementById("loginMsg").innerText = "Please fill all fields ❌";
return;
}

/* ADMIN LOGIN */
if(role === "admin" && username === ADMIN_EMAIL && password === ADMIN_PASSWORD){

currentUser = "admin";

/* Show name in navbar */
showUser(username);

document.getElementById("loginMsg").innerText = "Admin Login Successful ✅";

/* Show admin button */
document.getElementById("navAdmin").style.display = "block";

/* Hide login */
hideLoginUI();

showSection("home");

}

/* USER LOGIN */
else if(role === "user"){

currentUser = "user";

/* Show name in navbar */
showUser(username);

document.getElementById("loginMsg").innerText = "User Login Successful ✅";

hideLoginUI();

showSection("home");

}

else{
document.getElementById("loginMsg").innerText = "Invalid Credentials ❌";
}

}

/* ---------------- ADMIN DATA ---------------- */

function loadAdminData(){

let data = JSON.parse(localStorage.getItem("cropData")) || [];

let output = "";

data.forEach((item, index)=>{

output += `
<div class="card">
<p><b>Record ${index+1}</b></p>
<p>${item.stage}</p>
<p>${item.irrigation}</p>
<p>${item.fertilizer}</p>
<p><small>${item.time}</small></p>
</div>
`;

});

document.getElementById("adminData").innerHTML = output;

}


/* ---------------- HIDE LOGIN ---------------- */
/* ---------------- HIDE LOGIN ---------------- */

function hideLoginUI(){

document.getElementById("navLogin").style.display = "none";

let btn = document.getElementById("homeLoginBtn");
if(btn){
btn.style.display = "none";
}

}

/* ---------------- SHOW USER ---------------- */

function showUser(email){

let userBox = document.getElementById("userDisplay");
let userText = document.getElementById("userEmail");

userText.innerText = email;
userBox.style.display = "block";

/* Show logout button */
document.getElementById("logoutBtn").style.display = "block";

}

/* ---------------- LOGOUT ---------------- */

function logout(){

currentUser = null;

document.getElementById("userDisplay").style.display = "none";
document.getElementById("navAdmin").style.display = "none";
document.getElementById("navLogin").style.display = "block";

let btn = document.getElementById("homeLoginBtn");
if(btn){
btn.style.display = "inline-block";
}

document.getElementById("logoutBtn").style.display = "none";

alert("Logged out successfully ✅");

showSection("home");

}

async function sendMessage() {

    let input = document.getElementById("userInput");
    let chatBox = document.getElementById("chatBox");
    let language = document.getElementById("chatLanguage").value;

    let userMessage = input.value.trim();

    if(!userMessage) return;

    chatBox.innerHTML += `
    <p><b>👨 Farmer:</b> ${userMessage}</p>
    `;

    input.value = "";

    chatBox.innerHTML += `
    <p id="loading"><b>🤖 AgriVision AI:</b> Thinking...</p>
    `;

    try {

        const response = await fetch(
            "http://localhost:11434/api/generate",
            {
                method: "POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({
                    model: "gemma3:4b",

                    prompt: `
                You are AgriVision AI.

                You are an expert agricultural assistant.

                Always answer in ${language}.

                Use simple words that a farmer can understand.

                If the question is about crops,
                give irrigation,
                fertilizer,
                disease prevention,
                and precautions.

                Question:

                ${userMessage}
`,
                    stream:false
                })
            }
        );

        const data = await response.json();

        document.getElementById("loading").remove();

        chatBox.innerHTML += `
        <p><b>🤖 AgriVision AI:</b>
        ${data.response}</p>
        `;

        chatBox.scrollTop = chatBox.scrollHeight;

    } catch(err){

        document.getElementById("loading").remove();

        chatBox.innerHTML += `
        <p><b>🤖 AgriVision AI:</b>
        Ollama is not running.</p>
        `;

        console.error(err);
    }
}
async function getAIRecommendation(stage) {

    const response = await fetch("http://localhost:11434/api/generate", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            model: "gemma3:4b",

            prompt: `
You are an agriculture expert.

A crop image has been analyzed.

Detected Stage:

${stage}

Explain in SIMPLE language.

Give:

1. Irrigation advice

2. Fertilizer advice

3. Disease precautions

4. Best farming tips

Keep answer under 8 lines.
`,

            stream: false

        })

    });

    const data = await response.json();

    return data.response;
}
async function getWeather() {

    let city = document.getElementById("cityName").value;

    if(city==""){
        alert("Please enter city");
        return;
    }

    try{

        const response = await fetch(
`https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${city}&aqi=no`
        );

        const data = await response.json();

        let temp = data.current.temp_c;
        let humidity = data.current.humidity;
        let wind = data.current.wind_kph;
        let condition = data.current.condition.text;

        document.getElementById("weatherResult").innerHTML = `
        🌍 <b>${data.location.name}</b><br><br>

        🌡 Temperature : ${temp} °C<br>

        💧 Humidity : ${humidity}%<br>

        🌬 Wind : ${wind} km/h<br>

        ☁ Weather : ${condition}
        `;

        getWeatherAI(city,temp,humidity,condition);

    }
    catch(error){

        console.log(error);

        alert("Unable to fetch weather");

    }

}
async function getWeatherAI(city,temp,humidity,condition){

const response = await fetch(
"http://localhost:11434/api/generate",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

model:"gemma3:4b",

prompt:`

You are an agriculture expert.

Current Weather

City : ${city}

Temperature : ${temp}°C

Humidity : ${humidity}%

Condition : ${condition}

Give advice for farmers.

Mention

1. Irrigation

2. Fertilizer

3. Crop Precautions

Use simple language.

Keep answer under 6 lines.

`,

stream:false

})

}

);

const data=await response.json();

document.getElementById("weatherAI").innerHTML=

"<br><h3>🤖 AI Weather Recommendation</h3><br>"+data.response;

}
function speakLastReply() {

    let messages = document.querySelectorAll("#chatBox p");

    if (messages.length === 0) {
        alert("No AI reply available.");
        return;
    }

    // Find the last AI message
    let aiReply = "";

    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].innerText.startsWith("🤖")) {
            aiReply = messages[i].innerText.replace("🤖 AgriVision AI:", "").trim();
            break;
        }
    }

    if (!aiReply) {
        alert("No AI reply found.");
        return;
    }

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(aiReply);

    // Match selected language
    const lang = document.getElementById("languageSelect").value;

    speech.lang = lang;   // hi-IN, en-US, mr-IN

    speech.rate = 1;
    speech.pitch = 1;

    speechSynthesis.speak(speech);
}
function getCurrentLocationWeather() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported by your browser.");

        return;

    }

    navigator.geolocation.getCurrentPosition(

        position => {

            let lat = position.coords.latitude;

            let lon = position.coords.longitude;

            getWeatherByCoordinates(lat, lon);

        },

        () => {

            alert("Location permission denied.");

        }

    );

}
async function getWeatherByCoordinates(lat, lon) {

    try {

        let response = await fetch(

`https://api.weatherapi.com/v1/current.json?key=32776fd38a8f41aea7163633262606&q=${lat},${lon}&aqi=no`

        );

        let data = await response.json();

        document.getElementById("weatherResult").innerHTML = `

        <h3>📍 ${data.location.name}</h3>

        🌡 Temperature : ${data.current.temp_c} °C <br>

        💧 Humidity : ${data.current.humidity}% <br>

        🌥 Condition : ${data.current.condition.text}

        `;

    }

    catch(err){

        console.log(err);

        alert("Unable to fetch weather.");

    }

}
async function generateAIRecommendation(stage, irrigation, fertilizer) {

    document.getElementById("aiRecommendation").style.display = "block";

    document.getElementById("aiRecommendationText").innerHTML =
    "🧠 Generating AI recommendation...";

    const lang = document.getElementById("languageSelect").value;

    let prompt = `
You are AgriVision AI.

You are an experienced agricultural expert.

Respond ONLY in the selected language.

Language:
${lang}

Crop Stage:
${stage}

Suggested Irrigation:
${irrigation}

Suggested Fertilizer:
${fertilizer}

Give a SIMPLE answer suitable for Indian farmers.

Use exactly this format:

🌱 Crop Stage

💧 Irrigation Advice

🌿 Fertilizer Advice

🐛 Disease Prevention

⚠ Precautions

Maximum 6 short points.
`;

    try {

        const response = await fetch("http://localhost:11434/api/generate", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                model: "gemma3:4b",

                prompt: prompt,

                stream: false

            })

        });

        const data = await response.json();

        document.getElementById("aiRecommendationText").innerText =
            data.response;

    }

    catch(err){

        document.getElementById("aiRecommendationText").innerHTML =
        "Unable to generate AI recommendation.";

    }

}
function loadHistory(){

    let history = JSON.parse(localStorage.getItem("cropData")) || [];

    let output = "";

    if(history.length===0){

        output = `
        <div class="card">
        <h3>No Analysis Found</h3>
        </div>
        `;

    }

    history.reverse().forEach((item,index)=>{

        output += `
        <div class="card">

        <h3>Analysis ${index+1}</h3>

        <p><b>Stage:</b> ${item.stage}</p>

        <p><b>Irrigation:</b> ${item.irrigation}</p>

        <p><b>Fertilizer:</b> ${item.fertilizer}</p>

        <p><b>Date:</b> ${item.time}</p>

        </div>
        `;

    });

    document.getElementById("historyContainer").innerHTML = output;

}