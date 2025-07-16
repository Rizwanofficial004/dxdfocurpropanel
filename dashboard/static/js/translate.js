document.addEventListener("DOMContentLoaded", () => {
  const languageBtn = document.getElementById("languageBtn");
  const languageDropdown = document.getElementById("languageDropdown");
  const languageOptions = document.querySelectorAll(".language-option");

  let isDropdownOpen = false;

  // Toggle dropdown
  if (languageBtn && languageDropdown) {
    languageBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      isDropdownOpen = !isDropdownOpen;
      languageDropdown.classList.toggle("active", isDropdownOpen);
      languageBtn.setAttribute("aria-expanded", isDropdownOpen);
    });

    document.addEventListener("click", (e) => {
      if (!languageDropdown.contains(e.target) && !languageBtn.contains(e.target)) {
        isDropdownOpen = false;
        languageDropdown.classList.remove("active");
        languageBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Handle language selection
  languageOptions.forEach(option => {
    option.addEventListener("click", () => {
      const langCode = option.dataset.lang;
      const flag = option.querySelector(".flag-icon").textContent;
      const name = option.querySelector("span:last-child").textContent;

      document.querySelector(".language-btn .flag-icon").textContent = flag;
      document.querySelector(".language-btn .language-text").textContent = name;

      localStorage.setItem("language", langCode);
      translatePageTo(langCode);
    });
  });

  // Auto-load saved language
  const savedLang = localStorage.getItem("language");
  if (savedLang) {
    translatePageTo(savedLang);
  }
});

// Translation logic
async function translatePageTo(langCode) {
  const elements = document.querySelectorAll("[data-translatable]");

  for (const el of elements) {
    const originalText = el.textContent.trim();

    try {
      const res = await fetch("/translate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, lang: langCode })
      });

      const data = await res.json();
      if (data.translated) el.textContent = data.translated;
    } catch (error) {
      console.error("Translation error:", error);
    }
  }
}
