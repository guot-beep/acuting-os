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

  /* 控制字元剝除(Codex MED-3):C0 除 \t(09) \n(0A) 外全剝,含過去漏掉的
   * CR(0D);DEL(7F);Unicode bidi override(202A-202E, 2066-2069)。
   * CR 一律剝除而非轉成 LF —— 剝除是唯一確定的行為,轉換會製造「輸入與
   * 儲存不同」的第二種漂移。 */
  const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g;

  function stripControlChars(s) {
    return String(s).replace(CONTROL_CHARS_RE, "");
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
      return { ok: false, errors: [`不是合法的 JSON。Not valid JSON: ${e.message}`], data: null };
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, errors: ["資料格式錯誤,不是一個物件。Invalid payload — not an object."], data: null };
    }

    if (data.kind !== "acuting-previsit-v1") {
      errors.push(`kind 欄位不是 "acuting-previsit-v1"(實際:${JSON.stringify(data.kind)})。kind is not "acuting-previsit-v1".`);
    }
    if (typeof data.patientCode !== "string") {
      errors.push(`patientCode 必須是文字(實際型別:"${typeof data.patientCode}")。patientCode must be a string.`);
    }
    // §7:formVersion / payloadId / filledAt 三欄必帶(缺 payloadId 會繞過
    // import 端的重放閘 —— 那道閘是 `if (data.payloadId)`)。
    if (data.formVersion !== 1) {
      errors.push(`formVersion 必須為 1(實際 ${JSON.stringify(data.formVersion)})。formVersion must be exactly 1.`);
    }
    if (typeof data.payloadId !== "string" || !data.payloadId.trim()) {
      errors.push("payloadId 缺少或為空(重放防護所需)。payloadId missing/empty — required for replay protection.");
    }
    if (typeof data.filledAt !== "string" || !ISO_8601_RE.test(data.filledAt) || !Number.isFinite(Date.parse(data.filledAt))) {
      errors.push(`filledAt 必須是 ISO 8601 時間(實際 ${JSON.stringify(data.filledAt)})。filledAt must be an ISO 8601 timestamp.`);
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
        errors.push(`metrics[${i}]:metricId「${m.metricId}」重複出現。duplicate metricId.`);
        return;
      }
      seenMetricIds.add(m.metricId);
      if (P1_TRANSPORT_METRIC_IDS.indexOf(m.metricId) === -1) {
        errors.push(`metrics[${i}]:metricId「${m.metricId}」不在 P1 傳輸白名單內(病人頁只問 ${P1_TRANSPORT_METRIC_IDS.length} 項)。metricId not in the P1 transport subset.`);
        return;
      }
      const cfg = metricConfig.find((c) => c.metricId === m.metricId);
      if (!cfg) {
        errors.push(`metrics[${i}]:metricId「${m.metricId}」不在數值 metric 設定內。metricId not in the numeric metric config.`);
        return;
      }
      if (!registryHas(m.metricId)) {
        errors.push(`metrics[${i}]:metricId「${m.metricId}」在 registry 找不到對應紀錄。metricId not found in the registry.`);
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
      const num = m.valueNumber === 0 ? 0 : m.valueNumber;   // -0 → 0(消除傳輸/存檔的表示差異)
      const shapeOk = cfg.integer ? Number.isInteger(num) : true;
      const rangeOk = num >= cfg.min && (cfg.max == null || num <= cfg.max);
      if (!shapeOk || !rangeOk) {
        const rangeText = cfg.max != null ? `${cfg.min}–${cfg.max}` : `${cfg.min} 以上`;
        const shapeText = cfg.integer ? "整數" : "數字(可含小數)";
        errors.push(`metrics[${i}](${labelOf(m.metricId)}):須為 ${rangeText} 的${shapeText}(實際:${m.valueNumber})。Must be a ${shapeText} in range ${rangeText}.`);
        return;
      }
      checkedMetrics.push({ metricId: m.metricId, valueNumber: num });
    });

    // 自由文字:長度上限 + 控制字元剝除。非字串視為缺欄,不 String()-強制
    // (String({}) → "[object Object]" 會變成病歷文字)。
    const textField = (val, max, label) => {
      if (val === undefined || val === null || typeof val !== "string") return "";
      if (val.length > max) {
        errors.push(`${label} 超過長度上限(${max} 字,實際 ${val.length})。${label} exceeds the ${max}-char limit.`);
        return "";
      }
      return stripControlChars(val).trim();
    };
    const subjectiveText = textField(data.subjectiveText, MAX_PROSE_CHARS, "subjectiveText");
    const patientPerspective = textField(data.patientPerspective, MAX_PROSE_CHARS, "patientPerspective");
    const aeText = textField(data.aeSelfReport && data.aeSelfReport.text, MAX_REPORT_CHARS, "aeSelfReport.text");
    const expText = textField(data.exposureSelfReport && data.exposureSelfReport.text, MAX_REPORT_CHARS, "exposureSelfReport.text");

    if (errors.length) return { ok: false, errors, data: null };

    return {
      ok: true,
      errors: [],
      data: {
        patientCode: data.patientCode,
        payloadId: data.payloadId.trim(),
        filledAt: data.filledAt,
        metrics: checkedMetrics,
        subjectiveText,
        patientPerspective,
        aeSelfReport: (data.aeSelfReport && typeof data.aeSelfReport === "object" && !Array.isArray(data.aeSelfReport))
          ? { any: !!data.aeSelfReport.any, text: aeText }
          : { any: false, text: "" },
        exposureSelfReport: (data.exposureSelfReport && typeof data.exposureSelfReport === "object" && !Array.isArray(data.exposureSelfReport))
          ? { any: !!data.exposureSelfReport.any, text: expText }
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
    validatePrevisitShape
  };
})(typeof window !== "undefined" ? window : globalThis);
