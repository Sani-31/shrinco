const WA_NUMBER = "919960455775";

const truckValues = {
  perforated: [
    { width: 50, height: "15–50", thickness: "1–3" },
    { width: 75, height: "15–50", thickness: "1–3" },
    { width: 100, height: "25–100", thickness: "1–3" },
    { width: 150, height: "25–150", thickness: "1–3" },
    { width: 200, height: "25–150", thickness: "1–3" },
    { width: 300, height: "50–150", thickness: "1.6–3" },
    { width: 400, height: "50–150", thickness: "1.6–3" },
    { width: 450, height: "50–150", thickness: "1.6–3" },
    { width: 600, height: "50–150", thickness: "1.6–3" },
    { width: 750, height: "50–150", thickness: "1.6–3" },
    { width: 900, height: "75–150", thickness: "1.6–3" },
    { width: 1000, height: "75–150", thickness: "1.6–3" }
  ],
  ladder: [
    { width: 150, height: "50–100", thickness: "1.6–3" },
    { width: 200, height: "50–100", thickness: "1.6–3" },
    { width: 300, height: "50–100", thickness: "1.6–3" },
    { width: 400, height: "50–100", thickness: "1.6–3" },
    { width: 450, height: "50–100", thickness: "1.6–3" },
    { width: 600, height: "50–100", thickness: "1.6–3" },
    { width: 750, height: "75–150", thickness: "1.6–3" },
    { width: 900, height: "75–150", thickness: "1.6–3" },
    { width: 1000, height: "75–150", thickness: "1.6–3" }
  ]
};

function buildWaLink(message) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => toast.classList.remove("visible"), 2200);
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function setSizeFinder() {
  const typeSelect = document.getElementById("trayType");
  const widthRange = document.getElementById("widthRange");
  const widthValue = document.getElementById("widthValue");
  const resultType = document.getElementById("resultType");
  const resultTitle = document.getElementById("resultTitle");
  const resultHeight = document.getElementById("resultHeight");
  const resultThickness = document.getElementById("resultThickness");
  const resultLength = document.getElementById("resultLength");
  const sizeWaButton = document.getElementById("sizeWaButton");
  const sizeProductImage = document.getElementById("sizeProductImage");

  if (!typeSelect || !widthRange) return;

  function findNearestMatch(type, width) {
    const typeData = truckValues[type] || truckValues.perforated;
    const closest = typeData.reduce((acc, item) => {
      const difference = Math.abs(item.width - width);
      if (!acc || difference < acc.distance) {
        return { item, distance: difference };
      }
      return acc;
    }, null);
    return closest.item;
  }

  function update() {
    const type = typeSelect.value;
    const selected = Number(widthRange.value);
    const match = findNearestMatch(type, selected);
    const typeLabel = type === "ladder" ? "Ladder" : "Perforated";
    const widthText = `${selected} mm`;
    const widthNumber = Number(selected);

    widthValue.textContent = widthText;
    resultType.textContent = typeLabel;
    resultTitle.textContent = `${typeLabel} tray · ${widthText}`;
    resultHeight.textContent = match.height + " mm";
    resultThickness.textContent = match.thickness + " mm";
    resultLength.textContent = "2.5 / 3 m";

    sizeWaButton.dataset.type = typeLabel;
    sizeWaButton.dataset.width = String(widthNumber);
    sizeWaButton.dataset.finish = type === "ladder" ? "GI" : "HDG";
    if (sizeProductImage) {
      sizeProductImage.src = `assets/tray-${type === "ladder" ? "ladder" : "perforated"}.webp`;
      sizeProductImage.alt = `${typeLabel} cable tray`;
    }
  }

  typeSelect.addEventListener("change", update);
  widthRange.addEventListener("input", update);
  update();
}

function setupWhatsAppButtons() {
  const buttons = document.querySelectorAll("[data-wa]");

  buttons.forEach((button) => {
    const type = button.dataset.type || "Cable Tray";
    const width = button.dataset.width || "-";
    const finish = button.dataset.finish || "-";
    const text = `Hi Shrinco, I'd like a quote:\n• Type: ${type}\n• Width: ${width} mm\n• Finish: ${finish}\nPlease share price & lead time.`;
    button.setAttribute("href", buildWaLink(text));
    button.addEventListener("click", (event) => {
      if (button.tagName === "BUTTON") {
        event.preventDefault();
        window.open(buildWaLink(text), "_blank", "noopener");
      }
    });
  });

  const waFloat = document.getElementById("waFloat");
  if (waFloat) {
    waFloat.href = buildWaLink("Hi Shrinco team, I need a quotation for cable trays.");
  }
}

function setupFormSubmit() {
  const form = document.getElementById("rfqForm");
  const submitButton = form?.querySelector("button[type='submit']");

  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (data._gotcha) {
      return;
    }

    const subject = encodeURIComponent("Quotation request from website");
    const body = encodeURIComponent(
      [
        `Name: ${data.name || "-"}`,
        `Company: ${data.company || "-"}`,
        `Phone: ${data.phone || "-"}`,
        `Email: ${data.email || "-"}`,
        `Tray type: ${data.tray_type || "-"}`,
        `Width: ${data.width || "-"}`,
        `Material / finish: ${data.finish || "-"}`,
        `Quantity: ${data.quantity || "-"}`,
        `Message: ${data.message || "-"}`
      ].join("\n")
    );

    window.location.href = `mailto:sales@shrinco.example?subject=${subject}&body=${body}`;
    showToast("Enquiry drafted. Please send the email.");
    form.reset();

    if (submitButton) {
      submitButton.textContent = "Sent";
      setTimeout(() => {
        submitButton.textContent = "Send enquiry";
      }, 1600);
    }
  });
}

function setupMaterialSelector() {
  const chips = document.querySelectorAll(".material-chip");
  const detail = document.querySelector(".material-detail");
  const detailMap = {
    "Hot Dip Galvanised": "Mild steel, hot dip galvanised after manufacture.",
    "GI Sheet": "Trays made from pre-galvanised sheets.",
    "Powder Coated": "Mild steel sheet powder coated as required (glossy, matt, structure or plain).",
    "Stainless Steel": "Stainless steel sheets (304, 316L).",
    "Aluminium": "Aluminium sheets (anodised)."
  };

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((item) => item.classList.remove("active"));
      chip.classList.add("active");
      if (detail) {
        const label = chip.textContent.trim();
        detail.innerHTML = `<h3>${label}</h3><p>${detailMap[label] || "Material details to confirm with Shrinco."}</p>`;
      }
    });
  });
}

function setupFittingFilters() {
  const filters = document.querySelectorAll("[data-fitting-filter]");
  const cards = document.querySelectorAll(".fitting-card[data-category]");

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      const selectedCategory = filter.dataset.fittingFilter;

      filters.forEach((button) => button.classList.remove("active"));
      filter.classList.add("active");

      cards.forEach((card) => {
        card.hidden = selectedCategory !== "all" && card.dataset.category !== selectedCategory;
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  setupRevealObserver();
  setSizeFinder();
  setupWhatsAppButtons();
  setupFormSubmit();
  setupMaterialSelector();
  setupFittingFilters();

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const type = button.dataset.view;
      const target = type === "ladder" ? "ladder" : "perforated";
      document.getElementById("trayType").value = target;
      const event = new Event("change", { bubbles: true });
      document.getElementById("trayType").dispatchEvent(event);
      document.getElementById("sizes").scrollIntoView({ behavior: "smooth" });
    });
  });
});
