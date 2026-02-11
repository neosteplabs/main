// Check if user has already confirmed
document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("ageVerified") === "true") {
    document.getElementById("age-overlay").style.display = "none";
  }
});

function enterSite() {
  localStorage.setItem("ageVerified", "true");
  document.getElementById("age-overlay").style.display = "none";
}

function leaveSite() {
  window.location.href = "https://www.google.com";
}