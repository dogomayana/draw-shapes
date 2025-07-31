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

// Conversion factor from pixels to approximate centimeters (assuming ~96 DPI)
const PX_TO_CM_RATIO = 37.8; // Approx. 96 pixels per inch / 2.54 cm per inch

// Define a palette of colors (hex codes)
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

// Mapping from hex codes to friendly color names
const colorNames = {
    '#FF6347': 'Tomato',
    '#4682B4': 'Steel Blue',
    '#32CD32': 'Lime Green',
    '#FFD700': 'Gold',
    '#8A2BE2': 'Blue Violet',
    '#FF69B4': 'Hot Pink',
    '#00CED1': 'Dark Turquoise',
    '#D2691E': 'Chocolate',
    '#6A5ACD': 'Slate Blue',
    '#FFFFFF': 'White',
    '#000000': 'Black'
};

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
        y = cy + Math.sin(rot) * outerRadius; // This line was previously using innerRadius, fixed to outerRadius for proper star point
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
    propertiesTextLines.push(`Color: ${colorNames[currentColor] || currentColor}`); // Use color name or fallback to hex
    // Display the input scale in pixels, then properties in cm
    propertiesTextLines.push(`Input Scale: ${currentSize} px`);

    // Add specific properties, formulas, and draw shape
    switch (currentShape) {
        case 'circle':
            const radiusC_px = currentSize / 2;
            ctx.beginPath(); // Always start a new path
            ctx.arc(centerX, centerY, radiusC_px, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke(); // Draw border

            // Properties calculated and displayed in cm
            const radiusC_cm = radiusC_px / PX_TO_CM_RATIO;
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- Circular form`);
            propertiesTextLines.push(`- No corners or edges`);
            propertiesTextLines.push(`- Radius: ${radiusC_cm.toFixed(2)} cm`);
            propertiesTextLines.push(`- Diameter: ${(radiusC_cm * 2).toFixed(2)} cm`);
            propertiesTextLines.push(`- Circumference: ${ (2 * Math.PI * radiusC_cm).toFixed(2)} cm `);
            propertiesTextLines.push(`- Area: ${ (Math.PI * radiusC_cm * radiusC_cm).toFixed(2)} sq cm `);
            break;
        case 'square':
            const squareSide_px = currentSize;
            // No beginPath/closePath for rect, it's a direct drawing method
            ctx.fillRect(centerX - squareSide_px / 2, centerY - squareSide_px / 2, squareSide_px, squareSide_px);
            ctx.strokeRect(centerX - squareSide_px / 2, centerY - squareSide_px / 2, squareSide_px, squareSide_px); // Use strokeRect for border

            // Properties calculated and displayed in cm
            const squareSide_cm = squareSide_px / PX_TO_CM_RATIO;
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- 4 equal sides`);
            propertiesTextLines.push(`- 4 right (90°) angles`);
            propertiesTextLines.push(`- Side length: ${squareSide_cm.toFixed(2)} cm`);
            propertiesTextLines.push(`- Perimeter: ${ (4 * squareSide_cm).toFixed(2)} cm `);
            propertiesTextLines.push(`- Area: ${ (squareSide_cm * squareSide_cm).toFixed(2)} sq cm `);
            break;
        case 'rectangle':
            const rectWidth_px = currentSize * 1.5;
            const rectHeight_px = currentSize * 0.8;
            ctx.fillRect(centerX - rectWidth_px / 2, centerY - rectHeight_px / 2, rectWidth_px, rectHeight_px);
            ctx.strokeRect(centerX - rectWidth_px / 2, centerY - rectHeight_px / 2, rectWidth_px, rectHeight_px); // Use strokeRect for border

            // Properties calculated and displayed in cm
            const rectWidth_cm = rectWidth_px / PX_TO_CM_RATIO;
            const rectHeight_cm = rectHeight_px / PX_TO_CM_RATIO;
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- 4 sides`);
            propertiesTextLines.push(`- Opposite sides are equal`);
            propertiesTextLines.push(`- 4 right (90°) angles`);
            propertiesTextLines.push(`- Width: ${rectWidth_cm.toFixed(2)} cm`);
            propertiesTextLines.push(`- Height: ${rectHeight_cm.toFixed(2)} cm`);
            propertiesTextLines.push(`- Perimeter: ${ (2 * (rectWidth_cm + rectHeight_cm)).toFixed(2)} cm `);
            propertiesTextLines.push(`- Area: ${ (rectWidth_cm * rectHeight_cm).toFixed(2)} sq cm `);
            break;
        case 'triangle':
            const triRadius_px = currentSize / 2; // Radius for drawing polygon method
            const triSideApprox_px = 2 * triRadius_px * Math.sin(Math.PI / 3); // Approx side for equilateral triangle based on radius
            const triHeightApprox_px = triSideApprox_px * Math.sqrt(3) / 2; // Height of equilateral

            drawPolygon(ctx, centerX, centerY, triRadius_px, 3); // drawPolygon already calls beginPath/closePath
            ctx.fill();
            ctx.stroke(); // Draw border

            // Properties calculated and displayed in cm
            const triSideApprox_cm = triSideApprox_px / PX_TO_CM_RATIO;
            const triHeightApprox_cm = triHeightApprox_px / PX_TO_CM_RATIO;
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- 3 sides`);
            propertiesTextLines.push(`- 3 angles`);
            propertiesTextLines.push(`- Sum of angles = 180°`);
            propertiesTextLines.push(`- Approx. Side: ${triSideApprox_cm.toFixed(2)} cm`);
            propertiesTextLines.push(`- Approx. Perimeter: ${ (3 * triSideApprox_cm).toFixed(2)} cm `);
            propertiesTextLines.push(`- Approx. Area: ${ (0.5 * triSideApprox_cm * triHeightApprox_cm).toFixed(2)} sq cm `);
            break;
        case 'star':
            const innerRadiusS_px = currentSize / 2 * 0.4;
            const outerRadiusS_px = currentSize / 2;
            drawStar(ctx, centerX, centerY, 5, outerRadiusS_px, innerRadiusS_px); // drawStar already calls beginPath/closePath
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
            const radiusP_px = currentSize / 2;
            drawPolygon(ctx, centerX, centerY, radiusP_px, numSides); // drawPolygon already calls beginPath/closePath
            ctx.fill();
            ctx.stroke(); // Draw border

            // Properties calculated and displayed in cm
            const radiusP_cm = radiusP_px / PX_TO_CM_RATIO;
            // Side length of a regular polygon inscribed in a circle (in cm)
            const sideLength_cm = (2 * radiusP_cm * Math.sin(Math.PI / numSides));
            // Apothem of a regular polygon (in cm)
            const apothem_cm = (radiusP_cm * Math.cos(Math.PI / numSides));

            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- ${numSides} equal sides`);
            propertiesTextLines.push(`- ${numSides} equal angles`);
            propertiesTextLines.push(`- Side length: ${sideLength_cm.toFixed(2)} cm`);
            propertiesTextLines.push(`- Perimeter: ${ (numSides * sideLength_cm).toFixed(2)} cm `);
            propertiesTextLines.push(`- Area: ${ (0.5 * numSides * sideLength_cm * apothem_cm).toFixed(2)} sq cm `);
            break;
        case 'line':
            const lineLength_px = currentSize * 2;
            const lineWidth_px = currentLineWidth;
            ctx.beginPath(); // Always start a new path
            ctx.moveTo(centerX - currentSize, centerY);
            ctx.lineTo(centerX + currentSize, centerY);
            ctx.stroke(); // Lines only have stroke

            // Properties calculated and displayed in cm
            const lineLength_cm = lineLength_px / PX_TO_CM_RATIO;
            const lineWidth_cm = lineWidth_px / PX_TO_CM_RATIO;
            propertiesTextLines.push(`Properties:`);
            propertiesTextLines.push(`- One dimension: length`);
            propertiesTextLines.push(`- Length: ${lineLength_cm.toFixed(2)} cm`);
            propertiesTextLines.push(`- Display Width: ${lineWidth_cm.toFixed(2)} cm`);
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