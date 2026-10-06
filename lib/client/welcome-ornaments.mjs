const petals = [0, 72, 144, 216, 288].map(angle =>
  `<path transform="rotate(${angle})" d="M0-2C-6-7-11-14-8-20L-2-24L0-20L2-24L8-20C11-14 6-7 0-2Z"/>`
).join('')

function waveRings(x, y, radius, rings, spacing, depth, fill, opacity) {
  const arcs = Array.from({ length: rings }, (_, index) => {
    const r = radius - index * spacing
    return `M${-r} 0A${r} ${r} 0 0 1 ${r} 0`
  }).join('')
  return `<g class="wave-ring-group" transform="translate(${x} ${y}) scale(1 ${depth})"><path d="M${-radius} 0A${radius} ${radius} 0 0 1 ${radius} 0Z" fill="${fill}" stroke="none"/><path d="${arcs}" stroke-opacity="${opacity}"/></g>`
}

// Decorative SVG stays behind the character and inherits the scene's clock.
export const welcomeFanMarkup = `<svg class="svg-all" viewBox="0 0 1300 1100" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="welcomeFanPaper" x1="304" y1="105" x2="1071" y2="932" gradientUnits="userSpaceOnUse">
      <stop stop-color="#f7dca1"/><stop offset=".46" stop-color="#edc580"/><stop offset="1" stop-color="#c79555"/>
    </linearGradient>
    <linearGradient id="welcomeFanRim" x1="26" y1="205" x2="1267" y2="678" gradientUnits="userSpaceOnUse">
      <stop stop-color="#edc882"/><stop offset=".35" stop-color="#fff0bc"/><stop offset="1" stop-color="#d9ac68"/>
    </linearGradient>
    <clipPath id="welcomeFanClip"><path d="M180 950L2 311Q347-115 909 112Q1275 251 1282 718L180 950Z"/></clipPath>
    <g id="welcomeFanBlossom">${petals}<circle r="2.5"/></g>
  </defs>
  <path d="M180 950L2 311Q347-115 909 112Q1275 251 1282 718L180 950Z" fill="url(#welcomeFanPaper)"/>
  <g clip-path="url(#welcomeFanClip)">
    <g fill="#fff4c7" opacity=".11">
      <path d="M180 950L112 183L240 103Z"/><path d="M180 950L392 60L547 41Z"/>
      <path d="M180 950L710 61L850 93Z"/><path d="M180 950L983 149L1090 240Z"/>
      <path d="M180 950L1171 348L1230 455Z"/>
    </g>
    <g stroke="#9c6d3e" stroke-opacity=".17" stroke-width="1.5">
      <path d="M180 950L5 312M180 950L112 183M180 950L240 103M180 950L392 60M180 950L547 41M180 950L710 61M180 950L850 93M180 950L983 149M180 950L1090 240M180 950L1171 348M180 950L1230 455M180 950L1267 581M180 950L1282 718"/>
    </g>
    <path d="M24 325Q354-77 900 132Q1248 270 1260 722" stroke="#bc8a4e" stroke-opacity=".28" stroke-width="1.7"/>
    <g transform="translate(-90 0)" stroke="#9a6a3c" stroke-linecap="round" stroke-linejoin="round" opacity=".28">
      <path d="M1248 736C1220 674 1204 612 1182 551C1152 469 1108 420 1041 363" stroke-width="2.8"/>
      <path d="M1218 668C1200 630 1164 609 1125 596M1200 611C1212 574 1233 554 1262 539M1179 544C1147 516 1118 509 1076 511M1156 492C1160 455 1147 422 1118 394M1116 431C1085 424 1061 411 1047 390M1208 635C1238 620 1254 601 1267 577M1217 666C1178 665 1144 649 1111 624M1159 497C1191 480 1204 454 1208 432M1110 425C1101 395 1083 376 1059 364M1178 655C1163 677 1147 688 1126 697" stroke-width="1.7"/>
      <g fill="#9a6a3c" stroke="none">
        <path d="M1160 607C1146 589 1135 584 1127 588C1135 602 1144 608 1160 607ZM1195 595C1182 578 1180 565 1187 558C1198 572 1201 583 1195 595ZM1239 554C1238 538 1244 528 1254 523C1255 538 1251 548 1239 554ZM1117 510C1105 496 1093 493 1087 499C1096 510 1105 514 1117 510ZM1155 459C1140 449 1135 438 1139 430C1152 437 1158 446 1155 459ZM1094 426C1089 409 1080 401 1071 403C1076 417 1083 425 1094 426ZM1207 643C1222 628 1234 626 1240 632C1228 643 1219 647 1207 643ZM1230 692C1214 681 1208 670 1212 662C1226 670 1232 681 1230 692Z"/>
        <path d="M1144 647C1128 650 1117 646 1113 638C1127 632 1138 636 1144 647ZM1185 666C1186 683 1179 695 1170 697C1167 683 1172 672 1185 666ZM1194 463C1179 456 1173 446 1176 438C1189 442 1196 451 1194 463ZM1206 446C1219 438 1224 427 1221 419C1208 425 1203 434 1206 446ZM1088 395C1073 391 1065 380 1067 372C1080 375 1088 383 1088 395Z"/>
        <use href="#welcomeFanBlossom" transform="translate(1040 363) rotate(-15) scale(.63)"/>
        <use href="#welcomeFanBlossom" transform="translate(1120 394) rotate(16) scale(.75)"/>
        <use href="#welcomeFanBlossom" transform="translate(1071 511) rotate(-8) scale(.93)"/>
        <use href="#welcomeFanBlossom" transform="translate(1263 538) rotate(28) scale(.65)"/>
        <use href="#welcomeFanBlossom" transform="translate(1121 595) rotate(9) scale(.77)"/>
        <use href="#welcomeFanBlossom" transform="translate(1269 575) rotate(-22) scale(.82)"/>
        <use href="#welcomeFanBlossom" transform="translate(1110 623) rotate(25) scale(.98)"/>
        <use href="#welcomeFanBlossom" transform="translate(1208 430) rotate(-10) scale(.57)"/>
        <use href="#welcomeFanBlossom" transform="translate(1124 700) rotate(20) scale(.52)"/>
      </g>
    </g>
  </g>
  <path d="M2 311Q347-115 909 112Q1275 251 1282 718" stroke="url(#welcomeFanRim)" stroke-width="7"/>
  <path d="M180 950L2 311M180 950L1282 718" stroke="#ddaf69" stroke-width="2" stroke-opacity=".65"/>
</svg>`

export const welcomeWaveMarkup = `<svg class="svg-all" viewBox="0 0 1600 300" preserveAspectRatio="none" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="welcomeWaveBack" x1="0" y1="30" x2="0" y2="300" gradientUnits="userSpaceOnUse"><stop stop-color="#153a43"/><stop offset="1" stop-color="#0e2933"/></linearGradient>
    <linearGradient id="welcomeWaveMiddle" x1="800" y1="80" x2="800" y2="300" gradientUnits="userSpaceOnUse"><stop stop-color="#113340"/><stop offset="1" stop-color="#102a34"/></linearGradient>
    <linearGradient id="welcomeWaveFront" x1="800" y1="160" x2="800" y2="300" gradientUnits="userSpaceOnUse"><stop stop-color="#12343e"/><stop offset="1" stop-color="#0d2630"/></linearGradient>
    <linearGradient id="welcomeWaveGold" x1="0" y1="0" x2="1600" y2="200" gradientUnits="userSpaceOnUse"><stop stop-color="#a87838"/><stop offset=".18" stop-color="#f7d48c"/><stop offset=".4" stop-color="#c4974e"/><stop offset=".7" stop-color="#f1ca7b"/><stop offset="1" stop-color="#a87838"/></linearGradient>
    <clipPath id="welcomeWaveBackClip"><path d="M0 40C137 60 199 207 367 183C530 160 512 100 685 145C826 182 921 216 1084 156C1276 85 1423 84 1600 133V300H0Z"/></clipPath>
    <clipPath id="welcomeWaveMiddleClip"><path d="M0 144C154 43 246 231 439 216C650 199 743 135 923 111C1131 81 1290 204 1461 171C1520 161 1564 139 1600 140V300H0Z"/></clipPath>
    <clipPath id="welcomeWaveFrontClip"><path d="M0 242C168 203 207 283 385 244C528 213 612 167 758 189C951 218 1008 307 1182 267C1332 232 1400 219 1600 258V300H0Z"/></clipPath>
    <g id="welcomeWaveBlossom">${petals}<circle r="2" fill="#76512c"/></g>
  </defs>
  <path d="M0 40C137 60 199 207 367 183C530 160 512 100 685 145C826 182 921 216 1084 156C1276 85 1423 84 1600 133V300H0Z" fill="url(#welcomeWaveBack)"/>
  <g clip-path="url(#welcomeWaveBackClip)" stroke="#cda45e" stroke-width="1.2">
    ${waveRings(40, 187, 117, 9, 12, .92, '#143640', .42)}
    ${waveRings(431, 245, 96, 8, 11, 1.05, '#13353e', .36)}
    ${waveRings(597, 221, 108, 9, 12, .87, '#153741', .46)}
    ${waveRings(1414, 219, 124, 10, 12, .92, '#13343e', .43)}
  </g>
  <path d="M0 39C137 60 199 207 367 183C530 160 512 100 685 145C826 182 921 216 1084 156C1276 85 1423 84 1600 133" stroke="url(#welcomeWaveGold)" stroke-width="2"/>
  <path d="M0 28C139 49 206 207 367 183C218 225 133 65 0 49Z" fill="url(#welcomeWaveGold)"/>
  <path d="M0 144C154 43 246 231 439 216C650 199 743 135 923 111C1131 81 1290 204 1461 171C1520 161 1564 139 1600 140V300H0Z" fill="url(#welcomeWaveMiddle)"/>
  <g clip-path="url(#welcomeWaveMiddleClip)" stroke="#d0a768" stroke-width="1.3">
    ${waveRings(47, 249, 123, 10, 12, .95, '#12323e', .62)}
    ${waveRings(251, 295, 133, 10, 13, .97, '#11323d', .5)}
    ${waveRings(811, 250, 123, 10, 12, .96, '#12323e', .54)}
    ${waveRings(1097, 282, 127, 10, 12, .94, '#11313b', .48)}
    ${waveRings(1474, 271, 137, 11, 12, .96, '#12323c', .6)}
  </g>
  <path d="M0 144C154 43 246 231 439 216C650 199 743 135 923 111C1131 81 1290 204 1461 171C1520 161 1564 139 1600 140" stroke="url(#welcomeWaveGold)" stroke-width="2.2"/>
  <path d="M0 242C168 203 207 283 385 244C528 213 612 167 758 189C951 218 1008 307 1182 267C1332 232 1400 219 1600 258V300H0Z" fill="url(#welcomeWaveFront)"/>
  <g clip-path="url(#welcomeWaveFrontClip)" stroke="#d0a65f" stroke-width="1.45">
    ${waveRings(64, 330, 109, 9, 12, .97, '#10303a', .72)}
    ${waveRings(252, 342, 134, 11, 12, .95, '#0f2c36', .6)}
    ${waveRings(453, 324, 98, 8, 12, 1.02, '#10313b', .68)}
    ${waveRings(651, 332, 141, 11, 13, .98, '#0e2b35', .64)}
    ${waveRings(927, 345, 114, 9, 12, .96, '#102e38', .57)}
    ${waveRings(1202, 342, 126, 10, 12, .98, '#0f2c36', .66)}
    ${waveRings(1480, 327, 111, 9, 12, 1.02, '#10303a', .72)}
  </g>
  <path d="M0 242C168 203 207 283 385 244C528 213 612 167 758 189C951 218 1008 307 1182 267C1332 232 1400 219 1600 258" stroke="url(#welcomeWaveGold)" stroke-width="1.8"/>
  <path d="M758 189C951 218 1008 307 1182 267C1332 232 1400 219 1600 258C1405 213 1331 246 1183 278C1012 317 949 220 758 189Z" fill="url(#welcomeWaveGold)"/>
  <g class="wave-blossoms" fill="#e5b872">
    <use href="#welcomeWaveBlossom" transform="translate(121 175) rotate(-12) scale(.8)"/>
    <use href="#welcomeWaveBlossom" transform="translate(1220 225) rotate(16) scale(.74)"/>
  </g>
</svg>`

export const welcomeBackdropMarkup = `<svg class="svg-all" viewBox="0 0 1600 1100" preserveAspectRatio="none" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="welcomeRedSilk" x1="1123" y1="170" x2="1660" y2="842" gradientUnits="userSpaceOnUse"><stop stop-color="#722721"/><stop offset=".47" stop-color="#a43827"/><stop offset="1" stop-color="#74251f"/></linearGradient>
    <linearGradient id="welcomeRedEdge" x1="980" y1="18" x2="1534" y2="1100" gradientUnits="userSpaceOnUse"><stop stop-color="#bc8546"/><stop offset=".5" stop-color="#f0cc88"/><stop offset="1" stop-color="#a3763c"/></linearGradient>
    <clipPath id="welcomeRedClip"><path d="M1070-35C959 50 936 162 1008 305C1126 541 1540 487 1600 717V1100H1600V-35Z"/><path d="M1580-35C1371 86 1308 224 1358 393C1414 583 1375 729 1144 961L1009 1100H1600V-35Z"/></clipPath>
    <g id="welcomeRedBlossom">${petals}<circle r="2.3"/></g>
    <path id="welcomeRedStar" d="M0-11C1-3 3-1 10 0C3 1 1 3 0 11C-1 3-3 1-10 0C-3-1-1-3 0-11Z"/>
  </defs>
  <path d="M1070-35C959 50 936 162 1008 305C1126 541 1540 487 1600 717V1100H1600V-35Z" fill="url(#welcomeRedSilk)"/>
  <path d="M1580-35C1371 86 1308 224 1358 393C1414 583 1375 729 1144 961L1009 1100H1600V-35Z" fill="url(#welcomeRedSilk)"/>
  <path d="M1070-35C959 50 936 162 1008 305C1126 541 1540 487 1600 717M1580-35C1371 86 1308 224 1358 393C1414 583 1375 729 1144 961L1009 1100" stroke="url(#welcomeRedEdge)" stroke-width="2.1" stroke-opacity=".67"/>
  <path d="M1104-35C991 61 976 154 1036 283M1631-35C1400 88 1348 241 1394 393C1446 582 1400 758 1165 991L1060 1100" stroke="#d9a45c" stroke-width="1" stroke-opacity=".26"/>
  <g clip-path="url(#welcomeRedClip)">
    <g stroke="#e7b969" stroke-width="1.1" opacity=".37">
      <path d="M1318-28C1466 96 1508 289 1504 477M1588 692C1499 787 1387 864 1297 998M1624 725C1533 822 1419 905 1331 1029M1540 112C1576 132 1600 159 1623 202"/>
    </g>
    <g fill="#e7bd75" opacity=".7">
      <use href="#welcomeRedBlossom" transform="translate(1535 876) rotate(12) scale(.48)"/>
      <use href="#welcomeRedBlossom" transform="translate(1552 124) rotate(-20) scale(.32)"/>
      <use href="#welcomeRedBlossom" transform="translate(1469 1011) rotate(30) scale(.27)"/>
      <use href="#welcomeRedStar" transform="translate(1567 714) scale(.56)"/>
      <use href="#welcomeRedStar" transform="translate(1501 933) scale(.35)"/>
      <use href="#welcomeRedStar" transform="translate(1444 72) scale(.3)"/>
      <circle cx="1536" cy="251" r="1.1"/><circle cx="1574" cy="832" r="1.2"/><circle cx="1478" cy="838" r=".85"/>
    </g>
    <g fill="#de5544" opacity=".8">
      <path d="M1490 314C1506 287 1519 295 1530 281C1526 303 1511 314 1490 314Z"/>
      <path d="M1431 953C1447 932 1458 940 1467 929C1461 948 1449 954 1431 953Z"/>
    </g>
  </g>
</svg>`
