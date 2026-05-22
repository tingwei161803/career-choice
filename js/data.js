/*
 * Career Compass — 資料層（單一資料來源）
 * 內容整合自 research/ 的深度研究（含 104、levels.fyi、主計總處、商周、HBR 等 ~97 個來源）。
 * 以 window.CC 命名空間掛載，純 <script> 載入，file:// 與本地伺服器皆可用。
 */
(function (global) {
  'use strict';

  /* ---- 兩軸定義 ----
   * axisX：本土(-1) ←→ 國際化(+1)
   * axisY：扁平彈性(-1) ←→ 制度厚重(+1)
   */
  var AXES = {
    x: { neg: '本土', pos: '國際化', label: '在地 ↔ 跨國' },
    y: { neg: '扁平彈性', pos: '制度厚重', label: '草莽 ↔ 科層' }
  };

  /* ---- 四類公司 ---- */
  var COMPANIES = {
    sme: {
      key: 'sme',
      name: '台灣中小企業',
      tag: '練就野蠻生長的「生存力」',
      ability: '生存力',
      abilityFull: '從 0 到 1、無中生有的破局能力',
      color: '#C8643C',          // 土橙
      colorSoft: 'rgba(200,100,60,.16)',
      center: { x: -0.72, y: -0.72 },
      quadrant: '本土・草莽',
      oneLiner: '資源匱乏、JD 模糊、決策看老闆——但這裡能逼出你一個人搞定一條龍的底氣。',
      dimensions: [
        { h: '組織與權責', t: '組織扁平、層級少、沒有完美的 Job Description。今天你是行銷，明天可能就要去談供應鏈。資源極度匱乏，決策速度取決於老闆今天的心情。講究整合通才而非深度專才。' },
        { h: '主管與遴選', t: '老闆要的是「自己人」和「救火隊」。升遷靠的是信任 > 能力——很多人績效漂亮，卻不是老闆的自己人。能活下來的主管，通常具備極強的草莽特質與執行力。' },
        { h: '領導統御', t: '人治色彩濃厚，講人情、講義氣。決策權高度集中於老闆/家族，速度快但隨個人意志波動，接班與老臣張力是常見課題。' },
        { h: '文化與工作型態', t: '步調快、彈性高、官僚少，想法能快速被採納執行；但也常見「裝忙文化」與不給加班費的加班，穩定度受景氣與單一大客戶影響。' }
      ],
      salary: [
        { lv: '基層員工', range: '約 40–70 萬', note: '多數貼近或略低於全國中位數（約 55–58 萬）' },
        { lv: '中階主管', range: '約 70–130 萬', note: '視產業與獲利差距極大，多以年終/績效獎金為主' },
        { lv: '高階經理人', range: '約 120–300 萬+', note: '專業經理人天花板較低；獲利型隱形冠軍可更高' }
      ],
      salaryNote: '普遍缺乏股票選擇權、分紅配股，總報酬落後上市櫃電子業甚多。好缺常走內推、不上人力銀行，檯面薪資偏低估。',
      pros: ['學習面廣、成長快，一人多工累積跨領域實戰', '離決策核心近，努力容易被老闆看見', '彈性大、官僚少，想法能快速被執行', '好老闆/隱形冠軍下人情味濃、向心力強'],
      cons: ['薪酬與福利天花板低，缺乏資本市場報酬', '制度不健全、JD 不清、責任模糊易過勞', '資源分配受老闆主觀與「自己人」邏輯影響', '抗風險能力弱，履歷的品牌背書較弱'],
      fit: '主動積極、抗壓耐操、不怕模糊、喜歡多工與快速變化、想學經營全貌或未來創業接班的人。',
      stageFit: '職涯早期想快速練功、累積全才者最受用。',
      examples: ['上銀科技（隱形冠軍）', '中部精密機械/扣件聚落', '路易莎、八方雲集（上市前）']
    },
    listed: {
      key: 'listed',
      name: '上市櫃公司',
      tag: '精通派系與流程的「組織生存學」',
      ability: '組織政治力',
      abilityFull: '推動龐大科層體系的協調力與借力使力',
      color: '#4A7BA6',          // 鋼藍
      colorSoft: 'rgba(74,123,166,.16)',
      center: { x: -0.72, y: 0.72 },
      quadrant: '本土・科層',
      oneLiner: '簽呈走兩週是常態，組織核心是防錯與合規。看懂局、認清勢，把組織資源變成你的戰果。',
      dimensions: [
        { h: '組織與權責', t: '規章制度疊床架屋，一個簽呈走兩週是常態。組織設計核心不是「創新」而是「防錯」與「合規」。層級明確、分工專精，各部門 KPI 互相牽制，高牆林立。' },
        { h: '主管與遴選', t: '主管通常是「向上管理」的大師。遴選除了基本戰功，更看重政治正確與派系平衡。懂得分擔高層風險、在合規範圍內把事辦成，才是生存王道。' },
        { h: '領導統御', t: '制度化升遷，須提晉升申請、由委員會評估；檯面上重制度，檯面下重向上管理與形象。董事會、股東、各事業群多方制衡。' },
        { h: '文化與工作型態', t: '步調規律、制度成熟、訓練完整、福利齊全、較重 work-life balance。穩定但內耗，半導體龍頭加班壓力大、傳產上市則相對規律。' }
      ],
      salary: [
        { lv: '基層員工', range: '約 60–350 萬+', note: '差距極大：傳產上市 60–80 萬，半導體龍頭中位數逾 200 萬' },
        { lv: '中階主管', range: '約 120–400 萬+', note: '含獎金/分紅/RSU，電子金融業明顯較高' },
        { lv: '高階經理人', range: '約 300 萬–數千萬', note: 'CEO 年薪破千萬比例約 41.3%' }
      ],
      salaryNote: '2024 非主管中位數：聯發科 343.8 萬、瑞昱 324.6 萬、台積電 264.5 萬；上櫃信驊 400.4 萬居冠。依法揭露、可於公開資訊觀測站查證。',
      pros: ['薪酬與總報酬高（含股票分紅）', '制度完整、訓練成熟，履歷有品牌背書', '福利齊全、工作穩定、抗景氣能力強', '升遷管道與輪調機會多'],
      cons: ['流程冗長、簽呈與合規拖慢決策', '分工過細易成「螺絲釘」', 'KPI 互相牽制、政治與派系內耗', '個人彈性與創意空間受限'],
      fit: '擅長制度內運作、懂政治與向上管理、能在分工中做深做精、重視穩定與品牌的人。',
      stageFit: '想穩定高薪、需大公司履歷背書的職涯中段者。',
      examples: ['台積電、聯發科、瑞昱', '信驊、原相、力旺', '長榮海運、和泰汽車']
    },
    mnc: {
      key: 'mnc',
      name: '傳統外商',
      tag: '洗鍊標準化與「國際化」的視野',
      ability: '方法論',
      abilityFull: '建立專業方法論與國際化的個人品牌',
      color: '#2E8B7A',          // 墨綠
      colorSoft: 'rgba(46,139,122,.16)',
      center: { x: 0.72, y: 0.72 },
      quadrant: '國際・矩陣',
      oneLiner: '經典矩陣式組織，你既要向台灣總經理報告，又要對亞太/全球 Functional Head 匯報。台灣是執行與轉譯的角色。',
      dimensions: [
        { h: '組織與權責', t: '經典矩陣式設計、雙線匯報：向台灣總經理（實線、評核）與亞太/全球 Functional Head（虛線、指導）匯報。權力收歸總部，台灣主要是「執行與在地轉譯」。' },
        { h: '主管與遴選', t: '遴選重視 Standard Leadership Model（領導力模型），看重跨文化溝通、合規經營（Compliance），以及如何系統化地帶領團隊。' },
        { h: '領導統御', t: '能力＋年資＋制度契合度並重。在中西文化、總部與在地之間做平衡與翻譯，是主管的日常修煉。' },
        { h: '文化與工作型態', t: 'SOP 完善、訓練紮實（MA 多部門輪調、導師制度）、福利優於勞基法、彈性工時與 WFH 常態，工作穩定度相對高。' }
      ],
      salary: [
        { lv: '新鮮人 / MA', range: '約 90–130 萬', note: 'P&G/Unilever MA 第一年有機會破百萬' },
        { lv: '經理 / 處長', range: '約 250–450 萬', note: '醫藥業務含獎金可更高' },
        { lv: '台灣總經理', range: '約 800–1,500 萬+', note: '視公司規模與績效，含長期獎酬 LTI' }
      ],
      salaryNote: '薪資中上、可預期，底薪＋年終＋績效獎金透明；成長線性、天花板明確（高階才大幅跳升）。MA 輪調制度是頂尖履歷起點。',
      pros: ['制度與訓練成熟，MA/輪調是頂尖履歷起點', '薪資中上且可預期，福利完整', '工作穩定度較高，裁員風險相對低', '國際化視野與跨國協作經驗'],
      cons: ['權力收歸總部，台灣多為執行/轉譯', '矩陣雙線匯報，溝通成本高、決策慢', '薪資成長線性、天花板明確', '在地天花板常止於 Country GM'],
      fit: '重視穩定與制度、擅長跨文化與跨部門協調、能在框架內把事做到位、向上管理能力強的人。',
      stageFit: '社會新鮮人～中前期最適合（MA 是系統化訓練的最佳起點）。',
      examples: ['P&G、Unilever、L’Oréal', 'Nestlé、可口可樂', 'Roche、Novartis、J&J']
    },
    us: {
      key: 'us',
      name: '純美商',
      tag: '高回報與高風險並存的「市場價值變現力」',
      ability: '市場變現力',
      abilityFull: '把專業變成最高回報的市場變現能力',
      color: '#B23A48',          // 酒紅
      colorSoft: 'rgba(178,58,72,.16)',
      center: { x: 0.72, y: -0.72 },
      quadrant: '國際・數字扁平',
      oneLiner: '組織極度扁平，一切以數字說話。你就是你自己業務的 CEO，自主權極高，但背後是巨大的 KPI 壓力。',
      dimensions: [
        { h: '組織與權責', t: '組織極度扁平、透明，一切以數字說話。不看資歷只看產出（Output）。你擁有極高自主權，但 KPI 壓力巨大，責任直接落在個人身上。' },
        { h: '主管與遴選', t: '遴選非常殘酷——Data Speaks。能持續帶來增長（Growth）、具備強大市場變現能力的人才能上位。純能力主義（meritocracy），不看年資。' },
        { h: '領導統御', t: '主管需展現可量化的市場成長、營收貢獻與團隊產出。升遷與淘汰皆以績效為依歸，PIP（績效改進計畫）文化常見。' },
        { h: '文化與工作型態', t: 'SOP 精簡、變動快、組織重整頻繁。高風險高回報：2026 前四個月美企裁員約 30 萬人、科技業逆勢增 33%。HR 直言「你要隨時準備好被裁後馬上找到下一份好工作」。' }
      ],
      salary: [
        { lv: '工程 L3–L4', range: '約 222–336 萬', note: 'Google 台灣 levels.fyi 總包（底薪＋RSU＋獎金）' },
        { lv: '工程 L5–L6', range: '約 469–796 萬', note: '股票占比隨職級顯著提高' },
        { lv: '科技業務 OTE', range: '底薪 50%＋獎金 50%', note: '超額達標有加乘獎金；新創常用 Commission 抽成' }
      ],
      salaryNote: '高底薪＋高股票（RSU）/高獎金（OTE），總包顯著高於傳統外商與本土，但與績效、股價、留任條件高度連動，波動大。',
      pros: ['總包高（高底薪＋RSU/OTE），上檔空間大', '組織扁平、高自主，升遷靠實力不靠年資', '國際化、直接參與全球產品與市場', '數據導向、決策快、官僚少'],
      cons: ['工作穩定度低，PIP 與裁員風險高', '高 KPI/業績壓力，未達標直接淘汰', '薪資波動大（股價、達標、留任連動）', '高自主＝高責任，制度保護少'],
      fit: '自驅力強、能用數據證明價值、抗壓性高、能承受不確定與裁員風險、追求高回報的人。',
      stageFit: '已具備可量化戰功的中期職涯者最能放大優勢（議價力與抗風險較強）。',
      examples: ['Google、Amazon（AWS）', 'Salesforce、Microsoft', 'Meta 與美系 SaaS 業務團隊']
    }
  };

  var ORDER = ['sme', 'listed', 'mnc', 'us'];

  /* ---- 測驗題庫（12 題）。每個選項貢獻 (dx, dy) 向量，並標記傾向 a。 ---- */
  var QUESTIONS = [
    {
      q: '你心目中理想的工作節奏是？',
      opts: [
        { t: '一人多工、什麼都碰，今天行銷明天談供應鏈', dx: -0.8, dy: -0.7, a: 'sme' },
        { t: '層級分明、照簽呈與制度走，責任歸屬清楚', dx: -0.6, dy: 0.8, a: 'listed' },
        { t: '對接亞太/全球團隊，把總部策略在地落地', dx: 0.8, dy: 0.6, a: 'mnc' },
        { t: '自訂目標、用數據衝刺，高度自主', dx: 0.6, dy: -0.8, a: 'us' }
      ]
    },
    {
      q: '面對「沒有人教、規則不清楚」的情況，你會？',
      opts: [
        { t: '興奮，正好可以無中生有、自己定義玩法', dx: -0.6, dy: -0.85, a: 'sme' },
        { t: '不安，希望先有制度與前例可循', dx: -0.55, dy: 0.85, a: 'listed' },
        { t: '去翻總部的 global guideline 與 SOP', dx: 0.75, dy: 0.7, a: 'mnc' },
        { t: '直接用數據做實驗，跑出結果再說', dx: 0.6, dy: -0.8, a: 'us' }
      ]
    },
    {
      q: '你比較想要哪一種薪酬結構？',
      opts: [
        { t: '高底薪＋高股票/獎金，上不封頂但波動大', dx: 0.6, dy: -0.8, a: 'us' },
        { t: '穩定底薪＋完整福利，可預期', dx: 0.55, dy: 0.75, a: 'mnc' },
        { t: '制度化調薪＋分紅配股，跟著公司成長', dx: -0.6, dy: 0.75, a: 'listed' },
        { t: '看老闆與當年獲利，彈性大但不確定', dx: -0.75, dy: -0.65, a: 'sme' }
      ]
    },
    {
      q: '跨國工作環境（英文、全球協作）對你來說？',
      opts: [
        { t: '必要，我想要國際舞台與跨文化經驗', dx: 0.85, dy: 0.4, a: 'mnc' },
        { t: '想直接參與全球產品、跟總部硬碰硬', dx: 0.85, dy: -0.4, a: 'us' },
        { t: '還好，我更想深耕在地市場與人脈', dx: -0.8, dy: -0.35, a: 'sme' },
        { t: '在地大組織就夠，制度完整最重要', dx: -0.8, dy: 0.45, a: 'listed' }
      ]
    },
    {
      q: '你怎麼看「辦公室政治、向上管理」？',
      opts: [
        { t: '那是大組織必修課，看懂局才能調動資源', dx: -0.5, dy: 0.85, a: 'listed' },
        { t: '討厭，我只想用數據和產出說話', dx: 0.6, dy: -0.8, a: 'us' },
        { t: '小團隊裡跟老闆搏感情、被信任最實際', dx: -0.75, dy: -0.6, a: 'sme' },
        { t: '在跨國矩陣裡，協調總部與在地是日常', dx: 0.75, dy: 0.55, a: 'mnc' }
      ]
    },
    {
      q: '你心目中「該被拔擢」的人，通常是？',
      opts: [
        { t: '能扛事的救火隊，老闆信得過的自己人', dx: -0.75, dy: -0.7, a: 'sme' },
        { t: '懂合規、跨文化、照領導力模型帶團隊', dx: 0.8, dy: 0.6, a: 'mnc' },
        { t: '持續帶來成長、數字最漂亮的人', dx: 0.6, dy: -0.8, a: 'us' },
        { t: '懂派系平衡、向上管理、不犯錯的人', dx: -0.6, dy: 0.8, a: 'listed' }
      ]
    },
    {
      q: '你願意承受多大的不穩定/裁員風險？',
      opts: [
        { t: '可以，高風險換高回報，我隨時有即戰力', dx: 0.6, dy: -0.85, a: 'us' },
        { t: '偏好穩定＋完整制度與安全感', dx: -0.5, dy: 0.8, a: 'listed' },
        { t: '中等，外商的穩定＋國際歷練剛剛好', dx: 0.8, dy: 0.5, a: 'mnc' },
        { t: '小公司有風險，但我自己就能掌控', dx: -0.7, dy: -0.6, a: 'sme' }
      ]
    },
    {
      q: '你比較想成為哪一種專業者？',
      opts: [
        { t: '一條龍通才，什麼都能搞定', dx: -0.75, dy: -0.7, a: 'sme' },
        { t: '在單一領域做深做精的專才', dx: -0.6, dy: 0.75, a: 'listed' },
        { t: '有方法論、能輸出 SOP 的專業者', dx: 0.75, dy: 0.6, a: 'mnc' },
        { t: '能把專業變現、議價力強的市場玩家', dx: 0.7, dy: -0.7, a: 'us' }
      ]
    },
    {
      q: '對你而言，一份工作最大的價值是？',
      opts: [
        { t: '快速看清商業全貌、練破局生存力', dx: -0.75, dy: -0.65, a: 'sme' },
        { t: '品牌背書、完整制度與穩定保障', dx: -0.6, dy: 0.8, a: 'listed' },
        { t: '國際視野、系統化方法論與個人品牌', dx: 0.8, dy: 0.55, a: 'mnc' },
        { t: '最大化金錢回報與市場價值', dx: 0.65, dy: -0.8, a: 'us' }
      ]
    },
    {
      q: '決策速度 vs 嚴謹度，你偏好？',
      opts: [
        { t: '快，先做再說，錯了再修', dx: -0.55, dy: -0.85, a: 'sme' },
        { t: '數據驗證後快速行動', dx: 0.55, dy: -0.8, a: 'us' },
        { t: '嚴謹合規，流程把關不能少', dx: 0.7, dy: 0.7, a: 'mnc' },
        { t: '層層簽核、防錯優先，穩當最重要', dx: -0.6, dy: 0.8, a: 'listed' }
      ]
    },
    {
      q: '你現在最想補強的能力是？',
      opts: [
        { t: '從 0 到 1、無中生有的破局力', dx: -0.75, dy: -0.7, a: 'sme' },
        { t: '在龐大組織裡合縱連橫、調動資源', dx: -0.6, dy: 0.8, a: 'listed' },
        { t: '跨國溝通與系統化的做事框架', dx: 0.8, dy: 0.55, a: 'mnc' },
        { t: '把能力變現、用數據證明價值', dx: 0.65, dy: -0.8, a: 'us' }
      ]
    },
    {
      q: '十年後，你希望自己是？',
      opts: [
        { t: '能獨當一面，甚至自己創業當老闆', dx: -0.7, dy: -0.65, a: 'sme' },
        { t: '在大企業坐上管理高位、調度資源', dx: -0.6, dy: 0.75, a: 'listed' },
        { t: '成為跨國公司的區域級專業領袖', dx: 0.8, dy: 0.55, a: 'mnc' },
        { t: '成為市場搶手、高回報的頂尖戰將', dx: 0.7, dy: -0.75, a: 'us' }
      ]
    }
  ];

  /* ---- 職涯階段（第 13 題）。不影響座標，用於導航建議。 ---- */
  var STAGES = [
    {
      key: 's1', label: '25–30 歲', sub: '職涯初期',
      recommend: ['sme', 'mnc'],
      advice: '把自己當海綿，累積「本事」而非薪水。前往中小企業看清商業全貌、練生存力；或進傳統外商建立做事框架、練方法論。這個階段最大的陷阱是只看薪資、不看無形經驗的累積。'
    },
    {
      key: 's2', label: '30–35 歲', sub: '黃金期前段',
      recommend: ['mnc', 'listed'],
      advice: '把自己當「一人公司」經營。32 歲仍是轉外商、跨產業相對安全的時機。開始思考主管職 vs 專業職的分流——有沒有帶人經驗，會決定中年的去留與薪資天花板。'
    },
    {
      key: 's3', label: '35–40 歲', sub: '黃金期・關鍵分流',
      recommend: ['listed', 'us'],
      advice: '進上市櫃練組織政治、調動資源把大事做成；或進純美商把實力做最高回報的市場變現。警惕「中年危機已下移到 35 歲」——38 歲卡在主管職與專業職中間最危險，務必確認手上是「個人能力」而非「平台能力」。'
    },
    {
      key: 's4', label: '40 歲以上', sub: '從術轉道',
      recommend: ['listed', 'us'],
      advice: '從「做」轉向「想」、從「術」轉向「道」。靠的是專業、一技之長與累積的人脈。此時最該盤點：離開公司後，哪些能力還留在你身上？避免成為靠平台撐起的「萬年中階主管」。'
    }
  ];

  /* ---- 職涯導航金句 ---- */
  var QUOTES = [
    { t: '職涯不是選擇最厲害的公司，而是選擇最適合現在自己的舞台。', by: '林招煌 Alex' },
    { t: '薪資差異的背後，本質上是你在拿什麼換取你的人生選擇權。', by: '林招煌 Alex' },
    { t: '你以為的能力，有時只是平台的能力。離開公司後還留在你身上的，才是你真正的能力。', by: '職涯資本核心命題' },
    { t: 'Be so good they can’t ignore you.', by: 'Cal Newport' },
    { t: '升遷近則決定加薪幅度，遠則決定中年的去留。', by: '洪雪珍' },
    { t: '即使你從不創業，你仍是自己人生的創業者。', by: 'Reid Hoffman' }
  ];

  /* ---- 中年危機 / 平台 vs 個人能力 ---- */
  var MIDLIFE = {
    facts: [
      { n: '47–48 歲', d: '幸福感「U 型曲線」的人生最低點，落差等同被解雇或離婚的衝擊。' },
      { n: '35 歲', d: '中年危機年齡層已下移；近半數企業顧慮聘用 35 歲以上擔任非主管職。' },
      { n: '87%', d: '中高齡求職者曾因年齡遭職場歧視；約 9 成企業坦承徵才有年齡顧慮。' },
      { n: '−44.7%', d: '資深人員回任後薪資相較退休前，逾四成案例「減少」的比例。' }
    ],
    checklist: [
      { q: '客戶/合作方是衝著什麼來的？', platform: '衝著公司品牌與名氣', self: '衝著「你這個人」' },
      { q: '沒有現成團隊與預算，你還做得成嗎？', platform: '不行', self: '可以，能從零組建' },
      { q: '換到沒名氣的小公司，這本事還管用嗎？', platform: '大幅打折', self: '幾乎照樣管用' },
      { q: '你的成果靠的是？', platform: '流程、系統、平台流量', self: '你的判斷、手藝、人脈' },
      { q: '對方挖角你時，要的是？', platform: '你能帶來的關係/資源', self: '你本身的解決問題能力' }
    ]
  };

  /* ---- 參考來源（分組） ---- */
  var SOURCES = [
    {
      group: '本土：中小企業與上市櫃',
      items: [
        { t: '經濟部《2024 年中小企業白皮書》— 經濟日報', u: 'https://money.udn.com/money/story/10869/8393983' },
        { t: '113 年受僱員工薪資 — 行政院主計總處', u: 'https://www.dgbas.gov.tw/News_Content.aspx?n=3602&s=234606' },
        { t: '113 年薪資中位數 54.6 萬、近 7 成領不到平均數 — 經理人', u: 'https://www.managertoday.com.tw/articles/view/71321' },
        { t: '2024 上市櫃公司非主管薪資中位數 — 104 職場力', u: 'https://blog.104.com.tw/2025-median-salary-listed-company/' },
        { t: '上市上櫃高階經理人薪酬級距 — 咨鼎管顧', u: 'https://getconsultant.com/articles/%E4%B8%8A%E5%B8%82%E4%B8%8A%E6%AB%83%E5%85%AC%E5%8F%B8%E9%AB%98%E9%9A%8E%E7%B6%93%E7%90%86%E4%BA%BA%E8%96%AA%E9%85%AC%E7%B4%9A%E8%B7%9D%E7%9A%84%E6%95%A3%E4%BD%88/' },
        { t: '公開資訊觀測站 — 員工薪資揭露', u: 'https://mopsov.twse.com.tw/mops/web/t100sb15' },
        { t: '上市上櫃公司治理實務守則 — TWSE', u: 'https://twse-regulation.twse.com.tw/m/LawContent.aspx?FID=FL020553' },
        { t: '小公司 vs 大企業 — 安石國際', u: 'https://www.enspyre.com/blog/startups/%E5%B0%8F%E5%85%AC%E5%8F%B8%E5%A4%A7%E4%BC%81%E6%A5%AD/' },
        { t: '你是老闆的「自己人」嗎 — 獨立評論@天下', u: 'https://opinion.cw.com.tw/blog/profile/222/article/4732' },
        { t: 'KPI 是什麼／績效管理優缺點 — 經理人', u: 'https://www.managertoday.com.tw/articles/view/58229' },
        { t: '上銀科技 卓永財向隱形冠軍看齊 — 聯合新聞網', u: 'https://udn.com/news/story/7241/6925278' }
      ]
    },
    {
      group: '外商：傳統外商與純美商',
      items: [
        { t: 'levels.fyi：Google SWE 台灣薪資', u: 'https://www.levels.fyi/companies/google/salaries/software-engineer/locations/taiwan' },
        { t: 'levels.fyi：Amazon SDE 台灣薪資', u: 'https://www.levels.fyi/companies/amazon/salaries/software-engineer/locations/taiwan' },
        { t: 'Career Matters：2026 外商儲備幹部 MA 全攻略', u: 'https://energymatters.biz/1669/' },
        { t: 'Asana：矩陣式組織是什麼、如何運作', u: 'https://asana.com/zh-tw/resources/matrix-organization' },
        { t: 'DBS：外商六種產業企業文化大解密', u: 'https://www.dbs.com.tw/insights/post/job-5-foreign-company/index.html' },
        { t: '商周：一張表比較外商文化——美商靠能力、日商看年資', u: 'https://www.businessweekly.com.tw/careers/blog/16901' },
        { t: 'Vocus 愛咪說業務：外商科技業務薪水大解密（OTE）', u: 'https://vocus.cc/article/686d4a7ffd89780001de7d5d' },
        { t: '數位時代：圖解 2026 裁員潮——科技業逆勢增 33%', u: 'https://www.bnext.com.tw/article/90968/us-corporate-layoffs-2026-tech-ai-restructuring' },
        { t: 'Medium：I got laid off 我被外商公司資遣了', u: 'https://medium.com/@mandy880128/i-got-laid-off-%E6%88%91%E8%A2%AB%E5%A4%96%E5%95%86%E5%85%AC%E5%8F%B8%E8%B3%87%E9%81%A3%E4%BA%86-ca963ed1d086' }
      ]
    },
    {
      group: '職涯階段與中年危機',
      items: [
        { t: '104 職場力：中年危機年齡層已降至 35 歲？', u: 'https://blog.104.com.tw/the-35-year-old-workplace-crisis/' },
        { t: '104 職場力：30、40 歲黃金階段該追求什麼', u: 'https://blog.104.com.tw/30-to-40-career-planning/' },
        { t: '104 職場力：可遷移能力', u: 'https://blog.104.com.tw/transferable-skills-career-growth/' },
        { t: '商周：42 歲外商高階轉職碰壁（洪雪珍）', u: 'https://www.businessweekly.com.tw/careers/blog/3001666' },
        { t: '經理人：避免成為萬年中階主管，40 歲必備 3 個觀念', u: 'https://www.managertoday.com.tw/articles/view/54490' },
        { t: 'TechOrange：30 到 40 歲是最有價值的年紀', u: 'https://buzzorange.com/techorange/2022/04/22/learning-jerry/' },
        { t: 'HBR：Making Peace with Your Midlife（幸福 U 型曲線）', u: 'https://hbr.org/podcast/2024/01/making-peace-with-your-midlife-midcareer-self' },
        { t: '80,000 Hours：Why and how to keep your options open', u: 'https://80000hours.org/articles/keeping-options-open/' },
        { t: 'Greylock：Reid Hoffman ABZ Planning', u: 'https://greylock.com/greymatter/reid-hoffman-abzplanning/' },
        { t: 'Commoncog：So Good They Can’t Ignore You（Cal Newport）', u: 'https://commoncog.com/so-good-they-cant-ignore-you/' }
      ]
    }
  ];

  /* ---- 計分：把作答換算成座標與四類契合度 ---- */
  function score(answers) {
    // answers: 長度 = QUESTIONS.length 的陣列，元素為選項 index
    var sx = 0, sy = 0, maxX = 0, maxY = 0;
    var tally = { sme: 0, listed: 0, mnc: 0, us: 0 };
    QUESTIONS.forEach(function (qu, i) {
      var pick = qu.opts[answers[i]];
      if (!pick) return;
      sx += pick.dx; sy += pick.dy;
      tally[pick.a] += 1;
      // 該題在各軸上可達到的最大絕對值（用於正規化到 [-1,1]）
      var mx = 0, my = 0;
      qu.opts.forEach(function (o) {
        if (Math.abs(o.dx) > mx) mx = Math.abs(o.dx);
        if (Math.abs(o.dy) > my) my = Math.abs(o.dy);
      });
      maxX += mx; maxY += my;
    });
    var x = maxX ? clamp(sx / maxX, -1, 1) : 0;
    var y = maxY ? clamp(sy / maxY, -1, 1) : 0;

    // 與各公司象限中心的距離 → 契合度
    var maxDist = 2 * Math.SQRT2; // 對角線
    var matches = ORDER.map(function (k) {
      var c = COMPANIES[k].center;
      var d = Math.sqrt(Math.pow(x - c.x, 2) + Math.pow(y - c.y, 2));
      var closeness = 1 - d / maxDist;
      return { key: k, match: Math.round(closeness * 100), tally: tally[k] };
    });
    // 主推薦：契合度最高；平手時用 tally 決勝
    var sorted = matches.slice().sort(function (a, b) {
      return b.match - a.match || b.tally - a.tally;
    });
    return { x: x, y: y, matches: matches, primary: sorted[0].key, ranked: sorted };
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  global.CC = {
    AXES: AXES,
    COMPANIES: COMPANIES,
    ORDER: ORDER,
    QUESTIONS: QUESTIONS,
    STAGES: STAGES,
    QUOTES: QUOTES,
    MIDLIFE: MIDLIFE,
    SOURCES: SOURCES,
    score: score,
    clamp: clamp
  };
})(window);
