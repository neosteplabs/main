const searchInput = document.getElementById("searchInput");
const mgFilter = document.getElementById("mgFilter");
const productCards = document.querySelectorAll(".product-card");

function filterProducts() {
  const searchValue = searchInput.value.toLowerCase();
  const mgValue = mgFilter.value;

  productCards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const mg = card.dataset.mg;

    const matchesSearch = name.includes(searchValue);
    const matchesMg = mgValue === "" || mg === mgValue;

    card.style.display = matchesSearch && matchesMg ? "block" : "none";
  });
}

searchInput.addEventListener("input", filterProducts);
mgFilter.addEventListener("change", filterProducts);