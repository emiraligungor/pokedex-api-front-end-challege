const pokeContainer = document.getElementById("poke-container");
const searchFormEl = document.getElementById("search-form");
const unorderedListElement = document.querySelector("ul");
const container = document.getElementById("container");

const cachePokemons = {}; // contains already clicked pokemon cards
const pokemonNames = []; // contains pokemon names and their ID's
let pokemons = []; // contains pokemon objects

// Colors for card dynamic background styling
const colors = {
  fire: "#d0312d",
  grass: "#DEFDE0",
  electric: "yellow",
  water: "#DEF3FD",
  ground: "#80471c",
  rock: "#a0a1a4",
  fairy: "#fceaff",
  poison: "#98d7a5",
  bug: "#f8d5a3",
  dragon: "#97b3e6",
  psychic: "#eaeda1",
  flying: "#F5F5F5",
  fighting: "#E6E0D4",
  normal: "#f9f6ee",
};

const main_types = Object.keys(colors);
const baseUrl = "https://pokeapi.co/api/v2/pokemon";

// make list items clickable and when clicked display the clicked pokemon
unorderedListElement.addEventListener("click", (e) => {
  const pokeId = e.target.id;
  selectPokemon(pokeId);
});

// when lose focus, clear search input
container.addEventListener("click", (e) => {
  unorderedListElement.innerHTML = "";
});
// when input is changed, make suggestions according to the input (typeahead feature)
searchFormEl.addEventListener("input", (e) => {
  let possibleOutcomes = [];
  const searchedName = e.target.value.toUpperCase().replaceAll("-", " ").trim();
  if (searchedName) {
    possibleOutcomes = pokemonNames.filter(
      (pokeEl) =>
        pokeEl[0].includes(searchedName) && pokeEl[0].startsWith(searchedName)
    );

    possibleOutcomes = possibleOutcomes.map(
      (pokeEl) => `<li id = ${pokeEl[1]} >${pokeEl[0]}</li>`
    );
  }
  displaySuggestions(possibleOutcomes);
});

// display suggestions as a part of typeahead feature
const displaySuggestions = (possibleOutcomes) => {
  const html = !possibleOutcomes.length ? "" : possibleOutcomes.join("");
  unorderedListElement.innerHTML = html;
};

// add event listener to submit event to filter and show wanted pokemon
searchFormEl.addEventListener("submit", (e) => {
  e.preventDefault();
  unorderedListElement.innerHTML = "";
  const searchedPokemonName = document.getElementById("search-input").value;
  const checker = partialSearch(searchedPokemonName);

  const filteredPokemons = pokemons.filter(
    (pokemon) =>
      pokemon.name.toUpperCase().replaceAll("-", " ").trim() ===
        searchedPokemonName.toUpperCase() ||
      pokemon.name.toUpperCase() === searchedPokemonName.toUpperCase().trim()
  );

  pokeContainer.innerHTML = "";

  if (filteredPokemons.length > 0) {
    const id = getPokemonIdFromUrl(filteredPokemons[0].url);
    selectPokemon(id);
    createPokemonCards(filteredPokemons);
  } else if (checker.length > 0) {
    createPokemonCards(checker);
  } else {
    notFoundPokemon(searchedPokemonName);
  }
});

// search with partial matching
const partialSearch = (searchedPokemonName) => {
  let results = [];
  pokemons.forEach((element) => {
    let elementName = element.name.toUpperCase();
    let matchedPokemonName = searchedPokemonName.toUpperCase().trim();
    if (
      elementName.includes(matchedPokemonName) &&
      elementName.startsWith(matchedPokemonName)
    ) {
      results.push(element);
    }
  });
  return results;
};

// create a  div if searched pokemon name does not exists
const notFoundPokemon = (searchedPokemonName) => {
  const notFoundEl = document.createElement("div");
  const notFoundInnerHTML = `
    <div>
          <h3 class = "nf">Sorry, could not find ${searchedPokemonName} !</h3>
    </div>
    `;
  notFoundEl.innerHTML = notFoundInnerHTML;
  pokeContainer.appendChild(notFoundEl);
};

// fetch all available pokemons from url
const fetchPokemons = async () => {
  const url = createUrl("?limit=10000&offset=0");
  const res = await fetch(url);
  const data = await res.json();
  return data.results;
};

// get single pokemon from it's ID
const getPokemon = async (id) => {
  const url = createUrl(`/${id}`);
  const res = await fetch(url);
  const data = await res.json();
  return data;
};

// get single pokemon's ID from it's url
const getPokemonIdFromUrl = (url) => {
  return url.slice(baseUrl.length + 1, -1);
};

// create name container for each pokemon
const createPokemonNameContainer = (pokemon) => {
  const name = pokemon.name.toUpperCase().replaceAll("-", " ");
  const id = getPokemonIdFromUrl(pokemon.url);

  pokemonNames.push([name, id]);

  const pokemonEl = document.createElement("div");
  pokemonEl.classList.add("pokemon");

  const pokemonInnerHTML = `
  <div class="name-container" onclick = "selectPokemon(${id})">
        <span class = "number" >#${id}</span>
        <h3>${name}</h3>
  </div>
  
  `;
  pokemonEl.innerHTML = pokemonInnerHTML;
  pokeContainer.appendChild(pokemonEl);
};

// select pokemon when the card is selected
const selectPokemon = async (id) => {
  if (!cachePokemons[id]) {
    // if first time selecting this card
    const url = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const res = await fetch(url);
    const singlePokemon = await res.json();
    cachePokemons[id] = singlePokemon;
    displayPopup(singlePokemon);
  } else {
    displayPopup(cachePokemons[id]); // if card selected before (part of cache logic implementation)
  }
};

// display information about the clicked pokemon as popup
const displayPopup = (singlePokemon) => {
  const pokemon = createPokemonObject(singlePokemon);
  const htmlString = `  <div class="popup" style="background-color:${pokemon.color}">
      <button type="button" id ="closeBtn" onclick = "closePopup()" >Close</button>
        <div onclick = "selectPokemon(${pokemon.id})">
        <img src="${pokemon.image}" onerror="this.src= 'images/not-found.jpg' " alt=""/>
          <span >#${pokemon.id}</span>
          <h3>${pokemon.pokeName}</h3>
          <p>     
          <small>Height: </small>${pokemon.height} |
          <small>Weight: </small>${pokemon.weight} |
          <small>Type: </small>${pokemon.types}  
          </p>
          <p class = "stats"> 
          <small id = "hp">HP: ${pokemon.stats[0]}</small> |
          <small id = "atk">ATK: ${pokemon.stats[1]}</small> |
          <small id = "def">DEF: ${pokemon.stats[2]}</small> 
          </p>
        </div>
    </div>`;
  pokeContainer.innerHTML = htmlString + pokeContainer.innerHTML;
};

// close opened pokemon popup
const closePopup = () => {
  const popup = document.querySelector(".popup");
  popup.parentElement.removeChild(popup);
};

// create pokemon object containig information about the pokemon
const createPokemonObject = (singlePokemon) => {
  const poke_types = singlePokemon.types.map((type) => type.type.name);
  const type = poke_types.find((type) => poke_types.indexOf(type) > -1);
  const color = colors[type];
  const poke_stat = singlePokemon.stats.map((el) => el.base_stat);
  const stats = poke_stat.slice(0, 3);
  const pokeImage = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${singlePokemon.id}.png`;

  const pokemon = {
    pokeName: singlePokemon.name.toUpperCase().replaceAll("-", " "),
    id: singlePokemon.id,
    image: pokeImage,
    height: singlePokemon.height,
    weight: singlePokemon.weight,
    types: poke_types,
    stats: stats,
    color: color,
  };
  return pokemon;
};

// take a pokemon list and loop through them to create pokemon cards
const createPokemonCards = (pokemonList) => {
  pokemonList.forEach((pokemon) => createPokemonNameContainer(pokemon));
};

const createUrl = (route) => {
  return baseUrl + route;
};
// resolve and send fetched pokemons to the createPokemonCards function
fetchPokemons().then((data) => {
  pokemons = data;
  createPokemonCards(pokemons);
});
