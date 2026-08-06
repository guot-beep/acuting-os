# 提案 B — 症狀屬性架構(read-only,尚未實作)

狀態:**提案。本文件不改 template、不改 validator、不新增任何詞彙表。**
起因:Pilot 0 三張卡實測,`clinical_attributes` 適用維度 headache 4/4 · edema 3/4 · **fever 1/4**。
決定者:Ting。

---

## §0 問題的精確形狀

不是「詞彙表太小」。是**軸本身選錯了**。

`symptom_quality.json` 的 14 個值(脹刺隱空灼重竄絞酸掣墜麻冷跳)是一套**疼痛性質**詞彙。它對頭痛極好 —— 脹屬氣滯、刺屬血瘀,這是真正的辨證重量。但:

| 症狀 | 它真正的關鍵性質軸 | 現有 quality 能表達嗎 |
|---|---|---|
| 水腫 | 凹陷性 / 非凹陷性;皮膚繃急光亮 / 鬆軟 | ❌ |
| 發熱 | 壯熱 / 潮熱 / 身熱不揚 / 五心煩熱 / 往來寒熱 | ❌ |
| 咳嗽 | 乾咳 / 有痰;犬吠樣;陣發 / 持續 | ❌ |
| 痰 | 稀 / 黏 / 黃 / 白 / 難咯 | ❌ |
| 便秘 | 乾硬 / 排出無力 / 無便意 | ❌ |

**而且 `location` 也有同樣的病。** 模板 §6.3 寫 `location.vocabulary: "symptom_taxonomy"`,但 `symptom_taxonomy` 是 13 類**身體部位分類軸**(疼痛症狀 / 頭面 / 大小便…)。頭痛問部位的全部意義是**前額陽明 · 兩側少陽 · 巔頂厥陰 · 後枕太陽** —— 那是經絡分部,不是身體區塊,詞彙表停在「頭面」就沒了。

→ **兩個軸都是「宣告了一個維度,卻指向一個承載不了它的詞彙表」。**

---

## §1 你提的三個方向,逐一評估

### 方向 3(現況):template 宣告 applicable dimensions

**這已經是現況,而且它不是失敗的原因。**

Pilot 0 證明宣告機制本身運作良好 —— 我能誠實地把 fever 的 location/quality/laterality 標成 `applicable: false` 並寫下理由,驗證器接受,卡片也讀得懂。

**真正的限制是:可宣告的維度是一份寫死的清單。** 驗證器裡:

```js
const CARD_DIMENSIONS   = new Set(["location","quality","laterality","timing"]);
const INSTANCE_DIMENSIONS = new Set(["severity","duration","onset","frequency"]);
```

發熱需要的 `fever_pattern`、水腫需要的 `pitting_status`,**無論如何宣告都進不來** —— 它們不在集合裡,寫了就是 Y8「未核准欄位」。

→ **方向 3 的天花板不是宣告,是選單。單獨走這條路解決不了問題。**

### 方向 1:family-specific vocabularies

每個 symptom family 一組屬性(pain / edema / fever / cough…)。

**優點:** 語意乾淨,不會出現你擔心的「刺痛、凹陷性、犬吠樣住在同一個 quality 桶裡」。

**問題,而且是真的問題:**

1. **多重歸屬。** 胸痛同時是 pain 與 chest_respiratory;頭痛是 pain 與 head_face。Pilot 0 的 `sym.headache` 已經帶兩個 `taxonomy_ids`。family 若是單值就撐不住;若是多值,屬性就要合併,那 family 的「乾淨」也就沒了。
2. **從 3 張卡鑄造 family,正是 Pilot 0 剛剛證明危險的事。** 我現在知道 pain / edema / fever 三個 family,但那是因為我只做了這三張。咳嗽、痰、便秘、失眠、心悸各自會不會自成一家?**不知道 —— 而 family id 一旦鑄造就受 D1 約束。**

### 方向 2:reusable attribute registry

一份 `attribute.*` 登記,每個屬性有 id、名稱、值詞彙表;症狀卡挑用。

**優點:** 屬性可重用(`timing` 頭痛、發熱、水腫都要),新增一個軸不需要新增一個 family,也不會有多重歸屬問題。

**問題:** 沒有 family 就沒有一致性壓力 —— 12 張卡可能為同一件事發明 12 個名字(`sputum_color` / `phlegm_colour` / `tan_se`)。

---

## §2 建議:**方向 2 為地基,方向 1 延後,而且不要現在鑄造**

```
第一步(地基)   attribute registry —— 每個軸一個 id,指向自己的值詞彙表
第二步(可選)   family profiles —— 等 15 張卡看出哪些 bundle 真的重複出現才做
```

理由是 Pilot 0 剛剛給的教訓的同一句話:**不要在只有 3 個樣本時鑄造分類。**

attribute registry 是**加法**(多一個軸就多一筆),family 是**分類**(要決定每個症狀屬於誰)。加法可以邊做邊長,分類錯了要遷移。**先做那個錯了也便宜的。**

### 具體形狀(僅示意,未實作)

```jsonc
// data/config/symptom_attributes.json — 軸的登記處
{
  "attributes": [
    { "id": "attr.quality_pain",    "name_zh": "疼痛性質", "vocabulary": "symptom_quality" },
    { "id": "attr.pitting_status",  "name_zh": "凹陷性",   "vocabulary": "symptom_pitting" },
    { "id": "attr.fever_pattern",   "name_zh": "熱型",     "vocabulary": "symptom_fever_pattern" },
    { "id": "attr.timing",          "name_zh": "時間",     "vocabulary": "symptom_timing" },
    { "id": "attr.laterality",      "name_zh": "側性",     "vocabulary": "symptom_laterality" },
    { "id": "attr.channel_region",  "name_zh": "經絡分部", "vocabulary": "symptom_channel_region" }
  ]
}
```

症狀卡的 `clinical_attributes` 改成挑 `attr.*`,不再是寫死的四個 key。驗證器的 `CARD_DIMENSIONS` 從**常數集合**變成**讀 registry** —— 跟 `validate-relation-registry.js` 讓 relation registry 從文件變成 runtime 權威是同一手。

### 三條必須保留的東西

1. **`INSTANCE_DIMENSIONS` 不可變成可設定的。** severity / duration / onset / frequency 屬病例層(模板 §8),Y14 擋的就是這條線。**registry 化的是「卡片可以宣告哪些軸」,不是「卡片與病例的分界」。** 這條界線一旦可設定,遲早有人把 severity 設成 applicable。
2. **`applicable: false` 必須繼續要求寫 `why`。** Pilot 0 三張卡裡有 5 個 false,每一個的理由都是真訊息 —— 那是下一輪設計的輸入,不是雜訊。
3. **`symptom_quality` 不要改名、不要清空。** 它對疼痛是對的。做法是**旁邊長出 `attr.quality_pain` 指向它**,而不是把它改造成萬用桶(§0 只加深不刪除)。

---

## §3 這件事有多急?

**沒有 9/01 或 9/05 的 deadline。** 三張卡已經可以在 App 裡用,`applicable: false` + 理由是誠實且可讀的。

**但它會擋住剩下 12 張。** 那 12 張(咳嗽 · 氣短 · 口渴 · 胸痛 · 噁心 · 便秘 · 失眠 · 心悸 · 眩暈 · 腹脹 · 自汗 · 盜汗)大多不是疼痛症狀,照現況填會產生一批「四個軸關掉三個」的卡 —— 那不是資料,那是同一個缺陷複製 12 次。

→ 建議順序:**先決定 B(便宜、無 deadline、擋住 12 張),再看 A**。A 的 A1 分岔修復可以獨立先做,與 B 無關。
