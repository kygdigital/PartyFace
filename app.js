const canvas = document.querySelector("#cardCanvas");
const ctx = canvas.getContext("2d");

const templates = [
  {
    id: "cake",
    name: "Cake Parade",
    background: ["#fff1e8", "#ffe0ea"],
    accent: "#e94655",
    secondary: "#0f8f8c",
    slots: [
      { x: 314, y: 625, r: 112, body: "#3557d5", dx: 0, dy: 0, scale: 1, rotate: -4 },
      { x: 602, y: 585, r: 118, body: "#f6b84f", dx: 0, dy: 0, scale: 1, rotate: 3 },
      { x: 884, y: 632, r: 110, body: "#1f9b78", dx: 0, dy: 0, scale: 1, rotate: 5 },
    ],
  },
  {
    id: "disco",
    name: "Disco Wish",
    background: ["#eaf7f4", "#dfe7ff"],
    accent: "#3557d5",
    secondary: "#e94655",
    slots: [
      { x: 280, y: 660, r: 108, body: "#241f21", dx: 0, dy: 0, scale: 1, rotate: -8 },
      { x: 596, y: 560, r: 124, body: "#e94655", dx: 0, dy: 0, scale: 1, rotate: 0 },
      { x: 920, y: 660, r: 108, body: "#f6b84f", dx: 0, dy: 0, scale: 1, rotate: 8 },
    ],
  },
  {
    id: "garden",
    name: "Garden Party",
    background: ["#f7f2df", "#d9f2e5"],
    accent: "#0f8f8c",
    secondary: "#bd2635",
    slots: [
      { x: 360, y: 620, r: 118, body: "#0f8f8c", dx: 0, dy: 0, scale: 1, rotate: -2 },
      { x: 700, y: 620, r: 118, body: "#bd2635", dx: 0, dy: 0, scale: 1, rotate: 2 },
    ],
  },
];

const state = {
  templateIndex: 0,
  selectedSlot: 0,
  faces: [],
  assignments: [],
  drag: null,
};

const els = {
  headline: document.querySelector("#headlineInput"),
  message: document.querySelector("#messageInput"),
  templateGrid: document.querySelector("#templateGrid"),
  templateName: document.querySelector("#templateName"),
  faceUpload: document.querySelector("#faceUpload"),
  faceList: document.querySelector("#faceList"),
  scale: document.querySelector("#scaleInput"),
  rotate: document.querySelector("#rotateInput"),
  prev: document.querySelector("#prevSlotButton"),
  next: document.querySelector("#nextSlotButton"),
  reset: document.querySelector("#resetButton"),
  download: document.querySelector("#downloadButton"),
  prompt: document.querySelector("#promptInput"),
  copyPrompt: document.querySelector("#copyPromptButton"),
};

function currentTemplate() {
  return templates[state.templateIndex];
}

function slot() {
  return currentTemplate().slots[state.selectedSlot];
}

function resetAssignments() {
  state.assignments = currentTemplate().slots.map((_, index) => state.faces[index % Math.max(state.faces.length, 1)]?.id ?? null);
}

function renderTemplateButtons() {
  els.templateGrid.innerHTML = "";
  templates.forEach((template, index) => {
    const button = document.createElement("button");
    button.className = `template-button${index === state.templateIndex ? " active" : ""}`;
    button.type = "button";
    button.title = template.name;
    button.innerHTML = `<span class="swatch" style="background: linear-gradient(135deg, ${template.background[0]}, ${template.background[1]}); border-bottom: 12px solid ${template.accent};"></span>`;
    button.addEventListener("click", () => {
      state.templateIndex = index;
      state.selectedSlot = 0;
      resetAssignments();
      syncControls();
      renderTemplateButtons();
      draw();
    });
    els.templateGrid.appendChild(button);
  });
}

function syncControls() {
  const selected = slot();
  els.templateName.textContent = currentTemplate().name;
  els.scale.value = selected.scale;
  els.rotate.value = selected.rotate;
}

function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function drawBackground(template) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, template.background[0]);
  gradient.addColorStop(1, template.background[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 197) % canvas.width;
    const y = (i * 113) % 620;
    ctx.beginPath();
    ctx.arc(x, y, 5 + (i % 4), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = template.accent;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(canvas.width, 0);
  ctx.lineTo(canvas.width, 92);
  ctx.quadraticCurveTo(canvas.width * 0.5, 150, 0, 92);
  ctx.closePath();
  ctx.fill();
}

function drawText(template) {
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 92px Playfair Display, Georgia, serif";
  ctx.fillText(els.headline.value || "Happy Birthday!", canvas.width / 2, 112);

  ctx.fillStyle = "#352b2e";
  ctx.font = "700 42px Inter, sans-serif";
  wrapText(els.message.value || "", canvas.width / 2, 1270, 850, 52);

  ctx.fillStyle = template.secondary;
  ctx.font = "800 28px Inter, sans-serif";
  ctx.fillText("Made with PartyFace", canvas.width / 2, 1490);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/);
  let line = "";
  let row = 0;
  words.forEach((word) => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + row * lineHeight);
      line = word;
      row += 1;
    } else {
      line = test;
    }
  });
  if (line) ctx.fillText(line, x, y + row * lineHeight);
}

function drawCake(template) {
  ctx.save();
  ctx.translate(canvas.width / 2, 955);
  ctx.fillStyle = "#fff8f2";
  drawRoundedRect(-340, -100, 680, 215, 34);
  ctx.fill();
  ctx.fillStyle = template.accent;
  drawRoundedRect(-300, -56, 600, 70, 22);
  ctx.fill();
  ctx.fillStyle = "#f6b84f";
  for (let x = -250; x <= 250; x += 100) {
    ctx.fillRect(x - 8, -170, 16, 90);
    ctx.beginPath();
    ctx.ellipse(x, -186, 16, 30, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBody(slotData) {
  const y = slotData.y + slotData.r * 0.86;
  ctx.save();
  ctx.fillStyle = slotData.body;
  ctx.beginPath();
  ctx.ellipse(slotData.x, y + 145, slotData.r * 1.22, slotData.r * 1.68, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.beginPath();
  ctx.moveTo(slotData.x - 34, y + 20);
  ctx.lineTo(slotData.x, y + 155);
  ctx.lineTo(slotData.x + 34, y + 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function faceForSlot(index) {
  const id = state.assignments[index];
  return state.faces.find((face) => face.id === id);
}

function drawFace(slotData, face, isSelected) {
  ctx.save();
  ctx.translate(slotData.x + slotData.dx, slotData.y + slotData.dy);
  ctx.rotate((slotData.rotate * Math.PI) / 180);
  ctx.beginPath();
  ctx.arc(0, 0, slotData.r, 0, Math.PI * 2);
  ctx.clip();

  if (face) {
    const img = face.image;
    const size = slotData.r * 2 * slotData.scale;
    const ratio = img.width / img.height;
    let width = size;
    let height = size;
    if (ratio > 1) width = size * ratio;
    else height = size / ratio;
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-slotData.r, -slotData.r, slotData.r * 2, slotData.r * 2);
    ctx.fillStyle = "#cbbeb5";
    ctx.font = "800 72px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("+", 0, 0);
  }
  ctx.restore();

  ctx.lineWidth = isSelected ? 8 : 4;
  ctx.strokeStyle = isSelected ? "#e94655" : "rgba(255,255,255,0.9)";
  ctx.beginPath();
  ctx.arc(slotData.x + slotData.dx, slotData.y + slotData.dy, slotData.r + 3, 0, Math.PI * 2);
  ctx.stroke();
}

function draw() {
  const template = currentTemplate();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground(template);
  drawCake(template);

  template.slots.forEach((slotData, index) => drawBody(slotData, index));
  template.slots.forEach((slotData, index) => {
    drawFace(slotData, faceForSlot(index), index === state.selectedSlot);
  });

  drawText(template);
}

function renderFaceList() {
  els.faceList.innerHTML = "";
  state.faces.forEach((face) => {
    const chip = document.createElement("div");
    chip.className = "face-chip";
    chip.innerHTML = `<img src="${face.url}" alt=""><span>${face.name}</span>`;
    const assignButton = document.createElement("button");
    assignButton.type = "button";
    assignButton.textContent = "Use";
    assignButton.addEventListener("click", () => {
      state.assignments[state.selectedSlot] = face.id;
      draw();
    });
    chip.appendChild(assignButton);
    els.faceList.appendChild(chip);
  });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve({ img, url: reader.result });
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleUpload(event) {
  const files = [...event.target.files];
  for (const file of files) {
    const { img, url } = await readImageFile(file);
    state.faces.push({
      id: crypto.randomUUID(),
      image: img,
      name: file.name,
      url,
    });
  }
  resetAssignments();
  renderFaceList();
  draw();
  event.target.value = "";
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function pickSlot(point) {
  return currentTemplate().slots.findIndex((slotData) => {
    const x = slotData.x + slotData.dx;
    const y = slotData.y + slotData.dy;
    return Math.hypot(point.x - x, point.y - y) <= slotData.r + 22;
  });
}

canvas.addEventListener("pointerdown", (event) => {
  const point = canvasPoint(event);
  const index = pickSlot(point);
  if (index < 0) return;
  state.selectedSlot = index;
  const selected = slot();
  state.drag = {
    pointerId: event.pointerId,
    startX: point.x,
    startY: point.y,
    dx: selected.dx,
    dy: selected.dy,
  };
  canvas.setPointerCapture(event.pointerId);
  syncControls();
  draw();
});

canvas.addEventListener("pointermove", (event) => {
  if (!state.drag) return;
  const point = canvasPoint(event);
  const selected = slot();
  selected.dx = state.drag.dx + point.x - state.drag.startX;
  selected.dy = state.drag.dy + point.y - state.drag.startY;
  draw();
});

canvas.addEventListener("pointerup", () => {
  state.drag = null;
});

els.faceUpload.addEventListener("change", handleUpload);
els.headline.addEventListener("input", draw);
els.message.addEventListener("input", draw);
els.scale.addEventListener("input", () => {
  slot().scale = Number(els.scale.value);
  draw();
});
els.rotate.addEventListener("input", () => {
  slot().rotate = Number(els.rotate.value);
  draw();
});
els.prev.addEventListener("click", () => {
  const count = currentTemplate().slots.length;
  state.selectedSlot = (state.selectedSlot - 1 + count) % count;
  syncControls();
  draw();
});
els.next.addEventListener("click", () => {
  state.selectedSlot = (state.selectedSlot + 1) % currentTemplate().slots.length;
  syncControls();
  draw();
});
els.reset.addEventListener("click", () => {
  currentTemplate().slots.forEach((slotData) => {
    slotData.dx = 0;
    slotData.dy = 0;
    slotData.scale = 1;
    slotData.rotate = 0;
  });
  syncControls();
  draw();
});
els.download.addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "partyface-birthday-card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});
els.copyPrompt.addEventListener("click", async () => {
  const prompt = `${els.prompt.value}. Headline: ${els.headline.value}. Scene template: ${currentTemplate().name}. Preserve face cutout positions and birthday card composition.`;
  try {
    await navigator.clipboard.writeText(prompt);
    els.copyPrompt.textContent = "Copied";
  } catch {
    els.prompt.value = prompt;
    els.prompt.select();
    els.copyPrompt.textContent = "Selected";
  }
  setTimeout(() => {
    els.copyPrompt.textContent = "Copy prompt";
  }, 1200);
});

resetAssignments();
renderTemplateButtons();
syncControls();
draw();
