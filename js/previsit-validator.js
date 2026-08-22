/* AcuTing OS — P1 診前資料 payload 驗證器(單一 shape 尺,2026-08-12)
 *
 * 存在理由(Codex P1 adversarial retest NO-GO,MED-4 根因):
 * 同一份 shape 規則過去在 app.js 與 scripts/validate-previsit-payload.js
 * 各寫一份 —— 兩份必然漂移,而且 CI self-test 只跑 CLI 那份,漂移可以在
 * 「全綠」底下存活。實際發生的漂移(HIGH-1):`metrics` 是物件而非陣列時,
 * CLI 正確整筆拒收,app 卻靜默降成空陣列並照樣預填。
 *
 * 因此:shape 驗證只有這一份,app 與 CLI 都委派這裡,self-test 跑的就是
 * app 執行的同一段程式碼。這是 clinical-store.js 已建立的先例
 * (checkClinicalInvariants:CI validator 與 app import guard 共用一份)。
 *
 * 零 DOM 依賴,node 可直接 require。純函式:不改輸入、不碰 storage。
 *
 * 契約來源:docs/P1_PREVISIT_INTAKE_CONTRACT_v0.md §7。
 * 本模組只管 SHAPE(payload 自身是否合法);import 端三道硬規則
 * (patientCode 逐字比對 / 72h 過期 / payloadId 重放)留在 app.js
 * pastePrevisitImport —— 那些需要「目前開啟病例」與 session 狀態。
 */
(function (global) {
  "use strict";

  /* P1 傳輸白名單(Codex MED-1):病人頁 previsit.html 只問這六項,契約 v0
   * 的傳輸子集就是這六項。app/CLI 過去拿完整 NUMERIC_OUTCOME_METRIC_CONFIG
   * 當白名單,於是 metric.effect_duration_days 這種病人頁根本不會產生的
   * metric 也能被對抗 payload 灌進預填。範圍(min/max/integer)仍從 canonical
   * config 注入 —— 這裡只宣告「哪些 id 允許經由 P1 傳輸」,不複製第二份範圍。 */
  const P1_TRANSPORT_METRIC_IDS = [
    "metric.pain_score",
    "metric.sleep_hours",
    "metric.stress_level",
    "metric.mood",
    "metric.energy_level",
    "metric.pgic"
  ];

  /* 自由文字上限(Codex MED-3 的 consumer 半邊;producer 半邊是
   * previsit.html 的 maxlength)。 */
  const MAX_PROSE_CHARS = 5000;
  const MAX_REPORT_CHARS = 2000;

  /* ISO 8601 時間(Codex MED-2):過去只用 Date.parse,`"0"` 這種非 ISO
   * shorthand 在某些引擎可解析而通過 shape 層。契約 §7 明寫「ISO 時間」,
   * 這裡就照字面驗。涵蓋 previsit.html 的 toISOString() 輸出與常見 ISO 變體。 */
  const ISO_8601_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/;

  /* 不可見字元政策(第三輪定版)。
   *
   * 第一版手列範圍 → 漏掉 U+0085/009B/200E/200F/061C(Codex)。
   * 第二版翻成整個 \p{Cf} → 從漏放翻成**靜默誤殺**(Opus 覆測):emoji 的
   * ZWJ 與波斯/印地文的 ZWNJ(正字法的一部分)都被改掉,而且 errors 是空的
   * —— 病人看不出自己的字被動過。
   *
   * 定版分兩種對象,因為它們的正確答案不同:
   *   PROSE(病歷自由文字):剝掉不可見字元,但**保留 ZWJ(200D)/ZWNJ(200C)**
   *     —— 那兩個在 emoji 與多種文字的正字法裡有語義。
   *   IDENTIFIER(patientCode / payloadId):**全部剝掉,含 ZWJ/ZWNJ**。
   *     識別碼不該有任何不可見字元,而且它們是硬規則的鍵 —— 一個 ZWSP 就能
   *     讓 payloadId 變成另一個值、繞過重放閘(Opus MED-4 實證)。 */
  const INVISIBLE_C0_C1 = "\\u0000-\\u0008\\u000B-\\u001F\\u007F-\\u009F";
  const PROSE_INVISIBLE_RE = new RegExp("[" + INVISIBLE_C0_C1 + "]|(?![\\u200C\\u200D])\\p{Cf}", "gu");
  const IDENTIFIER_INVISIBLE_RE = new RegExp("[" + INVISIBLE_C0_C1 + "]|\\p{Cf}", "gu");

  function stripControlChars(s) {
    return String(s).replace(PROSE_INVISIBLE_RE, "");
  }
  /* 識別碼文法(SOL R-6/R-7/R-8 修復)。
   *
   * 前一版用「剝掉不可見字元」處理 patientCode / payloadId,三個問題:
   *   R-7 先驗證後清洗 —— `payloadId:"\u200B"` 通過必填(ZWSP 不是 JS
   *       whitespace,trim 不掉),清洗後變成 "",而 app 的重放閘是
   *       `if (data.payloadId)` → 空字串 falsy → **整個重放防護跳過**。
   *   R-6 「全部剝掉」做不到 —— U+034F(CGJ)、U+FE0F(VS16)不是 Cf,
   *       原樣留下,於是螢幕上一樣的 ID 在 Set 裡是兩個字串。
   *   R-8 靜默改寫讓「逐字相等」的契約變成「正規化後相等」,
   *       `P\u200B123` 會悄悄比對成 `P123`。
   *
   * 列舉不可見字元永遠追不完,所以改成**正面文法**:識別碼只能由字母、
   * 數字與一小組標點組成,且必須以字母或數字開頭。CGJ、VS、ZWSP、ZWJ
   * 全部不屬於 \p{L}/\p{N},自動被排除 —— 不需要知道它們的名字。
   * 而且**不合法就拒收**,不再靜默修正:異常識別碼是要被看見的事件。
   * 中文病歷代碼(病人代碼-三號)照樣通過,因為漢字是 \p{L}。 */
  /* 組合附加符號必須放行(自查,2026-08-12)。第一版只准 \p{L}\p{N},於是
   * 印地文、阿拉伯文帶母音、泰文帶聲調全被拒 —— 它們的合法字元包含
   * 組合符號(\p{M})。最不冷僻的一個情境是 NFD:Mac 的剪貼簿常給分解式,
   * 所以同一個看起來一樣的 `café-01` 在 Mac 上被拒、在 Windows 上通過。
   *
   * 但 \p{M} 裡混著幾個「看不見」的成員,正是 SOL R-6 點名的那類:
   * U+034F(CGJ)與 variation selectors(FE00-FE0F、E0100-E01EF)都是 Mn。
   * 所以是「正面文法 + 針對性排除」:形狀由 L/N/M 決定,
   * 少數不可見的 mark 逐個排除。
   *
   * 未解(留給 Ting/reviewer):NFC 與 NFD 是不同位元組,兩者都合法但
   * 逐字比對不相等。要不要在比較時正規化,是契約決定 —— SOL R-8 明確
   * 反對靜默改寫識別碼,所以這裡不擅自 normalize,寧可讓它拒收得明顯。 */
  const INVISIBLE_MARKS = /[\u034F\uFE00-\uFE0F]|[\u{E0100}-\u{E01EF}]/u;
  const IDENTIFIER_RE = /^[\p{L}\p{N}][\p{L}\p{N}\p{M} \-_.#/]*$/u;
  function isWellFormedIdentifier(v) {
    if (typeof v !== "string") return false;
    const t = v.trim();
    if (INVISIBLE_MARKS.test(t)) return false;   // mark,但看不見 —— 不准當識別碼的一部分
    return IDENTIFIER_RE.test(t) && t === v.replace(/^\s+|\s+$/g, "");
  }

  /* 解析失敗描述:只給長度,絕不轉述內容(Opus 覆測 HIGH-1)。
   * 與 js/clinical-store.js 的同名 helper 同款規則 —— 刻意各自持有一份三行
   * 實作而不共用模組:兩者都在安全關鍵載入路徑上,為省三行而引入載入順序
   * 相依,失敗模式比重複更糟。防止再犯的是 CI 守衛,不是共用程式碼。 */
  function parseFailureDetail(raw) {
    const n = typeof raw === "string" ? raw.length : 0;
    return `${n} 字元,內容不轉述`;
  }

  /* 原始數字 token 完整性(Codex retest HIGH-1)。
   * magnitude guard 只看「解析後」的值,但 `9007199254740990.5` 在 JSON.parse
   * 當下就被截成 `9007199254740990` —— 絕對值仍在安全範圍內,於是整筆放行,
   * 而病人送出的數字在驗證前已經不是原值。所以要驗**原始文字**:payload 裡
   * 每一個 number token 都必須能無損往返(String(Number(tok)) === tok)。
   * 先把字串字面量抽掉,避免病歷散文裡的數字被當成 token。
   * 0 / -0 例外:兩者都精確可表示,String(-0) 會變 "0" 但不是失真。 */
  const NUMBER_TOKEN_RE = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  /* 把數字 token 正規化成 canonical 十進位字串(去符號冗餘、去前導/尾隨零、
   * 展開指數),用來判斷「值有沒有真的變」而不是「寫法一不一樣」。 */
  function canonicalDecimal(tok) {
    const m = /^(-?)(\d+)(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(String(tok));
    if (!m) return null;
    const sign = m[1] === "-" ? "-" : "";
    let digits = m[2] + (m[3] || "");
    let point = m[2].length + Number(m[4] || 0);
    if (point <= 0) { digits = "0".repeat(1 - point) + digits; point = 1; }
    if (point > digits.length) digits += "0".repeat(point - digits.length);
    let intPart = digits.slice(0, point).replace(/^0+(?=\d)/, "");
    const fracPart = digits.slice(point).replace(/0+$/, "");
    if (intPart === "") intPart = "0";
    const body = fracPart ? intPart + "." + fracPart : intPart;
    return (body === "0" ? "" : sign) + body;
  }
  function lossyNumberTokens(rawText) {
    const withoutStrings = String(rawText).replace(/"(?:[^"\\]|\\.)*"/g, '""');
    const bad = [];
    for (const tok of withoutStrings.match(NUMBER_TOKEN_RE) || []) {
      const v = Number(tok);
      if (!Number.isFinite(v)) { bad.push(tok); continue; }
      if (v === 0) continue;
      // Opus 覆測:第一版直接比 String(Number(tok)) === tok,於是 7.0 / 6.50 /
      // 1e1 都被判「精度失真」—— 它們其實精確可表示,只是寫法不同。用錯誤的
      // 理由拒收合法輸入,比漏放更難被發現,因為沒有人會去查。改成兩邊都
      // 正規化成 canonical 十進位再比:寫法不同不算,值不同才算。
      const before = canonicalDecimal(tok);
      const after = canonicalDecimal(String(v));
      if (before !== null && after !== null && before !== after) bad.push(tok);
    }
    return bad;
  }

  /* 傳輸/存檔十進位契約(Codex retest MED-1;敘述經 SOL R-1 修正)。
   * 注意這條檢查的是**解析後數值的字串形式**,不是原始 JSON 的寫法 ——
   * 所以 raw `1e1` 會先變成 10 而通過,`1e-7` 則因為 String(v) 仍是 "1e-7"
   * 而被擋。規則的真正意思是「傳輸後必須能無歧義地進存檔端的十進位路徑」,
   * 不是「原始 JSON 禁用指數寫法」。
   * 存檔端 computeNumericOutcomeMetrics() 讀的是 DOM 字串,它的守則是
   * /^\d+(\.\d+)?$/ —— 指數形式一律拒。所以 0.0000001 這種合法極小值
   * 在傳輸層過關、預填成 "1e-7" 之後卻存不進去,兩層契約不一致。
   * 這裡要求 String(value) 必須是純十進位:兩層從此同一把尺。 */
  function isPlainDecimal(v) {
    return /^-?\d+(\.\d+)?$/.test(String(v));
  }

  /* 曆日真實性(Codex retest MED-2)。
   * ISO 外形正確不代表日期存在:"2026-02-31" 通過 regex,Date.parse 也給得出
   * 值(引擎正規化到 3 月),於是一個不存在的日子被正規化後送進 freshness 判斷。 */
  function isRealCalendarDate(iso) {
    // R-3:只驗年月日不夠。`2026-08-11T24:00:00Z` 的日期是真的,但引擎會
    // 把它正規化成 8/12 —— validator 驗的是 8/11,72 小時 gate 用的卻是
    // 8/12,而 confirm 畫面顯示的又是原始字串。時分秒一併驗。
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(iso));
    if (!m) return false;
    const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
    const hh = Number(m[4]), mi = Number(m[5]), ss = Number(m[6] || 0);
    if (hh > 23 || mi > 59 || ss > 59) return false;
    const dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
  }

  /* 數值上界(Codex HIGH-2):JSON 整數超過 MAX_SAFE_INTEGER 在 JSON.parse
   * 當下就被靜默改寫(9007199254740993 → ...992),病人送出的數字在驗證前
   * 已經不是原值;1e308 這類極大值則能過傳輸層卻被存檔端 regex 拒收,兩層
   * 契約不一致。一條規則同時堵住兩者:|value| 必須 ≤ MAX_SAFE_INTEGER。 */
  function magnitudeOk(v) {
    return Math.abs(v) <= Number.MAX_SAFE_INTEGER;
  }

  /* 主驗證器。
   *   rawText  — payload 原始 JSON 字串
   *   opts.metricConfig — canonical NUMERIC_OUTCOME_METRIC_CONFIG(注入,
   *                       範圍的唯一來源)
   *   opts.registryHas  — (metricId) => boolean,registry 存在性檢查
   *   opts.labelOf      — (metricId) => string,錯誤訊息用的短標籤(選填)
   * 回傳 { ok, errors[], data|null }。errors 蒐集全部問題(CLI 要列完整清單);
   * app 端取第一條顯示。任何一條 error = 整筆拒收,data 為 null。 */
  function validatePrevisitShape(rawText, opts) {
    const o = opts || {};
    const metricConfig = o.metricConfig || [];
    const registryHas = typeof o.registryHas === "function" ? o.registryHas : () => true;
    const labelOf = typeof o.labelOf === "function" ? o.labelOf : (id) => id;
    const errors = [];

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      // Opus 覆測 HIGH-1(2026-08-12):這一行過去把 e.message 原樣送出,而它
      // 流進 app.js 的 alert。V8 的 JSON 錯誤訊息內嵌**錯誤位置前後各約十個
      // 字**的原文,所以短輸入等於整份照登 —— 醫師貼錯剪貼簿時,病人的原話
      // 就出現在對話框裡(實測:12 字的貼上內容完整回顯)。這裡是 payload
      // 的入口,收到的可能是任何東西,一個字都不能轉述。
      return { ok: false, errors: [`不是合法的 JSON(${parseFailureDetail(rawText)})。Not valid JSON.`], data: null };
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, errors: ["資料格式錯誤,不是一個物件。Invalid payload — not an object."], data: null };
    }

    // HIGH-1:原始 number token 必須無損 —— 在任何值檢查之前,因為到這一步
    // 為止 data 裡的數字可能已經被 JSON.parse 靜默改寫過了。
    const lossy = lossyNumberTokens(rawText);
    if (lossy.length) {
      return { ok: false, errors: [`payload 含 ${lossy.length} 個精度會失真的數字(解析後的值與原始文字不同),整筆拒收。Payload contains number token(s) that do not survive JSON parsing losslessly.`], data: null };
    }

    if (data.kind !== "acuting-previsit-v1") {
      errors.push(`kind 欄位不是 "acuting-previsit-v1"(實際型別 ${typeof data.kind})。kind is not "acuting-previsit-v1".`);
    }
    if (typeof data.patientCode !== "string") {
      errors.push(`patientCode 必須是文字(實際型別:"${typeof data.patientCode}")。patientCode must be a string.`);
    } else if (!isWellFormedIdentifier(data.patientCode)) {
      // R-8:不靜默改寫。異常識別碼要拒收,否則「逐字相等」的硬規則會被
      // 悄悄降級成「正規化後相等」。
      errors.push("patientCode 含不允許的字元(只接受字母、數字與 - _ . # / 空格)。patientCode contains characters that are not allowed in an identifier.");
    }
    // §7:formVersion / payloadId / filledAt 三欄必帶(缺 payloadId 會繞過
    // import 端的重放閘 —— 那道閘是 `if (data.payloadId)`)。
    if (data.formVersion !== 1) {
      errors.push(`formVersion 必須為 1(實際型別 ${typeof data.formVersion})。formVersion must be exactly 1.`);
    }
    if (typeof data.payloadId !== "string" || !data.payloadId.trim()) {
      errors.push("payloadId 缺少或為空(重放防護所需)。payloadId missing/empty — required for replay protection.");
    } else if (!isWellFormedIdentifier(data.payloadId)) {
      // R-7:文法檢查跑在「輸出正規化」之前,所以不可能出現「驗證時非空、
      // 交出去卻是空字串」。只有不可見字元的 payloadId 在這裡就被擋下。
      errors.push("payloadId 含不允許的字元(只接受字母、數字與 - _ . # / 空格)。payloadId contains characters that are not allowed in an identifier.");
    }
    if (typeof data.filledAt !== "string" || !ISO_8601_RE.test(data.filledAt) || !isRealCalendarDate(data.filledAt) || !Number.isFinite(Date.parse(data.filledAt))) {
      errors.push(`filledAt 必須是合法的 ISO 8601 時間(型別 ${typeof data.filledAt})。filledAt must be a valid ISO 8601 timestamp.`);
    }

    // metrics:非陣列 = 整筆拒收(不靜默降成空陣列 —— HIGH-1 的根因)。
    if (data.metrics !== undefined && !Array.isArray(data.metrics)) {
      errors.push(`metrics 必須是陣列(實際型別:"${Array.isArray(data.metrics) ? "array" : typeof data.metrics}")。metrics must be an array.`);
    }
    const rawMetrics = Array.isArray(data.metrics) ? data.metrics : [];
    const checkedMetrics = [];
    const seenMetricIds = new Set();
    rawMetrics.forEach((m, i) => {
      if (!m || typeof m !== "object" || Array.isArray(m) || typeof m.metricId !== "string" || !m.metricId) {
        errors.push(`metrics[${i}] 缺少 metricId。metrics[${i}] is missing metricId.`);
        return;
      }
      if (seenMetricIds.has(m.metricId)) {
        // 重複 metricId = 預填時 last-write/first-write 語義不明,一律拒。
        errors.push(`metrics[${i}] 的 metricId 與前面重複。duplicate metricId.`);
        return;
      }
      seenMetricIds.add(m.metricId);
      if (P1_TRANSPORT_METRIC_IDS.indexOf(m.metricId) === -1) {
        errors.push(`metrics[${i}] 的 metricId 不在 P1 傳輸白名單內(病人頁只問 ${P1_TRANSPORT_METRIC_IDS.length} 項)。metricId not in the P1 transport subset.`);
        return;
      }
      const cfg = metricConfig.find((c) => c.metricId === m.metricId);
      if (!cfg) {
        errors.push(`metrics[${i}] 的 metricId 不在數值 metric 設定內。metricId not in the numeric metric config.`);
        return;
      }
      if (!registryHas(m.metricId)) {
        errors.push(`metrics[${i}] 的 metricId 在 registry 找不到對應紀錄。metricId not found in the registry.`);
        return;
      }
      // JSON number 本尊,禁 coercion(null/false/""/[] → 0、true → 1、"4" → 4)。
      if (typeof m.valueNumber !== "number" || !Number.isFinite(m.valueNumber)) {
        errors.push(`metrics[${i}](${labelOf(m.metricId)}):valueNumber 必須是 JSON 數字(不接受字串/null/布林/空值,實際型別 "${typeof m.valueNumber}")。valueNumber must be a JSON number.`);
        return;
      }
      if (!magnitudeOk(m.valueNumber)) {
        errors.push(`metrics[${i}](${labelOf(m.metricId)}):數值超出安全範圍(|value| 須 ≤ ${Number.MAX_SAFE_INTEGER})。valueNumber magnitude exceeds the safe-integer bound.`);
        return;
      }
      if (!isPlainDecimal(m.valueNumber)) {
        // MED-1:指數形式在存檔端會被 /^\d+(\.\d+)?$/ 拒絕;傳輸層不得放行
        // 一個存不進去的值。
        errors.push(`metrics[${i}](${labelOf(m.metricId)}):數值必須是純十進位(指數形式存檔端會拒絕)。valueNumber must be plain decimal, not exponent notation.`);
        return;
      }
      const num = m.valueNumber === 0 ? 0 : m.valueNumber;   // -0 → 0(消除傳輸/存檔的表示差異)
      const shapeOk = cfg.integer ? Number.isInteger(num) : true;
      const rangeOk = num >= cfg.min && (cfg.max == null || num <= cfg.max);
      if (!shapeOk || !rangeOk) {
        const rangeText = cfg.max != null ? `${cfg.min}–${cfg.max}` : `${cfg.min} 以上`;
        const shapeText = cfg.integer ? "整數" : "數字(可含小數)";
        errors.push(`metrics[${i}](${labelOf(m.metricId)}):須為 ${rangeText} 的${shapeText}。Must be a ${shapeText} in range ${rangeText}.`);
        return;
      }
      checkedMetrics.push({ metricId: m.metricId, valueNumber: num });
    });

    // 自由文字:長度上限 + 控制字元剝除。非字串視為缺欄,不 String()-強制
    // (String({}) → "[object Object]" 會變成病歷文字)。
    // R-9:非字串不再靜默當成缺欄。契約是「任何違規整筆拒收」,而一個
    // 物件型的 subjectiveText 過去會變成空字串 —— 病人的原話無聲消失。
    const textField = (val, max, label) => {
      if (val === undefined || val === null) return "";
      if (typeof val !== "string") {
        errors.push(`${label} 必須是文字(實際型別 ${typeof val})。${label} must be a string.`);
        return "";
      }
      if (val.length > max) {
        errors.push(`${label} 超過長度上限(${max} 字,實際 ${val.length})。${label} exceeds the ${max}-char limit.`);
        return "";
      }
      return stripControlChars(val).trim();
    };
    // R-9:`any` 過去用 !!value,於是字串 "false" 變成 true。這是病人自述
    // 「有沒有不良反應」的旗標,型別錯就是資料錯,不能猜。
    for (const rep of ["aeSelfReport", "exposureSelfReport"]) {
      const o = data[rep];
      if (o === undefined || o === null) continue;
      if (typeof o !== "object" || Array.isArray(o)) { errors.push(`${rep} 必須是物件。${rep} must be an object.`); continue; }
      if (o.any !== undefined && typeof o.any !== "boolean") errors.push(`${rep}.any 必須是 true/false(實際型別 ${typeof o.any})。${rep}.any must be a boolean.`);
    }
    const subjectiveText = textField(data.subjectiveText, MAX_PROSE_CHARS, "subjectiveText");
    const patientPerspective = textField(data.patientPerspective, MAX_PROSE_CHARS, "patientPerspective");
    const aeText = textField(data.aeSelfReport && data.aeSelfReport.text, MAX_REPORT_CHARS, "aeSelfReport.text");
    const expText = textField(data.exposureSelfReport && data.exposureSelfReport.text, MAX_REPORT_CHARS, "exposureSelfReport.text");

    if (errors.length) return { ok: false, errors, data: null };

    return {
      ok: true,
      errors: [],
      data: {
        // MED-4:這兩欄是 import 端硬規則的鍵(逐字比對 / 重放去重),任何
        // 不可見字元都會讓鍵變成另一個值 —— payloadId 加一個 ZWSP 就能無限重放。
        patientCode: data.patientCode,
        payloadId: data.payloadId.trim(),
        filledAt: data.filledAt,
        metrics: checkedMetrics,
        subjectiveText,
        patientPerspective,
        aeSelfReport: (data.aeSelfReport && typeof data.aeSelfReport === "object" && !Array.isArray(data.aeSelfReport))
          ? { any: data.aeSelfReport.any === true, text: aeText }
          : { any: false, text: "" },
        exposureSelfReport: (data.exposureSelfReport && typeof data.exposureSelfReport === "object" && !Array.isArray(data.exposureSelfReport))
          ? { any: data.exposureSelfReport.any === true, text: expText }
          : { any: false, text: "" }
      }
    };
  }

  global.AcuTingPrevisitValidator = {
    P1_TRANSPORT_METRIC_IDS,
    MAX_PROSE_CHARS,
    MAX_REPORT_CHARS,
    ISO_8601_RE,
    stripControlChars,
    isWellFormedIdentifier,
    canonicalDecimal,
    lossyNumberTokens,
    isPlainDecimal,
    isRealCalendarDate,
    validatePrevisitShape
  };
})(typeof window !== "undefined" ? window : globalThis);
