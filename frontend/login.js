// 🔗 CHANGE THIS ONLY
const BASE_URL = "https://your-backend.onrender.com"; // 👈 your real backend URL



// Sections
const loginBox = document.getElementById("login-box");
const registerBox = document.getElementById("register-box");
const forgotBox = document.getElementById("forgot-box");



// Navigation
document.getElementById("show-register").onclick = () => {
  loginBox.style.display = "none";
  registerBox.style.display = "block";
  forgotBox.style.display = "none";
};

document.getElementById("show-login").onclick = () => {
  loginBox.style.display = "block";
  registerBox.style.display = "none";
  forgotBox.style.display = "none";
};

document.getElementById("show-forgot").onclick = () => {
  loginBox.style.display = "none";
  registerBox.style.display = "none";
  forgotBox.style.display = "block";
};

document.getElementById("back-login").onclick = () => {
  loginBox.style.display = "block";
  registerBox.style.display = "none";
  forgotBox.style.display = "none";
};



// 🔐 LOGIN
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok && data.message === "Login successful") {
      window.location.href = "dashboard.html";
    }

  } catch (error) {
    console.error(error);
    alert("Server error");
  }
});



// 📝 REGISTER
document.getElementById("register-btn").addEventListener("click", async () => {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      loginBox.style.display = "block";
      registerBox.style.display = "none";
    }

  } catch (error) {
    console.error(error);
    alert("Server error");
  }
});



// 📩 SEND OTP
let timer = 30;
let interval;
const sendOtpBtn = document.getElementById("send-otp");

document.getElementById("send-otp").addEventListener("click", async () => {
  const email = document.getElementById("forgot-email").value;

  if (!email) {
    alert("Please enter email");
    return;
  }

  sendOtpBtn.disabled = true;
  timer = 30;
  sendOtpBtn.innerText = `Resend in ${timer}s`;

  interval = setInterval(() => {
    timer--;
    sendOtpBtn.innerText = `Resend in ${timer}s`;

    if (timer <= 0) {
      clearInterval(interval);
      sendOtpBtn.disabled = false;
      sendOtpBtn.innerText = "Send OTP";
    }
  }, 1000);

  try {
    const res = await fetch(`${BASE_URL}/send-otp`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message);

  } catch (error) {
    console.error(error);
    alert("Failed to send OTP");

    clearInterval(interval);
    sendOtpBtn.disabled = false;
    sendOtpBtn.innerText = "Send OTP";
  }
});



// 🔑 RESET PASSWORD
document.getElementById("reset-password").addEventListener("click", async () => {
  const email = document.getElementById("forgot-email").value;
  const otp = document.getElementById("otp").value;
  const new_password = document.getElementById("new-password").value;

  try {
    const res = await fetch(`${BASE_URL}/reset-password`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, otp, new_password })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok && data.message === "Password reset successful") {
      loginBox.style.display = "block";
      forgotBox.style.display = "none";
    }

  } catch (error) {
    console.error(error);
    alert("Server error");
  }
});