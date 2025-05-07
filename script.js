let dimensionsData = {};
let descriptions = {};
let currentDimension = "Region";
let currentHighlight = null;
let allDots = [];

const dotGrid = document.getElementById("dotGrid");
const dimensionToggles = document.getElementById("dimensionToggles");
const categoryCards = document.getElementById("categoryCards");
const descriptionText = document.getElementById("descriptionText");

// Define dimension order and metadata
const dimensionMetadata = [
  { id: 'region', label: 'Region', icon: 'fa-globe' },
  { id: 'age', label: 'Age Group', icon: 'fa-user' },
  { id: 'pope', label: 'Pope', icon: 'fa-crown' },
  { id: 'office', label: 'Office Type', icon: 'fa-briefcase' },
  { id: 'order', label: 'Priestly Order', icon: 'fa-cross' }
];

// Define gray shades for unselected categories
const grayShades = {
  "Pope": {
    "Francis": "#2D2D2D",      // Almost black
    "Benedict XVI": "#B8B8B8", // Very light gray
    "John Paul II": "#8B8B8B"  // Medium gray
  },
  "Region": {
    "Africa": "#2D2D2D",        // Almost black
    "Asia": "#B8B8B8",         // Very light gray
    "Italy": "#8B8B8B",        // Medium gray
    "Latin America": "#3D3D3D", // Very dark gray
    "Rest of Europe": "#D3D3D3", // Light gray
    "United States and Canada": "#4A4A4A" // Dark gray
  },
  "Age Group": {
    "Under 60": "#2D2D2D",     // Almost black
    "in their 60's": "#B8B8B8", // Very light gray
    "in their 70's": "#8B8B8B"  // Medium gray
  },
  "Office Type": {
    "Curia": "#2D2D2D",        // Almost black
    "Non-Curia": "#B8B8B8"     // Very light gray
  },
  "Priestly Order": {
    "Diocesan Clergy": "#2D2D2D",    // Almost black
    "Dominicans": "#B8B8B8",         // Very light gray
    "Franciscans": "#8B8B8B",        // Medium gray
    "Jesuits": "#3D3D3D",            // Very dark gray
    "Salesians": "#D3D3D3",          // Light gray
    "Other Religious Orders": "#4A4A4A" // Dark gray
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
  let dotCount = 0;

  // First row (9 dots, left-aligned: columns 1-9)
  for (let col = 0; col < 9; col++) {
    const dot = createDot(dotCount);
    const category = getCategoryForDot(dotCount);
    dot.style.backgroundColor = category === currentHighlight ? '#B84040' : grayShades[currentDimension][category];
    dot.dataset.category = category;
    dot.style.gridRow = '1';
    dot.style.gridColumn = (1 + col).toString();
    dot.addEventListener('mouseover', () => highlightCategory(category));
    dot.addEventListener('mouseout', () => highlightCategory(currentHighlight));
    dotGrid.appendChild(dot);
    allDots.push(dot);
    dotCount++;
  }

  // Middle 6 rows (19 dots each)
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 19; col++) {
      if (dotCount < total) {
        const dot = createDot(dotCount);
        const category = getCategoryForDot(dotCount);
        dot.style.backgroundColor = category === currentHighlight ? '#B84040' : grayShades[currentDimension][category];
        dot.dataset.category = category;
        // If row < 3, gridRow = 2,3,4; if row >= 3, gridRow = 6,7,8
        let gridRow = row < 3 ? (2 + row) : (6 + (row - 3));
        dot.style.gridRow = gridRow.toString();
        dot.style.gridColumn = (col + 1).toString();
        dot.addEventListener('mouseover', () => highlightCategory(category));
        dot.addEventListener('mouseout', () => highlightCategory(currentHighlight));
        dotGrid.appendChild(dot);
        allDots.push(dot);
        dotCount++;
      }
    }
  }

  // Last row (10 dots, left-aligned: columns 1-10)
  for (let col = 0; col < 10; col++) {
    if (dotCount < total) {
      const dot = createDot(dotCount);
      const category = getCategoryForDot(dotCount);
      dot.style.backgroundColor = category === currentHighlight ? '#B84040' : grayShades[currentDimension][category];
      dot.dataset.category = category;
      dot.style.gridRow = '9'; // now the last row is 9
      dot.style.gridColumn = (1 + col).toString();
      dot.addEventListener('mouseover', () => highlightCategory(category));
      dot.addEventListener('mouseout', () => highlightCategory(currentHighlight));
      dotGrid.appendChild(dot);
      allDots.push(dot);
      dotCount++;
    }
  }
}

function getCategoryForDot(index) {
  let count = 0;
  for (const [category, categoryCount] of Object.entries(dimensionsData[currentDimension])) {
    count += categoryCount;
    if (index < count) {
      return category;
    }
  }
  return Object.keys(dimensionsData[currentDimension])[0];
}

function renderDimensionToggles() {
  dimensionToggles.innerHTML = '';
  const dimensionOrder = ["Region", "Age Group", "Pope", "Office Type", "Priestly Order"];
  const dimensionIcons = {
    "Pope": "fa-crown",
    "Region": "fa-globe",
    "Age Group": "fa-hourglass-half",
    "Office Type": "fa-building",
    "Priestly Order": "fa-cross"
  };
  const dimensionLabels = {
    "Pope": "Pope",
    "Region": "Region",
    "Age Group": "Age",
    "Office Type": "Office",
    "Priestly Order": "Order"
  };
  
  for (const dim of dimensionOrder) {
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
      currentHighlight = Object.keys(dimensionsData[dim])[0]; // Auto-select first category
      
      // Scroll the selected dimension into view
      const containerWidth = dimensionToggles.offsetWidth;
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;
      const scrollLeft = btnLeft - (containerWidth / 2) + (btnWidth / 2);
      dimensionToggles.scrollLeft = scrollLeft;
      
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
  for (const [category, count] of Object.entries(dimensionsData[currentDimension])) {
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
      descriptionText.innerHTML = `
        <h2 class="description-title">${category}</h2>
        <div class="description-content">${description}</div>
      `;
    }
    categoryCards.appendChild(card);
  }
  if (!currentHighlight) {
    descriptionText.innerHTML = '<div class="description-content">Select a category to see details here.</div>';
  }
}

function highlightCategory(category) {
  currentHighlight = category;
  allDots.forEach(dot => {
    const match = dot.dataset.category === category;
    if (match) {
      dot.style.backgroundColor = '#B84040'; // Red for selected
      dot.classList.add('selected');
    } else {
      dot.style.backgroundColor = grayShades[currentDimension][dot.dataset.category]; // Gray shade for unselected
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
  dimensionsData = dims;
  descriptions = descs;
  renderDimensionToggles();
  // Keep the initial dimension as Region
  currentDimension = "Region";
  currentHighlight = Object.keys(dimensionsData[currentDimension])[0];
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

// Modal functionality
const modal = document.getElementById("aboutModal");
const aboutLink = document.getElementById("aboutLink");
const closeBtn = document.getElementsByClassName("close")[0];

aboutLink.onclick = function(e) {
  e.preventDefault();
  modal.style.display = "block";
}

closeBtn.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}