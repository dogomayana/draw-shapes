const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');

const shapeSelect = document.getElementById('shapeSelect');
const shapeSizeInput = document.getElementById('shapeSize');
const lineWidthInput = document.getElementById('lineWidth');
const polygonSidesControl = document.getElementById('polygonSidesControl');
const polygonSidesInput = document.getElementById('polygonSides');
const drawButton = document.getElementById('drawButton');
const downloadButton = document.getElementById('downloadButton');
const colorSwatchesContainer = document.getElementById('colorSwatches');

// Define a palette of colors
const colorPalette = [
    '#FF6347', // Tomato
    '#4682B4', // SteelBlue
    '#32CD32', // LimeGreen
    '#FFD700', // Gold
    '#8A2BE2', // BlueViolet
    '#FF69B4', // HotPink
    '#00CED1', // DarkTurquoise
    '#D2691E', // Chocolate
    '#6A5ACD', // SlateBlue
    '#FFFFFF', // White
    '#000000'  // Black
];

// Initial settings - these will be updated from input fields when drawShape is called
let currentShape = shapeSelect.value;
let currentColor = colorPalette[0];
let currentLineWidth = parseInt(lineWidthInput.value);
let currentPolygonSides = parseInt(polygonSidesInput.value);
let currentSize = parseInt(shapeSizeInput.value);


// --- Color Palette Initialization ---
function initializeColorPalette() {
    colorPalette.forEach(color => {
        const swatch = document.createElement('div');
        swatch.classList.add('color-swatch');
        swatch.style.backgroundColor = color;
        swatch.dataset.color = color; // Store color value
        if (color === currentColor) {
            swatch.classList.add('selected'); // Mark initial color as selected
        }
        swatch.addEventListener('click', () => {
            // Remove 'selected' from previous swatch
            const previouslySelected = document.querySelector('.color-swatch.selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected');
            }
            // Add 'selected' to clicked swatch
            swatch.classList.add('selected');
            currentColor = swatch.dataset.color; // Update current color state
            // No redraw here, it will be handled by drawButton click if needed, or initial load
        });
        colorSwatchesContainer.appendChild(swatch);
    });
}

// Function to draw a star (5 points, inner/outer radius)
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3; // Start from top
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath(); // Start a new path for the star
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.closePath();
}

// Function to draw a regular polygon with 'sides' number of sides
function drawPolygon(ctx, cx, cy, radius, sides) {
    ctx.beginPath(); // Start a new path for the polygon
    // Start angle adjusted so a flat side is at the bottom for even number of sides,
    // or a point is at the top for odd number of sides (like triangle or pentagon)
    let startAngle = (sides % 2 === 0) ? Math.PI / sides : Math.PI / 2 * 3;

    for (let i = 0; i < sides; i++) {
        let angle = startAngle + i * 2 * Math.PI / sides;
        let x = cx + radius * Math.cos(angle);
        let y = cy + radius * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
}

function updatePolygonSidesVisibility() {
    if (shapeSelect.value === 'polygon') {
        polygonSidesControl.style.display = 'block';
    } else {
        polygonSidesControl.style.display = 'none';
    }
}

function drawShape() {
    // Crucially, update all current values when drawShape is called
    currentShape = shapeSelect.value;
    // currentColor is updated by color swatch click directly
    currentSize = parseInt(shapeSizeInput.value);
    currentLineWidth = parseInt(lineWidthInput.value);
    currentPolygonSides = parseInt(polygonSidesInput.value);

    // Clear the canvas first (essential to remove previous drawings and their borders)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set drawing styles BEFORE drawing the shape
    ctx.fillStyle = currentColor;
    ctx.strokeStyle = '#333'; // Always a dark border for visibility
    ctx.lineWidth = currentLineWidth;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let propertiesTextLines = []; // Array to hold each line of text

    // Add common properties
    propertiesTextLines.push(`Shape: ${currentShape.charAt(0).toUpperCase() + currentShape.slice(1)}`);
    propertiesTextLines.push(`Color: ${currentColor}`);
    propertiesTextLines.push(`Scale: ${currentSize}px`); // Keep the general size info

    // Add specific properties, formulas, and draw shape
    switch (currentShape) {
        case 'circle':
            const radiusC = currentSize / 2;
            ctx.beginPath(); // Always start a new path
            ctx.arc(centerX, centerY, radiusC, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke(); // Draw border
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- Circular form`);
            propertiesTextLines.push(`- No corners or edges`);
            propertiesTextLines.push(`- Radius: ${radiusC}px`);
            propertiesTextLines.push(`- Diameter: ${currentSize}px`);
            propertiesTextLines.push(`- Circumference: ${ (2 * Math.PI * radiusC).toFixed(2)}px `);
            propertiesTextLines.push(`- Area: ${ (Math.PI * radiusC * radiusC).toFixed(2)} sq px `);
            break;
        case 'square':
            const squareSide = currentSize;
            // No beginPath/closePath for rect, it's a direct drawing method
            ctx.fillRect(centerX - squareSide / 2, centerY - squareSide / 2, squareSide, squareSide);
            ctx.strokeRect(centerX - squareSide / 2, centerY - squareSide / 2, squareSide, squareSide); // Use strokeRect for border
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- 4 equal sides`);
            propertiesTextLines.push(`- 4 right (90°) angles`);
            propertiesTextLines.push(`- Side length: ${squareSide}px`);
            propertiesTextLines.push(`- Perimeter: ${ (4 * squareSide).toFixed(0)}px `);
            propertiesTextLines.push(`- Area: ${ (squareSide * squareSide).toFixed(0)} sq px `);
            break;
        case 'rectangle':
            const rectWidth = currentSize * 1.5;
            const rectHeight = currentSize * 0.8;
            ctx.fillRect(centerX - rectWidth / 2, centerY - rectHeight / 2, rectWidth, rectHeight);
            ctx.strokeRect(centerX - rectWidth / 2, centerY - rectHeight / 2, rectWidth, rectHeight); // Use strokeRect for border
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- 4 sides`);
            propertiesTextLines.push(`- Opposite sides are equal`);
            propertiesTextLines.push(`- 4 right (90°) angles`);
            propertiesTextLines.push(`- Width: ${rectWidth.toFixed(0)}px`);
            propertiesTextLines.push(`- Height: ${rectHeight.toFixed(0)}px`);
            propertiesTextLines.push(`- Perimeter: ${ (2 * (rectWidth + rectHeight)).toFixed(0)}px `);
            propertiesTextLines.push(`- Area: ${ (rectWidth * rectHeight).toFixed(0)} sq px `);
            break;
        case 'triangle':
            const triSideApprox = currentSize; // Approx side for formula given drawing method
            const triHeightApprox = triSideApprox * Math.sqrt(3) / 2; // Height of equilateral
            drawPolygon(ctx, centerX, centerY, currentSize / 2, 3); // drawPolygon already calls beginPath/closePath
            ctx.fill();
            ctx.stroke(); // Draw border
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- 3 sides`);
            propertiesTextLines.push(`- 3 angles`);
            propertiesTextLines.push(`- Sum of angles = 180°`);
            propertiesTextLines.push(`- Approx. Side: ${triSideApprox}px`);
            propertiesTextLines.push(`- Approx. Perimeter: ${ (3 * triSideApprox).toFixed(0)}px `);
            propertiesTextLines.push(`- Approx. Area: ${ (0.5 * triSideApprox * triHeightApprox).toFixed(0)} sq px `);
            break;
        case 'star':
            const innerRadiusS = currentSize / 2 * 0.4;
            const outerRadiusS = currentSize / 2;
            drawStar(ctx, centerX, centerY, 5, outerRadiusS, innerRadiusS); // drawStar already calls beginPath/closePath
            ctx.fill();
            ctx.stroke(); // Draw outline
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- 5 points`);
            propertiesTextLines.push(`- Complex polygon`);
            break;
        case 'pentagon':
        case 'hexagon':
        case 'polygon':
            const numSides = (currentShape === 'pentagon') ? 5 :
                             (currentShape === 'hexagon') ? 6 :
                             currentPolygonSides;
            const radiusP = currentSize / 2;
            // Side length of a regular polygon inscribed in a circle
            const sideLength = (2 * radiusP * Math.sin(Math.PI / numSides));
            // Apothem of a regular polygon
            const apothem = (radiusP * Math.cos(Math.PI / numSides));

            drawPolygon(ctx, centerX, centerY, radiusP, numSides); // drawPolygon already calls beginPath/closePath
            ctx.fill();
            ctx.stroke(); // Draw border
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- ${numSides} equal sides`);
            propertiesTextLines.push(`- ${numSides} equal angles`);
            propertiesTextLines.push(`- Side length: ${sideLength.toFixed(1)}px`);
            propertiesTextLines.push(`- Perimeter: ${ (numSides * sideLength).toFixed(1)}px `);
            propertiesTextLines.push(`- Area: ${ (0.5 * numSides * sideLength * apothem).toFixed(1)} sq px `);
            break;
        case 'line':
            ctx.beginPath(); // Always start a new path
            ctx.moveTo(centerX - currentSize, centerY);
            ctx.lineTo(centerX + currentSize, centerY);
            ctx.stroke(); // Lines only have stroke
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- One dimension: length`);
            propertiesTextLines.push(`- Length: ${currentSize * 2}px`);
            propertiesTextLines.push(`- Display Width: ${currentLineWidth}px`);
            break;
    }

    // --- Draw Properties Text ---
    // Ensure the text drawing also starts a fresh path if it uses path methods,
    // although fillText doesn't directly use them. It's good practice for any complex drawing.
    ctx.beginPath(); // Good habit to ensure a clean slate for text rendering properties
    ctx.fillStyle = '#333'; // Dark color for text
    ctx.font = '13px Arial';
    ctx.textAlign = 'right'; // Align text to the right
    ctx.textBaseline = 'top';

    const textPadding = 10;
    const lineHeight = 16;

    // Calculate text block dimensions for background rectangle
    let maxWidth = 0;
    propertiesTextLines.forEach(line => {
        const textMetrics = ctx.measureText(line);
        maxWidth = Math.max(maxWidth, textMetrics.width);
    });
    const textBlockHeight = propertiesTextLines.length * lineHeight;

    const bgRectX = canvas.width - maxWidth - textPadding * 2;
    const bgRectY = textPadding;
    const bgRectWidth = maxWidth + textPadding * 2;
    const bgRectHeight = textBlockHeight + textPadding * 2;

    // Draw semi-transparent background rectangle for text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'; // Semi-transparent white
    ctx.fillRect(bgRectX, bgRectY, bgRectWidth, bgRectHeight);

    // Draw text
    ctx.fillStyle = '#333'; // Reset text color to dark
    let currentTextY = textPadding + 5; // Start text slightly below padding top

    propertiesTextLines.forEach(line => {
        ctx.fillText(line, canvas.width - textPadding, currentTextY);
        currentTextY += lineHeight; // Move down for the next line
    });
}

function downloadImage() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${currentShape}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Event Listeners
drawButton.addEventListener('click', drawShape);
downloadButton.addEventListener('click', downloadImage);

// Only update visibility on shape select, DO NOT draw shape on every input change
shapeSelect.addEventListener('change', () => {
    updatePolygonSidesVisibility(); // Update visibility when shape changes
    // drawShape() is NOT called here anymore
});

// Remove these event listeners to prevent auto-drawing on input change
// shapeSizeInput.addEventListener('input', drawShape);
// lineWidthInput.addEventListener('input', drawShape);
// polygonSidesInput.addEventListener('input', drawShape);

// Initial setup
initializeColorPalette(); // Initialize color swatches
updatePolygonSidesVisibility(); // Set initial visibility
drawShape(); // Draw initial shape when the page loads