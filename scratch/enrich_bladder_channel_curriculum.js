/**
 * scratch/enrich_bladder_channel_curriculum.js
 * 100% comprehensive enrichment for Bladder Channel (BL) including:
 * - All 67 Points detailed curriculum notes (BL1 to BL67)
 * - Divergent Channel (經別：別入腘中、入肛門、散於腎、合於足太陽)
 * - Luo Channel (絡脈：飛揚 BL58)
 * - Muscle Channel (經筋：維絡上眼瞼，形成目上綱)
 * - Dermatome (皮部：關樞)
 * - Channel Rhymes & Songs (循行歌、六十七穴分寸歌)
 * - Common Meridian Pathomechanism (常見經絡異常：是動病、主筋所生病與 11 段按診切診判讀)
 * - Meridian Care & Preservation (申時養生、推捏脊柱與腿部敲打、州都之官與淨腑水府氣化)
 */

const fs = require('fs');
const path = require('path');

const channelsFile = path.join(__dirname, '../data/channels/channels_and_charts.json');
const channels = JSON.parse(fs.readFileSync(channelsFile, 'utf8'));

const blChannel = channels.find(c => c.code === 'BL');

if (!blChannel) {
  console.error('BL channel not found!');
  process.exit(1);
}

blChannel.seam_anatomy_zh = `【體內循行路線】
從腰肌縫隙進入腹腔後，沿腹膜腔間隙到達並聯絡腎，向前至膀胱處的腹膜間隙聯屬膀胱。

【體表循行縫隙描述】
(1)頭面部體表循行縫隙:足太陽膀胱經，起於內眼角，沿額肌內側緣上額，與督脈交於頭頂部。頭部分支:從頭頂向兩側行至耳郭上方。
(2)軀幹部體表循行縫隙(第一側線):從頭頂部進入顱腔聯絡腦，返回後項部，沿斜方肌外側邊緣和豎脊肌第二列最長肌與髂肋肌之間的間隙到達腰部，沿此縫隙進入體腔內。
(3)腰部支脈體表循行縫隙:從豎脊肌最長肌與髂肋肌之間的間隙向下沿脊柱兩側的肌肉縫隙貫臀部，向下行於大腿後側正中股二頭肌與半膜肌、半腱肌之間的縫隙到達腘窩正中。
(4)肩頸部支脈體表循行縫隙(第二側線):(軀幹部)從肩胛骨內側緣向下，沿著髂肋肌外緣與後鋸肌之間的縫隙向下至腰部，沿臀大肌與臀中肌、小肌之間的縫隙下行，與少陽經交會;(大腿部)沿股二頭肌外側緣與髂脛束之間的縫隙下行至腘窩外側緣，與第一側線合於委中穴;(小腿部)委中至承山段行於腓腸肌兩肌腹之間，飛揚至崑崙段行於腓腸肌外側肌腹前緣與比目魚肌之間的縫隙，爾後行於跟腱與腓骨長短肌肌腱之間;(足部)沿跟骨下緣，行於第五跖骨粗隆下與足外側肌之間至第五腳趾外側指甲角。`;

blChannel.qihua_zh = `【足太陽經氣化與淨腑水府】
足太陽經，內屬膀胱，外行於睛明到至陰的縫隙中，通過足太陽經別加強對膀胱、腎的調節作用。膀胱又稱淨腑、水府、玉海、脬、尿胞。位於下腹部，在臟腑中，居最下處。《素問·靈蘭秘典論》曰：「膀胱者，州都之官，津液藏焉，氣化則能出矣。」說明足太陽經是人體水液儲存、分流、化氣成水或化水成氣的重要路徑，依靠腎氣的鼓動，並與手少陽三焦經共同行使此種功能。

【影響足太陽經氣化的因素】
主要有兩方面：一是膀胱藏津液的功能發生障礙，出現諸如癃閉、腫脹、尿頻、遺溺等病症；二是足太陽經在經絡循行路徑上的經氣運行出現障礙而發作的一些筋病，例如項、背、腰、尻、腘腨、腳皆痛等，都會出現足太陽經絡異常，集中在委中、飛揚、申脈、金門、京骨等處出現結絡或者結塊。

足太陽經氣化主要功能：貯存尿液、排泄小便、藏津液，化氣固表。`;

blChannel.pathomechanism_zh = `【主要病候】
1.臟腑病證：十二臟腑及其相關組織器官病證。
2.神志病：癲、狂、癇等。
3.頭面五官病：頭痛、鼻塞、鼻衄等。
4.經脈循行部位的其他病證：項、背、腰、下肢病證等。

【《靈樞·經脈》是動病與所生病原文】
主要病症 (是動病)：頭重痛，眼睛似將脫出，後項強直，脊背痛，腰似折斷，股關節不能彎曲，腘窩好像凝結，腓腸肌如要裂開；還可發生外踝部的氣血阻逆，如脈冷、麻木等症。
相關病症 (主筋所生病)：本經所屬腧穴能主治有關“筋”方面所發生的病症：痔，瘧疾，躁狂、癲癇，頭腦後項痛，眼睛昏黃，流淚，鼻塞，多涕或出血，後項、背腰部、骶尾部、膝彎、腓腸肌、腳都可發生病痛，小腳趾不好運用。

【常見經絡異常按診 11 段判讀】
1.循推背俞穴：若有硬結或腫物或壓痛，大多與相應臟腑有關。
2.膝以下循推時，首先從至陰、足通谷、束骨往上循推，如果在京骨、束骨出現小的沙粒狀結節或結塊，均提示足太陽膀胱經異常，一般屬於虛寒證。
3.至陰至飛揚的異常變化：提示腰椎病變，急性腰痛多有沙粒狀改變。
4.至陰至束骨：沙粒狀結節、結絡，提示腰背部肌肉的損傷、拉傷。
5.京骨若出現酸痛、鬆軟，表示足太陽經氣虛，如腰痛、腰酸無力、尿頻、憋尿不能。
6.在金門處若出現結節，提示經氣不順暢，如頭痛、泌尿系結石、腰痛、急性頭痛。
7.申脈出現結絡或結節，常提示腰痛、頭痛、共濟失調性步態。
8.崑崙處有結節，提示頭痛、眼部疾患。
9.委中有壓痛、結節、結絡或出現浮絡（異常突起靜脈），提示足太陽膀胱經循行部的腰背部肌肉、韌帶、筋腱有瘀血，或者有位置的異常，如偏歪、扭轉。
10.在殷門和承扶處肌肉較厚，如果在深部循摸到有棱角的結塊，要考慮是否有膀胱癌或前列腺癌，可建議患者做一些相關檢查。
11.足太陽膀胱經的經絡異常主要反映三方面的疾病：
第一：臟腑病。背部的背俞穴都在膀胱經上，臟腑有疾，五臟六腑的相關背俞穴可出現異常。
第二：頸、背、脊、腰部肌肉、筋腱、韌帶問題。如果頸項部、背、脊、腰或腰骶部出現僵硬、強直，一般提示足太陽膀胱經有寒濕。
第三：泌尿系感染或結石，會在足太陽膀胱經上出現異常。`;

blChannel.pathomechanism_en = `【Bladder Channel Pathomechanism (Shi Dong & Suo Sheng)】
• Shi Dong Pathologies: Severe headache, sensation of eyes popping out, rigid nape, spinal pain, lumbar feeling split, rigid hip joints, popliteal feeling bound, calf feeling split, arm/leg Bi-syndrome.
• Suo Sheng Pathologies (Disorders of Sinews / 筋): Hemorrhoids, malaria, mania, epilepsy, posterior head/neck pain, yellow eyes, tearing, nasal congestion/epistaxis, pain along neck, back, sacrum, popliteal area, calf, foot, and inability to use little toe.`;

blChannel.preservation_zh = `【膀胱經日常保養與導引】
• 申時(15:00~17:00)養生：申時是膀胱經當令，膀胱負責貯藏水液和津液,水液排出體外，津液循環在體內，此時宜適時飲水。申時體溫較高，陰虛的人最為突出。此時適當活動有助於體內津液循環,喝滋陰瀉火的茶水對陰虛的人最有效。
• 脊柱與腿部推捏敲打：膀胱經從頭頂到足部左右共134穴，可用雙手拇指和食指捏住脊柱兩邊肌肉(或用掌根)儘可能從頸椎一直推到尾骨，然後十指並攏,按住脊柱向上推回到開始的位置；腿部的膀胱經可用點揉或敲打的方式充分刺激穴位。每日1次，每次反復推幾遍。
• 禁忌：飲水後一定不要憋小便,否則不利於排毒。另外，午時睡個午覺，有利於保證申時精力充沛。`;

blChannel.preservation_en = `【Bladder Meridian Health Preservation & Self-Care】
• Clock Time Alignment (3:00 - 5:00 PM Shen Hour): Bladder meridian is most active. Drink warm water during Shen Hour to facilitate fluid circulation and waste excretion.
• Self-Care Massage & Tapping: Perform spinal kneading or rolling from C7 down to sacrum daily. Tap along the posterior thigh and calf to activate Bladder Qi.
• Cautions: Avoid holding urine after drinking water. Take a midday nap to maintain high energy during Shen Hour.`;

blChannel.divergent_channel_zh = `【足太陽膀胱經經別 (Bladder Divergent Channel)】
• 循行路線：從足太陽經脈的腘窩部分出，其中一條支脈在骶骨下五寸處別行進入肛門，上行歸屬膀胱，散布聯絡腎臟，沿脊柱兩旁的肌肉到心臟後散布於心臟內；直行的一條支脈，從脊柱兩旁的肌肉處繼續上行，淺出項部，脈氣仍注入足太陽本經。
• 分段結構：
  • 別入：于腘中，其一道行至尻下五寸處，別行入於肛門。
  • 別行：屬於膀胱，散於腎，當心入散，系舌本。
  • 出合：從膂上出於項。
  • 合於：足太陽。`;

blChannel.divergent_channel_en = `【Bladder Divergent Channel (Jing Bie)】
• Trajectory: Branches in popliteal fossa, ascends to sacrum, enters anus, pertains to Bladder, spreads in Kidneys, ascends along spine to Heart, and emerges at neck to rejoin main Bladder channel.
• Clinical Significance: Connects Bladder channel deeply to Heart, Kidney, Bladder, and anal region.`;

blChannel.luo_channel_zh = `【足太陽絡脈 —— 飛揚 (BL58 Luo-Connecting Channel)】
• 循行與病變：足太陽膀胱經的別行絡脈，名曰飛揚，在外踝上7寸處分出，走向足少陰腎經。其病變，實證為鼻塞流涕、頭背部疼痛，虛證為鼻流清涕、鼻衄，可取其絡穴飛揚治療。`;

blChannel.luo_channel_en = `【Bladder Luo-Connecting Vessel (Feiyang BL58)】
• Trajectory: Departs at BL58 (7 cun above lateral malleolus), connects to Kidney channel.
• Pathology: Excess: Nasal congestion, rhinorrhea, head & back pain. Deficiency: Clear nasal discharge, epistaxis. Treated via BL58.`;

blChannel.muscle_channel_zh = `【足太陽經筋 (Bladder Muscle Channel / Sinew Channel)】
• 循行路線：起於足小趾爪甲的外側，向上結於外踝，再斜向上結聚於膝部，在足背外側循行的一支結於足跟，上沿跟腱結於腘部；從外踝分出的一支，結於腨外（腓腸肌部），上行至腘窩內側緣，與腘部的一支並行上結於臀部；向上經軀幹挾於脊柱兩旁到項部；由此分出一支別入於內，結於舌根；直行的一支從項上結於枕骨，經頭頂行到顏面，結於鼻；再由鼻部分出維絡上眼瞼，形成目上綱，然後向下結於鼻旁；背部的分支，從腋後外側結於肩髃部；另一支從腋後進入腋下，向上繞行出於缺盆，上結於耳後顳骨乳突；還有一支從缺盆分出，斜向上結於鼻旁顴骨部，與從頭巔下行至顴部的分支相會合。`;

blChannel.muscle_channel_en = `【Bladder Muscle Channel (Jing Jin)】
• Trajectory: Originates at 5th toe, binds at lateral malleolus, heel, knee, popliteal, gluteus, spine, neck, tongue root, occiput, and connects over upper eyelid forming Eye Upper Lid (目上綱).
• Pathology: Eye lid twitching/ptosis, cramping along heel, calf, popliteal, gluteus, back, and neck.`;

blChannel.dermatome_zh = `【太陽皮部 —— 「關樞」(Taiyang Dermatome)】
• 太陽皮部名「關樞」（關者衛固也，太陽為三陽之關，主一身之表，統營衛而應皮毛，是衛外屏障，為諸經之藩籬）。
• 病理機制：陽氣衛外而為固，外邪侵犯人體，太陽經首先受病。《黃帝內經靈樞·百病始生》說：「是故虛邪之中人也，始於皮膚，皮膚緩則腠理開，開則邪從毛發入……」外邪束表，正氣向外抗邪，出現惡寒發熱，脈浮，頭項強痛。治當解表，善治者治皮毛。`;

blChannel.channel_rhyme_zh = `【足太陽膀胱經循行歌與六十七穴分寸歌】
「BL六十七膀胱經，起於睛明至陰終，臟腑頭面筋痔腰，熱病神志身后憑。
內眦上外是睛明，眉頭陷中攢竹取，眉衝直上旁神庭，曲差庭旁一寸半，
五處直後上星平，承光通天絡卻穴，后行俱是寸半程，玉枕腦戶旁寸三，
天柱筋外平啞門，再下脊旁寸半尋，第一大杼二風門，三椎肺俞四厥陰，
心五督六膈俞七，九肝十膽仔細分，十一脾俞十二胃，十三三焦十四腎，
氣海十五大腸六，七八關元小腸俞，十九膀胱廿中膂，廿一椎旁白環俞，
上次中下四髎穴，骶骨兩旁骨陷中，尾骨之旁會陽穴，承扶臀下橫紋中，
殷門扶下六寸當，浮郄委陽上一寸，委陽腘窩外筋旁，委中腘窩紋中央，
第二側線再細詳，以下夾脊開三寸，二三附分魄戶當，四椎膏肓神堂五，
六七譩譆膈關藏，第九魂門陽綱十，十一意舍二胃倉，十三肓門四志室，
十九胞膏廿一秩邊，小腿各穴牢牢記，紋下二寸尋合陽，紋下五寸承筋當，
承山腨下分肉藏，飛揚外踝上七寸，跗陽踝上三寸良，崑崙外踝跟腱間，
仆參昆下跟骨外，外踝下緣申脈穴，踝前骰陷金門鄉，大骨前下尋京骨，
關節之後束骨良，通谷節前陷中好，至陰小趾外甲角。六十七穴分三段，
頭后中外次第找。」`;

// Create curriculum notes array for all 67 BL points
const rawPointsData = [
  { code: "BL1", nameZh: "睛明", category: "交會穴 · 眼睛目疾要穴", location: "目內眦角稍上方凹陷處", needling: "囑患者閉目，將眼球推向外側，沿眼眶邊緣緩緩直刺 0.5-1.0 寸。⚠️ 嚴禁提插撚轉。古不宜灸。", actions: "清熱明目、祛風止痛", indications: "目赤腫痛、流淚、視物不明、目眩、近視、夜盲、色盲、乾眼症、急性腰扭傷、坐骨神經痛、心悸、怔忡", notes: "【課件考綱精華】眼睛目疾第一要穴；也可治療遠道急性腰扭傷。" },
  { code: "BL2", nameZh: "攢竹", category: "局部要穴 · 眉頭要穴", location: "額部，眉頭凹陷中，眶上切跡處", needling: "平刺 0.5-0.8 寸，或點刺出血。可灸。", actions: "祛風明目、通絡止痛", indications: "頭痛、眉稜骨痛、眼瞼瞤動、眼瞼下垂、口眼歪斜、目視不明、流淚、目赤腫痛、呃逆", notes: "【課件考綱精華】眉稜骨痛、眼瞼瞤動與呃逆（打嗝）要穴。" },
  { code: "BL3", nameZh: "眉衝", category: "頭部要穴", location: "頭部，眉頭直上入髮際0.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "祛風清頭、通鼻開竅", indications: "頭痛、目眩、鼻塞、鼻衄、癲癇", notes: "【課件考綱精華】頭痛目眩與鼻塞鼻衄。" },
  { code: "BL4", nameZh: "曲差", category: "頭部要穴", location: "頭部，前髮際正中旁開1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清頭明目、通鼻止痛", indications: "頭痛、目眩、鼻病、鼻塞、鼻衄", notes: "【課件考綱精華】前頭痛與鼻病。" },
  { code: "BL5", nameZh: "五處", category: "頭部要穴", location: "頭部，前髮際直上1.0寸，旁開1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "平肝息風、清頭明目", indications: "頭痛、目眩、癲癇", notes: "【課件考綱精華】頭痛與癲癇。" },
  { code: "BL6", nameZh: "承光", category: "頭部要穴", location: "頭部，前髮際直上2.5寸，旁開1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清熱祛風、明目通鼻", indications: "頭痛、目眩、鼻塞", notes: "【課件考綱精華】頭痛目眩與鼻塞。" },
  { code: "BL7", nameZh: "通天", category: "頭部鼻病要穴", location: "頭部，前髮際直上4.0寸，旁開1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清風通竅、升清降濁", indications: "頭痛、眩暈、鼻病、鼻塞、鼻衄、鼻淵（鼻竇炎）、癲癇", notes: "【課件考綱精華】鼻淵（鼻竇炎）、鼻塞鼻衄第一要穴。" },
  { code: "BL8", nameZh: "絡卻", category: "頭部要穴", location: "頭部，前髮際直上5.5寸，旁開1.5寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "清頭明目、通絡寧神", indications: "頭暈、目視不明、耳鳴", notes: "【課件考綱精華】頭暈與耳鳴目暗。" },
  { code: "BL9", nameZh: "玉枕", category: "後頭部要穴", location: "後頭部，枕外隆凸上緣旁开1.3寸", needling: "平刺 0.3-0.5 寸。可灸。", actions: "通經止痛、清頭明目", indications: "頭項痛、目痛、鼻塞", notes: "【課件考綱精華】後頭痛與項強。" },
  { code: "BL10", nameZh: "天柱", category: "項部要穴 · 天牖五部/天窗穴", location: "項部，大筋（斜方肌）外緣凹陷中，後髮際正中旁開1.3寸", needling: "直刺 0.5-0.8 寸。⚠️ 嚴禁向上方深刺，防止傷及延髓。可灸。", actions: "祛風散寒、清頭明目、通絡止痛、安神定志", indications: "後頭痛、項強（頸椎痛）、肩背腰痛、鼻塞、目痛、癲狂癇、熱病", notes: "【課件考綱精華】頸項強痛與後頭痛要穴；嚴禁向上深刺延髓。" },
  { code: "BL11", nameZh: "大杼", category: "八會穴之骨會 · 手足太陽/少陽交會穴", location: "背部，第1胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避開肺臟。可灸。", actions: "強筋骨 (Hui-Bone)、宣肺解表、舒筋通絡", indications: "咳嗽、發熱、項強、肩背痛、骨節疼痛（骨痹/骨質疏鬆）", notes: "【課件考綱精華】八會穴之骨會：治全身骨骼關節疾病與骨痛。" },
  { code: "BL12", nameZh: "風門", category: "督脈與足太陽交會穴 · 外感風邪要穴", location: "背部，第2胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避開肺臟。可灸。", actions: "宣肺解表 (Expels Wind)、祛風通絡", indications: "感冒、咳嗽、發熱、頭痛、項強、胸背痛", notes: "【課件考綱精華】預防與治療外感風寒感冒第一要穴。" },
  { code: "BL13", nameZh: "肺俞", category: "肺之背俞穴 (Lung Back-Shu)", location: "背部，第3胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避免深刺致氣胸。可灸。", actions: "調補肺氣 (Tonifies Lung Qi)、宣肺平喘、清熱潤肺、固表止汗", indications: "咳嗽、氣喘、咯血、骨蒸潮熱、盜汗、皮膚病、瘙癢、癮疹", notes: "【課件考綱精華】肺臟背俞穴：治療一切肺系疾病（咳喘）與皮膚病。" },
  { code: "BL14", nameZh: "厥陰俞", category: "心包之背俞穴 (Pericardium Back-Shu)", location: "背部，第4胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避開肺臟。可灸。", actions: "寬胸理氣、活血通絡、清心安神", indications: "心痛、心悸、咳嗽、胸悶、嘔吐", notes: "【課件考綱精華】心包背俞穴：心胸痛與心悸。" },
  { code: "BL15", nameZh: "心俞", category: "心之背俞穴 (Heart Back-Shu)", location: "背部，第5胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避開肺臟。可灸。", actions: "養心安神 (Calms Spirit)、清心火、調和氣血", indications: "心痛、驚悸、失眠、健忘、癲癇、咳嗽、咯血、盜汗、遺精", notes: "【課件考綱精華】心臟背俞穴：治療失眠、心悸、心痛與神志病要穴。" },
  { code: "BL16", nameZh: "督俞", category: "背部要穴", location: "背部，第6胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "寬胸理氣、和胃止痛", indications: "心痛、胸悶、寒熱、氣喘、腹脹、腹痛、腸鳴、呃逆", notes: "【課件考綱精華】胸悶心痛與呃逆。" },
  { code: "BL17", nameZh: "膈俞", category: "八會穴之血會 (Hui-Blood) · 寬胸降逆要穴", location: "背部，第7胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避開肺臟。可灸。", actions: "活血化瘀 (Hui-Blood)、涼血止血、寬胸降逆、理氣和胃", indications: "嘔吐、呃逆（打嗝特效）、氣喘、吐血、癮疹、皮膚瘙癢、貧血、潮熱、盜汗", notes: "【課件考綱精華】① 八會穴之血會：治療一切血證（貧血/出血/血瘀）。② 打嗝呃逆第一要穴。" },
  { code: "BL18", nameZh: "肝俞", category: "肝之背俞穴 (Liver Back-Shu)", location: "背部，第9胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避開肝臟與肺。可灸。", actions: "疏肝利膽 (Courses Liver Qi)、養血明目 (Benefits Eyes)、平肝熄風", indications: "脅痛、黃疸、目疾、目赤、目視不明、目眩、夜盲、迎風流淚、癲狂癇、脊背痛", notes: "【課件考綱精華】肝臟背俞穴：肝氣鬱結脅痛與眼睛目疾要穴。" },
  { code: "BL19", nameZh: "膽俞", category: "膽之背俞穴 (Gallbladder Back-Shu)", location: "背部，第10胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "清膽利濕、和胃降逆", indications: "黃疸、口苦、脅痛、肺癆、潮熱", notes: "【課件考綱精華】膽囊背俞穴：黃疸、口苦與脅痛。" },
  { code: "BL20", nameZh: "脾俞", category: "脾之背俞穴 (Spleen Back-Shu)", location: "背部，第11胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "健脾和胃 (Tonifies Spleen)、化濕升清、統血統津", indications: "腹脹、納呆、嘔吐、腹瀉、痢疾、便血、水腫、多食善飢、身體消瘦、背痛", notes: "【課件考綱精華】脾臟背俞穴：脾虛腹瀉、水腫與消化不良。" },
  { code: "BL21", nameZh: "胃俞", category: "胃之背俞穴 (Stomach Back-Shu)", location: "背部，第12胸椎棘突下旁開1.5寸", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "和胃健脾、理氣降逆", indications: "胃脘痛、嘔吐、腹脹、腸鳴、多食善飢、身體消瘦", notes: "【課件考綱精華】胃臟背俞穴：胃痛、胃脹與嘔吐。" },
  { code: "BL22", nameZh: "三焦俞", category: "三焦之背俞穴 (San Jiao Back-Shu)", location: "腰部，第1腰椎棘突下旁開1.5寸", needling: "直刺 0.5-1.0 寸。可灸。", actions: "通調水道 (Regulates Water Passages)、利水消腫、健脾利濕", indications: "腸鳴、腹脹、嘔吐、腹瀉、痢疾、小便不利、水腫、腰背強痛", notes: "【課件考綱精華】三焦背俞穴：水腫、小便不利與腹脹。" },
  { code: "BL23", nameZh: "腎俞", category: "腎之背俞穴 (Kidney Back-Shu) · 補腎第一要穴", location: "腰部，第2腰椎棘突下旁開1.5寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "益腎助陽 (Tonifies Kidney Qi/Yin/Yang)、強腰利水、聰耳明目、固精止帶", indications: "頭暈、耳鳴、耳聾、腰酸痛、遺尿、遺精、陽痿、早瀉、不育、月經不調、帶下、不孕、消渴", notes: "【課件考綱精華】補腎第一要穴（腎虛腰痛、耳鳴、生殖泌尿病）。" },
  { code: "BL24", nameZh: "氣海俞", category: "腰部要穴", location: "腰部，第3腰椎棘突下旁開1.5寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "培元補氣、強腰調經", indications: "腸鳴、腹脹、痛經、腰痛", notes: "【課件考綱精華】腰痛與痛經。" },
  { code: "BL25", nameZh: "大腸俞", category: "大腸之背俞穴 (Large Intestine Back-Shu)", location: "腰部，第4腰椎棘突下旁開1.5寸 (平髂嵴高點)", needling: "直刺 0.8-1.2 寸。可灸。", actions: "理氣腸胃 (Regulates Intestines)、通調腑氣、強腰利膝", indications: "腰腿痛、腹脹、腹瀉、便秘", notes: "【課件考綱精華】大腸背俞穴：腰痛、便秘與腹瀉。" },
  { code: "BL26", nameZh: "關元俞", category: "腰部要穴", location: "腰部，第5腰椎棘突下旁開1.5寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "調固下焦、強腰利尿", indications: "腹脹、洩瀉、腰骶痛、小便頻數或不利、遺尿", notes: "【課件考綱精華】腰骶痛與小便頻數。" },
  { code: "BL27", nameZh: "小腸俞", category: "小腸之背俞穴 (Small Intestine Back-Shu)", location: "骶部，第1骶後孔旁開1.5寸 (平第1骶椎棘突)", needling: "直刺 0.8-1.2 寸。可灸。", actions: "清熱利濕、調理小腸、通利小便", indications: "遺精、遺尿、尿血、尿痛、帶下、腹瀉、痢疾、疝氣、腰骶痛", notes: "【課件考綱精華】小腸背俞穴：尿痛尿血與腰骶痛。" },
  { code: "BL28", nameZh: "膀胱俞", category: "膀胱之背俞穴 (Bladder Back-Shu)", location: "骶部，第2骶後孔旁開1.5寸 (平第2骶椎棘突)", needling: "直刺 0.8-1.2 寸。可灸。", actions: "清熱利濕、通調膀胱氣化、強腰骶", indications: "小便不利、遺尿、腹瀉、便秘、腰脊強痛", notes: "【課件考綱精華】膀胱背俞穴：小便不利、遺尿與腰骶痛。" },
  { code: "BL29", nameZh: "中膂俞", category: "骶部要穴", location: "骶部，第3骶椎棘突下旁開1.5寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "溫陽散寒、調腸止瀉", indications: "腹瀉、疝氣、腰骶痛", notes: "【課件考綱精華】腰骶痛與腹瀉疝氣。" },
  { code: "BL30", nameZh: "白環俞", category: "骶部婦科要穴", location: "骶部，第4骶椎棘突下旁開1.5寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "調經止帶、固精利尿", indications: "遺尿、遺精、月經不調、帶下、疝氣、腰骶痛", notes: "【課件考綱精華】白帶過多與月經不調。" },
  { code: "BL31", nameZh: "上髎", category: "八髎穴之一 (Eight Liaos)", location: "骶部，第1骶後孔中", needling: "直刺 1.0-1.5 寸。可灸。", actions: "理下焦、調經止帶、通絡止痛", indications: "大小便不利、月經不調、帶下、陰挺、遺精、陽痿、腰骶痛", notes: "【課件考綱精華】八髎穴：婦科與腰骶痛。" },
  { code: "BL32", nameZh: "次髎", category: "八髎穴之一 (Primary Gynecological Liao)", location: "骶部，第2骶後孔中", needling: "直刺 1.0-1.5 寸。可灸。", actions: "補腎調經 (Gynecological primary)、理下焦、強腰骶", indications: "月經不調、痛經、帶下、小便不利、遺精、陽痿、疝氣、腰骶痛、下肢痿痺", notes: "【課件考綱精華】八髎穴中治痛經與婦科第一要穴。" },
  { code: "BL33", nameZh: "中髎", category: "八髎穴之一", location: "骶部，第3骶後孔中", needling: "直刺 1.0-1.5 寸。可灸。", actions: "通調二便、調經止帶", indications: "便秘、洩瀉、小便不利、月經不調、帶下、腰骶痛", notes: "【課件考綱精華】二便不利與腰骶痛。" },
  { code: "BL34", nameZh: "下髎", category: "八髎穴之一", location: "骶部，第4骶後孔中", needling: "直刺 1.0-1.5 寸。可灸。", actions: "通調二便、理少腹", indications: "腹痛、便秘、小便不利、帶下、腰骶痛", notes: "【課件考綱精華】腹痛便秘與腰骶痛。" },
  { code: "BL35", nameZh: "會陽", category: "尾骶部要穴", location: "尾骶部，尾骨尖旁開0.5寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "清熱利濕、止瀉止血", indications: "痔疾、腹瀉、便血、陽痿、帶下", notes: "【課件考綱精華】痔瘡與便血要穴。" },
  { code: "BL36", nameZh: "承扶", category: "臀部要穴", location: "臀大肌下緣，臀橫紋中央", needling: "直刺 1.5-2.5 寸。可灸。", actions: "舒筋活絡、通利關節", indications: "腰、骶、臀、股部疼痛、痔疾", notes: "【課件考綱精華】坐骨神經痛與臀股痛。" },
  { code: "BL37", nameZh: "殷門", category: "大腿後側要穴", location: "大腿後側，承扶(BL36)與委中(BL40)連線上，承扶下6寸", needling: "直刺 1.0-2.0 寸。可灸。", actions: "舒筋通絡、強腰利膝", indications: "腰痛、下肢痿痺 (坐骨神經痛)", notes: "【課件考綱精華】坐骨神經痛與下肢麻痺。" },
  { code: "BL38", nameZh: "浮隙", category: "腘窩要穴", location: "腘窩外成，委陽(BL39)上1寸，股二頭肌肌腱內側", needling: "直刺 0.5-1.0 寸。可灸。", actions: "舒筋活絡、通便止痛", indications: "股腘部疼痛、麻木、便秘", notes: "【課件考綱精華】腘部痛與便秘。" },
  { code: "BL39", nameZh: "委陽", category: "三焦之下合穴 (San Jiao Lower He-Sea)", location: "腘窩外側，股二頭肌肌腱內側緣，腘橫紋上", needling: "直刺 0.5-1.0 寸。可灸。", actions: "通調三焦、利水消腫 (Lower He-Sea of San Jiao)", indications: "腹滿、小便不利、水腫、腰脊強痛、腿足攣痛", notes: "【課件考綱精華】三焦下合穴：利水消腫與小便不利。" },
  { code: "BL40", nameZh: "委中", category: "膀胱之下合穴 · 五輸穴之合穴 (土穴) · 四總穴 (腰背委中求)", location: "腘窩橫紋中點，股二頭肌肌腱與半腱肌肌腱之間", needling: "直刺 1.0-1.5 寸，或點刺腘靜脈出血 (Prick to bleed)。可灸。", actions: "舒筋通絡 (Master of 腰背)、清熱涼血、瀉毒除濕、通利膀胱", indications: "腰背痛（腰背委中求）、下肢痿痺、膝關節痛、腹痛、急性吐瀉、癮疹、丹毒、小便不利、遺尿", notes: "【課件考綱精華】① 四總穴（腰背委中求）：腰背痛第一要穴。② 點刺腘靜脈出血治丹毒皮膚病與急性吐瀉。" },
  { code: "BL41", nameZh: "附分", category: "第二側線要穴", location: "背部，第2胸椎棘突下旁開3.0寸", needling: "斜刺 0.5-0.8 寸。⚠️ 避免深刺。可灸。", actions: "舒筋活絡、祛風散寒", indications: "頸項強痛、肩背拘急、肘臂麻木", notes: "【課件考綱精華】頸項強痛與肩背拘急。" },
  { code: "BL42", nameZh: "魄戶", category: "第二側線要穴", location: "背部，第3胸椎棘突下旁開3.0寸 (平肺俞)", needling: "斜刺 0.5-0.8 寸。⚠️ 避免深刺。可灸。", actions: "宣肺平喘、清熱理氣", indications: "咳嗽、氣喘、肺癆、項強、肩背痛", notes: "【課件考綱精華】咳嗽氣喘與肺癆。" },
  { code: "BL43", nameZh: "膏肓", category: "慢性虛損與大補第一要穴 (Gaohuang)", location: "背部，第4胸椎棘突下旁開3.0寸", needling: "斜刺 0.5-0.8 寸。可重灸。", actions: "大補虛損 (Nourishes all deficiencies)、補肺健脾、培元固本", indications: "咳嗽、氣喘、肺癆、健忘、遺精、盜汗、羸瘦（消瘦虛弱）、肩胛痛", notes: "【課件考綱精華】「藥石皆不可及，唯灸膏肓」：大補慢性虛損第一要穴。" },
  { code: "BL44", nameZh: "神堂", category: "第二側線要穴", location: "背部，第5胸椎棘突下旁開3.0寸 (平心俞)", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "寬胸理氣、安神定志", indications: "咳嗽、氣喘、胸悶、脊背強痛", notes: "【課件考綱精華】胸悶與脊背強痛。" },
  { code: "BL45", nameZh: "譩譆", category: "第二側線要穴", location: "背部，第6胸椎棘突下旁開3.0寸", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "宣肺解表、和營理氣", indications: "咳嗽、氣喘、肩背痛、瘧疾、熱病", notes: "【課件考綱精華】肩背痛與瘧疾發熱。" },
  { code: "BL46", nameZh: "膈關", category: "第二側線要穴", location: "背部，第7胸椎棘突下旁開3.0寸 (平膈俞)", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "寬胸降逆、理氣和胃", indications: "胸悶、曖氣、嘔吐、脊背強痛", notes: "【課件考綱精華】暖氣嘔吐與胸悶。" },
  { code: "BL47", nameZh: "魂門", category: "第二側線要穴", location: "背部，第9胸椎棘突下旁開3.0寸 (平肝俞)", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "疏肝理氣、降逆和胃", indications: "胸脅痛、背痛、嘔吐、腹瀉", notes: "【課件考綱精華】脅痛與背痛嘔吐。" },
  { code: "BL48", nameZh: "陽綱", category: "第二側線要穴", location: "背部，第10胸椎棘突下旁開3.0寸 (平膽俞)", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "清膽利濕、和胃消滯", indications: "腸鳴、腹痛、腹瀉、黃疸、消渴", notes: "【課件考綱精華】黃疸與腹痛腹瀉。" },
  { code: "BL49", nameZh: "意舍", category: "第二側線要穴", location: "背部，第11胸椎棘突下旁開3.0寸 (平脾俞)", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "健脾和胃、化濕消滯", indications: "腹脹、腸鳴、嘔吐、腹瀉", notes: "【課件考綱精華】腹脹腸鳴與嘔吐腹瀉。" },
  { code: "BL50", nameZh: "胃倉", category: "第二側線要穴", location: "背部，第12胸椎棘突下旁開3.0寸 (平胃俞)", needling: "斜刺 0.5-0.8 寸。可灸。", actions: "和胃健脾、消食導滯", indications: "胃脘痛、腹脹、小兒食積、水腫、背脊痛", notes: "【課件考綱精華】胃痛與小兒食積。" },
  { code: "BL51", nameZh: "肓門", category: "第二側線要穴", location: "腰部，第1腰椎棘突下旁開3.0寸 (平三焦俞)", needling: "直刺 0.5-1.0 寸。可灸。", actions: "理氣散結、通利腑氣", indications: "腹痛、胃痛、便秘、痞塊、乳疾", notes: "【課件考綱精華】腹痛便秘與痞塊。" },
  { code: "BL52", nameZh: "志室", category: "補腎強腰要穴", location: "腰部，第2腰椎棘突下旁開3.0寸 (平腎俞)", needling: "直刺 0.8-1.2 寸。可灸。", actions: "益腎固精、強腰利水", indications: "遺精、陽痿、小便不利、水腫、腰脊強痛", notes: "【課件考綱精華】腎虛遺精陽痿與腰脊痛。" },
  { code: "BL53", nameZh: "胞肓", category: "第二側線要穴", location: "平第2骶後孔，旁開3.0寸", needling: "直刺 0.8-1.2 寸。可灸。", actions: "通利二便、理少腹", indications: "腸鳴、腹脹、便秘、癃閉、腰脊強痛", notes: "【課件考綱精華】便秘癃閉與腰脊痛。" },
  { code: "BL54", nameZh: "秩邊", category: "坐骨神經痛與痔疾要穴", location: "平第4骶後孔，旁開3.0寸", needling: "直刺 1.5-2.5 寸。可灸。", actions: "舒筋通絡 (Sciatica primary)、清熱利濕、通利二便", indications: "腰骶痛、下肢痿痺 (坐骨神經痛)、小便不利、癃閉、便秘、痔疾、陰痛", notes: "【課件考綱精華】坐骨神經痛與痔瘡便秘特效穴。" },
  { code: "BL55", nameZh: "合陽", category: "小腿部要穴", location: "小腿後側，委中(BL40)與承山(BL57)連線上，委中下2寸", needling: "直刺 1.0-1.5 寸。可灸。", actions: "舒筋通絡、調經止血", indications: "腰脊強痛、下肢痿痺、疝氣、崩漏", notes: "【課件考綱精華】腰痛與崩漏。" },
  { code: "BL56", nameZh: "承筋", category: "小腿部要穴", location: "小腿後側，腓腸肌兩肌腹之間，委中下5寸", needling: "直刺 1.0-1.5 寸。可灸。", actions: "舒筋活絡、清熱通便", indications: "腰腿拘急、疼痛、痔疾", notes: "【課件考綱精華】腓腸肌痙攣抽筋。" },
  { code: "BL57", nameZh: "承山", category: "痔瘡與腓腸肌抽筋第一要穴 (Chengshan)", location: "小腿後側，腓腸肌兩肌腹交界處凹陷中 (委中下8寸)", needling: "直刺 1.0-2.0 寸。可灸。", actions: "理腸通便 (Primary for Hemorrhoids)、舒筋活絡 (Primary for Calf Cramps)、強腰止痛", indications: "腰腿拘急、疼痛、痔疾（痔瘡第一要穴）、便秘、腹痛、疝氣、小腿抽筋（腿抽筋特效）", notes: "【課件考綱精華】① 痔瘡治療第一要穴。② 腓腸肌痙攣（小腿抽筋）特效穴。" },
  { code: "BL58", nameZh: "飛揚", category: "絡穴 (Luo-Connecting Point to Kidney Channel)", location: "小腿後外側，外踝尖直上7寸，承山(BL57)外下方1寸", needling: "直刺 1.0-1.5 寸。可灸。", actions: "清頭明目、疏風解表、通絡止痛 (Treats Head & Lumbar pain)", indications: "腰腿疼痛、頭痛、目眩、鼻塞、鼻衄、痔疾", notes: "【課件考綱精華】① 絡穴：腰腿痛與頭痛目眩。② 鼻塞鼻衄。" },
  { code: "BL59", nameZh: "跗陽", category: "陽貎脈之郄穴 (Yang Qiao Xi-Cleft Point)", location: "小腿外側，外踝尖直上3寸，昆崙(BL60)直上", needling: "直刺 0.8-1.2 寸。可灸。", actions: "舒筋立節、通絡止痛 (Xi-Cleft of Yang Qiao)", indications: "腰骶痛、下肢痿痺、外踝腫痛、頭痛", notes: "【課件考綱精華】陽貎脈郄穴：急性腰骶痛與外踝痛。" },
  { code: "BL60", nameZh: "崑崙", category: "五輸穴之經穴 (Jing-River - 火穴) · 催產與後頭痛要穴", location: "足外側部，外踝尖與跟腱之間的凹陷中", needling: "直刺 0.5-0.8 寸。⚠️ 孕婦禁針 (Contraindicated in pregnancy). 可灸。", actions: "舒筋活絡、清頭明目、催產下胎 (Promotes Labor)", indications: "後頭痛、項強、目眩、腰骶疼痛、足踝腫痛、癲癇、滯產（難產/催產）", notes: "【課件考綱精華】① 催產下胎要穴：滯產/難產使用；孕婦嚴禁針灸。② 後頭痛與腰骶痛。" },
  { code: "BL61", nameZh: "仆參", category: "足跟痛要穴", location: "足外側部，跟骨外側，崑崙(BL60)直下，赤白肉際處", needling: "直刺 0.3-0.5 寸。可灸。", actions: "強足跟、安神息風", indications: "下肢痿痺、足跟痛（Plantalgia）、癲癇", notes: "【課件考綱精華】足跟痛（足跟骨刺/筋膜炎）要穴。" },
  { code: "BL62", nameZh: "申脈", category: "八脈交會穴 (通陽貎脈 - 配後谿 SI3) · 治失眠/嗜睡要穴", location: "足外側部，外踝尖直下方凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "通陽貎脈 (Master of Yang Qiao)、寧心安神、平息內風、舒筋利節", indications: "頭痛、眩暈、失眠（配照海 KI6 治失眠與晝日嗜睡）、腰腿酸痛、癲癇、目赤腫痛", notes: "【課件考綱精華】① 八脈交會穴通陽貎脈（配後谿 SI3 治頭痛頸腰痛）。② 晝日嗜睡或失眠（陽貎盛則目張不眠）。" },
  { code: "BL63", nameZh: "金門", category: "郄穴 (Xi-Cleft Point of Bladder Channel)", location: "足背外側，外踝前下方，骰骨下緣凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "緩急止痛 (Moderates Acute Conditions)、通絡止痛、安神息風", indications: "痛證、痹證、頭痛、腰痛、下肢痿痺、外踝痛、癲癇、小兒驚風", notes: "【課件考綱精華】郄穴：急性腰痛、頭痛與外踝痛。" },
  { code: "BL64", nameZh: "京骨", category: "原穴 (Yuan-Source Point of Bladder Channel)", location: "足外側部，第5跖骨粗隆下方，赤白肉際處", needling: "直刺 0.3-0.5 寸。可灸。", actions: "清頭明目、寧神息風、強腰舒筋 (Yuan-Source Point)", indications: "頭痛、項強、腰腿痛、癲癇、目翳", notes: "【課件考綱精華】原穴：足太陽經氣虛之腰痛尿頻。" },
  { code: "BL65", nameZh: "束骨", category: "五輸穴之輸穴 (Shu-Stream - 木穴/瀉穴)", location: "足外側部，第5跖趾關節的後下方赤白肉際凹陷中", needling: "直刺 0.3-0.5 寸。可灸。", actions: "清頭明目、通絡止痛", indications: "頭痛、項強、目眩、腰腿痛、癲狂", notes: "【課件考綱精華】輸穴：頭痛項強與腰腿痛。" },
  { code: "BL66", nameZh: "足通谷", category: "五輸穴之滎穴 (Ying-Spring - 水穴/本穴 Fire/Water)", location: "足外側部，第5跖趾關節的前下方赤白肉際凹陷中", needling: "直刺 0.2-0.3 寸。可灸。", actions: "清熱息風、清頭明目", indications: "頭痛、項強、目眩、鼻衄、癲狂", notes: "【課件考綱精華】滎穴本穴：清風熱、頭痛目眩。" },
  { code: "BL67", nameZh: "至陰", category: "五輸穴之井穴 (Jing-Well - 金穴/母穴) · 轉胎位第一要穴", location: "足小趾外側，指甲角旁0.1寸", needling: "淺刺 0.1 寸，或艾條溫灸 (Moxibustion for Breech presentation)。", actions: "矯正胎位 (Primary for Breech Presentation)、催產下胎、清頭明目", indications: "胎位不正（Breech Presentation第一要穴）、滯產（難產）、頭痛、目痛、鼻塞、鼻衄", notes: "【課件考綱精華】① 矯正胎位第一要穴（艾條雙側至陰穴溫灸）。② 井穴急救。" }
];

blChannel.points_curriculum = rawPointsData;

fs.writeFileSync(channelsFile, JSON.stringify(channels, null, 2), 'utf8');
console.log('Successfully updated Bladder Channel (BL) with full 67 points, Luo channel, Dermatome, and 11-Segment Palpation Diagnosis!');
