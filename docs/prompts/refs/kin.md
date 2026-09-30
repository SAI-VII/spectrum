<!-- 由 tools/gen-prompts.js 自動產生;請改 src/data/canon.js 或 src/prompts.js 後重新執行,不要手改 -->

# 念 · 念故者 Those we keep · 3D 參考圖指令(7 位)

每段一次生成 4 張灰底雕像參考圖。下載後按編號存成 `assets/refs/{編號}.png`,再執行 `node tools/meshy/generate.mjs --mode image`。
想要更準的背面:對單張圖再貼「四視圖」指令(見 app 內該靈體的「圖像與 3D 指令 → 四視圖」),存成 `assets/refs/{編號}/front.png、right.png、back.png、left.png`。

## 第 1 批

- [ ] 第 1 張 → `assets/refs/233.png` · 大士王（盂蘭鬼王） · King of Ghosts effigy
- [ ] 第 2 張 → `assets/refs/185.png` · 祖先煞（反常） · Ancestral wrath (aberrant)
- [ ] 第 3 張 → `assets/refs/170.png` · 家廟祖靈 · Clan Ancestral Spirit
- [ ] 第 4 張 → `assets/refs/186.png` · 祖先靈（香港） · Ancestral spirits (HK)

```text
Create 4 separate images, one for each statue below. Every image follows the same rules:
- square 1:1 studio reference photograph of a physical collectible statue, for image-to-3D reconstruction
- three-quarter front view from slightly above eye level, 85mm lens, whole statue and plinth in frame with about 10% margin
- soft even low-contrast front light, no cast shadows, no rim glow, no depth of field, seamless flat mid-grey background (#808080)
- one solid connected object; thicken wire-thin parts; smoke, flames, water and light are carved solid and attached, never floating
- base: a low hexagonal wooden altar base with a brass trim
- no text

1. King of Ghosts effigy (大士王（盂蘭鬼王）): a giant paper effigy of the Ghost King with a fierce blue face, horns and bulging eyes, a small image of Guanyin sitting on top of his head. Pose: seated on a festival stage. Attributes: flags, paper armour, Guanyin on his head. Material: painted paper, bamboo and gold foil.
2. Ancestral wrath (祖先煞（反常）): a troubled elderly ancestor figure in old-fashioned clothes, frowning, standing behind a cracked spirit tablet. Pose: standing with arms crossed in disapproval. Attributes: cracked spirit tablet, overturned tea cup. Material: dark wood.
3. Clan Ancestral Spirit (家廟祖靈): a clan hall altar with tiers of wooden ancestor tablets and a faint gathering of elderly figures in old clothes behind them. Pose: tablets rising in tiers. Attributes: ancestor tablets, candles, carved wooden screens. Material: dark carved wood with red and gold. Render it as a detailed object sculpture on the plinth.
4. Ancestral spirits (祖先靈（香港）): an elderly grandfather and grandmother in old Hong Kong clothes, standing side by side, calm and warm. Pose: standing together, the grandmother's hand on the grandfather's arm. Attributes: family photographs, spirit tablet. Material: warm carved sandalwood. All figures share one plinth and touch one another, so the group reads as a single connected sculpture.
```

## 第 2 批

- [ ] 第 1 張 → `assets/refs/142.png` · 祖先壇（港） · Ancestral Altar (HK)
- [ ] 第 2 張 → `assets/refs/242.png` · 游魂野鬼（港） · Wandering ghost (HK)
- [ ] 第 3 張 → `assets/refs/253.png` · 夢訪靈 · Dream Visitor

```text
Create 3 separate images, one for each statue below. Every image follows the same rules:
- square 1:1 studio reference photograph of a physical collectible statue, for image-to-3D reconstruction
- three-quarter front view from slightly above eye level, 85mm lens, whole statue and plinth in frame with about 10% margin
- soft even low-contrast front light, no cast shadows, no rim glow, no depth of field, seamless flat mid-grey background (#808080)
- one solid connected object; thicken wire-thin parts; smoke, flames, water and light are carved solid and attached, never floating
- base: a low hexagonal wooden altar base with a brass trim
- no text

1. Ancestral Altar (祖先壇（港）): a home ancestral altar cabinet in red and gold holding carved wooden spirit tablets. Pose: lamp lit on the altar. Attributes: spirit tablets, oil lamp, oranges, three cups of tea, incense. Material: red lacquer and gold leaf. Render it as a detailed object sculpture on the plinth.
2. Wandering ghost (游魂野鬼（港）): a thin, pale wandering ghost in faded clothes, hungry and lonely. Pose: standing at a roadside offering spot. Attributes: paper money, a small bowl of rice. Material: translucent frosted resin.
3. Dream Visitor (夢訪靈): a soft, glowing figure of someone loved and lost, sitting at the edge of a bed, one hand resting on the blanket. Pose: sitting and leaning slightly forward as if about to speak. Material: warm translucent amber resin.
```
