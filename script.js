const langSelect = document.getElementById("langSelect");
const monthSelect = document.getElementById("monthSelect");
const yearSelect = document.getElementById("yearSelect");
const headerImage = document.getElementById("headerImage");
const weekdaysColor = document.getElementById("weekdaysColor");
const monthTextColor = document.getElementById("monthTextColor");
const gradLeft = document.getElementById("gradLeft");
const gradRight = document.getElementById("gradRight");
const calendarBody = document.getElementById("calendarBody");
const weekdaysRow = document.getElementById("weekdaysRow");

const translations = {
  en: {
    months: [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ],
    weekdays: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  },
  fr: {
    months: [
      "Janvier","Février","Mars","Avril","Mai","Juin",
      "Juillet","Août","Septembre","Octobre","Novembre","Décembre"
    ],
    weekdays: ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"]
  }
};

// --- Color templates per season ---
const colorTemplates = {
  winter: {
    gradLeft: "#6dd5ed",
    gradRight: "#2193b0",
    text: "#ffffff",
    weekdays: "#d0e7f9"
  },
  spring: {
    gradLeft: "#a8e063",
    gradRight: "#56ab2f",
    text: "#1b4332",
    weekdays: "#dff6dd"
  },
  summer: {
    gradLeft: "#fceabb",
    gradRight: "#f8b500",
    text: "#4a2c00",
    weekdays: "#fff3cd"
  },
  autumn: {
    gradLeft: "#e96443",
    gradRight: "#904e95",
    text: "#ffffff",
    weekdays: "#f5e0d3"
  }
};

// Apply template based on month
function applyTemplate(month) {
  let season;
  if ([11, 0, 1].includes(month)) season = "winter";  // Dec, Jan, Feb
  else if ([2, 3, 4].includes(month)) season = "spring"; // Mar, Apr, May
  else if ([5, 6, 7].includes(month)) season = "summer"; // Jun, Jul, Aug
  else season = "autumn"; // Sep, Oct, Nov

  const tpl = colorTemplates[season];
  document.documentElement.style.setProperty("--grad-left", tpl.gradLeft);
  document.documentElement.style.setProperty("--grad-right", tpl.gradRight);
  document.documentElement.style.setProperty("--month-text-color", tpl.text);
  document.documentElement.style.setProperty("--weekdays-color", tpl.weekdays);

  // Sync pickers visually
  gradLeft.value = tpl.gradLeft;
  gradRight.value = tpl.gradRight;
  monthTextColor.value = tpl.text;
  weekdaysColor.value = tpl.weekdays;
}

// --- Populate years ---
for (let y = 2025; y <= 2035; y++) {
  const opt = document.createElement("option");
  opt.value = y;
  opt.textContent = y;
  yearSelect.appendChild(opt);
}
yearSelect.value = new Date().getFullYear();

// --- Image upload ---
document.getElementById("headerPhoto").addEventListener("change", e => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = ev => {
      headerImage.src = ev.target.result;
      headerImage.style.top = "0px";
    };
    reader.readAsDataURL(file);
  }
});

// --- Drag image vertically (mouse + touch) ---
let isDragging = false;
let startY = 0;
let startTop = 0;

function startDrag(y) {
  isDragging = true;
  startY = y;
  startTop = parseInt(headerImage.style.top || "0", 10);
  headerImage.style.cursor = "grabbing";
}

function doDrag(y) {
  if (isDragging) {
    const dy = y - startY;
    let newTop = startTop + dy;

    const containerHeight = document.getElementById("photoContainer").offsetHeight;
    const imgHeight = headerImage.offsetHeight;

    // Keep image inside container
    if (imgHeight > containerHeight) {
      const minTop = containerHeight - imgHeight;
      if (newTop < minTop) newTop = minTop;
      if (newTop > 0) newTop = 0;
    } else {
      newTop = 0;
    }

    headerImage.style.top = `${newTop}px`;
  }
}

function endDrag() {
  if (isDragging) {
    isDragging = false;
    headerImage.style.cursor = "grab";
  }
}

// Mouse events
headerImage.addEventListener("mousedown", e => startDrag(e.clientY));
document.addEventListener("mousemove", e => doDrag(e.clientY));
document.addEventListener("mouseup", endDrag);

// Touch events
headerImage.addEventListener("touchstart", e => {
  if (e.touches.length === 1) {
    startDrag(e.touches[0].clientY);
  }
});
document.addEventListener("touchmove", e => {
  if (e.touches.length === 1) {
    doDrag(e.touches[0].clientY);
  }
});
document.addEventListener("touchend", endDrag);

// --- Generate calendar ---
function generateCalendar() {
  const lang = langSelect.value;
  const months = translations[lang].months;
  const weekdays = translations[lang].weekdays;

  const month = parseInt(monthSelect.value);
  const year = parseInt(yearSelect.value);

  document.querySelector(".month-text").textContent = months[month];

  // Apply seasonal template
  applyTemplate(month);

  // Update weekdays header
  weekdaysRow.innerHTML = "";
  weekdays.forEach(day => {
    const th = document.createElement("th");
    th.textContent = day;
    weekdaysRow.appendChild(th);
  });

  // Build calendar days
  calendarBody.innerHTML = "";
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let date = 1;
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < 7; j++) {
      const cell = document.createElement("td");
      if (i === 0 && j < firstDay) {
        cell.textContent = "";
      } else if (date > daysInMonth) {
        cell.textContent = "";
      } else {
        cell.textContent = date;
        date++;
      }
      row.appendChild(cell);
    }
    calendarBody.appendChild(row);
  }
}

// --- Color pickers manual overrides ---
weekdaysColor.addEventListener("input", () => {
  document.documentElement.style.setProperty("--weekdays-color", weekdaysColor.value);
});
monthTextColor.addEventListener("input", () => {
  document.documentElement.style.setProperty("--month-text-color", monthTextColor.value);
});
gradLeft.addEventListener("input", () => {
  document.documentElement.style.setProperty("--grad-left", gradLeft.value);
});
gradRight.addEventListener("input", () => {
  document.documentElement.style.setProperty("--grad-right", gradRight.value);
});

// --- Export to PDF (high resolution) ---
function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const element = document.getElementById("calendarWrapper");

  html2canvas(element, {
    scale: 3, // high resolution (~300dpi)
    useCORS: true
  }).then(canvas => {
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "pt", "letter");
    const pageWidth = pdf.internal.pageSize.getWidth();

    const imgWidth = pageWidth - 10;
    const imgHeight = canvas.height * imgWidth / canvas.width;

    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
    const lang = langSelect.value;
    const months = translations[lang].months;
    pdf.save(`${months[monthSelect.value]} ${yearSelect.value}.pdf`);
  });
}

// --- Init months in English by default ---
translations.en.months.forEach((m, i) => {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = m;
  monthSelect.appendChild(opt);
});
monthSelect.value = new Date().getMonth();

// --- Handle language switch ---
langSelect.addEventListener("change", () => {
  const lang = langSelect.value;
  monthSelect.innerHTML = "";
  translations[lang].months.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = m;
    monthSelect.appendChild(opt);
  });
  monthSelect.value = new Date().getMonth();
  generateCalendar();
});

// --- Initial render ---
generateCalendar();
