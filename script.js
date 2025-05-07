let dimensions = {};
let descriptions = {};
let currentDimension = "Region";
let currentHighlight = null;
let allDots = [];

const dotGrid = document.getElementById("dotGrid");
const dimensionToggles = document.getElementById("dimensionToggles");
const categoryCards = document.getElementById("categoryCards");
const descriptionText = document.getElementById("descriptionText");

// Define gray shades for unselected categories
const grayShades = {
  "Region": {
    "Africa": "#666666",
    "Asia": "#777777",
    "Italy": "#888888",
    "Latin America": "#999999",
    "Rest of Europe": "#AAAAAA",
    "United States and Canada": "#BBBBBB"
  },
  "Pope": {
    "Francis": "#666666",
    "Benedict XVI": "#888888",
    "John Paul II": "#AAAAAA"
  },
  "Age Group": {
    "Under 60": "#666666",
    "60–69": "#888888",
    "70–79": "#AAAAAA"
  },
  "Office Type": {
    "Curia": "#666666",
    "Pastoral": "#AAAAAA"
  },
  "Priestly Order": {
    "Diocesan Clergy": "#888888",
    "Franciscans": "#666666",
    "Jesuits": "#777777",
    "Salesians": "#999999",
    "Dominicans": "#AAAAAA",
    "Other Religious Orders": "#BBBBBB"
  }
};

function createDot(index) {
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.style.setProperty('--dot-index', index);
  // Random delay between 0 and 0.2 seconds
  dot.style.setProperty('--dot-delay', `${Math.random() * 0.2}s`);
  return dot;
}

function renderDots() {
  dotGrid.innerHTML = '';
  allDots = [];
  const total = 133;
  for (const [category, count] of Object.entries(dimensions[currentDimension])) {
    for (let i = 0; i < count; i++) {
      const dot = createDot(i);
      // Use red for selected category, gray shade for others
      dot.style.backgroundColor = category === currentHighlight ? '#B84040' : grayShades[currentDimension][category];
      dot.dataset.category = category;
      dot.addEventListener('mouseover', () => highlightCategory(category));
      dot.addEventListener('mouseout', () => highlightCategory(currentHighlight));
      dotGrid.appendChild(dot);
      allDots.push(dot);
    }
  }
  while (allDots.length < total) {
    const dot = createDot(allDots.length);
    dot.style.backgroundColor = '#ccc';
    dotGrid.appendChild(dot);
    allDots.push(dot);
  }
}

function renderDimensionToggles() {
  dimensionToggles.innerHTML = '';
  const dimensionIcons = {
    "Region": "fa-globe",
    "Pope": "fa-crown",
    "Age Group": "fa-hourglass-half",
    "Office Type": "fa-building",
    "Priestly Order": "fa-cross"
  };
  const dimensionLabels = {
    "Region": "Region",
    "Pope": "Pope",
    "Age Group": "Age",
    "Office Type": "Office",
    "Priestly Order": "Order"
  };
  
  for (const dim of Object.keys(dimensions)) {
    const btn = document.createElement('div');
    btn.className = 'dimension-toggle';
    btn.innerHTML = `
      <i class="fas ${dimensionIcons[dim]}"></i>
      <div class="dimension-label">${dimensionLabels[dim]}</div>
    `;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dimension-toggle').forEach(toggle => {
        toggle.removeAttribute('data-selected');
      });
      btn.setAttribute('data-selected', 'true');
      currentDimension = dim;
      currentHighlight = Object.keys(dimensions[dim])[0]; // Auto-select first category
      render();
    });
    dimensionToggles.appendChild(btn);
  }
  const initialToggle = document.querySelector('.dimension-toggle');
  if (initialToggle) {
    initialToggle.setAttribute('data-selected', 'true');
  }
}

function renderCategoryCards() {
  categoryCards.innerHTML = '';
  for (const [category, count] of Object.entries(dimensions[currentDimension])) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `<div style="font-size: 1.25rem; font-weight: bold;">${count}</div>
                      <div>${category}</div>`;
    card.addEventListener('click', () => {
      currentHighlight = category;
      highlightCategory(category);
    });
    if (currentHighlight === category) {
      card.classList.add('active');
      const description = descriptions[currentDimension]?.[category] || `Description for ${category}`;
      descriptionText.innerText = description;
    }
    categoryCards.appendChild(card);
  }
  if (!currentHighlight) {
    descriptionText.innerText = 'Select a category to see details here.';
  }
}

function highlightCategory(category) {
  currentHighlight = category;
  allDots.forEach(dot => {
    const match = dot.dataset.category === category;
    if (match) {
      dot.style.backgroundColor = '#B84040'; // Red for selected
      dot.classList.remove('dimmed');
      dot.classList.add('selected');
    } else {
      dot.style.backgroundColor = grayShades[currentDimension][dot.dataset.category]; // Gray shade for unselected
      dot.classList.add('dimmed');
      dot.classList.remove('selected');
    }
  });
  renderCategoryCards();
}

function render() {
  renderDots();
  renderCategoryCards();
}

Promise.all([
  fetch('dimensions.json').then(res => res.json()),
  fetch('descriptions.json').then(res => res.json())
]).then(([dims, descs]) => {
  dimensions = dims;
  descriptions = descs;
  renderDimensionToggles();
  // Auto-select first dimension and its first category
  currentDimension = Object.keys(dimensions)[0];
  currentHighlight = Object.keys(dimensions[currentDimension])[0];
  render();
});

function updateDots() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot, index) => {
    const isSelected = selectedCategories.includes(dot.dataset.category);
    dot.classList.toggle('selected', isSelected);
    dot.classList.toggle('dimmed', !isSelected);
  });
}