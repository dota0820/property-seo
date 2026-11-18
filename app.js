// PrimeVerse Realty Group - Consumer Property Portal Logic

(function () {
  const DATA = window.APP_DATA;

  const state = {
    lang: "zh",
    search: "",
    searchTab: "all", // 'all' | 'New Launch' | 'Subsale' | 'investment'
    area: "all",
    maxBudget: 99999999,
    topic: "all",
    compareIds: ["trx-core-residence", "klcc-sky-atelier"],
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

  // --- Language Switcher ---
  window.setLanguage = function (lang) {
    state.lang = lang;
    const zhBtn = document.getElementById("lang-zh");
    const enBtn = document.getElementById("lang-en");

    if (lang === "zh") {
      zhBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all bg-emerald-500 text-navy-950";
      enBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-300 hover:text-white";
    } else {
      enBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all bg-emerald-500 text-navy-950";
      zhBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-300 hover:text-white";
    }

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
        ? "将完整贷款评估与印花税明细发到我 WhatsApp"
        : "WhatsApp Me the Full Loan & Stamp Duty Breakdown";

    updateCalculatorLabels();
    renderLifestylePills();
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
        ? "search-tab-btn px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-navy-950 transition-all"
        : "search-tab-btn px-4 py-2 rounded-xl text-xs font-bold bg-white/10 text-slate-200 hover:bg-white/15 transition-all";
    });
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
          : "bg-white/10 text-slate-200 border-white/15 hover:border-emerald-400/60";
        return `<button onclick="selectLifestyleFilter('${item.id}')" class="px-3 py-1.5 rounded-full text-xs border transition-all ${cls}">${escapeHtml(label)}</button>`;
      })
      .join("");
  }

  window.selectLifestyleFilter = function (topicId) {
    state.topic = topicId;
    renderLifestylePills();
    renderProjects();
  };

  window.filterByGuideArea = function (area) {
    state.area = area;
    document.getElementById("filter-area").value = area;
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
    renderProjects();
  };

  function getFilteredProjects() {
    const q = state.search.trim().toLowerCase();
    return DATA.projects.filter((p) => {
      if (state.searchTab === "New Launch" && p.category !== "New Launch") return false;
      if (state.searchTab === "Subsale" && p.category !== "Subsale") return false;
      if (state.searchTab === "investment" && p.rentalYield < 6.0) return false;
      if (state.area !== "all" && p.area !== state.area) return false;
      if (p.priceFrom > state.maxBudget) return false;
      if (state.topic !== "all" && !p.topics.includes(state.topic)) return false;
      if (q) {
        const hay = `${p.name} ${p.area} ${p.mrtStation} ${p.summaryEn} ${p.summaryZh}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  // --- Property Cards Grid ---
  function renderProjects() {
    const list = getFilteredProjects();
    document.getElementById("projects-count").textContent = list.length;
    const grid = document.getElementById("projects-grid");

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p class="text-slate-600 font-semibold mb-3">${
            state.lang === "zh" ? "当前筛选条件下暂无匹配楼盘" : "No residences match your current filters."
          }</p>
          <button onclick="resetFilters()" class="px-4 py-2 rounded-xl bg-emerald-500 text-navy-950 font-bold text-xs">${
            state.lang === "zh" ? "查看全部精选楼盘" : "Show All Properties"
          }</button>
        </div>`;
      return;
    }

    grid.innerHTML = list
      .map((p) => {
        const agent = findAgent(p.specialistId);
        const inCompare = state.compareIds.includes(p.id);
        const badge = pick(p, "badgeEn", "badgeZh");
        const summary = pick(p, "summaryEn", "summaryZh");
        const mrtText = p.mrtDistanceM <= 300 ? `${p.mrtDistanceM}m Walk` : `${(p.mrtDistanceM / 1000).toFixed(1)}km`;

        return `
          <article class="prop-card bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              <!-- Real Property Photo Header -->
              <div onclick="openProjectModal('${p.id}')" class="relative h-56 bg-gradient-to-br ${p.gradient} overflow-hidden cursor-pointer group">
                <img src="${escapeHtml(p.images[0])}" alt="${escapeHtml(p.name)}" class="card-photo w-full h-full object-cover" onerror="this.style.display='none'" />
                <div class="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent"></div>

                <div class="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span class="px-2.5 py-1 rounded-full bg-emerald-500 text-navy-950 text-[11px] font-extrabold shadow-sm">
                    ✓ ${p.verifiedUnits.length} ${state.lang === "zh" ? "套认证实盘" : "Verified Units"}
                  </span>
                  <span class="px-2.5 py-1 rounded-full bg-navy-950/75 backdrop-blur-sm text-white text-[11px] font-semibold border border-white/15">
                    ${escapeHtml(p.category)}
                  </span>
                </div>

                <div class="absolute bottom-3 left-3.5 right-3.5 text-white">
                  <div class="flex items-center justify-between gap-2 mb-0.5">
                    <span class="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">${escapeHtml(badge)}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-black/45 text-slate-200 backdrop-blur-sm">${p.images.length} Photos</span>
                  </div>
                  <h3 class="text-lg font-extrabold leading-tight group-hover:text-emerald-300 transition-colors">${escapeHtml(p.name)}</h3>
                  <div class="text-xs text-slate-200 flex items-center gap-2 mt-1">
                    <span>${escapeHtml(p.area)}</span>
                    <span>&middot;</span>
                    <span>${escapeHtml(p.tenure)}</span>
                    <span>&middot;</span>
                    <span>${escapeHtml(p.bedsSummary)}</span>
                  </div>
                </div>
              </div>

              <!-- Key Numbers Strip -->
              <div class="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/70 text-center py-2.5">
                <div>
                  <div class="text-[10px] text-slate-500 uppercase font-semibold">${state.lang === "zh" ? "总价起" : "From"}</div>
                  <div class="text-xs sm:text-sm font-extrabold text-navy-900">${formatRM(p.priceFrom)}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-500 uppercase font-semibold">${state.lang === "zh" ? "平均尺价" : "Avg PSF"}</div>
                  <div class="text-xs sm:text-sm font-extrabold text-navy-900">RM ${p.psfAvg}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-500 uppercase font-semibold">${state.lang === "zh" ? "租金回报" : "Est. Yield"}</div>
                  <div class="text-xs sm:text-sm font-extrabold text-emerald-600">${p.rentalYield}%</div>
                </div>
              </div>

              <!-- Description & Highlights -->
              <div class="p-4">
                <p class="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-3">${escapeHtml(summary)}</p>
                <div class="flex flex-wrap gap-1.5">
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">🚇 MRT ${escapeHtml(mrtText)}</span>
                  <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">📐 ${escapeHtml(p.sqftSummary)}</span>
                  ${p.petFriendly ? `<span class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold">🐾 Pet-Friendly</span>` : ""}
                </div>
              </div>
            </div>

            <!-- Specialist Footer & Buttons -->
            <div class="px-4 pb-4 pt-2 border-t border-slate-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-full bg-gradient-to-br ${agent.avatarBg} text-white text-[10px] font-bold flex items-center justify-center">${agent.initials}</div>
                  <div class="text-[11px]">
                    <div class="font-bold text-navy-900">${escapeHtml(agent.name)}</div>
                    <div class="text-slate-400">${escapeHtml(agent.renCode)}</div>
                  </div>
                </div>
                <span class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">${escapeHtml(p.completion)}</span>
              </div>

              <div class="grid grid-cols-12 gap-2">
                <button onclick="openProjectModal('${p.id}')" class="col-span-8 py-2.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5">
                  <i data-lucide="eye" class="w-3.5 h-3.5 text-emerald-400"></i>
                  <span>${t("btnViewDetails")}</span>
                </button>
                <button onclick="toggleCompare('${p.id}')" class="col-span-4 py-2.5 px-2 rounded-xl border text-xs font-bold transition-colors ${
                  inCompare
                    ? "bg-amber-100 border-amber-400 text-amber-900"
                    : "bg-white border-slate-200 text-slate-700 hover:border-navy-900"
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

  // --- Neighbourhood Area Guides ---
  function renderAreaGuides() {
    const grid = document.getElementById("area-guides-grid");
    grid.innerHTML = DATA.areaGuides
      .map(
        (g) => `
      <div onclick="filterByGuideArea('${escapeHtml(g.area)}')" class="guide-card relative h-52 rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200 bg-navy-900">
        <img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.area)}" class="guide-photo w-full h-full object-cover opacity-80" onerror="this.style.display='none'" />
        <div class="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/40 to-transparent"></div>
        <div class="absolute top-3 right-3 flex gap-1.5">
          <span class="px-2.5 py-1 rounded-full bg-white/90 text-navy-900 text-[11px] font-bold">${escapeHtml(g.avgPsf)}/psf</span>
          <span class="px-2.5 py-1 rounded-full bg-emerald-500 text-navy-950 text-[11px] font-extrabold">${escapeHtml(g.avgYield)} ROI</span>
        </div>
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <h3 class="text-lg font-extrabold group-hover:text-emerald-300 transition-colors">${escapeHtml(pick(g, "titleEn", "titleZh"))}</h3>
          <p class="text-xs text-slate-200 mt-1 line-clamp-2">${escapeHtml(pick(g, "descEn", "descZh"))}</p>
        </div>
      </div>`
      )
      .join("");
  }

  // --- Condo Comparison Tool ---
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

    const rows = [
      {
        label: state.lang === "zh" ? "区域 & 类别" : "Area & Category",
        render: (p) => `<span class="font-semibold text-navy-900">${escapeHtml(p.area)}</span> · <span class="text-xs text-slate-500">${escapeHtml(p.category)}</span>`
      },
      {
        label: state.lang === "zh" ? "起步总价" : "Entry Price",
        render: (p) => `<span class="font-extrabold text-navy-900">${formatRM(p.priceFrom)}</span>`
      },
      {
        label: state.lang === "zh" ? "平均实测尺价" : "Avg Transacted PSF",
        render: (p) => `RM ${p.psfAvg} / sqft`
      },
      {
        label: state.lang === "zh" ? "预估毛租金回报" : "Est. Gross Yield",
        render: (p) => `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">${p.rentalYield}%</span>`
      },
      {
        label: state.lang === "zh" ? "地铁 / RTS 实测距离" : "MRT / RTS Distance",
        render: (p) => `${p.mrtDistanceM}m (${escapeHtml(p.mrtStation)})`
      },
      {
        label: state.lang === "zh" ? "物业管理费" : "Maintenance Fee",
        render: (p) => `RM ${p.maintenancePsf.toFixed(2)} psf`
      },
      {
        label: state.lang === "zh" ? "宠物友好 / 外籍资格" : "Pets / Foreigner",
        render: (p) =>
          `${p.petFriendly ? "🐾 Allowed" : "No Pets"} · ${p.foreignerEligible ? "🌏 Foreigner OK" : "Local / >RM1M"}`
      },
      {
        label: state.lang === "zh" ? "楼盘定位标签" : "Key Highlight",
        render: (p) => `<span class="text-xs text-slate-700">${escapeHtml(pick(p, "badgeEn", "badgeZh"))}</span>`
      }
    ];

    wrapper.innerHTML = `
      <table class="w-full text-left border-collapse min-w-[640px]">
        <thead>
          <tr class="bg-navy-900 text-white">
            <th class="p-4 text-xs font-bold uppercase tracking-wider w-48">${state.lang === "zh" ? "对比项目" : "Metric"}</th>
            ${selected
              .map(
                (p) => `
              <th class="p-4">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <div class="text-sm font-extrabold">${escapeHtml(p.name)}</div>
                    <div class="text-[11px] text-emerald-400 font-normal">${p.verifiedUnits.length} ${state.lang === "zh" ? "套认证单位" : "Verified Units"}</div>
                  </div>
                  <button onclick="openProjectModal('${p.id}')" class="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-semibold">
                    ${state.lang === "zh" ? "查看" : "View"}
                  </button>
                </div>
              </th>`
              )
              .join("")}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white text-sm">
          ${rows
            .map(
              (r) => `
            <tr class="hover:bg-slate-50/80">
              <td class="p-4 font-bold text-xs text-slate-600 bg-slate-50/60">${r.label}</td>
              ${selected.map((p) => `<td class="p-4 text-xs sm:text-sm">${r.render(p)}</td>`).join("")}
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  // --- Mortgage, DSR & Malaysian MOT Stamp Duty Calculator ---
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
    cfEl.className = cashflow >= 0 ? "text-emerald-300" : "text-amber-300";
  }

  // --- Specialists Roster ---
  function renderAgents() {
    const grid = document.getElementById("agents-grid");
    grid.innerHTML = DATA.agents
      .map((a) => {
        const isSelected = state.activeAgentId === a.id;
        return `
          <div class="bg-white rounded-2xl border ${isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200"} p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div class="flex items-center gap-3.5 mb-3">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${a.avatarBg} text-white font-extrabold flex items-center justify-center shadow-md">${a.initials}</div>
                <div>
                  <h3 class="font-extrabold text-navy-900 flex items-center gap-2">
                    <span>${escapeHtml(a.name)}</span>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">${escapeHtml(a.renCode)}</span>
                  </h3>
                  <p class="text-xs text-emerald-700 font-semibold">${escapeHtml(pick(a, "roleEn", "roleZh"))}</p>
                </div>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed mb-4">${escapeHtml(pick(a, "bioEn", "bioZh"))}</p>
              <div class="grid grid-cols-3 gap-2 text-center bg-slate-50 rounded-xl p-2.5 mb-4 text-xs">
                <div><div class="font-extrabold text-navy-900">${a.dealsClosed}</div><div class="text-[10px] text-slate-500">${state.lang === "zh" ? "累计成交" : "Deals"}</div></div>
                <div><div class="font-extrabold text-emerald-600">${a.avgReplyMin} min</div><div class="text-[10px] text-slate-500">${state.lang === "zh" ? "响应速度" : "Avg Reply"}</div></div>
                <div><div class="font-extrabold text-navy-900">${a.verifiedUnitsCount}</div><div class="text-[10px] text-slate-500">${state.lang === "zh" ? "负责房源" : "Listings"}</div></div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button onclick="selectAgentPortfolio('${a.id}')" class="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-900 text-xs font-bold transition-colors">
                ${state.lang === "zh" ? "查看负责楼盘" : "View Listings"}
              </button>
              <button onclick="openLeadModal('Direct Consultation with ${escapeHtml(a.name)} (${escapeHtml(a.renCode)})')" class="py-2.5 px-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors">
                WhatsApp
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
          <div class="text-xs text-emerald-700 font-bold">${escapeHtml(agent.areas.join(" · "))} · ${escapeHtml(agent.languages.join(" / "))}</div>
          <h4 class="text-lg font-extrabold text-navy-900">${escapeHtml(agent.name)} — ${state.lang === "zh" ? "主理认证房源列表" : "Active Curated Developments"}</h4>
        </div>
        <button onclick="openLeadModal('Direct Inquiry to ${escapeHtml(agent.name)}')" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-bold text-xs">
          ${state.lang === "zh" ? "联系顾问看房" : "Contact Specialist"}
        </button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${ownedProjects
          .map(
            (p) => `
          <div class="bg-slate-50 rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
            <div>
              <div class="text-sm font-extrabold text-navy-900">${escapeHtml(p.name)}</div>
              <div class="text-xs text-slate-500">${escapeHtml(p.area)} &middot; ${p.verifiedUnits.length} ${state.lang === "zh" ? "套认证单位" : "Verified Units"} &middot; ${formatRM(p.priceFrom)}+</div>
            </div>
            <button onclick="openProjectModal('${p.id}')" class="px-3 py-1.5 rounded-lg bg-navy-900 text-white text-xs font-bold hover:bg-navy-800">
              ${state.lang === "zh" ? "查看" : "View"}
            </button>
          </div>`
          )
          .join("")}
      </div>
    `;
  }

  // --- Architectural SVG Floor Plan Schematic ---
  function renderFloorPlanSvg(fp) {
    return `
      <svg viewBox="0 0 320 170" class="w-full h-36 bg-white rounded-xl border border-slate-200 mb-3" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="300" height="150" fill="#f8fafc" stroke="#0f172a" stroke-width="2" />
        <rect x="10" y="10" width="120" height="85" fill="#ecfdf5" stroke="#334155" stroke-width="1.2" />
        <text x="70" y="55" font-size="10" font-weight="bold" text-anchor="middle" fill="#065f46">Living &amp; Dining</text>
        <rect x="130" y="10" width="90" height="85" fill="#ffffff" stroke="#334155" stroke-width="1.2" />
        <text x="175" y="55" font-size="10" font-weight="bold" text-anchor="middle" fill="#0f172a">Master Suite</text>
        <rect x="220" y="10" width="90" height="55" fill="#ffffff" stroke="#334155" stroke-width="1.2" />
        <text x="265" y="40" font-size="9" text-anchor="middle" fill="#334155">${fp.beds > 1 ? "Bedroom 2" : "Study / Flex"}</text>
        <rect x="220" y="65" width="90" height="30" fill="#f1f5f9" stroke="#334155" stroke-width="1.2" />
        <text x="265" y="83" font-size="9" text-anchor="middle" fill="#475569">${fp.baths} Bath(s)</text>
        <rect x="10" y="95" width="180" height="65" fill="#fffbeb" stroke="#334155" stroke-width="1.2" />
        <text x="100" y="130" font-size="10" font-weight="bold" text-anchor="middle" fill="#92400e">Kitchen &amp; Yard</text>
        <rect x="190" y="95" width="120" height="65" fill="#eff6ff" stroke="#334155" stroke-width="1.2" />
        <text x="250" y="130" font-size="10" text-anchor="middle" fill="#1e40af">Sky Balcony (${fp.sqft} sqft)</text>
      </svg>
    `;
  }

  // --- Property Detail Modal ---
  window.openProjectModal = function (projectId) {
    state.activeProjectId = projectId;
    state.activeModalTab = "overview";
    state.activePhotoIdx = 0;
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
      el.classList.toggle("ring-emerald-400", i === idx);
      el.classList.toggle("opacity-60", i !== idx);
    });
  };

  function renderProjectModalContent() {
    const p = findProject(state.activeProjectId);
    if (!p) return;
    const agent = findAgent(p.specialistId);
    const pros = pick(p, "prosEn", "prosZh");
    const cons = pick(p, "consEn", "consZh");

    const tabs = [
      { id: "overview", label: state.lang === "zh" ? "楼盘详情与真实测评" : "Overview & Highlights" },
      { id: "units", label: `${state.lang === "zh" ? "在售认证单位" : "Verified Units"} (${p.verifiedUnits.length})` },
      { id: "floorplans", label: state.lang === "zh" ? "户型图与尺价" : "Floor Plans" },
      { id: "faq", label: `${state.lang === "zh" ? "买家常见问答" : "Buyer Q&A"} (${p.faqs.length})` }
    ];

    let bodyHtml = "";
    if (state.activeModalTab === "overview") {
      bodyHtml = `
        <p class="text-sm text-slate-700 leading-relaxed mb-5">${escapeHtml(pick(p, "summaryEn", "summaryZh"))}</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div class="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
            <h4 class="font-extrabold text-emerald-900 text-sm mb-2.5">✓ ${
              state.lang === "zh" ? "核心亮点与买点" : "Why Buyers Love This Project"
            }</h4>
            <ul class="space-y-2 text-xs text-emerald-950">${pros.map((item) => `<li>• ${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
          <div class="rounded-2xl bg-amber-50 border border-amber-200 p-4">
            <h4 class="font-extrabold text-amber-900 text-sm mb-2.5">⚠ ${
              state.lang === "zh" ? "看房前需注意" : "Good to Know Before Buying"
            }</h4>
            <ul class="space-y-2 text-xs text-amber-950">${cons.map((item) => `<li>• ${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </div>
        <div class="rounded-2xl bg-slate-50 border border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div><span class="text-slate-400 block">MRT / RTS</span><strong class="text-navy-900">${p.mrtDistanceM}m</strong></div>
          <div><span class="text-slate-400 block">${state.lang === "zh" ? "物业管理费" : "Maintenance"}</span><strong class="text-navy-900">RM ${p.maintenancePsf.toFixed(2)} psf</strong></div>
          <div><span class="text-slate-400 block">${state.lang === "zh" ? "交房时间" : "Completion"}</span><strong class="text-navy-900">${escapeHtml(p.completion)}</strong></div>
          <div><span class="text-slate-400 block">${state.lang === "zh" ? "预估租金回报" : "Est. Yield"}</span><strong class="text-emerald-600">${p.rentalYield}%</strong></div>
        </div>
      `;
    } else if (state.activeModalTab === "units") {
      bodyHtml = `
        <div class="mb-3 text-xs text-slate-600 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <strong>${state.lang === "zh" ? "团队真房源保证：" : "Verified Exclusives:"}</strong> ${
            state.lang === "zh"
              ? `以下在售单位均由主理顾问 ${escapeHtml(agent.name)} 实勘核实价格与钥匙状态，实时更新。`
              : `Every unit below is directly verified by ${escapeHtml(agent.name)} with live availability.`
          }
        </div>
        <div class="space-y-3">
          ${p.verifiedUnits
            .map(
              (u) => `
            <div class="rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400 transition-colors">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-navy-900 text-emerald-400">${escapeHtml(u.code)}</span>
                  <span class="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">${escapeHtml(pick(u, "tagEn", "tagZh"))}</span>
                </div>
                <div class="font-extrabold text-navy-900 text-sm">${escapeHtml(u.layout)} &middot; ${escapeHtml(u.level)}</div>
                <div class="text-xs text-slate-500">${escapeHtml(u.furnishing)} &middot; RM ${u.psf} psf</div>
              </div>
              <div class="text-left sm:text-right">
                <div class="text-lg font-extrabold text-emerald-700">${formatRM(u.price)}</div>
                <button onclick="openLeadModal('${escapeHtml(p.name)} — Unit ${escapeHtml(u.code)} Private Viewing')" class="mt-1 px-3.5 py-1.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold">
                  ${state.lang === "zh" ? "预约看房 / 查实盘" : "Book Viewing"}
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
            <div class="rounded-2xl border border-slate-200 p-4 bg-slate-50">
              ${renderFloorPlanSvg(fp)}
              <div class="font-extrabold text-navy-900 text-sm mb-1">${escapeHtml(fp.type)}</div>
              <div class="text-xs text-slate-500 mb-3">${fp.sqft} sqft &middot; ${fp.beds} Bed &middot; ${fp.baths} Bath &middot; Est. Rent: <strong class="text-emerald-700">${escapeHtml(fp.estRent)}</strong></div>
              <div class="flex items-center justify-between pt-2 border-t border-slate-200">
                <span class="font-extrabold text-navy-900">${escapeHtml(fp.price)}</span>
                <button onclick="openLeadModal('${escapeHtml(p.name)} — ${escapeHtml(fp.type)} High-Res Floor Plan PDF')" class="text-xs font-bold text-emerald-700 hover:underline">
                  ${state.lang === "zh" ? "索取高清 PDF 户型图 →" : "Get Floor Plan PDF →"}
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
            <div class="rounded-2xl border border-slate-200 p-4">
              <div class="font-bold text-navy-900 text-sm mb-1.5">Q: ${escapeHtml(pick(f, "qEn", "qZh"))}</div>
              <p class="text-xs text-slate-600 leading-relaxed">A: ${escapeHtml(pick(f, "aEn", "aZh"))}</p>
            </div>`
            )
            .join("")}
        </div>
      `;
    }

    document.getElementById("project-modal-content").innerHTML = `
      <!-- Photo Gallery Header -->
      <div class="relative h-64 sm:h-72 bg-gradient-to-r ${p.gradient} text-white overflow-hidden">
        <img id="main-gallery-photo" src="${escapeHtml(p.images[state.activePhotoIdx])}" alt="${escapeHtml(p.name)}" class="w-full h-full object-cover" onerror="this.style.display='none'" />
        <div class="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/35 to-black/30"></div>

        <button onclick="closeProjectModal()" class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>

        <div class="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div class="text-xs font-bold text-emerald-300 mb-1">${escapeHtml(p.area)} &middot; ${escapeHtml(p.category)} &middot; ${escapeHtml(p.tenure)}</div>
            <h3 class="text-2xl sm:text-3xl font-extrabold">${escapeHtml(p.name)}</h3>
            <div class="text-xs text-slate-200 mt-1">From ${formatRM(p.priceFrom)} &middot; Avg RM ${p.psfAvg} psf &middot; Est. ${p.rentalYield}% Yield</div>
          </div>
          <!-- Gallery Thumbnails -->
          <div class="flex gap-1.5">
            ${p.images
              .map(
                (img, idx) => `
              <button onclick="selectModalPhoto(${idx})" class="gallery-thumb w-12 h-9 rounded-lg overflow-hidden border border-white/40 transition-all ${
                  idx === state.activePhotoIdx ? "ring-2 ring-emerald-400" : "opacity-65 hover:opacity-100"
                }">
                <img src="${escapeHtml(img)}" alt="" class="w-full h-full object-cover" />
              </button>`
              )
              .join("")}
          </div>
        </div>
      </div>

      <div class="border-b border-slate-200 px-5 sm:px-6 flex gap-5 overflow-x-auto bg-slate-50">
        ${tabs
          .map(
            (tb) => `
          <button onclick="switchModalTab('${tb.id}')" class="py-3 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
              state.activeModalTab === tb.id
                ? "border-emerald-500 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-navy-900"
            }">${tb.label}</button>`
          )
          .join("")}
      </div>

      <div class="p-5 sm:p-6 max-h-[55vh] overflow-y-auto thin-scroll">${bodyHtml}</div>

      <div class="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5 text-xs">
          <div class="w-8 h-8 rounded-full bg-gradient-to-br ${agent.avatarBg} text-white font-bold flex items-center justify-center">${agent.initials}</div>
          <div>
            <div class="font-bold text-navy-900">${escapeHtml(agent.name)} (${escapeHtml(agent.renCode)})</div>
            <div class="text-slate-500">${state.lang === "zh" ? "专属楼盘顾问 · 平均回复" : "Dedicated Specialist · Avg reply"} ${agent.avgReplyMin} min</div>
          </div>
        </div>
        <button onclick="openLeadModal('${escapeHtml(p.name)} — Viewing &amp; Floor Plan PDF')" class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-extrabold text-xs shadow-md">
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
      <div class="font-extrabold text-sm text-emerald-800">✓ 预约与资料请求已收到！</div>
      <p>感谢 <strong>${escapeHtml(name)}</strong>！关于 <em>"${escapeHtml(ctx)}"</em> 的高清户型图与最新单位价单正在发送至您的 WhatsApp（${escapeHtml(phone)}）。</p>
      <div class="p-3 rounded-xl bg-white border border-emerald-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br ${assignedAgent.avatarBg} text-white font-bold flex items-center justify-center shrink-0">${assignedAgent.initials}</div>
        <div>
          <div class="font-bold text-navy-900">专属对接顾问：${escapeHtml(assignedAgent.name)} (${escapeHtml(assignedAgent.renCode)})</div>
          <div class="text-slate-500">预计 ${assignedAgent.avgReplyMin} 分钟内与您联系安排看房</div>
        </div>
      </div>
      <button onclick="closeLeadModal()" class="w-full py-2 rounded-lg bg-emerald-600 text-white font-bold">好的 / 完成</button>`
        : `
      <div class="font-extrabold text-sm text-emerald-800">✓ Request Confirmed!</div>
      <p>Thank you, <strong>${escapeHtml(name)}</strong>! The brochure &amp; unit availability for <em>"${escapeHtml(ctx)}"</em> are on their way to your WhatsApp (${escapeHtml(phone)}).</p>
      <div class="p-3 rounded-xl bg-white border border-emerald-200 flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-gradient-to-br ${assignedAgent.avatarBg} text-white font-bold flex items-center justify-center shrink-0">${assignedAgent.initials}</div>
        <div>
          <div class="font-bold text-navy-900">Assigned Specialist: ${escapeHtml(assignedAgent.name)} (${escapeHtml(assignedAgent.renCode)})</div>
          <div class="text-slate-500">Typically replies within ${assignedAgent.avgReplyMin} mins</div>
        </div>
      </div>
      <button onclick="closeLeadModal()" class="w-full py-2 rounded-lg bg-emerald-600 text-white font-bold">Done</button>`;
  };

  // --- Bind Events & Init ---
  function bindEvents() {
    document.getElementById("search-input").addEventListener("input", (e) => {
      state.search = e.target.value;
      renderProjects();
    });
    document.getElementById("filter-area").addEventListener("change", (e) => {
      state.area = e.target.value;
      renderProjects();
    });
    document.getElementById("filter-budget").addEventListener("change", (e) => {
      state.maxBudget = Number(e.target.value);
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
    updateCalculators();
    updateCompareCounters();
    setLanguage("zh");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
