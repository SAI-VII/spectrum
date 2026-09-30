<!-- 由 tools/gen-prompts.js 自動產生;請改 src/data/canon.js 或 src/prompts.js 後重新執行,不要手改 -->

# 物 · 退潮:靈散為物 The tide goes out · 3D 參考圖指令(2 位)

每段一次生成 4 張灰底雕像參考圖。下載後按編號存成 `assets/refs/{編號}.png`,再執行 `node tools/meshy/generate.mjs --mode image`。
想要更準的背面:對單張圖再貼「四視圖」指令(見 app 內該靈體的「圖像與 3D 指令 → 四視圖」),存成 `assets/refs/{編號}/front.png、right.png、back.png、left.png`。

## 第 1 批

- [ ] 第 1 張 → `assets/refs/250.png` · 鬼火（科學解釋向） · Will-o’-the-wisp (science)
- [ ] 第 2 張 → `assets/refs/244.png` · 睡眠麻痺（科學對照） · Sleep paralysis (explanation)

```text
Create 2 separate images, one for each statue below. Every image follows the same rules:
- square 1:1 studio reference photograph of a physical collectible statue, for image-to-3D reconstruction
- three-quarter front view from slightly above eye level, 85mm lens, whole statue and plinth in frame with about 10% margin
- soft even low-contrast front light, no cast shadows, no rim glow, no depth of field, seamless flat mid-grey background (#808080)
- one solid connected object; thicken wire-thin parts; smoke, flames, water and light are carved solid and attached, never floating
- base: a low hexagonal plaster plinth with a brass scale ruler
- no text

1. Will-o’-the-wisp (鬼火（科學解釋向）): a marsh specimen model: a cold flame hovering over reeds, with a cutaway showing gas bubbles rising from rotting leaves. Pose: flame hovering, bubbles rising. Attributes: gas bubbles, reeds, measuring scale. Material: glass and white plaster. Render the phenomenon as a small sculptural diorama on the plinth.
2. Sleep paralysis (睡眠麻痺（科學對照）): an anatomical study of a sleeper lying on their back, the head in cross-section showing the brainstem, a dotted hat-shaped shadow above. Pose: lying still. Attributes: anatomical labels, brain cross-section. Material: white plaster with engraved lines. Render the phenomenon as a small sculptural diorama on the plinth.
```
