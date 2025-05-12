const theme = document.querySelector('.theme-toggle');
const promptFrom = document.querySelector('.prompt-form');
const promptBtn = document.querySelector('.prompt-btn');
const generateBtn = document.querySelector('.generate-btn');
const promptInput = document.querySelector('.prompt-input');
const modelSelect = document.getElementById('model-select');
const countSelect = document.getElementById('count-select');
const ratioSelect = document.getElementById('ratio-select');
const gridGallery = document.querySelector('.gallery-grid');
// Enter You HuggingFace API Key
const API_KEY = "";
const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];



// Theme Toggle START
(() => {
  const savedTheme = localStorage.getItem("theme1");
  const systemPreferedDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPreferedDark);
  document.body.classList.toggle('dark-theme',isDarkTheme);
  theme.querySelector('i').classList = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const themetoggle = () => {
  const isDarkTheme = document.body.classList.toggle('dark-theme');
  localStorage.setItem("theme1",isDarkTheme ? "dark" : "light");
  theme.querySelector('i').classList = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};
// Theme Toggle END



// Random Prompts START
promptBtn.addEventListener('click', () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});
// Random Prompt END



// Get Dimensions in Height & Width
const getImageDimensions = (aspectRatio, baseSize = 512) => {

    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);


    let calculatedWidth = Math.round(width * scaleFactor);
    let calculatedHeight = Math.round(height * scaleFactor);
    
    calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
    calculatedHeight = Math.floor(calculatedHeight / 16) * 16;
    
    return { width: calculatedWidth, height: calculatedHeight};
};
// END



// START Update Image
const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  if(!imgCard) return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}" class="result-img" />
  <div class="img-overlay">
  <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
  <i class="fa-solid fa-download"></i>
  </button>
  </div>`;
}
// END Update Image



// API Images Generate START
const GenerateImages = async (selectedmodel, imageCount, aspectRatio, promptText) => {
  const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedmodel}`;
  const {width,height} = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled","true");

  const imagePromises = Array.from({length: imageCount}, async(_,i) => {
    
    try {
    
      const response = await fetch(MODEL_URL,{
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs : promptText,
          parameters : { width, height },
          option : { wait_for_model: true, user_cache: false },
        }),
      });

      if(!response.ok) throw new Error((await response.json())?.error);

      const result = await response.blob();
      console.log(result);
      updateImageCard(i, URL.createObjectURL(result));
  
    } catch (error) {
      console.log(error)
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace('loading','error');
      imgCard.querySelector('.status-text').textContent = "Generating Failed Check Console For More Info.";
    }

  })

  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
};
// API Images Generate END



// Generate Images Cards
const createImageCards = (selectedmodel, imageCount, aspectRatio, promptText) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id = "img-card-${i}" style = "aspect-ratio:${aspectRatio}">
            <div class="status-container">
              <div class="spinner"></div>
              <i class="fa-solid fa-triangle-exclamation"></i>
              <p class="status-text">Generating</p>
            </div>`;
  }

  GenerateImages(selectedmodel, imageCount, aspectRatio, promptText);
}
// END Images Card Generation



// Prompt Input START
const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectedmodel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  createImageCards(selectedmodel, imageCount, aspectRatio, promptText);
}
// Prompt Input END



promptFrom.addEventListener('submit',handleFormSubmit)
theme.addEventListener('click',themetoggle);