const daggerButton = document.querySelector(".dagger-button");
const circleButton = document.querySelector(".circle-button");
const switchContainer = document.querySelector(".switch");

let player1Mark = "O";

daggerButton.addEventListener("click", () => {
  daggerButton.classList.add("active");
  circleButton.classList.remove("active");
  switchContainer.classList.remove("circle-active");
  player1Mark = "X";
});

circleButton.addEventListener("click", () => {
  circleButton.classList.add("active");
  daggerButton.classList.remove("active");
  switchContainer.classList.add("circle-active");
  player1Mark = "O";
});
