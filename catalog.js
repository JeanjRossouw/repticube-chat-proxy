(function(){
'use strict';
const IMG = 'https://cdn.shopify.com/s/files/1/0622/2351/5757/files/';
const CATS = {S:'Scatter Cushions',T:'Bed Throws',R:'Rugs',W:'Wallpapers',C:'Curtains',TW:'Towels',B:'Bedding',O:'Accessories'};
const P = [
["Cotton Bath Mat 50x75cm","TW",85.72,0,1,"bath-mat","Gemini_Generated_Image_pelnjjpelnjjpeln.png"],
["Cotton Bath Sheet 85x160cm","TW",198.2,0,1,"bath-sheet","Gemini_Generated_Image_f139ykf139ykf139.png"],
["Cotton Bath Towel 70x135cm","TW",139.12,0,1,"bath-towel","Gemini_Generated_Image_c8xdulc8xdulc8xd.png"],
["Academy Wave Tape Curtain","C",579.67,639.05,1,"academy","Gemini_Generated_Image_fbxno5fbxno5fbxn.png"],
["At Ease (Unlined)","C",369.95,401.46,1,"at-ease-unlined","Gemini_Generated_Image_q8kaj0q8kaj0q8ka.png"],
["Eclipse Woven Blockout Curtain","C",391.64,482.24,1,"eclipse-woven-lining","Gemini_Generated_Image_lad4sxlad4sxlad4.png"],
["Elusion","C",344.17,430.28,1,"elusion","Gemini_Generated_Image_4wir0u4wir0u4wir.png"],
["Secrets Dark Grey Sheer Curtain","C",239.45,0,1,"secrets","Secrets_dark_grey_2.jpg"],
["Slumber","C",580.96,0,1,"slumber","Slumber-light-grey.jpg"],
["Vogue (Woven Lining)","C",373.22,0,1,"vogue-woven-lining","Gemini_Generated_Image_1agnhl1agnhl1agn.png"],
["Voile White Sheer Curtain","C",233.86,0,1,"voile","Voilefrostywhite.jpg"],
["Scatter Cushion Inners","S",431.25,0,1,"scatter-cushion-inners","Pillow_Inners_60_60.jpg"],
["Egyptian Cotton Duvet Cover White With 40cm Flap","B",876.96,2731.05,1,"duvet-cover-egyptian-cotton","WHITE_2_c7df2988-c96a-4791-9737-1f09339f9af8.png"],
["Oxford Egyptian Cotton Duvet Cover White 400 Thread Count","B",932.31,2818.27,1,"oxford-duvet-cover-egyptian-cotton-400-thread-count","Gemini_Generated_Image_1267ow1267ow1267.png"],
["Oxford Duvet Cover with 40cm Flap","B",448.9,1643.79,1,"oxford-duvet-cover-with-40cm-flap","WHITE_3.png"],
["Plain Duvet Cover (With 40cm Flap)","B",363.2,1461.49,1,"plain-duvet-cover","WHITE_2_60b4552f-99cf-4c24-ba94-0e9ca1b097b0.png"],
["85/15 Duck & Down Duvet Inner","B",1005.71,3568.71,1,"bed-linen","85_15_Duck_Down_Duvet_Inner_43900dcc-ac47-4494-923a-00077eac69ff.jpg"],
["Microfibre Duvet Inner","B",683.1,2197.65,1,"microfibre-duvet-inner","af4b23b1-cab9-4449-9fbe-f4d778c7a66f.png"],
["Cotton Face Cloth 30x30cm","TW",21.07,0,1,"face-cloth","Gemini_Generated_Image_lyjeqclyjeqclyje.png"],
["Egyptian Cotton Fitted Sheet White 400 Thread Count","B",606.34,1532.01,1,"fitted-sheet-egyptian-cotton-400-thread-count","ChatGPT_Image_Jul_3_2026_08_17_23_AM.png"],
["Fitted Sheet Cotton Percale 200 Thread Count","B",263.55,834.21,1,"fitted-sheet-cotton-percale-200-thread-count-copy-1","WHITE_1_9d53a54e-9bf8-4e3b-981c-d2fa9feb4ac3.png"],
["Egyptian Cotton Flat Sheet White 400 Thread Count","B",591.25,1657.86,1,"flat-sheet-egyptian-cotton-400-thread-count","WHITE_4_f1d0692c-6c5e-4aa3-8d6f-bd68dd274ed2.png"],
["Cotton Percale Flat Sheet 200 Thread Count","B",251.15,988.8,1,"flat-sheet-cotton-percale-200-thread-count","WHITE_4_e2bbf3d1-8a50-46dd-ba5b-14ae725e5d1d.png"],
["Cotton Hand Towel 50x90cm","TW",74.68,0,1,"hand-towel","Gemini_Generated_Image_qclogkqclogkqclo.png"],
["Quilted Mattress Protector","B",207,500.25,1,"quilted-mattress-protector","Quilted-Mattress-Protector.jpg"],
["Microfibre Pillow Inner","B",248.4,562.35,1,"micro-fibre-pillow-inner","Micro-fibre_Pillow_Inner.jpg"],
["Premium Duck Feather & Ball Fibre Pillow Inner (Pack of 2)","B",366,0,1,"premium-duck-feather-ball-fibre-pillow-inner-pack-of-2","Gemini_Generated_Image_ju0zfqju0zfqju0z_1.png"],
["Quilted Pillow Protector With Zip","B",72.45,158.7,1,"quilted-pillow-protector","Quilted_Pillow_Protector.jpg"],
["Egyptian Cotton Pillowcase 400 Thread Count - White","B",208.18,468.58,1,"pillowcase-egyptian-cotton-400-thread-count","Pillowcase.jpg"],
["Polycotton Pillowcase","B",94.23,326.51,1,"pillowcase-polycotton-copy","ChatGPT_Image_Jul_2_2026_04_32_41_PM.png"],
["Nostos Beige Textured Rug","R",5261,0,1,"nostos-29268-beige","Nostos29268-Beige_2.png"],
["Anatoli Yellow & Beige Textured Rug","R",5261,0,1,"anatoli-24614a-yellow-beige","Anatoli24614A-Yellow_Beige_2.png"],
["Metis Dark Grey & Light Grey Rug","R",4213,0,1,"metis-16135a-d-grey-l-grey","Metis16135A-D.Grey_L.Grey_2.png"],
["Metis Grey & Beige Rug","R",4213,0,1,"metis-16135a-grey-beige","Metis16135A-Grey_Beige_3.png"],
["Metis Grey & Yellow Rug","R",4213,0,1,"metis-16135a-grey-yellow","Metis16135A-Grey_Yellow_2.png"],
["Aether 21170A- Dark Grey","R",7021,0,1,"aether-21170a-dark-grey","Aether21170A-DarkGrey_2.png"],
["Nyx 21095A- Cream/ Dark Grey","R",7021,0,1,"nyx-21095a-cream-dark-grey","Nyx21095A-Cream_DarkGrey_2.png"],
["Orpheus 21160- Dark Grey","R",7021,0,1,"orpheus-21160-dark-grey","Orpheus-DarkGrey_2.png"],
["Selene 29579- Cream/ Beige","R",4537,0,1,"selene-29579-cream-beige","Selene29579-Cream_Beige_2.png"],
["Ciro 31592- Cream/ Cream","R",3397,0,1,"ciro-31592-cream-cream","Ciro31592-Cream_Cream_2.png"],
["Achillies Beige & Grey Geometric Rug","R",4537,0,1,"achillies-0054-beige-grey","Achilles0056-Beige_Grey_2.png"],
["Hermes 14715C- Antracite/ Bone","R",4537,0,1,"hermes-14715c-antracite-bone","Hermes14715C-Antracite_Bone_2.png"],
["Hermes 14715C- Beige","R",4537,0,1,"hermes-14715c-beige","Hermes14715C-Beige_2.png"],
["Apollo 0024- Beige","R",4537,0,1,"apollo-0024-beige","Apollo0024-Beige_2.png"],
["Hermes 14715C- Bone/ Antracite","R",4537,0,1,"hermes-14715c-bone-antracite","Hermes14715C-Bone_Antracite_2_ef494329-d40b-47f2-bd6e-7cdf249d7455.png"],
["Apollo Antracite","R",4537,0,1,"apollo-0024-d-grey-l-grey","Apollo0024-D.Grey_L.Grey_2.png"],
["Adonis 0124- L.Grey/ Cream","R",2859,0,1,"adonis-0124-l-grey-cream","Adonis0124-L.Grey_Cream_2.png"],
["Adonis 0124- D.Grey/ L.Grey","R",2859,0,1,"adonis-0124-d-grey-l-grey","Adonis0124-D.Grey_L.Grey_2.png"],
["Chroma 19804A - Charcoal/Smoke","R",5261,0,1,"chroma-19804a-charcoal-smoke","RUG.png"],
["Captivate Black & White (60X60)","S",550,0,1,"captivate-black-white","Captivate_Black_White.jpg"],
["Hartland Natural Scatter Cushion Cover (60x60)","S",550,0,1,"hartland-natural","Hartland_Natural.jpg"],
["Asmara Caviar (60X60)","S",550,0,1,"asmara-caviar","Asmara_Caviar.jpg"],
["Rua Black (60X60)","S",550,0,1,"rua-black","Rua_Black.jpg"],
["Rua Natural (60X60)","S",550,0,1,"rua-natural","Gemini_Generated_Image_cbn25scbn25scbn2.png"],
["Aralia Autumn (60X60)","S",550,0,1,"aralia-autumn","Aralia_Autumn.jpg"],
["Issa Linen Scatter Cushion Cover (60x60)","S",550,0,1,"issa-linen","Issa_-_Linen.jpg"],
["Linton Sulphur Scatter Cushion Cover (60x60)","S",550,0,1,"linton-sulphur","Untitleddesign_54.png"],
["Imaza Sierra Scatter Cushion Cover (60x60)","S",550,0,1,"imaza-sierra","04cce98e-50ed-4791-bbec-a9958b4b761a.png"],
["Zelda Inca (60X60)","S",550,0,1,"zelda-inca","Scatter_30of58.jpg"],
["Gomera Sunshine Scatter Cushion Cover (60x60)","S",550,0,1,"gomera-sunshine","Gomera_Sunshine.jpg"],
["Anderson Cedor (60X60)","S",550,0,1,"anderson-cedor","d7274bba-51e9-405d-a83d-f50719f5ea0b.png"],
["Shirin Stormy Sea Scatter Cushion Cover (60x60)","S",550,0,1,"shirin-stormy-sea","Gemini_Generated_Image_f596vtf596vtf596.png"],
["Brandley Garden (60X60)","S",550,0,1,"brandley-garden","Brandley-Garden.jpg"],
["Amira Rustic Scatter Cushion Cover (40x70)","S",450,0,1,"amira-rustic","Amira-Rustic.jpg"],
["Taneka Zebra (60X60)","S",550,0,1,"taneka-zebra","Taneka_-_Zebra.jpg"],
["Arcadia Griffin (60X60)","S",550,0,1,"arcadia-griffin","Arcadia-Griffin.jpg"],
["Amberly Sage (60X60)","S",550,0,1,"amberly-sage","Untitleddesign_47.png"],
["Moretti Pristine Block Scatter Cushion Cover (40x70)","S",450,0,1,"moretti-pristine-block","f9be58f1-d6f2-41a0-b0b7-7f3cb5654ad7.png"],
["Moretti Pristine Front Gold Scatter Cushion Cover (40x70)","S",450,0,1,"moretti-pristine-front-gold","Moretti-Pristine.jpg"],
["Moretti Pristine Black Piping Scatter Cushion Cover (40x70)","S",450,0,1,"moretti-pristine","Scatter_5of7_-2_b23048bb-c209-4af0-bd49-09dfc34d6831.png"],
["Amanda - Green","S",599,0,1,"amanda-green","AmandaGreen.png"],
["Daytona - Dark","S",599,0,1,"daytona-dark","DaytonaDark.png"],
["Exotic - Royal","S",599,0,1,"exotic-royal","ExoticRoyal.png"],
["Flora - Natural","S",599,0,1,"flora-natural","FloraNatural.png"],
["Tao - Blue","S",599,0,1,"hartland-natural-1","HartlandNatural.png"],
["Ivory Blocks - Natural","S",599,0,1,"ivory-blocks-natural","IvoryBlocksNatural.png"],
["Loei - Natural","S",599,0,1,"loei-natural","LoeiNatural.png"],
["Maui - Green","S",599,0,1,"maui-green","MauiGreen.png"],
["Meadow - Blue","S",599,0,1,"meadow-blue","MeadowBlue.png"],
["Mosta - Natural","S",599,0,1,"mosta-natural","MostaNatural.png"],
["Nisha - Sage","S",599,0,1,"nisha-sage","NishaSage.png"],
["Sundar - Sulpha","S",599,0,1,"sundar-sulpha","SundarSulpha.png"],
["Crofton Black Bed Throw (3m x 140cm)","T",898.99,0,1,"bed-throw-crofton-black","860884d7-849f-4022-9200-d9b88f8000f4_3f652c60-b9f2-466b-9c45-248733208aa3.png"],
["Crofton White Bed Throw (3m x 140cm)","T",898.99,0,1,"bed-throw-crofton-white","Scatter_18_of_27.jpg"],
["Bed Throw- Crofton Dark Grey (3m x 140cm)","T",898.99,0,1,"bed-throw-crofton-dark-grey","Scatter_11_of_27.jpg"],
["Bed Throw- Crofton Light Grey (3m x 140cm)","T",898.99,0,1,"bed-throw-crofton-light-grey","Scatter_13of27.jpg"],
["Bed Throw - Rochelle Green (3m x 140cm)","T",1299.5,0,1,"bed-throw-rochelle-green","ROCHELLEGREEN_1.png"],
["Bed Throw - Rochelle Taupe (3m x 140cm)","T",1299.5,0,1,"bed-throw-rochelle-taupe-3m-x-140cm","ROCHELLETAUPE_3.png"],
["Bed Throw - Rochelle Cream (3m x 140cm)","T",1299.5,0,1,"bed-throw-rochelle-cream-3m-x-140cm","ROCHELLECREAM_1_30cd4546-12dc-42ea-aa50-1bed3f09537b.png"],
["Bed Throw - Rochelle Grey (3m x 140cm)","T",1299.5,0,1,"bed-throw-rochelle-grey-3m-x-140cm","ROCHELLEGREY_2.png"],
["U&G Fabric Bag","O",299,0,1,"u-g-fabric-bag","WhatsAppImage2026-06-30at17.22.36_1.jpg"],
["Wallpaper- 32502","W",1644.5,0,1,"wallpaper-32502","32502_32512_001_imageroom.jpg"],
["Wallpaper- 32802","W",1644.5,0,1,"wallpaper-32802","32802_001_imageroom.png"],
["Wallpaper- 39002","W",1644.5,0,1,"wallpaper-39002","39002.png"],
["Soft Stone Feature Wallpaper","W",1644.5,0,1,"wallpaper-32260","32260_010_imageroom.png"],
["Wallpaper- 32272","W",1644.5,0,1,"wallpaper-32272","32272_010_imageroom.jpg"],
["Soft Sand Textured Wallpaper","W",1562.27,0,1,"wallpaper-15509","15509App.png"],
["Linen Veil Neutral Wallpaper","W",1562.27,0,1,"wallpaper-15529","15529APP.png"],
["Quiet Luxury Neutral Wallpaper","W",1562.27,0,1,"wallpaper-15567","15567.png"],
["Warm Stone Textured Wallpaper","W",1194.85,0,1,"wallpaper-18528","Gemini_Generated_Image_ebu36nebu36nebu3.png"],
["Modern Neutral Feature Wallpaper","W",1644.5,0,1,"wallpaper-32230","9_32230_001_scan.jpg"],
["Elegant Stone Texture Wallpaper","W",1644.5,0,1,"wallpaper-32622","43_32622_001_scan.jpg"],
["Soft Grey Designer Wallpaper","W",1644.5,0,1,"wallpaper-32819","72_32819_001_scan.jpg"],
["Wallpaper- 34265","W",1644.5,0,1,"wallpaper-34265","93_34265_001_scan.jpg"],
["Warm Manor Feature Wallpaper","W",1644.5,0,1,"wallpaper-34418","111_34418_001_scan.jpg"],
["Grand Room Statement Wallpaper","W",2631.2,0,1,"wallpaper-47716","47716.jpg"],
["Calm Linen Look Wallpaper","W",1562.27,0,1,"wallpaper-84005","84005.jpg"],
["Soft Minimal Texture Wallpaper","W",1562.27,0,1,"wallpaper-84038","84038.jpg"],
["Soft Minimalist Wallpaper","W",1562.27,0,1,"wallpaper-84041","84041.jpg"],
["Wallpaper- 39004","W",1554.8,0,1,"wallpaper-39004","39004.jpg"],
["Refined Living Wallpaper","W",1554.8,0,1,"wallpaper-39006","39006.jpg"],
["Wallpaper- 39016","W",1554.8,0,1,"wallpaper-39016","39016.jpg"],
["Boutique Hotel Wallpaper","W",1554.8,0,1,"wallpaper-39035","Gemini_Generated_Image_54mvqn54mvqn54mv.png"],
["Wallpaper- 39059","W",1554.8,0,1,"wallpaper-39059","39059.jpg"],
["Quiet Texture Wallpaper","W",1554.8,0,1,"wallpaper-39078","39078.jpg"],
["Soft Neutral Feature Wallpaper","W",1224.75,0,1,"wallpaper-b39099","39099.jpg"],
["Calm Linen Wallpaper","W",1562.27,0,1,"wallpaper-84001","84001.jpg"],
["Natural Linen Wall Wallpaper","W",1562.27,0,1,"wallpaper-84008","84008.jpg"],
["Wallpaper- 84010","W",1562.27,0,1,"wallpaper-84010","84010.jpg"],
["Wallpaper- 84019","W",1562.27,0,1,"wallpaper-84019","84019.jpg"],
["Warm Taupe Feature Wallpaper","W",1562.27,0,1,"wallpaper-84026","84026.jpg"],
["Quiet Luxury Linen Wallpaper","W",1562.27,0,1,"wallpaper-84033","84033.jpg"],
["Soft Plaster Effect Wallpaper","W",1562.27,0,1,"wallpaper-84036","84036.jpg"],
["Ivory Texture Wallpaper","W",1562.27,0,1,"wallpaper-84045","84045.jpg"],
["Wallpaper- 84054","W",1562.27,0,1,"wallpaper-84054","Untitleddesign_52.png"],
["Wallpaper- 84058","W",1562.27,0,1,"wallpaper-84058","Gemini_Generated_Image_q2byrkq2byrkq2by.png"],
["Soft Sand Feature Wallpaper","W",1562.27,0,1,"wallpaper-84059","84059.jpg"],
["Elegant Neutral Texture Wallpaper","W",1562.27,0,1,"wallpaper-84063","84063.jpg"],
["Natural Weave Wallpaper","W",1562.27,0,1,"wallpaper-84067","84067.jpg"],
["Warm Linen Wallpaper","W",1562.27,0,1,"wallpaper-84069","84069.jpg"],
["Designer Neutral Wallpaper","W",1562.27,0,1,"wallpaper-84077","84077.jpg"],
["Warm Linen Feature Wallpaper","W",1562.27,0,1,"wallpaper-84079","84079.jpg"],
["Grand Estate Wallpaper","W",2631.2,0,1,"wallpaper-47702","47702.jpg"],
["Elegant Estate Wallpaper","W",2631.2,0,1,"wallpaper-47704","47704.jpg"],
["Classic Boutique Wallpaper","W",2631.2,0,1,"wallpaper-47712","47712.jpg"],
["Wallpaper- 47713","W",2631.2,0,1,"wallpaper-47713","47713.jpg"],
["Classic Pattern Wallpaper","W",2631.2,0,1,"wallpaper-47720","47720.jpg"],
["Timeless Wallpaper","W",2631.2,0,1,"wallpaper-47725","47725.jpg"],
["Elegant Room Wallpaper","W",2631.2,0,1,"wallpaper-47742","Gemini_Generated_Image_5w9ex35w9ex35w9e_26179732-d066-44bd-afeb-d06fd3f09d5c.png"],
["Wallpaper- 47752","W",2631.2,0,1,"wallpaper-47752","47752.jpg"],
["Wallpaper- 49321","W",2631.2,0,1,"wallpaper-49321","49321.jpg"],
["Wallpaper- 49326","W",2631.2,0,1,"wallpaper-49326","49326.jpg"],
["Luxury Neutral Wallpaper","W",2631.2,0,1,"wallpaper-49331","49331.jpg"],
["Wallpaper- 49333","W",2631.2,0,1,"wallpaper-49333","49333.jpg"],
["Refined Neutral Wallpaper","W",2631.2,0,1,"wallpaper-49345","49345.jpg"],
["Soft Classic Wallpaper","W",2631.2,0,1,"wallpaper-49355","49355.jpg"],
["Soft Stone Wall Wallpaper","W",1644.5,0,1,"wallpaper-30416","1_30416_001_scan.jpg"],
["Natural Stone Texture Wallpaper","W",1644.5,0,1,"wallpaper-32401","20_32401_001_scan.jpg"],
["Warm Neutral Texture Wallpaper","W",1644.5,0,1,"wallpaper-32507","32_32507_001_scan.jpg"],
["Soft Grey Texture Wallpaper","W",1644.5,0,1,"wallpaper-32611","38_32611_001_scan.jpg"],
["Ivory Stone Wallpaper","W",1644.5,0,1,"wallpaper-32614","41_32614_001_scan.jpg"],
["Wallpaper- 32615","W",1644.5,0,1,"wallpaper-32615","42_32615_001_scan.jpg"],
["Textured Neutral Wallpaper","W",1644.5,0,1,"wallpaper-32627","45_32627_001_scan.jpg"],
["Modern Stone Wallpaper","W",1644.5,0,1,"wallpaper-32709","49_32709_001_scan.jpg"],
["Soft Grey Feature Wallpaper","W",1644.5,0,1,"wallpaper-32803","64_32803_001_scan.jpg"],
["Light Stone Wallpaper","W",1644.5,0,1,"wallpaper-32809","67_32809_001_scan.jpg"],
["Warm Stone Wallpaper","W",1644.5,0,1,"wallpaper-32813","68_32813_001_scan.jpg"],
["Soft Charcoal Wallpaper","W",1644.5,0,1,"wallpaper-32818","71_32818_001_scan.jpg"],
["Classic Linen Wallpaper","W",1644.5,0,1,"wallpaper-34151","87_34151_001_scan.jpg"],
["Natural Calm Wallpaper","W",1644.5,0,1,"wallpaper-34154","88_34154_001_scan.jpg"],
["Warm Minimal Wallpaper","W",1644.5,0,1,"wallpaper-34278","104_34278_001_scan.jpg"],
["Soft Taupe Wallpaper","W",1644.5,0,1,"wallpaper-34279","105_34279_001_scan.jpg"],
["Wallpaper- 34281","W",1644.5,0,1,"wallpaper-34281","107_34281_001_scan.jpg"],
["Botanical Escape Wallpaper","W",2137.85,0,1,"wallpaper-2927-00103-b","2927-00103_Room.jpg"],
["Garden Room Wallpaper","W",2137.85,0,1,"wallpaper-2927-00104","2927-00104_Room.jpg"],
["Tropical Luxe Wallpaper","W",2137.85,0,1,"wallpaper-2927-00403-b","2927-00403_Room_A.jpg"],
["Botanical Linen Wallpaper","W",2137.85,0,1,"wallpaper-2927-00607-b","2927-00607_Room.jpg"],
["Soft Botanical Wallpaper","W",2137.85,0,1,"wallpaper-2927-00701-b","2927-00701_Room.jpg"],
["Garden Leaf Wallpaper","W",2137.85,0,1,"wallpaper-2927-00704-b","2927-00704_Room.jpg"],
["Wallpaper- 2927-00706 B","W",2137.85,0,1,"wallpaper-2927-00706-b","2927-00706_Room.jpg"],
["Modern Geo Wallpaper","W",1808.95,0,1,"wallpaper-2927-10105-a","2927-10105_Room.jpg"],
["Architectural Lines Wallpaper","W",1808.95,0,1,"wallpaper-2927-10605-a","2927-10605_Room.jpg"],
["Soft Line Wallpaper","W",1808.95,0,1,"wallpaper-2927-10902-a","2927-10902_Room.jpg"],
["Warm Grid Wallpaper","W",1808.95,0,1,"wallpaper-2927-12003-a","2927-12003_Room.jpg"],
["Soft Stripe Wallpaper","W",1808.95,0,1,"wallpaper-2927-13002-a","2927-13002_Room.jpg"],
["Classic Line Wallpaper","W",1808.95,0,1,"wallpaper-2927-20106-a","2927-20106_Room.jpg"],
["Modern Line Wallpaper","W",1808.95,0,1,"wallpaper-2927-20304-a","2927-20304_Room.jpg"],
["Wallpaper- 2927-20402 A","W",1808.95,0,1,"wallpaper-2927-20402-a","2927-20402-A.jpg"],
["Soft Geometric Wallpaper","W",1808.95,0,1,"wallpaper-2927-20901-a","2927-20901-A.jpg"],
["Modern Grid Feature Wallpaper","W",1808.95,0,1,"wallpaper-2927-20905-a","2927-20905.jpg"],
["Minimal Wallpaper","W",1808.95,0,1,"wallpaper-2927-21001-a","2927-21001.jpg"],
["Soft Minimal Wallpaper","W",1808.95,0,1,"wallpaper-2927-21002-a","2927-21002.jpg"],
["Classic Manor Wallpaper","W",1808.95,0,1,"wallpaper-2927-42488-a","2927-42488.jpg"],
["Elegant Estate Wallpaper","W",1808.95,0,1,"wallpaper-2927-42492-a","2927-42492.jpg"],
["Soft Texture Wallpaper","W",2039.18,0,1,"wallpaper-4016-24282-a","2964-24282.jpg"],
["Natural Texture Wallpaper","W",2039.18,0,1,"wallpaper-4016-25901-b","2964-25901.jpg"],
["Warm Natural Wallpaper","W",2039.18,0,1,"wallpaper-4016-25902-b","2964-25902.jpg"],
["Natural Feature Wallpaper","W",2039.18,0,1,"wallpaper-25904-b","2964-25904.jpg"],
["Soft Natural Wallpaper","W",2039.18,0,1,"wallpaper-4016-25905-b","2964-25905.jpg"],
["Light Natural Wallpaper","W",2039.18,0,1,"wallpaper-4016-25909-b","2964-25909.jpg"],
["Warm Texture Wallpaper","W",2039.18,0,1,"wallpaper-4016-25911","2964-25911.jpg"],
["Soft Beige Wallpaper","W",2039.18,0,1,"wallpaper-4016-25919-b","2964-25919.jpg"],
["Light Neutral Wallpaper","W",2039.18,0,1,"wallpaper-4016-25920-b","2964-25920.jpg"],
["Warm Beige Wallpaper","W",2039.18,0,1,"wallpaper-4016-25926-b","2964-25926.jpg"],
["Soft Taupe Texture Wallpaper","W",2039.18,0,1,"wallpaper-4016-25931-b","2964-25931.jpg"],
["Calm Neutral Wallpaper","W",2039.18,0,1,"wallpaper-4016-25951-b","2964-25951.jpg"],
["Soft Warm Wallpaper","W",2039.18,0,1,"wallpaper-4016-25954-b","2964-25954.jpg"],
["Elegant Neutral Wallpaper","W",2039.18,0,1,"wallpaper-4016-25958-b","2964-25958.jpg"],
["Natural Beige Wallpaper","W",2039.18,0,1,"wallpaper-4016-25959-b","2964-25959.jpg"],
["Warm Neutral Wallpaper","W",2039.18,0,1,"wallpaper-4016-25963-b","2964-25963.jpg"],
["Wallpaper- 4016- 25965 B","W",2039.18,0,1,"wallpaper-4016-25965","2964-25965.jpg"],
["Soft Stone Wallpaper","W",2039.18,0,1,"wallpaper-4016-87340-c","2964-87340.jpg"],
["Wallpaper- 4016- 87341 B","W",4282.28,0,1,"wallpaper-4016-87341-b","2964-87341.jpg"],
["Neutral Wallpaper","W",4282.28,0,1,"wallpaper-4016-87344-b","2964-87344.jpg"],
["Luxe Stone Wallpaper","W",4282.28,0,1,"wallpaper-4016-87345-c","2964-87345.jpg"],
["Premium Stone Wallpaper","W",4282.28,0,1,"wallpaper-4016-87346-c","2964-87346.jpg"],
["Soft Stone Texture Wallpaper","W",2039.18,0,1,"wallpaper-4016-87350-d","2964-87350.jpg"],
["Designer Neutral Wallpaper","W",2691,0,1,"wallpaper-43803","43803.jpg"],
["Elegant Feature Wallpaper","W",2691,0,1,"wallpaper-43806","43806.jpg"],
["Luxury Texture Wallpaper","W",2691,0,1,"wallpaper-43876","43876.jpg"]
];
const CATTAGS = {
  S:['scatter cushion','cushion cover','décor','lounge','sofa'],
  T:['bed throw','throw blanket','bedroom','décor','layering'],
  R:['rug','floor rug','living room','textured','home décor'],
  W:['wallpaper','feature wall','interior','décor','wall covering'],
  C:['curtain','readymade','window','drapes','home décor'],
  TW:['towel','bathroom','cotton','bath','home textiles'],
  B:['bed linen','bedroom','cotton','comfort','bedding'],
  O:['accessory','lifestyle','gift','home','u&g']
};
function tagsFor(name,c){
  const base=(CATTAGS[c]||CATTAGS.O).slice();
  const spec=(name.split(/[\s\-\u2013\u2014(]/)[0]||'').toLowerCase().replace(/[^a-z0-9&]/g,'');
  const generic={cotton:1,egyptian:1,plain:1,soft:1,warm:1,the:1,light:1,natural:1,quilted:1,oxford:1};
  return (spec.length>2 && !generic[spec]) ? [spec].concat(base).slice(0,5) : base.slice(0,5);
}
const fmt = n => 'R ' + n.toLocaleString('en-ZA', {minimumFractionDigits:2, maximumFractionDigits:2});
const isSale = p => p[3] > p[2];
function cardHTML(p, newTag){
  const [name,c,price,cmp,ok,handle,img] = p;
  const sale = isSale(p);
  let tag = '';
  if (!ok) tag = '<span class="tag out">Sold Out</span>';
  else if (sale) tag = '<span class="tag sale">Sale</span>';
  else if (newTag) tag = '<span class="tag">New</span>';
  return `<a class="card" href="https://uglifestyle.com/products/${handle}" target="_blank" rel="noopener">
    <div class="card-img">${tag}<img loading="lazy" src="${IMG}${img}?width=540" alt="${(name+' – '+CATS[c]).replace(/"/g,'')}"><div class="quick">View Product</div></div>
    <div class="card-info"><div class="type">${CATS[c]}</div><div class="name">${name}</div>
    <div class="price">${fmt(price)}${sale?`<span class="was">${fmt(cmp)}</span>`:''}</div><div class="tags">${tagsFor(name,c).map(t=>'<span>'+t+'</span>').join('')}</div></div></a>`;
}

var cat=(window.PAGECAT||'ALL'), sort='feat', shown=24;
function filtered(){
  var list;
  if(cat==='ALL'||cat==='NEW') list=P.slice();
  else if(cat==='SALE') list=P.filter(isSale);
  else if(cat==='DECOR') list=P.filter(function(p){return p[1]==='S'||p[1]==='T';});
  else if(cat==='FURN') list=[];
  else list=P.filter(function(p){return p[1]===cat;});
  if(sort==='asc') list.sort(function(a,b){return a[2]-b[2];});
  if(sort==='desc') list.sort(function(a,b){return b[2]-a[2];});
  return list;
}
function render(){
  var grid=document.getElementById('grid'); if(!grid) return;
  var list=filtered();
  grid.innerHTML = list.length ? list.slice(0,shown).map(function(p){return cardHTML(p);}).join('')
    : '<p style="grid-column:1/-1;padding:60px 0;color:var(--grey);text-align:center;font-size:16px">This collection is coming soon.</p>';
  var more=document.getElementById('more'); if(more) more.style.display = (list.length && shown<list.length) ? '' : 'none';
  var pc=document.getElementById('prod-count'); if(pc) pc.textContent=list.length;
}
function buildFilters(){
  var el=document.getElementById('filters'); if(!el) return;
  var counts={ALL:P.length,SALE:P.filter(isSale).length};
  P.forEach(function(p){counts[p[1]]=(counts[p[1]]||0)+1;});
  var order=['ALL','S','T','R','W','C','TW','B','O','SALE'];
  var labels=Object.assign({},CATS,{ALL:'All',SALE:'Sale'});
  el.innerHTML=order.filter(function(k){return counts[k];}).map(function(k){
    return '<button class="fbtn'+(k===cat?' on':'')+(k==='SALE'?' sale-f':'')+'" data-c="'+k+'">'+labels[k]+'<small>'+counts[k]+'</small></button>';
  }).join('');
  [].forEach.call(el.querySelectorAll('.fbtn'),function(b){b.onclick=function(){cat=b.dataset.c;shown=24;buildFilters();render();};});
}
(function(){
  var firstOf=function(c){return P.find(function(p){return p[1]===c&&p[4];});};
  var ng=document.getElementById('new-grid'); if(ng) ng.innerHTML=['T','S','R','W'].map(function(c){return cardHTML(firstOf(c),true);}).join('');
  var rg=document.getElementById('rug-grid'); if(rg) rg.innerHTML=P.filter(function(p){return p[1]==='R'&&p[4];}).slice(0,4).map(function(p){return cardHTML(p);}).join('');
})();
var _s=document.getElementById('sort'); if(_s) _s.onchange=function(e){sort=e.target.value;shown=24;render();};
var _m=document.getElementById('more'); if(_m) _m.onclick=function(){shown+=24;render();};
buildFilters(); render();
[].forEach.call(document.querySelectorAll('a[href="#"]'),function(a){a.addEventListener('click',function(e){e.preventDefault();});});

(function(){
  var navlist=document.querySelector('.nav-list');
  var ham=document.querySelector('.hamburger');
  if(!navlist||!ham) return;
  var drawer=document.createElement('div'); drawer.className='m-drawer';
  var back=document.createElement('div'); back.className='m-back';
  var panel=document.createElement('div'); panel.className='m-panel';
  var head=document.createElement('div'); head.className='m-head';
  head.innerHTML='<span>Menu</span><button class="m-close" aria-label="Close menu">&times;</button>';
  panel.appendChild(head);
  function close(){drawer.classList.remove('open');document.documentElement.style.overflow='';}
  function open(){drawer.classList.add('open');document.documentElement.style.overflow='hidden';}
  [].forEach.call(navlist.children,function(li){
    var a=li.querySelector('a'); if(!a) return;
    var mega=li.querySelector('.mega');
    var grp=document.createElement('div'); grp.className='m-grp';
    if(mega){
      var btn=document.createElement('button');
      btn.innerHTML='<span>'+a.textContent.trim()+'</span><span class="m-caret">▼</span>';
      btn.addEventListener('click',function(){grp.classList.toggle('on');});
      grp.appendChild(btn);
      var sub=document.createElement('div'); sub.className='m-sub';
      [].forEach.call(mega.querySelectorAll('a'),function(sa){
        var x=document.createElement('a'); x.href=sa.getAttribute('href')||'#'; x.textContent=sa.textContent.trim();
        x.addEventListener('click',function(ev){ev.preventDefault();close();sa.click();});
        sub.appendChild(x);
      });
      grp.appendChild(sub);
    } else {
      var top=document.createElement('a'); top.href='#'; top.textContent=a.textContent.trim();
      if(a.classList.contains('sale')) top.className='sale';
      top.addEventListener('click',function(ev){ev.preventDefault();close();a.click();});
      grp.appendChild(top);
    }
    panel.appendChild(grp);
  });
  drawer.appendChild(back); drawer.appendChild(panel);
  document.body.appendChild(drawer);
  ham.addEventListener('click',open);
  back.addEventListener('click',close);
  head.querySelector('.m-close').addEventListener('click',close);
})();
})();
