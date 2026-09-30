/* 立像登記冊
   把 ChatGPT 生成的圖放進 assets/ 後,在這裡登記,整個圖鑑(抽屜立體台、分享卡、印記標記)就會用上。
   鍵 = 靈體的 rank(抽屜標題下方「編號」,或網址 #e121 的數字)。

   img   肖像(建議 4:5,1024×1280 以上;webp / png / jpg 皆可)
   depth 深度圖(同尺寸灰階:白 = 近,黑 = 遠)。可省略,省略時自動估算。
   model GLB 立體模型(Meshy / Tripo / Hunyuan3D 等匯出)。可省略。

   例:
   121: { img: "assets/portraits/121.webp", depth: "assets/depth/121.png", model: "assets/models/121.glb" },

   不想改檔案的話,也可以在抽屜的立體台直接拖放圖像,圖像只存在你這部裝置的瀏覽器內。 */
window.SPECTRUM_ASSETS = {
};
