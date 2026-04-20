/* ---------------- GLOBAL ---------------- */

let currentUser = null;
/* ADMIN CREDENTIALS */

const ADMIN_EMAIL = "admin@agri.com";
const ADMIN_PASSWORD = "1234";


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

function downloadReport(){

let stage=document.getElementById("stageResult").innerText;
let irrigation=document.getElementById("irrigationResult").innerText;
let fertilizer=document.getElementById("fertilizerResult").innerText;

let report =

"SMART AGRI AI REPORT\n\n"+
"Crop Growth Detection System\n\n"+
stage+"\n\n"+
irrigation+"\n\n"+
fertilizer+"\n\n"+
"Generated for College Minor Project";

let blob=new Blob([report],{type:"text/plain"});

let link=document.createElement("a");

link.href=URL.createObjectURL(blob);
link.download="Agri_Report.txt";

link.click();

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