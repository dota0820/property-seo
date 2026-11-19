// PrimeVerse Ipoh Realty - MapLibre GL Vector Map + PropertyGuru Sticky Search + Pre-filled WhatsApp Pro Logic

(function () {
  const DATA = window.APP_DATA;

  let mapInstance = null;
  let activeMapMarkers = [];
  let mapStyle = "bright";

  const MAP_STYLES = {
    bright: "https://tiles.openfreemap.org/styles/bright",
    positron: "https://tiles.openfreemap.org/styles/positron",
    satellite: {
      version: 8,
      sources: {
        esri: {
          type: "raster",
          tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
          tileSize: 256,
          attribution: "Imagery &copy; Esri"
        }
      },
      layers: [{ id: "esri-satellite", type: "raster", source: "esri", minzoom: 0, maxzoom: 18 }]
    }
  };

  function toLngLat(coords) {
    return [coords[1], coords[0]];
  }

  const AREA_BADGES = {
    "Bandar Seri Botani": { en: "High Growth", zh: "热门成长区", cls: "bg-brand-soft border" },
    "Tiger Lane": { en: "Ultra Luxury", zh: "名门富人区", cls: "badge-accent-soft border" },
    "Tambun / Sunway": { en: "Resort & Homestay", zh: "度假民宿区", cls: "bg-purple-50 text-[#7C3AED] border border-purple-200" },
    "Canning / Ipoh Garden": { en: "Heritage & Food", zh: "成熟美食圈", cls: "bg-emerald-50 text-success border border-emerald-200" },
    "Meru Valley": { en: "Golf & School", zh: "高尔夫与学区", cls: "bg-sky-50 text-sky-700 border border-sky-200" },
    "Station 18": { en: "Best Entry Value", zh: "首购高性价比", cls: "bg-amber-50 text-amber-800 border border-amber-200" }
  };

  function readStoredTheme() {
    try {
      return localStorage.getItem("pv_theme") || "a";
    } catch (e) {
      return "a";
    }
  }

  const NEW_PROJECT_IDS = ["botani-seri-meranti", "manhattan-station-18"];

  const state = {
    lang: "en",
    theme: readStoredTheme(),
    search: "",
    searchTab: "all", // 'all' | 'Landed' | 'Condo' | 'investment'
    mapLegend: "all", // 'all' | 'sale' | 'homestay'
    area: "all",
    maxBudget: 99999999,
    topic: "all",
    compareIds: ["upper-east-tiger-lane", "the-haven-tambun"],
    viewedIds: new Set(),
    favoriteIds: new Set(),
    activeAgentId: null,
    activeProjectId: null,
    activeModalTab: "overview",
    activePhotoIdx: 0,
    roundRobinIndex: 0,
    calcTouched: false,
    calcSnapshot: null
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

  function icon(name, cls) {
    return window.pvIcon ? window.pvIcon(name, cls) : "";
  }

  // --- Live 3-Theme Switcher (Schemes A, B, C) ---
  window.setTheme = function (themeId) {
    if (["a", "b", "c"].indexOf(themeId) === -1) themeId = "a";
    state.theme = themeId;
    document.body.setAttribute("data-theme", themeId);
    try {
      localStorage.setItem("pv_theme", themeId);
    } catch (e) {
      /* private mode: theme still applies for this visit */
    }

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
      zhBtn.className = "px-2.5 py-1 text-[11px] font-bold rounded-full transition-all btn-brand-primary";
      enBtn.className = "px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all text-muted hover:text-ink";
    } else {
      enBtn.className = "px-2.5 py-1 text-[11px] font-bold rounded-full transition-all btn-brand-primary";
      zhBtn.className = "px-2.5 py-1 text-[11px] font-semibold rounded-full transition-all text-muted hover:text-ink";
    }

    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    zhBtn.setAttribute("aria-pressed", String(lang === "zh"));
    enBtn.setAttribute("aria-pressed", String(lang !== "zh"));
    const navMapLbl = document.getElementById("nav-map-lbl");
    if (navMapLbl) navMapLbl.textContent = lang === "zh" ? "房价地图" : "Price Map";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key === "tagline") {
        el.textContent = state.lang === "zh" ? DATA.brand.taglineZh : DATA.brand.taglineEn;
      } else {
        el.textContent = t(key);
      }
    });

    const isZh = lang === "zh";
    document.getElementById("search-input").placeholder = t("searchPlaceholder");
    const stickySearch = document.getElementById("sticky-search-input");
    if (stickySearch) {
      stickySearch.placeholder = isZh
        ? "搜 Botani, Upper East, Haven..."
        : "Search Botani, Upper East, Haven...";
    }
    const stickyHomesLbl = document.getElementById("sticky-homes-lbl");
    if (stickyHomesLbl) {
      stickyHomesLbl.textContent = isZh ? "个楼盘" : "Homes";
    }
    document.getElementById("footer-address").textContent = isZh ? DATA.brand.addressZh : DATA.brand.addressEn;
    document.getElementById("calc-cta-text").textContent = isZh ? "发预算给顾问免费查贷款" : "Send Estimate to WhatsApp";
    document.getElementById("map-eyebrow").textContent = isZh ? "怡保地图找房" : "Live Ipoh Street Map";
    document.getElementById("map-section-title").textContent = isZh ? "按社区看怡保真实房价" : "Explore Ipoh Prices by Neighbourhood";
    document.getElementById("map-strip-title").textContent = isZh
      ? "放大查看学校、医院与大道距离，点击价格气泡即可预览并直连 WhatsApp。"
      : "Zoom into schools, parks & highways. Tap any price pin to preview or WhatsApp.";
    document.getElementById("matchmaking-title").textContent = isZh
      ? "没找到心仪的街道或户型？"
      : "Looking for a specific street or budget in Ipoh?";
    document.getElementById("matchmaking-sub").textContent = isZh
      ? "告诉我们预算与区域，顾问直接帮您匹配未公开屋主实盘。"
      : "Tell us what you need — we source off-market Ipoh subsales directly from owners.";
    document.getElementById("matchmaking-cta").textContent = isZh ? "免费帮我找房" : "Match Me a Home";

    updateCalculatorLabels();
    updateCalculators();
    renderLifestylePills();
    renderMapPins(false);
    renderProjects();
    renderAreaGuides();
    renderCompareTable();
    renderAgents();
    if (state.activeAgentId) renderAgentPortfolio(state.activeAgentId);
    if (state.activeProjectId) renderProjectModalContent();
  };

  function updateCalculatorLabels() {
    const isZh = state.lang === "zh";
    document.getElementById("calc-lbl-price").textContent = isZh ? "目标房价 (Target Home Price)" : "Target Home Price";
    document.getElementById("calc-lbl-loan").textContent = isZh ? "贷款成数 (Margin)" : "Loan Margin";
    document.getElementById("calc-lbl-rate").textContent = isZh ? "银行利率 (Rate)" : "Interest Rate";
    document.getElementById("calc-lbl-tenure").textContent = isZh ? "贷款年限 (Tenure)" : "Loan Tenure";
    document.getElementById("calc-lbl-rent").textContent = isZh ? "预期月租 (Est. Rent)" : "Est. Monthly Rent";
    document.getElementById("calc-lbl-buyer").textContent = isZh ? "买家身份" : "Buyer Type";
    const buyerSel = document.getElementById("calc-buyer");
    const buyerLabels = isZh
      ? ["大马公民（换房 / 第二套）", "大马公民（首购）", "外国买家（MOT 统一 8%）"]
      : ["Malaysian (upgrading / 2nd home)", "Malaysian, first home", "Foreign buyer (8% flat MOT)"];
    Array.prototype.forEach.call(buyerSel.options, (opt, i) => {
      opt.textContent = buyerLabels[i];
    });
    document.getElementById("calc-first-note-text").textContent = isZh
      ? "大马首购族购买 RM 500k 以内二手房，可享 100% MOT 印花税减免。"
      : "First-time Malaysian buyers may enjoy 100% MOT exemption for homes up to RM 500k.";
    document.getElementById("calc-summary-heading").textContent = isZh ? "预计每月供款" : "Estimated Monthly Repayment";
    document.getElementById("out-lbl-principal").textContent = isZh ? "贷款本金" : "Loan Principal";
    document.getElementById("out-lbl-income").textContent = isZh ? "最低月入（70% DSR）" : "Min. Income (70% DSR)";
    document.getElementById("out-lbl-mot").textContent = isZh ? "MOT 产权印花税" : "MOT Stamp Duty";
    document.getElementById("out-lbl-legal").textContent = isZh ? "律师费 + 贷款印花税" : "Legal + Loan Duty";
    document.getElementById("out-legal-note").textContent = isZh ? "按律师收费令（SPA + 贷款）" : "SRO scale (SPA + loan)";
    document.getElementById("out-lbl-roi").textContent = isZh ? "毛租金回报" : "Gross Rental Yield";
    document.getElementById("lbl-downpayment").textContent = isZh ? "首付" : "Downpayment";
    document.getElementById("lbl-cashflow").textContent = isZh ? "每月净现金流" : "Net Cashflow / Month";
    document.getElementById("calc-disclaimer").textContent = isZh
      ? "仅供估算。大马公民 MOT 按 1/2/3/4% 分级计算，外国买家统一 8%；首购豁免假设为合资格公民且房价 ≤ RM 50 万。律师费按律师收费令（SRO）计算。请以律师与银行为准。"
      : "Estimates only. MOT uses the 1/2/3/4% tiers for Malaysians and a flat 8% for foreign buyers; the first-home exemption assumes an eligible citizen buying at RM 500k or below. Legal fees follow the Solicitors' Remuneration Order scale. Confirm with your lawyer and bank.";
  }

  function syncStickyFilterInputs() {
    const heroSearch = document.getElementById("search-input");
    const stickySearch = document.getElementById("sticky-search-input");
    const heroArea = document.getElementById("filter-area");
    const stickyArea = document.getElementById("sticky-filter-area");
    const heroBudget = document.getElementById("filter-budget");
    const stickyBudget = document.getElementById("sticky-filter-budget");
    const stickyTab = document.getElementById("sticky-filter-tab");

    if (heroSearch && document.activeElement !== heroSearch) heroSearch.value = state.search;
    if (stickySearch && document.activeElement !== stickySearch) stickySearch.value = state.search;
    if (heroArea) heroArea.value = state.area;
    if (stickyArea) stickyArea.value = state.area;
    if (heroBudget) heroBudget.value = String(state.maxBudget);
    if (stickyBudget) stickyBudget.value = String(state.maxBudget);
    if (stickyTab) stickyTab.value = state.searchTab;
  }

  // --- Search Tabs & Lifestyle Filters ---
  window.setSearchTab = function (tab) {
    state.searchTab = tab;
    document.querySelectorAll(".search-tab-btn").forEach((btn) => {
      const active = btn.getAttribute("data-tab") === tab;
      btn.className = active
        ? "search-tab-btn shrink-0 px-4 py-2 rounded-lg search-tab-active font-semibold text-[13px] shadow-sm transition-all"
        : "search-tab-btn shrink-0 px-4 py-2 rounded-lg bg-surface-high text-muted hover:text-ink font-semibold text-[13px] transition-colors";
    });
    syncStickyFilterInputs();
    renderMapPins(true);
    renderProjects();
  };

  window.setMapLegendFilter = function (legend) {
    state.mapLegend = legend;
    ["all", "sale", "homestay"].forEach((key) => {
      const btn = document.getElementById("legend-btn-" + key);
      if (!btn) return;
      const active = key === legend;
      btn.className = active
        ? "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-brand-soft border text-xs font-bold"
        : "flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-surface-high text-muted text-xs font-semibold";
    });
    renderMapPins(true);
  };

  function renderLifestylePills() {
    const container = document.getElementById("lifestyle-pills-container");
    container.innerHTML = DATA.lifestyleFilters
      .map((item) => {
        const active = state.topic === item.id;
        const label = pick(item, "labelEn", "labelZh");
        const cls = active
          ? "lifestyle-pill-active font-bold"
          : "bg-surface-high text-muted border-transparent hover:text-ink";
        return `<button onclick="selectLifestyleFilter('${item.id}')" class="shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs border transition-all ${cls}">${escapeHtml(label)}</button>`;
      })
      .join("");
  }

  window.selectLifestyleFilter = function (topicId) {
    state.topic = topicId;
    renderLifestylePills();
    renderMapPins(true);
    renderProjects();
  };

  window.filterByGuideArea = function (area) {
    state.area = area;
    syncStickyFilterInputs();
    renderMapPins(true);
    renderProjects();
    document.getElementById("properties").scrollIntoView({ behavior: "smooth" });
  };

  window.resetFilters = function () {
    state.search = "";
    state.searchTab = "all";
    state.mapLegend = "all";
    state.area = "all";
    state.maxBudget = 99999999;
    state.topic = "all";
    syncStickyFilterInputs();
    setSearchTab("all");
    setMapLegendFilter("all");
    renderLifestylePills();
    renderMapPins(true);
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

  // --- #3 Crisp Vector Map (MapLibre GL + OpenFreeMap Styles) ---
  function initVectorMap() {
    const mapEl = document.getElementById("ipoh-vector-map");
    if (!mapEl || !window.maplibregl || mapInstance) return;

    mapInstance = new window.maplibregl.Map({
      container: mapEl,
      style: MAP_STYLES[mapStyle],
      center: [101.108, 4.602],
      zoom: 11.4,
      attributionControl: true,
      scrollZoom: false
    });
  }

  window.zoomInMap = function () {
    if (mapInstance) mapInstance.zoomIn({ duration: 250 });
  };

  window.zoomOutMap = function () {
    if (mapInstance) mapInstance.zoomOut({ duration: 250 });
  };

  window.resetMapView = function () {
    fitMapToCoords(getMapFilteredProjects().map((p) => p.coords).filter(Boolean));
  };

  window.setMapStyle = function (styleKey) {
    if (!MAP_STYLES[styleKey]) return;
    mapStyle = styleKey;
    if (mapInstance) {
      mapInstance.setStyle(MAP_STYLES[styleKey]);
    }
    ["bright", "positron", "satellite"].forEach((key) => {
      const btn = document.getElementById("map-style-" + key);
      if (!btn) return;
      const active = key === styleKey;
      btn.className = active
        ? "px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-bold btn-brand-primary transition-colors"
        : "px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] font-semibold text-muted hover:bg-slate-100 transition-colors";
    });
  };

  function getMapFilteredProjects() {
    return getFilteredProjects().filter((p) => {
      if (state.mapLegend === "sale") return !p.homestayHot;
      if (state.mapLegend === "homestay") return p.homestayHot;
      return true;
    });
  }

  function fitMapToCoords(coordsList) {
    if (!mapInstance || !window.maplibregl) return;
    const targets = coordsList && coordsList.length ? coordsList : DATA.projects.map((p) => p.coords).filter(Boolean);
    if (!targets.length) return;
    if (targets.length === 1) {
      mapInstance.flyTo({ center: toLngLat(targets[0]), zoom: 13.8, duration: 650 });
      return;
    }
    const bounds = new window.maplibregl.LngLatBounds();
    targets.forEach((c) => bounds.extend(toLngLat(c)));
    mapInstance.fitBounds(bounds, {
      padding: { top: 72, bottom: 64, left: 48, right: 48 },
      maxZoom: 12.8,
      duration: 650
    });
  }

  function buildMapPopupHtml(p) {
    const shortName = p.name.replace(" (Example)", "");
    const detailsLbl = state.lang === "zh" ? "看详情" : "Details";
    return `
      <div class="bg-white text-left font-sans">
        <div class="relative h-28 bg-slate-200 overflow-hidden">
          <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(shortName)}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/15"></div>
          <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/95 text-ink text-[10px] font-bold shadow-sm">
            ${escapeHtml(p.area)} &bull; ${escapeHtml(p.tenure)}
          </span>
          <div class="absolute bottom-2 left-2.5 right-2.5 text-white font-extrabold text-sm">
            ${formatRM(p.priceFrom)} <span class="text-[10px] font-semibold text-slate-200">· RM ${p.psfAvg}/psf</span>
          </div>
        </div>
        <div class="p-3">
          <div class="font-bold text-xs text-ink leading-snug line-clamp-1">${escapeHtml(shortName)}</div>
          <div class="text-[11px] text-muted mt-0.5 truncate">${escapeHtml(p.bedsSummary)} &bull; ${escapeHtml(p.sqftSummary)}</div>
          <div class="text-[10px] text-success font-semibold mt-0.5 truncate">${escapeHtml(p.landmark || p.amenityDrive)}</div>
          <div class="grid grid-cols-2 gap-1.5 mt-2.5">
            <button type="button" onclick="openProjectModal('${p.id}')" class="py-1.5 px-2 rounded-lg bg-surface-high hover:bg-slate-200 text-ink font-bold text-[11px] transition-colors">
              ${detailsLbl} &rarr;
            </button>
            <button type="button" onclick="openProjectWhatsApp('${p.id}')" class="py-1.5 px-2 rounded-lg btn-whatsapp text-[11px] flex items-center justify-center gap-1">
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function renderMapPins(shouldFit = true) {
    const countEl = document.getElementById("map-pin-count");
    const list = getMapFilteredProjects();
    if (countEl) countEl.textContent = list.length;

    if (!mapInstance || !window.maplibregl) return;
    activeMapMarkers.forEach((m) => m.remove());
    activeMapMarkers = [];

    const coordsList = [];

    list.forEach((p) => {
      if (!p.coords) return;
      coordsList.push(p.coords);

      const isViewed = state.viewedIds.has(p.id);
      const isNew = NEW_PROJECT_IDS.indexOf(p.id) > -1;

      let pillCls = "map-pin-sale";
      let tipCls = "map-pin-sale-tip";
      if (isViewed) {
        pillCls = "map-pin-viewed opacity-90";
        tipCls = "map-pin-viewed-tip";
      } else if (p.homestayHot) {
        pillCls = "map-pin-rent";
        tipCls = "map-pin-rent-tip";
      } else if (isNew) {
        pillCls = "map-pin-new";
        tipCls = "map-pin-new-tip";
      }

      const iconName = isViewed ? "eye" : p.homestayHot ? "key" : p.category === "Landed" ? "home" : "tag";
      const shortArea = p.area.split("/")[0].replace("Bandar Seri ", "").trim();

      const el = document.createElement("div");
      el.className = "pv-ml-pin-root";
      el.innerHTML = `
        <div class="pv-pin-pill px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full ${pillCls} font-extrabold text-[11px] sm:text-xs flex items-center gap-1 ring-2 ring-white/95 whitespace-nowrap">
          ${isNew && !isViewed ? `<span class="text-[9px] bg-white text-[#16A34A] font-extrabold px-1 rounded">NEW</span>` : icon(iconName, "w-[13px] h-[13px]")}
          <span>${formatCompactRM(p.priceFrom)} &bull; ${escapeHtml(shortArea)}</span>
        </div>
        <div class="w-2.5 h-2.5 ${tipCls} rotate-45 -mt-1 shadow-sm"></div>
      `;

      const popup = new window.maplibregl.Popup({
        offset: 36,
        maxWidth: "276px",
        className: "pv-map-popup",
        closeButton: true
      }).setHTML(buildMapPopupHtml(p));

      const marker = new window.maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(toLngLat(p.coords))
        .setPopup(popup)
        .addTo(mapInstance);

      activeMapMarkers.push(marker);
    });

    if (shouldFit) {
      fitMapToCoords(coordsList);
    }
  }

  // --- Favorite Heart Toggle ---
  window.toggleFavorite = function (projectId, event) {
    if (event) event.stopPropagation();
    if (state.favoriteIds.has(projectId)) {
      state.favoriteIds.delete(projectId);
    } else {
      state.favoriteIds.add(projectId);
    }
    renderProjects();
  };

  // --- Listing Cards (5 layers: photo · price/PSF · name · area · specs + actions) ---
  function renderProjects() {
    const list = getFilteredProjects();
    const isZh = state.lang === "zh";
    document.getElementById("projects-count").textContent = list.length;
    const stickyCount = document.getElementById("sticky-result-count");
    if (stickyCount) stickyCount.textContent = list.length;
    const grid = document.getElementById("projects-grid");

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-2xl border border-dashed border-line p-8 sm:p-10 text-center">
          <p class="text-muted font-semibold mb-3">${isZh ? "当前筛选条件下暂无匹配怡保房源" : "No Ipoh homes match these filters."}</p>
          <button type="button" onclick="resetFilters()" class="min-h-[44px] px-5 rounded-xl btn-brand-primary font-bold text-sm">${
            isZh ? "查看全部怡保房源" : "Show all Ipoh homes"
          }</button>
        </div>`;
      return;
    }

    grid.innerHTML = list
      .map((p) => {
        const inCompare = state.compareIds.includes(p.id);
        const isViewed = state.viewedIds.has(p.id);
        const isFav = state.favoriteIds.has(p.id);
        const isNew = NEW_PROJECT_IDS.indexOf(p.id) > -1;
        const firstPlan = p.floorPlans[0] || { beds: 3, baths: 2, sqft: 1200 };
        const name = p.name.replace(" (Example)", "");
        const statusBadge = isViewed
          ? `<span class="px-2.5 py-1 rounded-full bg-slate-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-sm">${isZh ? "已看过" : "Viewed"}</span>`
          : isNew
          ? `<span class="px-2.5 py-1 rounded-full badge-price-drop text-[10px] font-bold uppercase tracking-wide shadow-sm">${isZh ? "新上架" : "New"}</span>`
          : "";

        return `
          <article class="prop-card rounded-2xl overflow-hidden shadow-sm border border-line flex flex-col">
            <div class="relative w-full aspect-[4/3] overflow-hidden bg-slate-200">
              <button type="button" onclick="openProjectModal('${p.id}')" class="absolute inset-0 w-full h-full" aria-label="${escapeHtml(isZh ? "查看 " + name : "View " + name)}">
                <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(name)}" loading="lazy" width="800" height="600" class="card-photo w-full h-full object-cover" onerror="this.style.display='none'" />
              </button>
              <div class="absolute top-3 left-3 flex gap-1.5 items-center pointer-events-none">
                <span class="px-2.5 py-1 rounded-full bg-white/95 text-ink text-[10px] font-bold uppercase tracking-wide shadow-sm">${escapeHtml(p.tenure)}</span>
                ${statusBadge}
              </div>
              <button type="button" onclick="toggleFavorite('${p.id}', event)" aria-label="${isZh ? "收藏" : "Save to favourites"}" aria-pressed="${isFav}" class="absolute top-2.5 right-2.5 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center ${
                isFav ? "text-[#E11D48]" : "text-ink hover:text-[#E11D48]"
              } transition-colors shadow-sm">
                ${icon("heart", "w-5 h-5" + (isFav ? " is-filled" : ""))}
              </button>
              <span class="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-[11px] font-semibold text-white flex items-center gap-1 pointer-events-none">
                ${icon("camera", "w-3.5 h-3.5")} ${p.images.length}
              </span>
            </div>

            <div class="p-4 sm:p-5 flex flex-col gap-2 flex-1">
              <p class="flex items-baseline flex-wrap gap-x-2">
                <span class="text-[22px] font-extrabold text-ink tabular-nums">${formatRM(p.priceFrom)}</span>
                <span class="text-xs font-semibold text-muted">RM ${p.psfAvg} psf</span>
              </p>
              <h3 class="font-bold text-base text-ink leading-snug line-clamp-1">
                <button type="button" onclick="openProjectModal('${p.id}')" class="text-left hover:text-brand-primary transition-colors">${escapeHtml(name)}</button>
              </h3>
              <p class="text-sm text-muted flex items-center gap-1.5">
                ${icon("pin", "w-4 h-4 shrink-0")}
                <span class="truncate">${escapeHtml(p.area)}</span>
              </p>
              <div class="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted pt-2.5 mt-0.5 border-t border-line">
                <span class="inline-flex items-center gap-1.5">${icon("bed", "w-4 h-4")}${firstPlan.beds} ${isZh ? "房" : "bed"}</span>
                <span class="inline-flex items-center gap-1.5">${icon("bath", "w-4 h-4")}${firstPlan.baths} ${isZh ? "浴" : "bath"}</span>
                <span class="inline-flex items-center gap-1.5">${icon("area", "w-4 h-4")}${Number(firstPlan.sqft).toLocaleString("en-US")} sf</span>
                <span class="inline-flex items-center gap-1.5 text-success font-semibold">${icon("chart", "w-4 h-4")}${p.rentalYield}%</span>
              </div>

              <div class="grid grid-cols-[1fr_1fr_auto] gap-2 mt-auto pt-3">
                <button type="button" onclick="openProjectModal('${p.id}')" class="min-h-[44px] px-2 rounded-xl bg-surface-high hover:bg-slate-200 text-ink font-bold text-xs transition-colors flex items-center justify-center gap-1">
                  <span>${isZh ? "看详情" : "Details"}</span>${icon("arrow-right", "w-4 h-4")}
                </button>
                <button type="button" onclick="openProjectWhatsApp('${p.id}')" class="min-h-[44px] px-2 rounded-xl btn-whatsapp text-xs flex items-center justify-center gap-1.5 shadow-sm">
                  ${icon("chat", "w-4 h-4")}<span>WhatsApp</span>
                </button>
                <button type="button" onclick="toggleCompare('${p.id}')" aria-pressed="${inCompare}" aria-label="${
                  inCompare ? (isZh ? "移出对比" : "Remove from compare") : isZh ? "加入对比" : "Add to compare"
                }" title="${isZh ? "对比" : "Compare"}" class="min-h-[44px] min-w-[44px] rounded-xl border flex items-center justify-center transition-colors ${
                  inCompare ? "btn-brand-primary border-transparent" : "bg-white border-line text-ink hover:border-slate-400"
                }">
                  ${icon(inCompare ? "check" : "compare", "w-[18px] h-[18px]")}
                </button>
              </div>
            </div>
          </article>
        `;
      })
      .join("");
  }

  // --- Stitch Bento Ipoh Neighbourhood Guides ---
  function renderAreaGuides() {
    const grid = document.getElementById("area-guides-grid");
    grid.innerHTML = DATA.areaGuides
      .map((g) => {
        const badgeInfo = AREA_BADGES[g.area] || { en: "Popular", zh: "热门区", cls: "bg-brand-soft border" };
        const badgeLabel = state.lang === "zh" ? badgeInfo.zh : badgeInfo.en;
        return `
          <button type="button" onclick="filterByGuideArea('${escapeHtml(g.area)}')" class="guide-card text-left w-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-line transition-all cursor-pointer flex flex-col justify-between">
            <div>
              <div class="relative h-36 bg-slate-200 overflow-hidden">
                <img src="${escapeHtml(g.image)}" alt="" loading="lazy" class="guide-photo w-full h-full object-cover" onerror="this.style.display='none'" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                <span class="absolute top-3 left-3 px-2.5 py-1 rounded-md ${badgeInfo.cls} text-[11px] font-bold shadow-sm">${escapeHtml(badgeLabel)}</span>
                <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-ink text-[11px] font-extrabold shadow-sm">${escapeHtml(g.avgYield)} ROI</span>
              </div>
              <div class="p-4 sm:p-5">
                <h3 class="text-lg font-bold text-ink">${escapeHtml(pick(g, "titleEn", "titleZh"))}</h3>
                <p class="text-xs text-muted mt-1.5 leading-relaxed line-clamp-2">${escapeHtml(pick(g, "descEn", "descZh"))}</p>
              </div>
            </div>
            <div class="px-4 sm:px-5 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div class="text-muted">${state.lang === "zh" ? "二手均价" : "Avg subsale"}: <strong class="text-ink">${escapeHtml(g.avgPsf)}/psf</strong></div>
              <span class="text-brand-primary font-bold">${state.lang === "zh" ? "查看房源 →" : "Explore →"}</span>
            </div>
          </button>`;
      })
      .join("");
  }

  // --- Ipoh Comparison Tool ---
  window.toggleCompare = function (projectId) {
    const idx = state.compareIds.indexOf(projectId);
    if (idx > -1) {
      if (state.compareIds.length <= 1) return;
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
        render: (p) => `<span class="font-semibold text-ink">${escapeHtml(p.area)}</span><br class="sm:hidden" /><span class="hidden sm:inline"> &bull; </span><span class="text-[11px] text-muted">${escapeHtml(p.category)} (${escapeHtml(p.tenure)})</span>`
      },
      {
        label: state.lang === "zh" ? "参考价起" : "Entry Price",
        value: (p) => p.priceFrom,
        best: "min",
        render: (p) => `<span class="font-extrabold">${formatRM(p.priceFrom)}</span>`
      },
      {
        label: state.lang === "zh" ? "房型面积" : "Layout & Size",
        render: (p) => `${escapeHtml(p.bedsSummary)} &bull; ${escapeHtml(p.sqftSummary)}`
      },
      {
        label: state.lang === "zh" ? "参考尺价" : "Avg PSF",
        value: (p) => p.psfAvg,
        best: "min",
        render: (p) => `RM ${p.psfAvg} / sqft`
      },
      {
        label: state.lang === "zh" ? "租金回报" : "Est. Yield",
        value: (p) => p.rentalYield,
        best: "max",
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
          <tr class="bg-surface-low border-b border-slate-200 text-ink">
            <th class="p-2.5 sm:p-4 text-[10px] sm:text-xs font-bold uppercase tracking-wider w-24 sm:w-44 text-muted">${state.lang === "zh" ? "对比项" : "Metric"}</th>
            ${selected
              .map(
                (p) => `
              <th class="p-2.5 sm:p-4 align-top">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <div class="text-xs sm:text-sm font-extrabold leading-snug text-ink">${escapeHtml(p.name)}</div>
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
              <th scope="row" class="p-2.5 sm:p-4 font-bold text-[11px] sm:text-xs text-muted bg-surface-low text-left">${r.label}</th>
              ${(function () {
                let bestVal = null;
                if (r.value && selected.length > 1) {
                  const vals = selected.map(r.value);
                  bestVal = r.best === "min" ? Math.min.apply(null, vals) : Math.max.apply(null, vals);
                }
                return selected
                  .map((p) => {
                    const isBest = bestVal !== null && r.value(p) === bestVal;
                    return `<td class="p-2.5 sm:p-4 text-[11px] sm:text-sm align-top ${isBest ? "pv-best" : "text-ink"}">${r.render(p)}</td>`;
                  })
                  .join("");
              })()}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  // --- Ipoh DSR, Mortgage & MOT Stamp Duty Calculator ---
  window.applyDsrExample = function (price, rent) {
    state.calcTouched = true;
    document.getElementById("slider-price").value = price;
    document.getElementById("slider-rent").value = rent;
    document.getElementById("slider-margin").value = 90;
    document.getElementById("slider-rate").value = 4.0;
    document.getElementById("slider-tenure").value = 35;
    updateCalculators();
  };

  // MOT (instrument of transfer) stamp duty.
  // Malaysians: 1% / 2% / 3% / 4% tiers. Foreign buyers: flat 8%.
  // First home <= RM 500k: treated as fully exempt (i-Miliki style exemption, eligibility to be confirmed by lawyer).
  function calculateMalaysiaMOT(price, buyerType) {
    if (buyerType === "foreign") return price * 0.08;
    if (buyerType === "first" && price <= 500000) return 0;
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

  // Solicitors' Remuneration Order scale: 1.25% on the first RM 500k, 1% on the next RM 7.5M, minimum RM 500.
  function sroLegalFee(amount) {
    const first = Math.min(amount, 500000) * 0.0125;
    const next = Math.max(0, Math.min(amount, 8000000) - 500000) * 0.01;
    return Math.max(500, first + next);
  }

  function updateCalculators() {
    const price = Number(document.getElementById("slider-price").value);
    const margin = Number(document.getElementById("slider-margin").value) / 100;
    const rate = Number(document.getElementById("slider-rate").value) / 100;
    const years = Number(document.getElementById("slider-tenure").value);
    const rent = Number(document.getElementById("slider-rent").value);
    const buyerType = document.getElementById("calc-buyer").value;
    const isForeigner = buyerType === "foreign";
    const isZh = state.lang === "zh";

    const loanAmount = price * margin;
    const monthlyRate = rate / 12;
    const months = years * 12;
    const monthlyInstallment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    const minIncome = monthlyInstallment / 0.7;
    const mot = calculateMalaysiaMOT(price, buyerType);
    const grossYield = ((rent * 12) / price) * 100;
    const cashflow = rent - monthlyInstallment;
    const downpayment = price * (1 - margin);
    const firstHomeExempt = buyerType === "first" && price <= 500000;
    const loanStampDuty = firstHomeExempt ? 0 : loanAmount * 0.005;
    const legalEstimate = sroLegalFee(price) + sroLegalFee(loanAmount) + loanStampDuty;

    state.calcSnapshot = {
      price,
      marginPct: Math.round(margin * 100),
      ratePct: (rate * 100).toFixed(2),
      years,
      rent,
      isForeigner,
      buyerType,
      legalEstimate,
      loanAmount,
      monthlyInstallment,
      minIncome,
      mot,
      downpayment,
      grossYield,
      cashflow,
      motExemptionEligible: firstHomeExempt
    };

    document.getElementById("calc-val-price").textContent = formatRM(price);
    document.getElementById("calc-val-loan").textContent = `${Math.round(margin * 100)}%`;
    document.getElementById("calc-val-rate").textContent = `${(rate * 100).toFixed(2)}%`;
    document.getElementById("calc-val-tenure").textContent = `${years} ${state.lang === "zh" ? "年" : "Years"}`;
    document.getElementById("calc-val-rent").textContent = formatRM(rent);

    document.getElementById("out-monthly").innerHTML = `${formatRM(monthlyInstallment)} <span class="text-sm font-semibold text-white/70">/ ${isZh ? "月" : "month"}</span>`;
    document.getElementById("out-loan-amount").textContent = `${formatRM(loanAmount)} (${Math.round(margin * 100)}%)`;
    document.getElementById("out-income").textContent = `${formatRM(minIncome)} / ${isZh ? "月" : "mo"}`;
    document.getElementById("out-mot").textContent = formatRM(mot);
    document.getElementById("out-mot-note").textContent = isForeigner
      ? isZh ? "外国买家统一 8%" : "8% flat (foreign buyer)"
      : firstHomeExempt
      ? isZh ? "首购 ≤ RM50万 全免" : "First-home exemption applied"
      : isZh ? "按 1–4% 分级" : "1–4% tiers";
    document.getElementById("calc-first-note").classList.toggle("hidden", isForeigner);
    document.getElementById("out-roi").textContent = `${grossYield.toFixed(2)}%`;
    document.getElementById("out-downpayment").textContent = formatRM(downpayment);
    document.getElementById("out-legal").textContent = formatRM(legalEstimate);

    const cfEl = document.getElementById("out-cashflow");
    cfEl.textContent = `${cashflow >= 0 ? "+" : "−"}${formatRM(Math.abs(cashflow))} / ${isZh ? "月" : "mo"}`;
    cfEl.className = cashflow >= 0 ? "text-success font-bold" : "text-warn font-bold";
  }

  // --- Ipoh Specialists Roster ---
  function renderAgents() {
    const grid = document.getElementById("agents-grid");
    grid.innerHTML = DATA.agents
      .map((a) => {
        const isSelected = state.activeAgentId === a.id;
        return `
          <div class="bg-white rounded-2xl border ${isSelected ? "border-brand-primary ring-2 ring-brand-soft" : "border-slate-200/80"} p-4 sm:p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center gap-3.5 mb-3">
                <div class="w-12 h-12 rounded-2xl btn-brand-primary font-extrabold flex items-center justify-center shadow-sm shrink-0">${a.initials}</div>
                <div>
                  <h3 class="font-extrabold text-ink flex flex-wrap items-center gap-1.5">
                    <span>${escapeHtml(a.name)}</span>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-low text-muted">${escapeHtml(a.renCode)}</span>
                  </h3>
                  <p class="text-xs text-brand-primary font-semibold">${escapeHtml(pick(a, "roleEn", "roleZh"))}</p>
                </div>
              </div>
              <p class="text-xs text-muted leading-relaxed mb-4">${escapeHtml(pick(a, "bioEn", "bioZh"))}</p>
              <div class="grid grid-cols-3 gap-2 text-center bg-surface-low rounded-xl p-2.5 mb-4 text-xs">
                <div><div class="font-extrabold text-ink">${a.dealsClosed}</div><div class="text-[10px] text-muted">${state.lang === "zh" ? "累计成交" : "Deals"}</div></div>
                <div><div class="font-extrabold text-brand-primary">${a.avgReplyMin} min</div><div class="text-[10px] text-muted">${state.lang === "zh" ? "响应速度" : "Avg Reply"}</div></div>
                <div><div class="font-extrabold text-ink">${a.verifiedUnitsCount}</div><div class="text-[10px] text-muted">${state.lang === "zh" ? "负责房源" : "Listings"}</div></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="selectAgentPortfolio('${a.id}')" class="py-2.5 px-3 rounded-xl bg-surface-high hover:bg-slate-200 text-ink text-xs font-bold transition-colors">
                ${state.lang === "zh" ? "查看负责楼盘" : "View Listings"}
              </button>
              <button onclick="openAgentWhatsApp('${a.id}')" class="py-2.5 px-3 rounded-xl btn-whatsapp text-xs flex items-center justify-center gap-1">
                <svg class="pv-icon w-[16px] h-[16px]" aria-hidden="true"><use href="#i-chat"/></svg>
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
          <h4 class="text-base sm:text-lg font-extrabold text-ink">${escapeHtml(agent.name)} — ${state.lang === "zh" ? "怡保主理二手社区" : "Active Ipoh Developments"}</h4>
        </div>
        <button onclick="openAgentWhatsApp('${agent.id}')" class="px-4 py-2 rounded-xl btn-whatsapp text-xs">
          ${state.lang === "zh" ? "联系顾问看房" : "WhatsApp Specialist"}
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${ownedProjects
          .map(
            (p) => `
          <div class="bg-surface-low rounded-xl border border-slate-200/70 p-4 flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-extrabold text-ink">${escapeHtml(p.name)}</div>
              <div class="text-xs text-muted">${escapeHtml(p.area)} &middot; ${p.verifiedUnits.length} ${state.lang === "zh" ? "套 Example 房源" : "Example Units"} &middot; ${formatRM(p.priceFrom)}+</div>
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
    renderMapPins(false);
    renderProjects();
    document.getElementById("project-modal").classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    renderProjectModalContent();
  };

  window.closeProjectModal = function () {
    document.getElementById("project-modal").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    state.activeProjectId = null;
  };

  window.switchModalTab = function (tab) {
    state.activeModalTab = tab;
    renderProjectModalContent();
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
        <p class="text-xs sm:text-sm text-muted leading-relaxed mb-4 sm:mb-5">${escapeHtml(pick(p, "summaryEn", "summaryZh"))}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 mb-4 sm:mb-5">
          <div class="rounded-2xl bg-brand-soft border p-4">
            <h4 class="font-extrabold text-ink text-xs sm:text-sm mb-2">✓ ${
              state.lang === "zh" ? "怡保买家喜欢的原因" : "Why Ipoh Buyers Love This Area"
            }</h4>
            <ul class="space-y-1.5 text-xs text-slate-700">${pros.map((item) => `<li>&bull; ${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="rounded-2xl badge-accent-soft border p-4">
            <h4 class="font-extrabold text-ink text-xs sm:text-sm mb-2">⚠ ${
              state.lang === "zh" ? "买二手房前要注意" : "Good to Check Before Buying"
            }</h4>
            <ul class="space-y-1.5 text-xs text-slate-700">${cons.map((item) => `<li>&bull; ${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="rounded-2xl bg-surface-low border border-slate-200/70 p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div><span class="text-muted block">${state.lang === "zh" ? "周边车程" : "Key Amenities"}</span><strong class="text-ink">${escapeHtml(p.amenityDrive)}</strong></div>
          <div><span class="text-muted block">${state.lang === "zh" ? "保安 / 管理费" : "Maint. / Guard"}</span><strong class="text-ink">${escapeHtml(p.maintenanceLabel)}</strong></div>
          <div><span class="text-muted block">${state.lang === "zh" ? "产权状态" : "Tenure"}</span><strong class="text-ink">${escapeHtml(p.tenure)}</strong></div>
          <div><span class="text-muted block">${state.lang === "zh" ? "参考租金回报" : "Est. Yield"}</span><strong class="text-brand-primary">${p.rentalYield}%</strong></div>
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
                <div class="font-extrabold text-ink text-sm">${escapeHtml(u.layout)} &middot; ${escapeHtml(u.level)}</div>
                <div class="text-xs text-muted">${escapeHtml(u.furnishing)} &middot; ~RM ${u.psf} psf</div>
              </div>
              <div class="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div class="text-base sm:text-lg font-extrabold text-brand-primary">${formatRM(u.price)}</div>
                <button onclick="openUnitWhatsApp('${p.id}', '${escapeHtml(u.code)}')" class="px-3.5 py-2 rounded-lg btn-whatsapp text-xs">
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
              (fp, idx) => `
            <div class="rounded-2xl border border-slate-200 p-4 bg-surface-low">
              ${renderFloorPlanSvg(fp, isLanded)}
              <div class="font-extrabold text-ink text-sm mb-1">${escapeHtml(fp.type)}</div>
              <div class="text-xs text-muted mb-3">${fp.sqft} sqft &middot; ${fp.beds} Bed &middot; ${fp.baths} Bath &middot; Est. Rent: <strong class="text-brand-primary">${escapeHtml(fp.estRent)}</strong></div>
              <div class="flex items-center justify-between pt-2 border-t border-slate-200">
                <span class="font-extrabold text-ink">${escapeHtml(fp.price)}</span>
                <button onclick="openFloorPlanLead('${p.id}', ${idx})" class="text-xs font-bold text-brand-primary hover:underline">
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
              <div class="font-bold text-ink text-sm mb-1.5">Q: ${escapeHtml(pick(f, "qEn", "qZh"))}</div>
              <p class="text-xs text-muted leading-relaxed">A: ${escapeHtml(pick(f, "aEn", "aZh"))}</p>
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

        <button type="button" onclick="closeProjectModal()" aria-label="Close" class="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-sm">
          <svg class="pv-icon w-5 h-5" aria-hidden="true"><use href="#i-x"/></svg>
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

      <div class="border-b border-slate-200 px-4 sm:px-6 flex gap-4 overflow-x-auto no-scrollbar bg-surface-low shrink-0">
        ${tabs
          .map(
            (tb) => `
          <button onclick="switchModalTab('${tb.id}')" class="py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              state.activeModalTab === tb.id
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-muted hover:text-ink"
            }">${tb.label}</button>`
          )
          .join("")}
      </div>

      <div class="p-4 sm:p-6 overflow-y-auto thin-scroll flex-1 bg-white">${bodyHtml}</div>

      <div class="p-3.5 sm:px-6 bg-surface-low border-t border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
        <div class="flex items-center gap-2 min-w-0 text-xs">
          <div class="w-8 h-8 rounded-full btn-brand-primary font-bold flex items-center justify-center shrink-0">${agent.initials}</div>
          <div class="truncate">
            <div class="font-bold text-ink truncate">${escapeHtml(agent.name)}</div>
            <div class="text-muted text-[11px]">${escapeHtml(agent.renCode)} &middot; ${agent.avgReplyMin}m reply</div>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button onclick="openLeadModal('${escapeHtml(p.name)} — Viewing &amp; Bank Valuation')" class="hidden sm:inline-flex px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-ink font-bold text-xs">
            ${state.lang === "zh" ? "预约时段" : "Book Viewing"}
          </button>
          <button onclick="openProjectWhatsApp('${p.id}')" class="px-4 py-2.5 rounded-xl btn-whatsapp text-xs shadow-sm flex items-center gap-1.5">
            <svg class="pv-icon w-[16px] h-[16px]" aria-hidden="true"><use href="#i-chat"/></svg>
            <span>WhatsApp</span>
          </button>
        </div>
      </div>
    `;
  }

  // --- #4 Real Pre-filled WhatsApp Launchers (with DSR Budget Sync) ---
  function getDsrSummaryLine(forceInclude) {
    if (!state.calcSnapshot || (!forceInclude && !state.calcTouched)) return "";
    const c = state.calcSnapshot;
    const isZh = state.lang === "zh";
    return isZh
      ? `\n[DSR 试算参考] 目标房价 ${formatRM(c.price)}（${c.marginPct}% 贷款 · ${c.years}年 @ ${c.ratePct}%），月供约 ${formatRM(c.monthlyInstallment)}，建议月入 ≥ ${formatRM(c.minIncome)}`
      : `\n[DSR Calculator Budget] Target ${formatRM(c.price)} (${c.marginPct}% loan, ${c.years}y @ ${c.ratePct}%), est. ${formatRM(c.monthlyInstallment)}/mo (70% DSR income: ${formatRM(c.minIncome)}/mo)`;
  }

  window.openProjectWhatsApp = function (projectId) {
    const p = findProject(projectId);
    if (!p || !window.PVConcierge) return;
    const agent = findAgent(p.specialistId);
    const agentShort = agent.name.replace(" (Example)", "");
    const title = p.name.replace(" (Example)", "");
    const dsrNote = getDsrSummaryLine(false);
    const msg =
      state.lang === "zh"
        ? `你好 ${agentShort}，我在 PrimeVerse Ipoh 看到楼盘「${title}」（${p.area} · ${p.tenure} · ${formatRM(p.priceFrom)}+ · RM ${p.psfAvg}/psf）。请问目前有哪些实盘单位可看房？${dsrNote}`
        : `Hi ${agentShort}, I viewed "${title}" (${p.area} · ${p.tenure} · From ${formatRM(p.priceFrom)}, RM ${p.psfAvg}/psf) on PrimeVerse Ipoh. Please share available subsale units and viewing slots.${dsrNote}`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      agent,
      eventName: "project_whatsapp",
      meta: { package: "pro", projectId: p.id, area: p.area, price: p.priceFrom, label: title },
      lang: state.lang
    });
  };

  window.openUnitWhatsApp = function (projectId, unitCode) {
    const p = findProject(projectId);
    if (!p || !window.PVConcierge) return;
    const unit = p.verifiedUnits.find((u) => u.code === unitCode) || p.verifiedUnits[0];
    const agent = findAgent(p.specialistId);
    const agentShort = agent.name.replace(" (Example)", "");
    const title = p.name.replace(" (Example)", "");
    const dsrNote = getDsrSummaryLine(false);
    const msg =
      state.lang === "zh"
        ? `你好 ${agentShort}，我想询问「${title}」示范编号 [${unit.code}] 的单位（${unit.layout} · ${formatRM(unit.price)} · ${unit.furnishing}），请问还可以安排看房与查银行估价吗？${dsrNote}`
        : `Hi ${agentShort}, I'm interested in Unit Ref [${unit.code}] at ${title} (${unit.layout} · ${formatRM(unit.price)} · ${unit.furnishing}). Is it available for viewing & bank valuation check?${dsrNote}`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      agent,
      eventName: "unit_whatsapp",
      meta: { package: "pro", projectId: p.id, unitCode: unit.code, price: unit.price, label: `${unit.code} · ${title}` },
      lang: state.lang
    });
  };

  window.openDsrWhatsApp = function () {
    if (!window.PVConcierge) return;
    if (!state.calcSnapshot) updateCalculators();
    const c = state.calcSnapshot;
    const buyerEn = { local: "Malaysian", first: "Malaysian first-home buyer", foreign: "Foreign buyer" }[c.buyerType] || "Malaysian";
    const buyerZh = { local: "大马公民", first: "大马首购", foreign: "外国买家" }[c.buyerType] || "大马公民";
    const motNoteEn = `Est. MOT ${formatRM(c.mot)}${c.motExemptionEligible ? " (first-home exemption)" : ""}, legal + loan duty ${formatRM(c.legalEstimate)} · ${buyerEn}`;
    const motNoteZh = `MOT 印花税约 ${formatRM(c.mot)}${c.motExemptionEligible ? "（首购豁免）" : ""}，律师费 + 贷款印花税约 ${formatRM(c.legalEstimate)} · ${buyerZh}`;

    const msg =
      state.lang === "zh"
        ? `你好 PrimeVerse Ipoh 顾问，我刚用网站怡保 DSR 计算器做了预算评估：\n• 目标房价：${formatRM(c.price)}（首付 ${formatRM(c.downpayment)}）\n• 贷款设定：${c.marginPct}%（${formatRM(c.loanAmount)}）· ${c.years} 年 · ${c.ratePct}%\n• 预计月供：${formatRM(c.monthlyInstallment)}/月\n• 70% DSR 建议月入：${formatRM(c.minIncome)}/月（${motNoteZh}）\n请帮我做免费银行 Pre-Check（Maybank/PBB/CIMB），并推荐匹配此预算的怡保二手好房！`
        : `Hi PrimeVerse Ipoh team, I just ran the Ipoh DSR Calculator on your portal:\n• Target Price: ${formatRM(c.price)} (Downpayment ${formatRM(c.downpayment)})\n• Loan: ${c.marginPct}% (${formatRM(c.loanAmount)}) · ${c.years} Years @ ${c.ratePct}%\n• Est. Repayment: ${formatRM(c.monthlyInstallment)}/month\n• Min. 70% DSR Income: ${formatRM(c.minIncome)}/mo · ${motNoteEn}\nCan you help me run a free bank eligibility pre-check and recommend matching Ipoh homes?`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      eventName: "dsr_whatsapp",
      meta: { package: "pro", targetPrice: c.price, monthlyInstallment: Math.round(c.monthlyInstallment), label: `DSR Check · ${formatRM(c.price)}` },
      lang: state.lang
    });
  };

  window.openAgentWhatsApp = function (agentId) {
    const agent = findAgent(agentId);
    if (!window.PVConcierge) return;
    const agentShort = agent.name.replace(" (Example)", "");
    const dsrNote = getDsrSummaryLine(false);
    const msg =
      state.lang === "zh"
        ? `你好 ${agentShort}（${agent.renCode}），我在 PrimeVerse Ipoh 看到你主理 ${agent.areas.join(" / ")} 的怡保二手房源，想进一步咨询实盘报价与预约看房。${dsrNote}`
        : `Hi ${agentShort} (${agent.renCode}), I saw your Ipoh specialist profile covering ${agent.areas.join(" / ")} on PrimeVerse Ipoh and would like advice on verified subsale listings.${dsrNote}`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      agent,
      eventName: "agent_whatsapp",
      meta: { package: "pro", agentId: agent.id, label: agentShort },
      lang: state.lang
    });
  };

  window.openGeneralWhatsApp = function (customTopic) {
    if (!window.PVConcierge) return;
    const topic = customTopic || "General Ipoh Subsale Inquiry";
    const filters = [];
    if (state.area !== "all") filters.push(state.area);
    if (state.searchTab !== "all") filters.push(state.searchTab);
    if (state.maxBudget < 99999999) filters.push((state.lang === "zh" ? "预算 <= " : "Budget <= ") + formatRM(state.maxBudget));
    const filterNote = filters.length ? ` (${filters.join(" · ")})` : "";
    const dsrNote = getDsrSummaryLine(false);
    const msg =
      state.lang === "zh"
        ? `你好 PrimeVerse Ipoh 团队，我正在浏览网站（Pro 版），想咨询「${topic}」${filterNote}。${dsrNote}`
        : `Hi PrimeVerse Ipoh team, I'm browsing your Ipoh property portal regarding "${topic}"${filterNote}.${dsrNote}`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      eventName: "general_whatsapp",
      meta: { package: "pro", topic, label: topic },
      lang: state.lang
    });
  };

  // --- Concierge / Buyer Inquiry Modal ---
  window.openFloorPlanLead = function (projectId, fpIdx) {
    const p = findProject(projectId);
    if (!p) return;
    const fp = p.floorPlans[fpIdx];
    const label = fp ? `${p.name} — ${fp.type} Floor Plan & Bank Value` : `${p.name} — Floor Plan`;
    openLeadModal(label);
  };

  window.openLeadModal = function (contextText) {
    document.getElementById("lead-context").value = contextText;
    document.getElementById("lead-success-box").classList.add("hidden");
    document.getElementById("lead-form").classList.remove("hidden");

    const directLink = document.getElementById("lead-direct-wa-link");
    if (directLink && window.PVConcierge) {
      const dsrNote = getDsrSummaryLine(false);
      const msg =
        state.lang === "zh"
          ? `你好 PrimeVerse Ipoh 团队，我想直接咨询「${contextText}」。${dsrNote}`
          : `Hi PrimeVerse Ipoh team, I would like to inquire directly about: ${contextText}.${dsrNote}`;
      directLink.href = window.PVConcierge.buildWhatsAppUrl(msg);
    }

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

    const dsrNote = getDsrSummaryLine(false);
    const waMsg =
      state.lang === "zh"
        ? `你好 ${assignedAgent.name.replace(" (Example)", "")}，我是 ${name} (${phone})，刚在官网提交了请求：「${ctx}」，请发送实拍照片、银行估价与可看房时间。${dsrNote}`
        : `Hi ${assignedAgent.name.replace(" (Example)", "")}, I'm ${name} (${phone}). I submitted an inquiry on PrimeVerse Ipoh for "${ctx}". Please share unit details, valuation estimate & viewing slots.${dsrNote}`;

    const waUrl = window.PVConcierge ? window.PVConcierge.buildWhatsAppUrl(waMsg, assignedAgent) : "https://wa.me/60125082048";
    if (window.PVConcierge) {
      window.PVConcierge.trackLeadEvent("form_lead", {
        package: "pro",
        name,
        phone,
        topic: ctx,
        agentId: assignedAgent.id,
        agentName: assignedAgent.name,
        lang: state.lang
      });
    }

    document.getElementById("lead-form").classList.add("hidden");
    const box = document.getElementById("lead-success-box");
    box.classList.remove("hidden");
    box.innerHTML =
      state.lang === "zh"
        ? `
      <div class="font-extrabold text-sm text-emerald-800">✓ 请求已登记！点击下方按钮一键直达顾问 WhatsApp</div>
      <p>感谢 <strong>${escapeHtml(name)}</strong>（${escapeHtml(phone)}），系统已指派怡保专员并为你备好以下预填消息：</p>
      <div class="p-3 rounded-xl bg-white border border-emerald-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full btn-brand-primary font-bold flex items-center justify-center shrink-0">${assignedAgent.initials}</div>
        <div>
          <div class="font-bold text-ink">怡保对接顾问：${escapeHtml(assignedAgent.name)} (${escapeHtml(assignedAgent.renCode)})</div>
          <div class="text-slate-500">预计 ${assignedAgent.avgReplyMin} 分钟内回复</div>
        </div>
      </div>
      <div class="p-2.5 rounded-xl bg-white/80 border border-emerald-200/80 text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">${escapeHtml(waMsg)}</div>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" onclick="if (window.PVConcierge) window.PVConcierge.trackLeadEvent('form_to_whatsapp', { package: 'pro', topic: document.getElementById('lead-context').value })" class="w-full py-2.5 rounded-xl btn-whatsapp text-xs flex items-center justify-center gap-1.5 shadow-sm">
        <span>立即在 WhatsApp 发送消息 &rarr;</span>
      </a>
      <button type="button" onclick="closeLeadModal()" class="w-full py-2 rounded-lg bg-white border border-emerald-200 text-slate-700 font-bold text-xs">关闭</button>`
        : `
      <div class="font-extrabold text-sm text-emerald-800">✓ Request Logged! Tap below to open WhatsApp:</div>
      <p>Thank you, <strong>${escapeHtml(name)}</strong> (${escapeHtml(phone)}). Your specialist is assigned and your WhatsApp message is ready:</p>
      <div class="p-3 rounded-xl bg-white border border-emerald-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full btn-brand-primary font-bold flex items-center justify-center shrink-0">${assignedAgent.initials}</div>
        <div>
          <div class="font-bold text-ink">Ipoh Specialist: ${escapeHtml(assignedAgent.name)} (${escapeHtml(assignedAgent.renCode)})</div>
          <div class="text-slate-500">Typically replies within ${assignedAgent.avgReplyMin} mins</div>
        </div>
      </div>
      <div class="p-2.5 rounded-xl bg-white/80 border border-emerald-200/80 text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">${escapeHtml(waMsg)}</div>
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" onclick="if (window.PVConcierge) window.PVConcierge.trackLeadEvent('form_to_whatsapp', { package: 'pro', topic: document.getElementById('lead-context').value })" class="w-full py-2.5 rounded-xl btn-whatsapp text-xs flex items-center justify-center gap-1.5 shadow-sm">
        <span>Open WhatsApp Chat Now &rarr;</span>
      </a>
      <button type="button" onclick="closeLeadModal()" class="w-full py-2 rounded-lg bg-white border border-emerald-200 text-slate-700 font-bold text-xs">Done</button>`;
  };

  // --- Inline Inquiry Form (#inquiry section) ---
  window.submitInlineInquiry = function (e) {
    e.preventDefault();
    const isZh = state.lang === "zh";
    const nameEl = document.getElementById("inq-name");
    const phoneEl = document.getElementById("inq-phone");
    const topicEl = document.getElementById("inq-topic");
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    let ok = true;

    function setErr(el, errId, msg) {
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      document.getElementById(errId).textContent = msg || "";
      if (msg) ok = false;
    }
    setErr(nameEl, "inq-name-err", name ? "" : isZh ? "请输入您的称呼" : "Please enter your name");
    setErr(
      phoneEl,
      "inq-phone-err",
      /^\+?[\d\s-]{9,}$/.test(phone) ? "" : isZh ? "请输入有效的 WhatsApp 号码" : "Please enter a valid WhatsApp number"
    );
    if (!ok) {
      (nameEl.getAttribute("aria-invalid") === "true" ? nameEl : phoneEl).focus();
      return;
    }

    const topic = topicEl.options[topicEl.selectedIndex].textContent.trim();
    const agent = DATA.agents[state.roundRobinIndex % DATA.agents.length];
    state.roundRobinIndex += 1;
    const agentShort = agent.name.replace(" (Example)", "");
    const dsrNote = getDsrSummaryLine(false);
    const msg = isZh
      ? `你好 ${agentShort}，我是 ${name}（${phone}），想在 PrimeVerse Ipoh 咨询：「${topic}」。${dsrNote}`
      : `Hi ${agentShort}, I'm ${name} (${phone}). I'd like help with: "${topic}" on PrimeVerse Ipoh.${dsrNote}`;

    if (window.PVConcierge) {
      window.PVConcierge.trackLeadEvent("form_lead", {
        package: "pro",
        source: "inline_inquiry",
        name,
        phone,
        topic,
        agentId: agent.id,
        agentName: agent.name,
        lang: state.lang
      });
      window.PVConcierge.launchWhatsApp({
        message: msg,
        agent,
        eventName: "inline_inquiry_whatsapp",
        meta: { package: "pro", topic, label: topic },
        lang: state.lang
      });
    }
  };

  function initStickySearchObserver() {
    const heroCard = document.getElementById("hero-search-card");
    const stickyBar = document.getElementById("sticky-search-bar");
    if (!heroCard || !stickyBar) return;

    function updateVisibility() {
      const rect = heroCard.getBoundingClientRect();
      stickyBar.classList.toggle("is-visible", rect.bottom < 0);
    }

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          const shouldShow = !entry.isIntersecting && entry.boundingClientRect.bottom < 0;
          stickyBar.classList.toggle("is-visible", shouldShow);
        },
        { threshold: 0 }
      );
      observer.observe(heroCard);
    }
    window.addEventListener("scroll", updateVisibility, { passive: true });
    updateVisibility();
  }

  // --- Bind Events & Init ---
  function bindEvents() {
    document.getElementById("search-input").addEventListener("input", (e) => {
      state.search = e.target.value;
      syncStickyFilterInputs();
      renderMapPins(true);
      renderProjects();
    });
    document.getElementById("filter-area").addEventListener("change", (e) => {
      state.area = e.target.value;
      syncStickyFilterInputs();
      renderMapPins(true);
      renderProjects();
    });
    document.getElementById("filter-budget").addEventListener("change", (e) => {
      state.maxBudget = Number(e.target.value);
      syncStickyFilterInputs();
      renderMapPins(true);
      renderProjects();
    });

    const stickySearch = document.getElementById("sticky-search-input");
    const stickyArea = document.getElementById("sticky-filter-area");
    const stickyTab = document.getElementById("sticky-filter-tab");
    const stickyBudget = document.getElementById("sticky-filter-budget");

    if (stickySearch) {
      stickySearch.addEventListener("input", (e) => {
        state.search = e.target.value;
        syncStickyFilterInputs();
        renderMapPins(true);
        renderProjects();
      });
    }
    if (stickyArea) {
      stickyArea.addEventListener("change", (e) => {
        state.area = e.target.value;
        syncStickyFilterInputs();
        renderMapPins(true);
        renderProjects();
      });
    }
    if (stickyTab) {
      stickyTab.addEventListener("change", (e) => {
        setSearchTab(e.target.value);
      });
    }
    if (stickyBudget) {
      stickyBudget.addEventListener("change", (e) => {
        state.maxBudget = Number(e.target.value);
        syncStickyFilterInputs();
        renderMapPins(true);
        renderProjects();
      });
    }

    ["slider-price", "slider-margin", "slider-rate", "slider-tenure", "slider-rent", "calc-buyer"].forEach(
      (id) => {
        document.getElementById(id).addEventListener("input", function () {
          state.calcTouched = true;
          updateCalculators();
        });
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
    initStickySearchObserver();
    setTheme(state.theme);
    initVectorMap();
    updateCalculators();
    updateCompareCounters();
    setLanguage("en");
    if (mapInstance) {
      setTimeout(function () {
        mapInstance.resize();
        resetMapView();
      }, 300);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
