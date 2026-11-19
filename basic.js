// PrimeVerse Ipoh - Basic Package Demo Logic (3-Theme Switcher + Rule 1/2/3 UI)

(function () {
  const DATA = window.APP_DATA;

  const BASIC_LISTINGS = [
    {
      id: "ex-bot-01",
      titleEn: "2-Storey Terrace @ Botani Seri Meranti (Example)",
      titleZh: "翠林城 Botani Seri Meranti 双层排屋 (Example)",
      area: "Bandar Seri Botani",
      type: "Landed",
      tenure: "Freehold",
      price: 538000,
      isNew: true,
      specs: "4 Bed · 3 Bath · 20'x70'",
      furnishingEn: "Extended Kitchen & Auto Gate",
      furnishingZh: "厨房已扩建 · 配自动门",
      descEn: "Well-maintained freehold double-storey terrace inside a 24-hour guarded enclave in Bandar Seri Botani. 3 mins to Botani Eco Park, Lotus's & SJK(C) Botani.",
      descZh: "位于翠林城 24 小时保安围篱街区，屋况保养极佳、厨房已扩建。3 分钟直达生态公园、Lotus's 与华小。",
      image: "./images/botani-exterior.jpg",
      agentId: "jason-leong"
    },
    {
      id: "ex-ue-01",
      titleEn: "Pool-View Condo @ Upper East Tiger Lane (Example)",
      titleZh: "老虎巷 Upper East 高楼泳池景公寓 (Example)",
      area: "Tiger Lane",
      type: "Condo",
      tenure: "Freehold",
      price: 528000,
      isNew: false,
      specs: "3 Bed · 2 Bath · 1,162 sqft",
      furnishingEn: "Fully Furnished w/ Built-ins",
      furnishingZh: "全套精装家私",
      descEn: "High-floor Block B unit overlooking the Olympic-size pool at Ipoh's prestigious Tiger Lane. Walking/5-min drive to Royal Perak Golf Club & KPJ Ipoh.",
      descZh: "坐落怡保名门地段 Tiger Lane，Block B 高楼层俯瞰奥林匹克泳池，5 分钟直达皇家高尔夫球场与 KPJ 专科医院。",
      image: "./images/tigerlane-condo.jpg",
      agentId: "michelle-chong"
    },
    {
      id: "ex-hv-01",
      titleEn: "Lakefront Condo @ The Haven Tambun (Example)",
      titleZh: "打扪 The Haven 山湖景观度假公寓 (Example)",
      area: "Tambun / Sunway",
      type: "Condo",
      tenure: "Leasehold",
      price: 485000,
      isNew: false,
      specs: "2+1 Bed · 2 Bath · 1,140 sqft",
      furnishingEn: "Resort Furnished (Lake View)",
      furnishingZh: "度假风全精装 · 看天然湖景",
      descEn: "Scenic lake and limestone hill views in Acacia Tower. Ideal for serene retirement living or weekend homestay investment next to Lost World of Tambun.",
      descZh: "Acacia 楼栋直望天然湖泊与石灰岩山景，毗邻双威温泉乐园与双威医疗中心，退休自住或短租回报俱佳。",
      image: "./images/haven-aerial.jpg",
      agentId: "kenny-yeoh"
    },
    {
      id: "ex-cg-01",
      titleEn: "Refurbished 2-Storey @ Canning Garden (Example)",
      titleZh: "桂和园 Canning Garden 现代翻新双层排屋 (Example)",
      area: "Canning / Ipoh Garden",
      type: "Landed",
      tenure: "Freehold",
      price: 560000,
      isNew: false,
      specs: "4 Bed · 3 Bath · 22'x70'",
      furnishingEn: "Newly Tiled, Rewired & Modern Kitchen",
      furnishingZh: "全屋翻新地砖电线 · 现代厨房",
      descEn: "Move-in ready refurbished terrace house in the heart of Ipoh. 3 mins to AEON Kinta City, Pantai Hospital, and Ipoh's famous Canning dim sum & cafes.",
      descZh: "全屋全新翻新免大改，3 分钟内覆盖 AEON Kinta City、班台医院与桂和园美食圈，永久地契零管理费。",
      image: "./images/canning-terrace.jpg",
      agentId: "michelle-chong"
    },
    {
      id: "ex-mr-01",
      titleEn: "Gated Superlink 24'x75' @ Meru Desa Park (Example)",
      titleZh: "Meru Desa Park 24x75 围篱超排大宅 (Example)",
      area: "Meru Valley",
      type: "Landed",
      tenure: "Freehold",
      price: 598000,
      isNew: false,
      specs: "4+1 Bed · 4 Bath · 24'x75'",
      furnishingEn: "Kitchen Cabinets + Clubhouse Access",
      furnishingZh: "配厨柜与居民会所泳池",
      descEn: "Spacious guarded superlink home 3 minutes from Tenby International School, Mydin Mall, and the North-South Highway toll.",
      descZh: "24x75 宽敞超排户型，24 小时保安与会所配套，3 分钟直达 Tenby 国际学校与南北大道入口。",
      image: "./images/meru-superlink.jpg",
      agentId: "kenny-yeoh"
    },
    {
      id: "ex-mh-01",
      titleEn: "3-Bed Condo @ Manhattan Station 18 (Example)",
      titleZh: "Station 18 Manhattan 公寓三房单位 (Example)",
      area: "Station 18",
      type: "Condo",
      tenure: "Freehold",
      price: 338000,
      isNew: true,
      specs: "3 Bed · 2 Bath · 1,033 sqft",
      furnishingEn: "Fully Furnished (Waterpark Pool)",
      furnishingZh: "全套家私 · 带水上乐园泳池",
      descEn: "Affordable freehold 3-bedroom unit at Level 9 overlooking the waterpark pool. 4 mins to AEON Station 18 & Lotus's — easy loan approval for first-time buyers.",
      descZh: "RM33.8万即可入手永久地契三房公寓！靠近 AEON Station 18，月供约 RM1,346，非常适合怡保年轻首购族。",
      image: "./images/manhattan-exterior.jpg",
      agentId: "jason-leong"
    },
    {
      id: "ex-ig-02",
      titleEn: "Single-Storey Corner @ Ipoh Garden (Example)",
      titleZh: "怡保花园 Ipoh Garden 单层角头大屋地排屋 (Example)",
      area: "Canning / Ipoh Garden",
      type: "Landed",
      tenure: "Freehold",
      price: 495000,
      isNew: false,
      specs: "3 Bed · 2 Bath · 3,600 sqft Land",
      furnishingEn: "Large Side Garden · Below RM500k",
      furnishingZh: "超大侧花园屋地 · 50万以下",
      descEn: "Rare single-storey corner terrace with generous side garden under RM500k in central Ipoh Garden — ideal for elderly parents or buyers wanting zero stairs.",
      descZh: "50 万以内罕见单层角头排屋，带 3,600 方尺大屋地，无楼梯设计极适合长辈同住。",
      image: "./images/ipoh-corner-lot.jpg",
      agentId: "michelle-chong"
    },
    {
      id: "ex-mv-02",
      titleEn: "Golf Vista Condo @ Meru Valley Resort (Example)",
      titleZh: "美露谷 Meru Valley 高尔夫球场景公寓 (Example)",
      area: "Meru Valley",
      type: "Condo",
      tenure: "Freehold",
      price: 365000,
      isNew: false,
      specs: "3 Bed · 2 Bath · 1,200 sqft",
      furnishingEn: "Golf Course Balcony View",
      furnishingZh: "阳台直望高尔夫球场绿景",
      descEn: "Quiet, airy golf-resort apartment surrounded by lush fairways and hills in Meru Valley — popular with retirees and out-of-state weekend homeowners.",
      descZh: "环境清幽空气极佳，阳台直望高尔夫球场绿地，深受跨州退休族与居家办公人士喜爱。",
      image: "./images/meru-ecovillage.jpg",
      agentId: "kenny-yeoh"
    }
  ];

  const BLOG_POSTS = [
    {
      id: "ipoh-top-5-areas-2026",
      categoryEn: "Area Guide",
      categoryZh: "买房区域指南",
      readTime: "4 min read",
      date: "Nov 2026",
      image: "./images/botani-ecopark.jpg",
      titleEn: "2026 Ipoh Subsale Guide: Top 5 Most Popular Neighbourhoods for Families",
      titleZh: "2026 怡保买二手房看哪里？最受本地家庭欢迎的 5 大社区盘点",
      excerptEn: "Compare Bandar Seri Botani, Canning Garden, Tiger Lane, Meru Desa Park, and Station 18 by price range, school access, and resale demand.",
      excerptZh: "一次对比翠林城 Botani、桂和园 Canning Garden、Tiger Lane、Meru Desa Park 与 Station 18 的房价区间与配套。",
      bodyEn: `
        <p>When shopping for a subsale home in Ipoh, location determines both daily convenience and long-term resale value. Here is how the top 5 residential pockets compare in 2026:</p>
        <h4>1. Bandar Seri Botani (RM 480k – RM 680k)</h4>
        <p>Ipoh South's most active family township. Buyers love the 24-hour guarded lanes, Eco Park, private hospital, and immediate access to SJK(C) Bandar Seri Botani and international schools.</p>
        <h4>2. Canning Garden &amp; Ipoh Garden East (RM 450k – RM 750k)</h4>
        <p>Central, mature, and walkable to AEON Kinta City, Pantai Hospital, and Ipoh's best eateries. Refurbished freehold terraces here sell quickly.</p>
        <h4>3. Tiger Lane / Thompson (RM 510k – RM 890k for Condos)</h4>
        <p>Prestigious freehold condos like Upper East attract doctors, business owners, and downsizers looking for strict security near Royal Perak Golf Club.</p>
        <h4>4. Meru Desa Park &amp; Meru Valley (RM 365k – RM 850k)</h4>
        <p>Perfect for families attending Tenby International School or retirees wanting tranquil golf-course greenery right beside the North-South Highway.</p>
        <h4>5. Station 18 / Pasir Puteh (RM 320k – RM 450k)</h4>
        <p>High convenience around AEON Station 18 and Lotus's, offering Ipoh's best entry-level freehold homes for young couples.</p>
      `,
      bodyZh: `
        <p>在怡保买二手房（Subsale），选对生活圈决定了居住体验和未来的转手保值能力。以下是 2026 年怡保最受欢迎的 5 个核心社区对比：</p>
        <h4>1. Bandar Seri Botani 翠林城（约 RM48万 – RM68万）</h4>
        <p>怡保南区最具活力的生态围篱大城，自带公园、私立医院与华小/国际学校，双层排屋换房刚需极旺。</p>
        <h4>2. 桂和园 Canning Garden &amp; Ipoh Garden East（约 RM45万 – RM75万）</h4>
        <p>老字号美食与医疗中心集中地，3 分钟可达 AEON Kinta City 与班台医院，翻新后的永久地契排屋保值力顶尖。</p>
        <h4>3. Tiger Lane 老虎巷（公寓约 RM51万 – RM89万）</h4>
        <p>传统高尚名门区，低密度豪华公寓如 Upper East 深受医生、企业主及注重安保的改善买家青睐。</p>
        <h4>4. Meru Desa Park &amp; Meru Valley（约 RM36.5万 – RM85万）</h4>
        <p>紧邻 Tenby 国际学校、高尔夫球场与南北大道出口，适合注重清幽环境与跨州出行的家庭。</p>
        <h4>5. Station 18 上环十八（约 RM32万 – RM45万）</h4>
        <p>商业配套齐全，RM33万左右即可入手带泳池设施的三房永久地契公寓，首购门槛最低。</p>
      `
    },
    {
      id: "botani-vs-meru",
      categoryEn: "Comparison",
      categoryZh: "社区横评",
      readTime: "3 min read",
      date: "Nov 2026",
      image: "./images/meru-superlink.jpg",
      titleEn: "Bandar Seri Botani vs Meru Desa Park: Which Guarded Township Fits You?",
      titleZh: "Botani 翠林城 vs Meru Desa Park：怡保两大围篱排屋区怎么选？",
      excerptEn: "Both offer modern 24-hour guarded terraces around RM 530k–RM 630k, but serve completely different daily commutes and school needs.",
      excerptZh: "两区预算都在 RM53万–RM63万左右，同样主打保安围篱社区，但学区、交通与周边商圈差异很大。",
      bodyEn: `
        <p>Homebuyers comparing guarded double-storey terraces in Ipoh almost always narrow down to <strong>Bandar Seri Botani (South)</strong> and <strong>Meru Desa Park (North)</strong>.</p>
        <ul>
          <li><strong>Choose Bandar Seri Botani</strong> if you want bustling Chinese eateries, Chinese primary school (SJK(C) Botani), and quick access to Station 18 / Simpang Pulai toll.</li>
          <li><strong>Choose Meru Desa Park</strong> if your children attend Tenby International School, you work near government/Meru hubs, or you travel frequently via the North-South Highway northwards.</li>
        </ul>
        <p>In terms of entry price, Botani 20'x70' terraces generally start around RM520k–RM550k, while Meru Desa Park's larger 24'x75' superlinks typically trade around RM590k–RM650k.</p>
      `,
      bodyZh: `
        <p>在怡保寻找 RM50万–RM65万保安围篱双层排屋的买家，最后往往都会在南区的 <strong>Bandar Seri Botani</strong> 和北区的 <strong>Meru Desa Park</strong> 之间二选一。</p>
        <ul>
          <li><strong>选 Botani 翠林城：</strong> 华人餐饮生活氛围浓厚，自带大型公园与翠林城华小，往新邦波赖收费站与南区商场极为方便。</li>
          <li><strong>选 Meru Desa Park：</strong> 孩子就读 Tenby 国际学校或经常跑南北大道北上南下，且偏爱 24'x75' 更大面宽超排与会所设施。</li>
        </ul>
        <p>预算上，Botani 20'x70' 精装二手多在 RM52万–RM55万区间；Meru Desa Park 24'x75' 超排则约 RM59万–RM65万。</p>
      `
    },
    {
      id: "ipoh-subsale-buying-checklist",
      categoryEn: "Buyer Tips",
      categoryZh: "买房干货",
      readTime: "5 min read",
      date: "Oct 2026",
      image: "./images/canning-terrace.jpg",
      titleEn: "Complete Guide to Buying a Subsale House in Ipoh: Valuation, DSR & Legal Fees",
      titleZh: "怡保买二手房（Subsale）完整攻略：银行估价、DSR 薪水门槛与印花税怎么算？",
      excerptEn: "Avoid cash top-up surprises! Learn how to check bank valuation before paying earnest deposit and estimate your MOT & lawyer fees.",
      excerptZh: "下订前先查银行估价才不会多掏现金！带你搞懂怡保 RM35万–RM55万房子需要多少头期、律师费与月薪条件。",
      bodyEn: `
        <p>Unlike buying a brand-new developer project, subsale purchases require checking three critical numbers before signing the booking form:</p>
        <h4>1. Bank Valuation Check</h4>
        <p>Always ask your Ipoh agent to verify the indicative bank valuation with at least two banks. If a house is priced at RM550,000 but valued at RM500,000, the 90% loan only covers RM450,000 (meaning RM100,000 downpayment instead of RM55,000).</p>
        <h4>2. Realistic Ipoh DSR Qualification</h4>
        <p>For a RM480,000 home at 90% loan (35 years, 4.0%), monthly installment is roughly <strong>RM1,913</strong>. With zero other loans, a household income around <strong>RM2,800–RM3,200</strong> is typically sufficient.</p>
        <h4>3. Upfront Cash Needed</h4>
        <p>Prepare 10% downpayment + roughly 3%–4% for MOT stamp duty and SPA/loan legal fees (first-time buyers may enjoy stamp duty exemptions depending on current Malaysia Budget incentives).</p>
      `,
      bodyZh: `
        <p>买二手房不像买发展商新盘那样通常免律师费，下定金（Booking Fee）前一定要先算清楚这 3 笔数字：</p>
        <h4>1. 先查银行估价（Bank Valuation）</h4>
        <p>签 Offer Letter 前，务必让顾问向至少两家银行核实估价。如果屋主卖 RM55万但银行只估 RM50万，9 成贷款只会批 RM45万，意味着你要自掏 RM10万差额现金。</p>
        <h4>2. 怡保真实 DSR 薪水参考</h4>
        <p>以 RM48万二手排屋贷 9 成 35 年（4.0%）为例，月供约 <strong>RM1,913</strong>；若无其他车贷，个人或夫妻联名净月入约 <strong>RM2,800–RM3,200</strong> 即有机会获批。</p>
        <h4>3. 预备现金（头期 + 律师印花税）</h4>
        <p>一般需准备 10% 头期款 + 约 3%–4% 律师费及 MOT 印花税（首次置业可咨询最新印花税减免政策）。</p>
      `
    },
    {
      id: "tambun-resort-homestay-roi",
      categoryEn: "Investment",
      categoryZh: "投资分析",
      readTime: "4 min read",
      date: "Oct 2026",
      image: "./images/tambun-lake.jpg",
      titleEn: "Can Ipoh Resort Condos Like The Haven Generate Good Homestay & Medical Rental Yields?",
      titleZh: "买怡保度假公寓（如 The Haven / Sunway 一带）做民宿或医院旁长租划算吗？",
      excerptEn: "Why Tambun & Sunway City Ipoh continue to draw weekend KL/SG tourists and medical staff tenants in 2026.",
      excerptZh: "拆解打扪温泉乐园与新建双威医疗中心带来的双轮租客需求，实算二手 RM48万单位真实回酬。",
      bodyEn: `
        <p>Ipoh's domestic tourism boom and the expansion of healthcare infrastructure around Sunway City Ipoh have turned Tambun into a standout rental pocket.</p>
        <p>Residences like <strong>The Haven Lakeside Residences</strong> benefit from two distinct tenant streams: weekend holidaymakers visiting Lost World of Tambun and outstation families/doctors seeking calm long-term accommodation near Sunway Medical Centre Ipoh.</p>
        <p>At a subsale entry price near RM485,000, well-furnished 2+1 bedroom units routinely achieve gross yields of <strong>6.0%–6.8%</strong> when priced competitively.</p>
      `,
      bodyZh: `
        <p>受惠于怡保周末旅游人潮以及双威城市（Sunway City Ipoh）医疗与商业配套扩张，打扪 Tambun 一带已成为怡保极少见同时具备“旅游短租 + 医护刚需长租”双引擎的板块。</p>
        <p>以 <strong>The Haven Lakeside Residences</strong> 为例，二手约 RM48.5万左右的 2+1 房单位若做好全精装配置，旺季民宿配合稳健长租客，毛租金回报率普遍可维持在 <strong>6.0%–6.8%</strong> 区间。</p>
      `
    }
  ];

  const state = {
    lang: "en",
    theme: localStorage.getItem("pv_theme") || "a",
    search: "",
    area: "all",
    type: "all",
    maxBudget: 99999999,
    viewedIds: new Set()
  };

  function formatRM(num) {
    return "RM " + Math.round(num).toLocaleString("en-US");
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function pick(obj, enKey, zhKey) {
    return state.lang === "zh" ? obj[zhKey] : obj[enKey];
  }

  function findAgent(id) {
    return DATA.agents.find((a) => a.id === id) || DATA.agents[0];
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  // --- Live 3-Theme Switcher ---
  window.setBasicTheme = function (themeId) {
    state.theme = themeId;
    document.body.setAttribute("data-theme", themeId);
    localStorage.setItem("pv_theme", themeId);

    ["a", "b", "c"].forEach((id) => {
      const btn = document.getElementById("theme-btn-" + id);
      if (!btn) return;
      const active = id === themeId;
      btn.className = active
        ? "px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 bg-white text-slate-900 whitespace-nowrap shadow-sm"
        : "px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-white/10 text-slate-200 hover:bg-white/20 whitespace-nowrap";
    });
  };

  window.setBasicLang = function (lang) {
    state.lang = lang;
    const enBtn = document.getElementById("basic-lang-en");
    const zhBtn = document.getElementById("basic-lang-zh");

    if (lang === "en") {
      enBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md transition-all btn-brand-primary";
      zhBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-600 hover:text-slate-900";
    } else {
      zhBtn.className = "px-2.5 py-1 text-xs font-bold rounded-md transition-all btn-brand-primary";
      enBtn.className = "px-2.5 py-1 text-xs font-semibold rounded-md transition-all text-slate-600 hover:text-slate-900";
    }

    const isZh = lang === "zh";
    document.getElementById("basic-tagline").textContent = isZh
      ? "怡保二手房源与房产部落格网站 (Basic 精简版)"
      : "Ipoh Subsale Listings & Local Property Blog (Example)";
    document.getElementById("nav-listings-lbl").textContent = isZh ? "怡保房源列表" : "Property Listings";
    document.getElementById("nav-blog-lbl").textContent = isZh ? "怡保买房部落格" : "Ipoh Property Blog";
    document.getElementById("nav-team-lbl").textContent = isZh ? "顾问团队" : "Our Team";
    document.getElementById("btn-wa-lbl").textContent = isZh ? "WhatsApp 咨询" : "WhatsApp Us";
    document.getElementById("basic-hero-badge").textContent = isZh
      ? "Basic 精简版方案 · 房源展示 + SEO 部落格文章"
      : "Basic Package Demo · Clean Listings + SEO Blog";
    document.getElementById("basic-hero-title").textContent = isZh
      ? "怡保严选二手房源与本地买房部落格"
      : "Ipoh Subsale Homes & Local Market Blog";
    document.getElementById("basic-hero-sub").textContent = isZh
      ? "清爽直观的经纪/团队官网方案：顾客快速搜房看图，并用本地买房干货文章吸引 Google 自然搜寻流量。"
      : "A simple, fast website for buyers to browse verified Ipoh subsale units and read helpful local neighbourhood guides — easy to maintain and clean on mobile.";
    document.getElementById("basic-listings-heading").textContent = isZh
      ? "套怡保二手在售房源 (Example)"
      : "Ipoh Subsale Listings (Examples)";
    document.getElementById("basic-listings-sub").textContent = isZh
      ? "每一张卡片对应一套独立实盘，点击即可查看照片、户型参数并直接 WhatsApp 联系。"
      : "Individual subsale units across Ipoh — tap any listing to view full photos, specs, and direct WhatsApp inquiry.";
    document.getElementById("basic-blog-heading").textContent = isZh
      ? "怡保买房指南与市场部落格 (Blog)"
      : "Ipoh Real Estate Blog & Buying Guides";
    document.getElementById("basic-blog-sub").textContent = isZh
      ? "用真实解答怡保买家疑问的文章获取 Google 排名，自然导流至你的房源。"
      : "Practical articles answering common Ipoh homebuyer questions to bring organic Google traffic directly to your listings.";
    document.getElementById("basic-team-heading").textContent = isZh
      ? "怡保主理顾问团队 (Example)"
      : "Your Ipoh Property Team (Example)";

    const stickySearch = document.getElementById("basic-sticky-search");
    if (stickySearch) {
      stickySearch.placeholder = isZh
        ? "搜 Botani, Upper East, Haven..."
        : "Search Botani, Upper East, Haven...";
    }
    const stickyLbl = document.getElementById("basic-sticky-lbl");
    if (stickyLbl) stickyLbl.textContent = isZh ? "套" : "Units";

    renderListings();
    renderBlogs();
    renderTeam();
    refreshIcons();
  };

  function syncBasicStickyInputs() {
    const ss = document.getElementById("basic-sticky-search");
    const sa = document.getElementById("basic-sticky-area");
    const st = document.getElementById("basic-sticky-type");
    const sb = document.getElementById("basic-sticky-budget");
    const hs = document.getElementById("basic-search");
    const ha = document.getElementById("basic-area");
    const ht = document.getElementById("basic-type");
    const hb = document.getElementById("basic-budget");

    if (hs && document.activeElement !== hs) hs.value = state.search;
    if (ss && document.activeElement !== ss) ss.value = state.search;
    if (ha) ha.value = state.area;
    if (sa) sa.value = state.area;
    if (ht) ht.value = state.type;
    if (st) st.value = state.type;
    if (hb) hb.value = String(state.maxBudget);
    if (sb) sb.value = String(state.maxBudget);
  }

  window.resetBasicFilters = function () {
    state.search = "";
    state.area = "all";
    state.type = "all";
    state.maxBudget = 99999999;
    syncBasicStickyInputs();
    renderListings();
  };

  function getFilteredListings() {
    const q = state.search.trim().toLowerCase();
    return BASIC_LISTINGS.filter((item) => {
      if (state.area !== "all" && item.area !== state.area) return false;
      if (state.type !== "all" && item.type !== state.type) return false;
      if (item.price > state.maxBudget) return false;
      if (q) {
        const hay = `${item.titleEn} ${item.titleZh} ${item.area} ${item.descEn} ${item.descZh}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderListings() {
    const list = getFilteredListings();
    document.getElementById("basic-count").textContent = list.length;
    const stickyCount = document.getElementById("basic-sticky-count");
    if (stickyCount) stickyCount.textContent = list.length;
    const grid = document.getElementById("basic-listings-grid");

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p class="text-sm font-semibold text-slate-600 mb-3">${
            state.lang === "zh" ? "未找到符合条件的怡保房源" : "No matching Ipoh listings found."
          }</p>
          <button onclick="resetBasicFilters()" class="px-4 py-2 rounded-xl btn-brand-primary text-xs font-bold">${
            state.lang === "zh" ? "重置筛选" : "Reset Filters"
          }</button>
        </div>`;
      return;
    }

    grid.innerHTML = list
      .map((item) => {
        const agent = findAgent(item.agentId);
        const isViewed = state.viewedIds.has(item.id);
        return `
          <article onclick="openListingModal('${item.id}')" class="prop-card rounded-2xl border border-slate-200 overflow-hidden cursor-pointer flex flex-col justify-between shadow-sm">
            <div>
              <div class="relative h-44 bg-slate-200 overflow-hidden">
                <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.titleEn)}" class="card-photo w-full h-full object-cover" onerror="this.style.display='none'" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div class="absolute top-2.5 left-2.5 right-2.5 flex justify-between gap-1.5">
                  <div class="flex items-center gap-1">
                    <span class="px-2 py-0.5 rounded-full ${isViewed ? "bg-slate-400 text-white" : "btn-brand-primary"} text-[10px] font-extrabold">${isViewed ? "Viewed" : "For Sale"}</span>
                    ${item.isNew ? `<span class="px-2 py-0.5 rounded-full badge-price-drop text-[10px] font-bold">New</span>` : ""}
                  </div>
                  <span class="px-2 py-0.5 rounded-full bg-white/95 text-slate-800 text-[10px] font-bold">${escapeHtml(item.tenure)}</span>
                </div>
                <div class="absolute bottom-2.5 left-3 right-3 text-white font-extrabold text-base">
                  ${formatRM(item.price)}
                </div>
              </div>

              <div class="p-3.5">
                <div class="text-[11px] font-bold text-brand-primary mb-0.5">${escapeHtml(item.area)}</div>
                <h3 class="text-sm font-extrabold text-slate-900 leading-snug mb-1.5 line-clamp-2">${escapeHtml(pick(item, "titleEn", "titleZh"))}</h3>
                <div class="text-xs text-slate-500 mb-2">${escapeHtml(item.specs)}</div>
                <div class="text-[11px] text-slate-600 bg-[#F8FAFC] border border-slate-100 rounded-lg px-2.5 py-1.5">${escapeHtml(pick(item, "furnishingEn", "furnishingZh"))}</div>
              </div>
            </div>

            <div class="px-3.5 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span class="text-slate-500 truncate">${escapeHtml(agent.name.replace(" (Example)", ""))}</span>
              <span class="font-bold text-brand-primary shrink-0">${state.lang === "zh" ? "看详情 →" : "View →"}</span>
            </div>
          </article>`;
      })
      .join("");
  }

  function renderBlogs() {
    const grid = document.getElementById("basic-blog-grid");
    grid.innerHTML = BLOG_POSTS.map(
      (post) => `
      <article onclick="openBlogModal('${post.id}')" class="prop-card bg-[#F8FAFC] rounded-2xl border border-slate-200 overflow-hidden cursor-pointer flex flex-col sm:flex-row">
        <div class="sm:w-44 h-44 sm:h-auto shrink-0 bg-slate-200 overflow-hidden">
          <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.titleEn)}" class="card-photo w-full h-full object-cover" onerror="this.style.display='none'" />
        </div>
        <div class="p-4 sm:p-5 flex flex-col justify-between bg-white flex-1">
          <div>
            <div class="flex items-center gap-2 text-[11px] mb-1.5">
              <span class="px-2 py-0.5 rounded badge-accent-soft border font-bold">${escapeHtml(pick(post, "categoryEn", "categoryZh"))}</span>
              <span class="text-slate-400">${escapeHtml(post.date)} &middot; ${escapeHtml(post.readTime)}</span>
            </div>
            <h3 class="text-base font-extrabold text-slate-900 leading-snug mb-2">${escapeHtml(pick(post, "titleEn", "titleZh"))}</h3>
            <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">${escapeHtml(pick(post, "excerptEn", "excerptZh"))}</p>
          </div>
          <div class="mt-3 text-xs font-bold text-brand-primary">${state.lang === "zh" ? "阅读全文 →" : "Read Full Article →"}</div>
        </div>
      </article>`
    ).join("");
  }

  function renderTeam() {
    const grid = document.getElementById("basic-team-grid");
    grid.innerHTML = DATA.agents
      .map(
        (a) => `
      <div class="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-11 h-11 rounded-xl btn-brand-primary font-bold flex items-center justify-center shrink-0">${a.initials}</div>
          <div class="min-w-0">
            <div class="font-extrabold text-sm text-slate-900 truncate">${escapeHtml(a.name)}</div>
            <div class="text-xs text-slate-500 truncate">${escapeHtml(pick(a, "roleEn", "roleZh"))}</div>
            <div class="text-[11px] text-brand-primary font-semibold">${escapeHtml(a.renCode)}</div>
          </div>
        </div>
        <button onclick="openBasicAgentWhatsApp('${a.id}')" class="px-3 py-2 rounded-xl btn-whatsapp text-xs shrink-0">WhatsApp</button>
      </div>`
      )
      .join("");
  }

  // --- #4 Real Pre-filled WhatsApp Launchers (Basic Package) ---
  window.openBasicListingWhatsApp = function (listingId) {
    const item = BASIC_LISTINGS.find((l) => l.id === listingId);
    if (!item || !window.PVConcierge) return;
    const agent = findAgent(item.agentId);
    const agentShort = agent.name.replace(" (Example)", "");
    const title = pick(item, "titleEn", "titleZh");
    const msg =
      state.lang === "zh"
        ? `你好 ${agentShort}，我在 PrimeVerse Ipoh 看到二手房源 [${item.id.toUpperCase()}] ${title}（${formatRM(item.price)} · ${item.area} · ${item.specs}），请问还在售吗？想了解屋况详情或预约看房。`
        : `Hi ${agentShort}, I viewed [${item.id.toUpperCase()}] ${title} (${formatRM(item.price)} · ${item.area} · ${item.specs}) on PrimeVerse Ipoh. Is it still available for viewing?`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      agent,
      eventName: "listing_whatsapp",
      meta: { package: "basic", listingId: item.id, area: item.area, price: item.price, label: title },
      lang: state.lang
    });
  };

  window.openBasicBlogWhatsApp = function (postId) {
    const post = BLOG_POSTS.find((b) => b.id === postId);
    if (!post || !window.PVConcierge) return;
    const title = pick(post, "titleEn", "titleZh");
    const msg =
      state.lang === "zh"
        ? `你好 PrimeVerse Ipoh 团队，我刚阅读了攻略文章《${title}》，想了解文中提到的怡保推荐楼盘与最新在售二手实盘清单。`
        : `Hi PrimeVerse Ipoh team, I just read your guide "${title}" and would like recommendations on available Ipoh subsale units in those areas.`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      eventName: "blog_whatsapp",
      meta: { package: "basic", postId: post.id, label: title },
      lang: state.lang
    });
  };

  window.openBasicAgentWhatsApp = function (agentId) {
    const agent = findAgent(agentId);
    if (!window.PVConcierge) return;
    const agentShort = agent.name.replace(" (Example)", "");
    const msg =
      state.lang === "zh"
        ? `你好 ${agentShort}（${agent.renCode}），我想咨询你在 ${agent.areas.join(" / ")} 负责的怡保二手房源与银行估价。`
        : `Hi ${agentShort} (${agent.renCode}), I'd like to consult you regarding verified subsale homes in ${agent.areas.join(" / ")}, Ipoh.`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      agent,
      eventName: "agent_whatsapp",
      meta: { package: "basic", agentId: agent.id, label: agent.name },
      lang: state.lang
    });
  };

  window.openBasicDirectWhatsApp = function (topic) {
    if (!window.PVConcierge) return;
    const filters = [];
    if (state.area !== "all") filters.push(state.area);
    if (state.type !== "all") filters.push(state.type);
    if (state.maxBudget < 99999999) filters.push((state.lang === "zh" ? "预算 <= " : "Budget <= ") + formatRM(state.maxBudget));
    const filterNote = filters.length ? ` (${filters.join(" · ")})` : "";
    const msg =
      state.lang === "zh"
        ? `你好 PrimeVerse Ipoh，我正在浏览贵团队网站（Basic 版），想咨询「${topic}」${filterNote}。`
        : `Hi PrimeVerse Ipoh, I'm browsing your site regarding "${topic}"${filterNote} and would like to speak with an Ipoh specialist.`;

    window.PVConcierge.launchWhatsApp({
      message: msg,
      eventName: "general_whatsapp",
      meta: { package: "basic", topic, label: topic },
      lang: state.lang
    });
  };

  window.openListingModal = function (id) {
    state.viewedIds.add(id);
    renderListings();
    const item = BASIC_LISTINGS.find((l) => l.id === id);
    if (!item) return;
    const agent = findAgent(item.agentId);
    const title = pick(item, "titleEn", "titleZh");

    document.getElementById("basic-modal-content").innerHTML = `
      <div class="relative h-56 sm:h-64 shrink-0 bg-slate-900 overflow-hidden">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(title)}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/25"></div>
        <button onclick="closeBasicModal()" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <div class="text-xs font-bold text-slate-200">${escapeHtml(item.area)} &middot; ${escapeHtml(item.tenure)}</div>
          <h3 class="text-lg sm:text-2xl font-extrabold">${escapeHtml(title)}</h3>
          <div class="text-lg font-extrabold text-amber-300 mt-0.5">${formatRM(item.price)}</div>
        </div>
      </div>
      <div class="p-4 sm:p-6 overflow-y-auto thin-scroll flex-1 space-y-4 bg-white">
        <div class="grid grid-cols-2 gap-3 text-xs bg-[#F8FAFC] rounded-xl p-3.5 border border-slate-200">
          <div><span class="text-slate-400 block">Specs</span><strong class="text-slate-900">${escapeHtml(item.specs)}</strong></div>
          <div><span class="text-slate-400 block">Condition</span><strong class="text-slate-900">${escapeHtml(pick(item, "furnishingEn", "furnishingZh"))}</strong></div>
        </div>
        <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(pick(item, "descEn", "descZh"))}</p>
      </div>
      <div class="p-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div class="text-xs">
          <div class="font-bold text-slate-900">${escapeHtml(agent.name)}</div>
          <div class="text-slate-500">${escapeHtml(agent.renCode)}</div>
        </div>
        <button onclick="openBasicListingWhatsApp('${item.id}')" class="px-5 py-2.5 rounded-xl btn-whatsapp text-xs">
          ${state.lang === "zh" ? "WhatsApp 预约看房" : "Inquire on WhatsApp"}
        </button>
      </div>`;
    document.getElementById("basic-modal").classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    refreshIcons();
  };

  window.openBlogModal = function (id) {
    const post = BLOG_POSTS.find((b) => b.id === id);
    if (!post) return;
    const title = pick(post, "titleEn", "titleZh");

    document.getElementById("basic-modal-content").innerHTML = `
      <div class="relative h-48 sm:h-56 shrink-0 bg-slate-900 overflow-hidden">
        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(title)}" class="w-full h-full object-cover opacity-85" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-black/25"></div>
        <button onclick="closeBasicModal()" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <div class="text-xs font-bold text-slate-200 mb-1">${escapeHtml(pick(post, "categoryEn", "categoryZh"))} &middot; ${escapeHtml(post.readTime)}</div>
          <h3 class="text-lg sm:text-2xl font-extrabold leading-snug">${escapeHtml(title)}</h3>
        </div>
      </div>
      <div class="p-4 sm:p-6 overflow-y-auto thin-scroll flex-1 blog-prose bg-white">
        ${pick(post, "bodyEn", "bodyZh")}
      </div>
      <div class="p-4 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <span class="text-xs text-slate-600">${state.lang === "zh" ? "想找文中提到的社区房源？" : "Looking for homes mentioned in this guide?"}</span>
        <button onclick="openBasicBlogWhatsApp('${post.id}')" class="px-4 py-2.5 rounded-xl btn-whatsapp text-xs shrink-0">
          ${state.lang === "zh" ? "WhatsApp 咨询顾问" : "WhatsApp Ipoh Agent"}
        </button>
      </div>`;
    document.getElementById("basic-modal").classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    refreshIcons();
  };

  window.closeBasicModal = function () {
    document.getElementById("basic-modal").classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  };

  window.openBasicInquiry = function (ctx) {
    document.getElementById("basic-inq-ctx").value = ctx;
    document.getElementById("basic-inq-form").classList.remove("hidden");
    document.getElementById("basic-inq-done").classList.add("hidden");
    const directLink = document.getElementById("basic-direct-wa-link");
    if (directLink && window.PVConcierge) {
      const msg =
        state.lang === "zh"
          ? `你好 PrimeVerse Ipoh，我想直接咨询「${ctx}」。`
          : `Hi PrimeVerse Ipoh, I would like to inquire directly about: ${ctx}`;
      directLink.href = window.PVConcierge.buildWhatsAppUrl(msg);
    }
    document.getElementById("basic-lead-modal").classList.remove("hidden");
  };

  window.closeBasicInquiry = function () {
    document.getElementById("basic-lead-modal").classList.add("hidden");
  };

  window.submitBasicInquiry = function (e) {
    e.preventDefault();
    const name = document.getElementById("basic-inq-name").value.trim();
    const phone = document.getElementById("basic-inq-phone").value.trim();
    const ctx = document.getElementById("basic-inq-ctx").value;

    const waMsg =
      state.lang === "zh"
        ? `你好 PrimeVerse Ipoh，我是 ${name} (${phone})，刚在官网（Basic 版）提交了咨询「${ctx}」，请发送相关房源资料与安排联系，谢谢！`
        : `Hi PrimeVerse Ipoh, I'm ${name} (${phone}). I just submitted an inquiry for "${ctx}" on your website. Please share the details & viewing slots.`;

    const waUrl = window.PVConcierge ? window.PVConcierge.buildWhatsAppUrl(waMsg) : "https://wa.me/60125082048";
    if (window.PVConcierge) {
      window.PVConcierge.trackLeadEvent("form_lead", {
        package: "basic",
        name,
        phone,
        topic: ctx,
        lang: state.lang
      });
    }

    document.getElementById("basic-inq-form").classList.add("hidden");
    const box = document.getElementById("basic-inq-done");
    box.classList.remove("hidden");
    box.innerHTML =
      state.lang === "zh"
        ? `<div class="font-bold text-emerald-800">✓ 资料已记录，点击下方一键发送 WhatsApp！</div>
           <p class="text-emerald-900/90">顾问将优先跟进 ${escapeHtml(name)}（${escapeHtml(phone)}）关于「${escapeHtml(ctx)}」的请求：</p>
           <div class="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-slate-600 leading-relaxed">${escapeHtml(waMsg)}</div>
           <a href="${waUrl}" target="_blank" rel="noopener noreferrer" onclick="if (window.PVConcierge) window.PVConcierge.trackLeadEvent('form_to_whatsapp', { package: 'basic', topic: document.getElementById('basic-inq-ctx').value })" class="w-full py-2.5 rounded-xl btn-whatsapp text-xs flex items-center justify-center gap-1.5 shadow-sm">
             <span>立即在 WhatsApp 发送消息 &rarr;</span>
           </a>
           <button type="button" onclick="closeBasicInquiry()" class="w-full py-2 rounded-lg bg-white border border-emerald-200 text-slate-700 font-bold text-xs">关闭</button>`
        : `<div class="font-bold text-emerald-800">✓ Details Saved! Tap below to open WhatsApp:</div>
           <p class="text-emerald-900/90">Ready for <strong>${escapeHtml(name)}</strong> (${escapeHtml(phone)}) regarding "${escapeHtml(ctx)}":</p>
           <div class="p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-slate-600 leading-relaxed">${escapeHtml(waMsg)}</div>
           <a href="${waUrl}" target="_blank" rel="noopener noreferrer" onclick="if (window.PVConcierge) window.PVConcierge.trackLeadEvent('form_to_whatsapp', { package: 'basic', topic: document.getElementById('basic-inq-ctx').value })" class="w-full py-2.5 rounded-xl btn-whatsapp text-xs flex items-center justify-center gap-1.5 shadow-sm">
             <span>Open WhatsApp Chat Now &rarr;</span>
           </a>
           <button type="button" onclick="closeBasicInquiry()" class="w-full py-2 rounded-lg bg-white border border-emerald-200 text-slate-700 font-bold text-xs">Done</button>`;
  };

  function initBasicStickyObserver() {
    const heroCard = document.getElementById("basic-hero-search");
    const stickyBar = document.getElementById("basic-sticky-search-bar");
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

  function bindEvents() {
    document.getElementById("basic-search").addEventListener("input", (e) => {
      state.search = e.target.value;
      syncBasicStickyInputs();
      renderListings();
    });
    document.getElementById("basic-area").addEventListener("change", (e) => {
      state.area = e.target.value;
      syncBasicStickyInputs();
      renderListings();
    });
    document.getElementById("basic-type").addEventListener("change", (e) => {
      state.type = e.target.value;
      syncBasicStickyInputs();
      renderListings();
    });
    document.getElementById("basic-budget").addEventListener("change", (e) => {
      state.maxBudget = Number(e.target.value);
      syncBasicStickyInputs();
      renderListings();
    });

    const ss = document.getElementById("basic-sticky-search");
    const sa = document.getElementById("basic-sticky-area");
    const st = document.getElementById("basic-sticky-type");
    const sb = document.getElementById("basic-sticky-budget");
    if (ss) {
      ss.addEventListener("input", (e) => {
        state.search = e.target.value;
        syncBasicStickyInputs();
        renderListings();
      });
    }
    if (sa) {
      sa.addEventListener("change", (e) => {
        state.area = e.target.value;
        syncBasicStickyInputs();
        renderListings();
      });
    }
    if (st) {
      st.addEventListener("change", (e) => {
        state.type = e.target.value;
        syncBasicStickyInputs();
        renderListings();
      });
    }
    if (sb) {
      sb.addEventListener("change", (e) => {
        state.maxBudget = Number(e.target.value);
        syncBasicStickyInputs();
        renderListings();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeBasicModal();
        closeBasicInquiry();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    initBasicStickyObserver();
    setBasicTheme(state.theme);
    setBasicLang("en");
  });
})();
