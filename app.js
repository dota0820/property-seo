// PrimeVerse Ipoh Realty - Pro Portal Logic (3-Theme Switcher + 3 Golden UI Rules)

(function () {
  const DATA = window.APP_DATA;

  const state = {
    lang: "en",
    theme: localStorage.getItem("pv_theme") || "a",
    search: "",
    searchTab: "all", // 'all' | 'Landed' | 'Condo' | 'investment'
    area: "all",
    maxBudget: 99999999,
    topic: "all",
    compareIds: ["upper-east-tiger-lane", "the-haven-tambun"],
    viewedIds: new Set(),
    activeAgentId: null,
    activeProjectId: null,
    activeModalTab: "overview",
    activePhotoIdx: 0,
    roundRobinIndex: 0
  };

  // --- Helpers ---
  function formatRM(num) {
    return "RM " + Math.round(num).toLocaleString("en-US");
  }

  function formatCompactRM(num) {
    return "RM " + Math.round(num / 1000) + "k";
  }

  function t(key) {
    return DATA.i18n[state.lang][key] || key;
  }

  function pick(obj, enField, zhField) {
    return state.lang === "zh" ? obj[zhField] : obj[enField];
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function findAgent(agentId) {
    return DATA.agents.find((a) => a.id === agentId) || DATA.agents[0];
  }

  function findProject(projectId) {
    return DATA.projects.find((p) => p.id === projectId);
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // --- Live 3-Theme Switcher (Schemes A, B, C) ---
  window.setTheme = function (themeId) {
    state.theme = themeId;
    document.body.setAttribute("data-theme", themeId);
    localStorage.setItem("pv_theme", themeId);

    ["a", "b", "c"].forEach((id) => {
      const btn = document.getElementById("theme-btn-" + id);
      if (!btn) return;
      const active = id === themeId;
      btn.className = active
        ? "theme-switch-btn px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-white text-slate-900 whitespace-nowrap shadow-sm"
        : "theme-switch-btn px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-white/10 text-slate-200 hover:bg-white/20 whitespace-nowrap";
    });
  };

  // --- Language Switcher ---
  window.setLanguage = function (lang) {
    state.lang = lang;
    const zhBtn = document.getElementById("lang-zh");
    const enBtn = document.getElementById("lang-en");

    if (lang === "zh") {
      zhBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md transition-all btn-brand-primary";
      enBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-600 hover:text-slate-900";
    } else {
      enBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md transition-all btn-brand-primary";
      zhBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-600 hover:text-slate-900";
    }

    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key === "tagline") {
        el.textContent = state.lang === "zh" ? DATA.brand.taglineZh : DATA.brand.taglineEn;
      } else {
        el.textContent = t(key);
      }
    });

    document.getElementById("search-input").placeholder = t("searchPlaceholder");
    document.getElementById("footer-address").textContent =
      state.lang === "zh" ? DATA.brand.addressZh : DATA.brand.addressEn;
    document.getElementById("calc-cta-text").textContent =
      state.lang === "zh"
        ? "将怡保贷款评估与银行估价发到我 WhatsApp"
        : "WhatsApp Me This Ipoh Loan & Valuation Breakdown";
    document.getElementById("map-strip-title").textContent =
      state.lang === "zh"
        ? "怡保地图价格气泡演示（蓝色=在售 · 紫色=民宿/租 · 绿色=新盘/降价 · 点击查看后变浅灰）"
        : "Ipoh Map Price Pins Preview (Click any pin to inspect — turns light grey after Viewed)";

    updateCalculatorLabels();
    renderLifestylePills();
    renderMapPins();
    renderProjects();
    renderAreaGuides();
    renderCompareTable();
    renderAgents();
    if (state.activeAgentId) renderAgentPortfolio(state.activeAgentId);
    if (state.activeProjectId) renderProjectModalContent();
    refreshIcons();
  };

  function updateCalculatorLabels() {
    const isZh = state.lang === "zh";
    document.getElementById("calc-lbl-price").textContent = isZh ? "房屋总价 (Property Price)" : "Property Price";
    document.getElementById("calc-lbl-loan").textContent = isZh ? "贷款成数 (Loan Margin)" : "Loan Margin";
    document.getElementById("calc-lbl-rate").textContent = isZh ? "贷款利率 (Interest Rate)" : "Interest Rate";
    document.getElementById("calc-lbl-tenure").textContent = isZh ? "贷款年限 (Tenure)" : "Loan Tenure";
    document.getElementById("calc-lbl-rent").textContent = isZh ? "预期月租 (Est. Rent)" : "Est. Monthly Rent";
    document.getElementById("calc-lbl-foreigner").textContent = isZh
      ? "外籍买家税率（适用 8% 统一 MOT 印花税）"
      : "Foreign Buyer (8% Flat MOT Stamp Duty Rate)";
    document.getElementById("calc-summary-heading").textContent = isZh
      ? "月供与买房入场成本概算"
      : "Monthly Repayment & Entry Cost";
    document.getElementById("out-lbl-monthly").textContent = isZh ? "预计每月供款" : "Est. Monthly Installment";
    document.getElementById("out-lbl-income").textContent = isZh ? "最低家庭月入 (70% DSR)" : "Min. Income (70% DSR)";
    document.getElementById("out-lbl-mot").textContent = isZh ? "MOT 产权印花税" : "MOT Stamp Duty";
    document.getElementById("out-lbl-roi").textContent = isZh ? "毛租金回报率" : "Gross Rental Yield";
    document.getElementById("lbl-downpayment").textContent = isZh ? "首付资金 (Downpayment):" : "Downpayment:";
    document.getElementById("lbl-cashflow").textContent = isZh ? "预计每月净现金流:" : "Est. Monthly Net Cashflow:";
    document.getElementById("lbl-legal").textContent = isZh ? "律师费估算 (SPA + Loan):" : "Est. SPA + Loan Legal Fees:";
  }

  // --- Search Tabs & Lifestyle Filters ---
  window.setSearchTab = function (tab) {
    state.searchTab = tab;
    document.querySelectorAll(".search-tab-btn").forEach((btn) => {
      const active = btn.getAttribute("data-tab") === tab;
      btn.className = active
        ? "search-tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold search-tab-active transition-all"
        : "search-tab-btn shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:border-slate-300 transition-all";
    });
    renderMapPins();
    renderProjects();
  };

  function renderLifestylePills() {
    const container = document.getElementById("lifestyle-pills-container");
    container.innerHTML = DATA.lifestyleFilters
      .map((item) => {
        const active = state.topic === item.id;
        const label = pick(item, "labelEn", "labelZh");
        const cls = active
          ? "lifestyle-pill-active font-bold"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-400";
        return `<button onclick="selectLifestyleFilter('${item.id}')" class="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs border transition-all ${cls}">${escapeHtml(label)}</button>`;
      })
      .join("");
  }

  window.selectLifestyleFilter = function (topicId) {
    state.topic = topicId;
    renderLifestylePills();
    renderMapPins();
    renderProjects();
  };

  window.filterByGuideArea = function (area) {
    state.area = area;
    document.getElementById("filter-area").value = area;
    renderMapPins();
    renderProjects();
    document.getElementById("properties").scrollIntoView({ behavior: "smooth" });
  };

  window.resetFilters = function () {
    state.search = "";
    state.searchTab = "all";
    state.area = "all";
    state.maxBudget = 99999999;
    state.topic = "all";
    document.getElementById("search-input").value = "";
    document.getElementById("filter-area").value = "all";
    document.getElementById("filter-budget").value = "99999999";
    setSearchTab("all");
    renderLifestylePills();
    renderMapPins();
    renderProjects();
  };

  function getFilteredProjects() {
    const q = state.search.trim().toLowerCase();
    return DATA.projects.filter((p) => {
      if (state.searchTab === "Landed" && p.category !== "Landed") return false;
      if (state.searchTab === "Condo" && p.category !== "Condo") return false;
      if (state.searchTab === "investment" && p.rentalYield < 6.0) return false;
      if (state.area !== "all" && p.area !== state.area) return false;
      if (p.priceFrom > state.maxBudget) return false;
      if (state.topic !== "all" && !p.topics.includes(state.topic)) return false;
      if (q) {
        const hay = `${p.name} ${p.area} ${p.amenityDrive} ${p.summaryEn} ${p.summaryZh}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // --- Rule 2: Interactive Map Price Pins ---
  function renderMapPins() {
    const container = document.getElementById("ipoh-map-pins");
    const list = getFilteredProjects();
    if (!container) return;

    container.innerHTML = list
      .map((p) => {
        const isViewed = state.viewedIds.has(p.id);
        const isRentOrHomestay = p.homestayHot;
        const pinClass = isViewed
          ? "map-pin-viewed"
          : isRentOrHomestay
          ? "map-pin-rent"
          : "map-pin-sale";
        const newBadge =
          p.id === "botani-seri-meranti" || p.id === "manhattan-station-18"
            ? `<span class="ml-1 px-1.5 py-0.5 rounded bg-[#16A34A] text-white text-[9px] font-bold">NEW</span>`
            : "";

        return `
          <button onclick="openProjectModal('${p.id}')" class="px-3 py-1.5 rounded-full text-xs font-extrabold transition-all hover:scale-105 flex items-center gap-1 ${pinClass}">
            <span>${formatCompactRM(p.priceFrom)}</span>
            <span class="font-normal opacity-90">&middot; ${escapeHtml(p.area.split("/")[0].trim())}</span>
            ${newBadge}
            ${isViewed ? `<span class="text-[9px] ml-0.5 opacity-90">(Viewed)</span>` : ""}
          </button>`;
      })
      .join("");
  }

  // --- Property Cards Grid (Rule 1: Clean White Cards + Rule 2 Badges) ---
  function renderProjects() {
    const list = getFilteredProjects();
    document.getElementById("projects-count").textContent = list.length;
    const grid = document.getElementById("projects-grid");

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center">
          <p class="text-slate-600 font-semibold mb-3">${
            state.lang === "zh" ? "当前筛选条件下暂无匹配怡保房源" : "No Ipoh properties match your current filters."
          }</p>
          <button onclick="resetFilters()" class="px-4 py-2 rounded-xl btn-brand-primary font-bold text-xs">${
            state.lang === "zh" ? "查看全部怡保严选楼盘" : "Show All Ipoh Properties"
          }</button>
        </div>`;
      return;
    }

    grid.innerHTML = list
      .map((p, idx) => {
        const agent = findAgent(p.specialistId);
        const inCompare = state.compareIds.includes(p.id);
        const isViewed = state.viewedIds.has(p.id);
        const badge = pick(p, "badgeEn", "badgeZh");
        const summary = pick(p, "summaryEn", "summaryZh");
        const isPriceDrop = idx === 0 || idx === 5;

        return `
          <article class="prop-card rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <div onclick="openProjectModal('${p.id}')" class="relative h-48 sm:h-56 bg-slate-200 overflow-hidden cursor-pointer group">
                <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" class="card-photo w-full h-full object-cover" onerror="this.style.display='none'" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent"></div>

                <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <div class="flex items-center gap-1.5">
                    <span class="px-2.5 py-1 rounded-full ${isViewed ? "bg-slate-400 text-white" : "btn-brand-primary"} text-[11px] font-extrabold shadow-sm">
                      ${isViewed ? "Viewed" : `For Sale · ${p.verifiedUnits.length} Ex`}
                    </span>
                    ${isPriceDrop ? `<span class="px-2 py-1 rounded-full badge-price-drop text-[10px] font-bold">New Listing</span>` : ""}
                  </div>
                  <span class="px-2.5 py-1 rounded-full bg-white/95 text-slate-800 text-[11px] font-bold shadow-sm">
                    ${escapeHtml(p.category)}
                  </span>
                </div>

                <div class="absolute bottom-3 left-3.5 right-3.5 text-white">
                  <div class="flex items-center justify-between gap-2 mb-0.5">
                    <span class="px-2 py-0.5 rounded badge-brand-accent text-[10px] font-bold uppercase tracking-wider truncate">${escapeHtml(badge)}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-black/50 text-white backdrop-blur-sm shrink-0">${p.images.length} Photos</span>
                  </div>
                  <h3 class="text-base sm:text-lg font-extrabold leading-tight mt-1">${escapeHtml(p.name)}</h3>
                  <div class="text-xs text-slate-200 flex items-center gap-2 mt-0.5">
                    <span>${escapeHtml(p.area)}</span>
                    <span>&middot;</span>
                    <span>${escapeHtml(p.tenure)}</span>
                    <span>&middot;</span>
                    <span>${escapeHtml(p.bedsSummary)}</span>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-[#F8FAFC] text-center py-2.5">
                <div>
                  <div class="text-[10px] text-slate-500 uppercase font-semibold">${state.lang === "zh" ? "参考价起" : "From"}</div>
                  <div class="text-xs sm:text-sm font-extrabold text-slate-900">${formatRM(p.priceFrom)}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-500 uppercase font-semibold">${state.lang === "zh" ? "平均尺价" : "Avg PSF"}</div>
                  <div class="text-xs sm:text-sm font-extrabold text-slate-900">RM ${p.psfAvg}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-500 uppercase font-semibold">${state.lang === "zh" ? "预估回酬" : "Est. Yield"}</div>
                  <div class="text-xs sm:text-sm font-extrabold text-brand-primary">${p.rentalYield}%</div>
                </div>
              </div>

              <div class="p-4">
                <p class="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">${escapeHtml(summary)}</p>
                <div class="flex flex-wrap gap-1.5">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">📐 ${escapeHtml(p.sqftSummary)}</span>
                  ${p.gatedGuarded ? `<span class="px-2 py-0.5 rounded bg-brand-soft border text-[10px] font-semibold">🛡️ Gated</span>` : ""}
                  ${p.homestayHot ? `<span class="px-2 py-0.5 rounded bg-purple-50 text-[#7C3AED] border border-purple-200 text-[10px] font-semibold">🏨 Homestay / Rent</span>` : ""}
                </div>
              </div>
            </div>

            <div class="px-4 pb-4 pt-2 border-t border-slate-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-full btn-brand-primary text-[10px] font-bold flex items-center justify-center shrink-0">${agent.initials}</div>
                  <div class="text-[11px] truncate">
                    <div class="font-bold text-slate-900 truncate">${escapeHtml(agent.name)}</div>
                    <div class="text-slate-400">${escapeHtml(agent.renCode)}</div>
                  </div>
                </div>
                <span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">${escapeHtml(p.maintenanceLabel)}</span>
              </div>

              <div class="grid grid-cols-12 gap-2">
                <button onclick="openProjectModal('${p.id}')" class="col-span-8 py-2.5 px-3 rounded-xl btn-brand-primary font-bold text-xs flex items-center justify-center gap-1.5">
                  <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                  <span>${t("btnViewDetails")}</span>
                </button>
                <button onclick="toggleCompare('${p.id}')" class="col-span-4 py-2.5 px-2 rounded-xl border text-xs font-bold transition-colors ${
                  inCompare
                    ? "badge-accent-soft"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-400"
                }">
                  ${inCompare ? "✓ " + t("btnInCompare") : "+ " + t("btnCompare")}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");

    refreshIcons();
  }

  // --- Ipoh Neighbourhood Area Guides ---
  function renderAreaGuides() {
    const grid = document.getElementById("area-guides-grid");
    grid.innerHTML = DATA.areaGuides
      .map(
        (g) => `
      <div onclick="filterByGuideArea('${escapeHtml(g.area)}')" class="guide-card relative h-44 sm:h-52 rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200 bg-slate-900">
        <img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.area)}" class="guide-photo w-full h-full object-cover opacity-85" onerror="this.style.display='none'" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent"></div>
        <div class="absolute top-3 right-3 flex gap-1.5">
          <span class="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[11px] font-bold">${escapeHtml(g.avgPsf)}/psf</span>
          <span class="px-2.5 py-1 rounded-full btn-brand-primary text-[11px] font-extrabold">${escapeHtml(g.avgYield)} ROI</span>
        </div>
        <div class="absolute bottom-3.5 left-4 right-4 text-white">
          <h3 class="text-base sm:text-lg font-extrabold">${escapeHtml(pick(g, "titleEn", "titleZh"))}</h3>
          <p class="text-xs text-slate-200 mt-1 line-clamp-2">${escapeHtml(pick(g, "descEn", "descZh"))}</p>
        </div>
      </div>`
      )
      .join("");
  }

  // --- Ipoh Comparison Tool ---
  window.toggleCompare = function (projectId) {
    const idx = state.compareIds.indexOf(projectId);
    if (idx > -1) {
      if (state.compareIds.length <= 2) return;
      state.compareIds.splice(idx, 1);
    } else {
      if (state.compareIds.length >= 3) state.compareIds.shift();
      state.compareIds.push(projectId);
    }
    updateCompareCounters();
    renderProjects();
    renderCompareTable();
  };

  window.setComparePreset = function (ids) {
    state.compareIds = ids.slice();
    updateCompareCounters();
    renderProjects();
    renderCompareTable();
  };

  function updateCompareCounters() {
    document.getElementById("nav-compare-count").textContent = state.compareIds.length;
    document.getElementById("btn-compare-count").textContent = state.compareIds.length;
  }

  function renderCompareTable() {
    const selected = state.compareIds.map(findProject).filter(Boolean);
    const wrapper = document.getElementById("compare-table-wrapper");
    const minTableWidth = selected.length >= 3 ? "min-w-[600px]" : "min-w-full";

    const rows = [
      {
        label: state.lang === "zh" ? "区域 & 类型" : "Area & Type",
        render: (p) => `<span class="font-semibold text-slate-900">${escapeHtml(p.area)}</span><br class="sm:hidden" /><span class="hidden sm:inline"> · </span><span class="text-[11px] text-slate-500">${escapeHtml(p.category)} (${escapeHtml(p.tenure)})</span>`
      },
      {
        label: state.lang === "zh" ? "参考价起" : "Entry Price",
        render: (p) => `<span class="font-extrabold text-slate-900">${formatRM(p.priceFrom)}</span>`
      },
      {
        label: state.lang === "zh" ? "房型面积" : "Layout & Size",
        render: (p) => `${escapeHtml(p.bedsSummary)} · ${escapeHtml(p.sqftSummary)}`
      },
      {
        label: state.lang === "zh" ? "参考尺价" : "Avg PSF",
        render: (p) => `RM ${p.psfAvg} / sqft`
      },
      {
        label: state.lang === "zh" ? "租金回报" : "Est. Yield",
        render: (p) => `<span class="px-2 py-0.5 rounded bg-brand-soft border font-bold text-[11px] sm:text-xs">${p.rentalYield}%</span>`
      },
      {
        label: state.lang === "zh" ? "周边车程" : "Amenities",
        render: (p) => escapeHtml(p.amenityDrive)
      },
      {
        label: state.lang === "zh" ? "管理/保安费" : "Maint. / Guard",
        render: (p) => escapeHtml(p.maintenanceLabel)
      }
    ];

    wrapper.innerHTML = `
      <table class="w-full text-left border-collapse ${minTableWidth}">
        <thead>
          <tr class="bg-[#F8FAFC] border-b border-slate-200 text-slate-900">
            <th class="p-2.5 sm:p-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider w-24 sm:w-44 text-slate-500">${state.lang === "zh" ? "对比项" : "Metric"}</th>
            ${selected
              .map(
                (p) => `
              <th class="p-2.5 sm:p-4 align-top">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <div class="text-xs sm:text-sm font-extrabold leading-snug text-slate-900">${escapeHtml(p.name)}</div>
                    <div class="text-[10px] sm:text-[11px] text-brand-primary font-semibold">${p.verifiedUnits.length} ${state.lang === "zh" ? "套 Example" : "Examples"}</div>
                  </div>
                  <button onclick="openProjectModal('${p.id}')" class="self-start sm:self-auto px-2.5 py-1 rounded-lg btn-brand-primary text-[10px] sm:text-[11px] font-bold">
                    ${state.lang === "zh" ? "查看" : "View"}
                  </button>
                </div>
              </th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          ${rows
            .map(
              (r) => `
            <tr class="hover:bg-slate-50/80">
              <td class="p-2.5 sm:p-4 font-bold text-[11px] sm:text-xs text-slate-600 bg-[#F8FAFC]">${r.label}</td>
              ${selected.map((p) => `<td class="p-2.5 sm:p-4 text-[11px] sm:text-sm align-top">${r.render(p)}</td>`).join("")}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  // --- Ipoh DSR, Mortgage & MOT Stamp Duty Calculator ---
  window.applyDsrExample = function (price, rent) {
    document.getElementById("slider-price").value = price;
    document.getElementById("slider-rent").value = rent;
    document.getElementById("slider-margin").value = 90;
    document.getElementById("slider-rate").value = 4.0;
    document.getElementById("slider-tenure").value = 35;
    updateCalculators();
  };

  function calculateMalaysiaMOT(price, isForeigner) {
    if (isForeigner) return price * 0.08;
    let duty = 0;
    let remaining = price;
    const tiers = [
      { cap: 100000, rate: 0.01 },
      { cap: 400000, rate: 0.02 },
      { cap: 500000, rate: 0.03 },
      { cap: Infinity, rate: 0.04 }
    ];
    for (const tier of tiers) {
      if (remaining <= 0) break;
      const chunk = Math.min(remaining, tier.cap);
      duty += chunk * tier.rate;
      remaining -= chunk;
    }
    return duty;
  }

  function updateCalculators() {
    const price = Number(document.getElementById("slider-price").value);
    const margin = Number(document.getElementById("slider-margin").value) / 100;
    const rate = Number(document.getElementById("slider-rate").value) / 100;
    const years = Number(document.getElementById("slider-tenure").value);
    const rent = Number(document.getElementById("slider-rent").value);
    const isForeigner = document.getElementById("calc-foreigner").checked;

    const loanAmount = price * margin;
    const monthlyRate = rate / 12;
    const months = years * 12;
    const monthlyInstallment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const minIncome = monthlyInstallment / 0.7;
    const mot = calculateMalaysiaMOT(price, isForeigner);
    const grossYield = ((rent * 12) / price) * 100;
    const cashflow = rent - monthlyInstallment;
    const downpayment = price * (1 - margin);
    const legalEstimate = price * 0.012 + 2800;

    document.getElementById("calc-val-price").textContent = formatRM(price);
    document.getElementById("calc-val-loan").textContent = `${Math.round(margin * 100)}%`;
    document.getElementById("calc-val-rate").textContent = `${(rate * 100).toFixed(2)}%`;
    document.getElementById("calc-val-tenure").textContent = `${years} ${state.lang === "zh" ? "年" : "Years"}`;
    document.getElementById("calc-val-rent").textContent = formatRM(rent);

    document.getElementById("out-monthly").textContent = formatRM(monthlyInstallment);
    document.getElementById("out-income").textContent = formatRM(minIncome);
    document.getElementById("out-mot").textContent = formatRM(mot);
    document.getElementById("out-roi").textContent = `${grossYield.toFixed(2)}%`;
    document.getElementById("out-downpayment").textContent = formatRM(downpayment);
    document.getElementById("out-legal").textContent = formatRM(legalEstimate);

    const cfEl = document.getElementById("out-cashflow");
    cfEl.textContent = `${cashflow >= 0 ? "+" : "-"}${formatRM(Math.abs(cashflow))} / mo`;
    cfEl.className = cashflow >= 0 ? "text-emerald-700" : "text-amber-700";
  }

  // --- Ipoh Specialists Roster (Rule 3: Distinct WhatsApp #25D366 Button) ---
  function renderAgents() {
    const grid = document.getElementById("agents-grid");
    grid.innerHTML = DATA.agents
      .map((a) => {
        const isSelected = state.activeAgentId === a.id;
        return `
          <div class="bg-white rounded-2xl border ${isSelected ? "border-brand-primary ring-2 ring-blue-500/15" : "border-slate-200"} p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center gap-3.5 mb-3">
                <div class="w-12 h-12 rounded-2xl btn-brand-primary font-extrabold flex items-center justify-center shadow-sm shrink-0">${a.initials}</div>
                <div>
                  <h3 class="font-extrabold text-slate-900 flex flex-wrap items-center gap-1.5">
                    <span>${escapeHtml(a.name)}</span>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(a.renCode)}</span>
                  </h3>
                  <p class="text-xs text-brand-primary font-semibold">${escapeHtml(pick(a, "roleEn", "roleZh"))}</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">${escapeHtml(pick(a, "bioEn", "bioZh"))}</p>
              <div class="grid grid-cols-3 gap-2 text-center bg-[#F8FAFC] rounded-xl p-2.5 mb-4 text-xs border border-slate-100">
                <div><div class="font-extrabold text-slate-900">${a.dealsClosed}</div><div class="text-[10px] text-slate-500">${state.lang === "zh" ? "累计成交" : "Deals"}</div></div>
                <div><div class="font-extrabold text-brand-primary">${a.avgReplyMin} min</div><div class="text-[10px] text-slate-500">${state.lang === "zh" ? "响应速度" : "Avg Reply"}</div></div>
                <div><div class="font-extrabold text-slate-900">${a.verifiedUnitsCount}</div><div class="text-[10px] text-slate-500">${state.lang === "zh" ? "负责房源" : "Listings"}</div></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="selectAgentPortfolio('${a.id}')" class="py-2.5 px-3 rounded-xl bg-[#F8FAFC] border border-slate-200 hover:border-slate-400 text-slate-800 text-xs font-bold transition-colors">
                ${state.lang === "zh" ? "查看负责楼盘" : "View Listings"}
              </button>
              <button onclick="openLeadModal('Ipoh Consultation with ${escapeHtml(a.name)} (${escapeHtml(a.renCode)})')" class="py-2.5 px-3 rounded-xl btn-whatsapp text-xs flex items-center justify-center gap-1">
                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        `;
      })
      .join("");
  }

  window.selectAgentPortfolio = function (agentId) {
    state.activeAgentId = agentId;
    renderAgents();
    renderAgentPortfolio(agentId);
  };

  function renderAgentPortfolio(agentId) {
    const agent = findAgent(agentId);
    const box = document.getElementById("agent-listings-preview");
    const ownedProjects = DATA.projects.filter((p) => p.specialistId === agent.id);
    box.classList.remove("hidden");

    box.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-200">
        <div>
          <div class="text-xs text-brand-primary font-bold">${escapeHtml(agent.areas.join(" · "))} · ${escapeHtml(agent.languages.join(" / "))}</div>
          <h4 class="text-base sm:text-lg font-extrabold text-slate-900">${escapeHtml(agent.name)} — ${state.lang === "zh" ? "怡保主理二手社区" : "Active Ipoh Developments"}</h4>
        </div>
        <button onclick="openLeadModal('Direct Inquiry to ${escapeHtml(agent.name)}')" class="px-4 py-2 rounded-xl btn-whatsapp text-xs">
          ${state.lang === "zh" ? "联系顾问看房" : "WhatsApp Specialist"}
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${ownedProjects
          .map(
            (p) => `
          <div class="bg-[#F8FAFC] rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-extrabold text-slate-900">${escapeHtml(p.name)}</div>
              <div class="text-xs text-slate-500">${escapeHtml(p.area)} &middot; ${p.verifiedUnits.length} ${state.lang === "zh" ? "套 Example 房源" : "Example Units"} &middot; ${formatRM(p.priceFrom)}+</div>
            </div>
            <button onclick="openProjectModal('${p.id}')" class="px-3 py-1.5 rounded-lg btn-brand-primary text-xs font-bold shrink-0">
              ${state.lang === "zh" ? "查看" : "View"}
            </button>
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  // --- Architectural SVG Floor Plan Schematic ---
  function renderFloorPlanSvg(fp, isLanded) {
    return `
      <svg viewBox="0 0 320 170" class="w-full h-36 bg-white rounded-xl border border-slate-200 mb-3" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="300" height="150" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
        <rect x="10" y="10" width="120" height="85" fill="#eff6ff" stroke="#334155" stroke-width="1.2" />
        <text x="70" y="55" font-size="10" font-weight="bold" text-anchor="middle" fill="#1e3a8a">${isLanded ? "Car Porch / Living" : "Living & Dining"}</text>
        <rect x="130" y="10" width="90" height="85" fill="#ffffff" stroke="#334155" stroke-width="1.2" />
        <text x="175" y="55" font-size="10" font-weight="bold" text-anchor="middle" fill="#0f172a">Master Bedroom</text>
        <rect x="220" y="10" width="90" height="55" fill="#ffffff" stroke="#334155" stroke-width="1.2" />
        <text x="265" y="40" font-size="9" text-anchor="middle" fill="#334155">${fp.beds} Beds Layout</text>
        <rect x="220" y="65" width="90" height="30" fill="#f1f5f9" stroke="#334155" stroke-width="1.2" />
        <text x="265" y="83" font-size="9" text-anchor="middle" fill="#475569">${fp.baths} Bath(s)</text>
        <rect x="10" y="95" width="180" height="65" fill="#fff7ed" stroke="#334155" stroke-width="1.2" />
        <text x="100" y="130" font-size="10" font-weight="bold" text-anchor="middle" fill="#9a3412">${isLanded ? "Extended Wet Kitchen" : "Kitchen & Yard"}</text>
        <rect x="190" y="95" width="120" height="65" fill="#f0fdf4" stroke="#334155" stroke-width="1.2" />
        <text x="250" y="130" font-size="10" text-anchor="middle" fill="#166534">${isLanded ? "Garden / Backyard" : "Balcony"} (${fp.sqft} sqft)</text>
      </svg>
    `;
  }

  // --- Property Detail Modal ---
  window.openProjectModal = function (projectId) {
    state.viewedIds.add(projectId);
    state.activeProjectId = projectId;
    state.activeModalTab = "overview";
    state.activePhotoIdx = 0;
    renderMapPins();
    renderProjects();
    document.getElementById("project-modal").classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    renderProjectModalContent();
    refreshIcons();
  };

  window.closeProjectModal = function () {
    document.getElementById("project-modal").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    state.activeProjectId = null;
  };

  window.switchModalTab = function (tab) {
    state.activeModalTab = tab;
    renderProjectModalContent();
    refreshIcons();
  };

  window.selectModalPhoto = function (idx) {
    state.activePhotoIdx = idx;
    const p = findProject(state.activeProjectId);
    if (!p) return;
    const mainImg = document.getElementById("main-gallery-photo");
    if (mainImg) mainImg.src = p.images[idx];
    document.querySelectorAll(".gallery-thumb").forEach((el, i) => {
      el.classList.toggle("ring-2", i === idx);
      el.classList.toggle("ring-white", i === idx);
      el.classList.toggle("opacity-60", i !== idx);
    });
  };

  function renderProjectModalContent() {
    const p = findProject(state.activeProjectId);
    if (!p) return;
    const agent = findAgent(p.specialistId);
    const pros = pick(p, "prosEn", "prosZh");
    const cons = pick(p, "consEn", "consZh");
    const isLanded = p.category === "Landed";

    const tabs = [
      { id: "overview", label: state.lang === "zh" ? "社区介绍与优缺点" : "Overview & Highlights" },
      { id: "units", label: `${state.lang === "zh" ? "Example 在售单位" : "Example Units"} (${p.verifiedUnits.length})` },
      { id: "floorplans", label: state.lang === "zh" ? "户型与估价" : "Layouts & Value" },
      { id: "faq", label: `${state.lang === "zh" ? "买家常见问答" : "Buyer Q&A"} (${p.faqs.length})` }
    ];

    let bodyHtml = "";
    if (state.activeModalTab === "overview") {
      bodyHtml = `
        <p class="text-xs sm:text-sm text-slate-700 leading-relaxed mb-4 sm:mb-5">${escapeHtml(pick(p, "summaryEn", "summaryZh"))}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-4 sm:mb-5">
          <div class="rounded-2xl bg-brand-soft border p-4">
            <h4 class="font-extrabold text-slate-900 text-xs sm:text-sm mb-2">✓ ${
              state.lang === "zh" ? "怡保买家喜欢的原因" : "Why Ipoh Buyers Love This Area"
            }</h4>
            <ul class="space-y-1.5 text-xs text-slate-700">${pros.map((item) => `<li>• ${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="rounded-2xl badge-accent-soft border p-4">
            <h4 class="font-extrabold text-slate-900 text-xs sm:text-sm mb-2">⚠ ${
              state.lang === "zh" ? "买二手房前要注意" : "Good to Check Before Buying"
            }</h4>
            <ul class="space-y-1.5 text-xs text-slate-700">${cons.map((item) => `<li>• ${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="rounded-2xl bg-[#F8FAFC] border border-slate-200 p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div><span class="text-slate-400 block">${state.lang === "zh" ? "周边车程" : "Key Amenities"}</span><strong class="text-slate-900">${escapeHtml(p.amenityDrive)}</strong></div>
          <div><span class="text-slate-400 block">${state.lang === "zh" ? "保安 / 管理费" : "Maint. / Guard"}</span><strong class="text-slate-900">${escapeHtml(p.maintenanceLabel)}</strong></div>
          <div><span class="text-slate-400 block">${state.lang === "zh" ? "产权状态" : "Tenure"}</span><strong class="text-slate-900">${escapeHtml(p.tenure)}</strong></div>
          <div><span class="text-slate-400 block">${state.lang === "zh" ? "参考租金回报" : "Est. Yield"}</span><strong class="text-brand-primary">${p.rentalYield}%</strong></div>
        </div>
      `;
    } else if (state.activeModalTab === "units") {
      bodyHtml = `
        <div class="mb-3 text-xs text-slate-700 bg-brand-soft border rounded-xl p-3">
          <strong>${state.lang === "zh" ? "Example 示范实盘：" : "Sample Subsale Units:"}</strong> ${
            state.lang === "zh"
              ? `以下数据参照 PropertyGuru 怡保当前真实挂牌水平整理，实际项目上线后由顾问 ${escapeHtml(agent.name)} 实时更新。`
              : `Benchmarked against live PropertyGuru Ipoh subsale prices and managed directly by ${escapeHtml(agent.name)}.`
          }
        </div>
        <div class="space-y-3">
          ${p.verifiedUnits
            .map(
              (u) => `
            <div class="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded btn-brand-primary">${escapeHtml(u.code)}</span>
                  <span class="text-xs font-bold badge-accent-soft border px-2 py-0.5 rounded">${escapeHtml(pick(u, "tagEn", "tagZh"))}</span>
                </div>
                <div class="font-extrabold text-slate-900 text-sm">${escapeHtml(u.layout)} &middot; ${escapeHtml(u.level)}</div>
                <div class="text-xs text-slate-500">${escapeHtml(u.furnishing)} &middot; ~RM ${u.psf} psf</div>
              </div>
              <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div class="text-base sm:text-lg font-extrabold text-slate-900">${formatRM(u.price)}</div>
                <button onclick="openLeadModal('${escapeHtml(p.name)} — ${escapeHtml(u.code)} Viewing')" class="px-3.5 py-2 rounded-lg btn-whatsapp text-xs">
                  ${state.lang === "zh" ? "WhatsApp 看房" : "WhatsApp Viewing"}
                </button>
              </div>
            </div>`
            )
            .join("")}
        </div>
      `;
    } else if (state.activeModalTab === "floorplans") {
      bodyHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${p.floorPlans
            .map(
              (fp) => `
            <div class="rounded-2xl border border-slate-200 p-4 bg-[#F8FAFC]">
              ${renderFloorPlanSvg(fp, isLanded)}
              <div class="font-extrabold text-slate-900 text-sm mb-1">${escapeHtml(fp.type)}</div>
              <div class="text-xs text-slate-500 mb-3">${fp.sqft} sqft &middot; ${fp.beds} Bed &middot; ${fp.baths} Bath &middot; Est. Rent: <strong class="text-brand-primary">${escapeHtml(fp.estRent)}</strong></div>
              <div class="flex items-center justify-between pt-2 border-t border-slate-200">
                <span class="font-extrabold text-slate-900">${escapeHtml(fp.price)}</span>
                <button onclick="openLeadModal('${escapeHtml(p.name)} — ${escapeHtml(fp.type)} Floor Plan & Bank Value')" class="text-xs font-bold text-brand-primary hover:underline">
                  ${state.lang === "zh" ? "索取视频与估价 →" : "Get Video & Bank Value →"}
                </button>
              </div>
            </div>`
            )
            .join("")}
        </div>
      `;
    } else {
      bodyHtml = `
        <div class="space-y-3">
          ${p.faqs
            .map(
              (f) => `
            <div class="rounded-2xl border border-slate-200 p-4 bg-white">
              <div class="font-bold text-slate-900 text-sm mb-1.5">Q: ${escapeHtml(pick(f, "qEn", "qZh"))}</div>
              <p class="text-xs text-slate-600 leading-relaxed">A: ${escapeHtml(pick(f, "aEn", "aZh"))}</p>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    document.getElementById("project-modal-content").innerHTML = `
      <div class="relative h-52 sm:h-64 shrink-0 bg-slate-900 text-white overflow-hidden">
        <img id="main-gallery-photo" src="${escapeHtml(p.images[state.activePhotoIdx])}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/25"></div>

        <button onclick="closeProjectModal()" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="absolute bottom-3.5 left-4 right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
          <div>
            <div class="text-[11px] font-bold text-slate-200 mb-0.5">${escapeHtml(p.area)} &middot; Subsale ${escapeHtml(p.category)} &middot; ${escapeHtml(p.tenure)}</div>
            <h3 class="text-lg sm:text-2xl font-extrabold leading-tight">${escapeHtml(p.name)}</h3>
            <div class="text-xs text-slate-200 mt-0.5">From ${formatRM(p.priceFrom)} &middot; Avg RM ${p.psfAvg} psf &middot; Est. ${p.rentalYield}% Yield</div>
          </div>
          <div class="flex gap-1.5">
            ${p.images
              .map(
                (img, idx) => `
              <button onclick="selectModalPhoto(${idx})" class="gallery-thumb w-11 h-8 rounded-lg overflow-hidden border border-white/40 transition-all ${
                  idx === state.activePhotoIdx ? "ring-2 ring-white" : "opacity-65 hover:opacity-100"
                }">
                <img src="${escapeHtml(img)}" alt="" class="w-full h-full object-cover" />
              </button>`
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="border-b border-slate-200 px-4 sm:px-6 flex gap-4 overflow-x-auto no-scrollbar bg-[#F8FAFC] shrink-0">
        ${tabs
          .map(
            (tb) => `
          <button onclick="switchModalTab('${tb.id}')" class="py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              state.activeModalTab === tb.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }">${tb.label}</button>`
          )
          .join("")}
      </div>

      <div class="p-4 sm:p-6 overflow-y-auto thin-scroll flex-1 bg-white">${bodyHtml}</div>

      <div class="p-3.5 sm:px-6 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-2 min-w-0 text-xs">
          <div class="w-8 h-8 rounded-full btn-brand-primary font-bold flex items-center justify-center shrink-0">${agent.initials}</div>
          <div class="truncate">
            <div class="font-bold text-slate-900 truncate">${escapeHtml(agent.name)}</div>
            <div class="text-slate-500 text-[11px]">${escapeHtml(agent.renCode)} · ${agent.avgReplyMin}m reply</div>
          </div>
        </div>
        <button onclick="openLeadModal('${escapeHtml(p.name)} — Viewing &amp; Bank Valuation')" class="px-4 py-2.5 rounded-xl btn-whatsapp text-xs shadow-sm shrink-0">
          ${t("modalDownloadCta")}
        </button>
      </div>
    `;
  }

  // --- Concierge / Buyer Inquiry Modal ---
  window.openLeadModal = function (contextText) {
    document.getElementById("lead-context").value = contextText;
    document.getElementById("lead-success-box").classList.add("hidden");
    document.getElementById("lead-form").classList.remove("hidden");
    document.getElementById("lead-modal").classList.remove("hidden");
  };

  window.closeLeadModal = function () {
    document.getElementById("lead-modal").classList.add("hidden");
  };

  window.submitLeadForm = function (e) {
    e.preventDefault();
    const name = document.getElementById("lead-name").value.trim();
    const phone = document.getElementById("lead-phone").value.trim();
    const ctx = document.getElementById("lead-context").value;

    const assignedAgent = DATA.agents[state.roundRobinIndex % DATA.agents.length];
    state.roundRobinIndex += 1;

    document.getElementById("lead-form").classList.add("hidden");
    const box = document.getElementById("lead-success-box");
    box.classList.remove("hidden");
    box.innerHTML =
      state.lang === "zh"
        ? `
      <div class="font-extrabold text-sm text-emerald-800">✓ 怡保看房与估价请求已提交！</div>
      <p>感谢 <strong>${escapeHtml(name)}</strong>！关于 <em>"${escapeHtml(ctx)}"</em> 的实拍资料与银行估价参考正发送至您的 WhatsApp（${escapeHtml(phone)}）。</p>
      <div class="p-3 rounded-xl bg-white border border-emerald-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full btn-brand-primary font-bold flex items-center justify-center shrink-0">${assignedAgent.initials}</div>
        <div>
          <div class="font-bold text-slate-900">怡保对接顾问：${escapeHtml(assignedAgent.name)} (${escapeHtml(assignedAgent.renCode)})</div>
          <div class="text-slate-500">预计 ${assignedAgent.avgReplyMin} 分钟内与您 WhatsApp 联系</div>
        </div>
      </div>
      <button onclick="closeLeadModal()" class="w-full py-2.5 rounded-lg btn-brand-primary font-bold">好的 / 完成</button>`
        : `
      <div class="font-extrabold text-sm text-emerald-800">✓ Request Confirmed!</div>
      <p>Thank you, <strong>${escapeHtml(name)}</strong>! Unit photos &amp; bank valuation details for <em>"${escapeHtml(ctx)}"</em> are being sent to WhatsApp (${escapeHtml(phone)}).</p>
      <div class="p-3 rounded-xl bg-white border border-emerald-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full btn-brand-primary font-bold flex items-center justify-center shrink-0">${assignedAgent.initials}</div>
        <div>
          <div class="font-bold text-slate-900">Ipoh Specialist: ${escapeHtml(assignedAgent.name)} (${escapeHtml(assignedAgent.renCode)})</div>
          <div class="text-slate-500">Typically replies within ${assignedAgent.avgReplyMin} mins</div>
        </div>
      </div>
      <button onclick="closeLeadModal()" class="w-full py-2.5 rounded-lg btn-brand-primary font-bold">Done</button>`;
  };

  // --- Bind Events & Init ---
  function bindEvents() {
    document.getElementById("search-input").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderMapPins();
      renderProjects();
    });
    document.getElementById("filter-area").addEventListener("change", (e) => {
      state.area = e.target.value;
      renderMapPins();
      renderProjects();
    });
    document.getElementById("filter-budget").addEventListener("change", (e) => {
      state.maxBudget = Number(e.target.value);
      renderMapPins();
      renderProjects();
    });

    ["slider-price", "slider-margin", "slider-rate", "slider-tenure", "slider-rent", "calc-foreigner"].forEach(
      (id) => {
        document.getElementById(id).addEventListener("input", updateCalculators);
      }
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeProjectModal();
        closeLeadModal();
      }
    });
  }

  function init() {
    bindEvents();
    setTheme(state.theme);
    updateCalculators();
    updateCompareCounters();
    setLanguage("en");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
