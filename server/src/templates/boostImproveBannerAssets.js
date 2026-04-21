/**
 * Static SVG art for engine `banner_8` (wellness / “Boost and Improve” CTA strip).
 * Gradient ids prefixed `b8-` for safe stacking with other strips.
 */

export const BOOST_LOGO_LEAF_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28" style="display:block;width:28px;height:28px;margin:0 auto 2px;border:0;">
<path d="M16 2 C16 2 28 8 28 20 C28 28 22 30 16 30 C10 30 4 28 4 20 C4 8 16 2 16 2Z" fill="#7ab82a"/>
<path d="M16 6 C16 6 24 11 24 20 C24 26 20 28 16 28" fill="#5a9010" opacity="0.5"/>
<line x1="16" y1="30" x2="16" y2="14" stroke="#aad060" stroke-width="1.5" stroke-linecap="round"/>
<line x1="16" y1="22" x2="11" y2="18" stroke="#aad060" stroke-width="1.2" stroke-linecap="round"/>
<line x1="16" y1="19" x2="21" y2="15" stroke="#aad060" stroke-width="1.2" stroke-linecap="round"/>
</svg>`;

export const BOOST_WELLNESS_SCENE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 130" preserveAspectRatio="xMidYMax meet" width="100%" height="54" style="display:block;width:100%;height:54px;max-height:58px;border:0;vertical-align:bottom;">
<defs>
<linearGradient id="b8-bgGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8f2d5"/><stop offset="100%" stop-color="#c0dc90"/></linearGradient>
<linearGradient id="b8-glassGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="100%" stop-color="#e0f0ff" stop-opacity="0.5"/></linearGradient>
<linearGradient id="b8-liquidGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a8e060"/><stop offset="100%" stop-color="#70c020"/></linearGradient>
<linearGradient id="b8-liquidClear" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d8f0ff" stop-opacity="0.8"/><stop offset="100%" stop-color="#b0d8f0" stop-opacity="0.6"/></linearGradient>
<linearGradient id="b8-lemonGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f5e040"/><stop offset="100%" stop-color="#d8c010"/></linearGradient>
<linearGradient id="b8-gingerGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e8c060"/><stop offset="100%" stop-color="#c09020"/></linearGradient>
</defs>
<rect width="390" height="130" fill="url(#b8-bgGrad)"/>
<ellipse cx="195" cy="0" rx="180" ry="60" fill="#ffffff" opacity="0.12"/>
<rect x="0" y="105" width="390" height="25" fill="#b0cc80" opacity="0.5"/>
<path d="M48 30 L52 108 L80 108 L84 30 Z" fill="url(#b8-glassGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>
<path d="M52 70 L53 108 L79 108 L80 70 Z" fill="url(#b8-liquidGreen)" opacity="0.75"/>
<ellipse cx="66" cy="70" rx="14" ry="2.5" fill="#c0f060" opacity="0.6"/>
<ellipse cx="66" cy="30" rx="18" ry="3" fill="rgba(255,255,255,0.6)"/>
<path d="M52 35 L53 90" stroke="rgba(255,255,255,0.7)" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="60" cy="27" rx="8" ry="4" fill="#4aaa20" transform="rotate(-20 60 27)"/>
<ellipse cx="72" cy="26" rx="7" ry="3.5" fill="#5abb28" transform="rotate(15 72 26)"/>
<line x1="60" y1="31" x2="60" y2="22" stroke="#3a8010" stroke-width="1" stroke-linecap="round"/>
<line x1="72" y1="30" x2="72" y2="21" stroke="#3a8010" stroke-width="1" stroke-linecap="round"/>
<path d="M100 45 L104 108 L128 108 L132 45 Z" fill="url(#b8-glassGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>
<path d="M104 78 L105 108 L127 108 L128 78 Z" fill="url(#b8-liquidClear)" opacity="0.8"/>
<ellipse cx="116" cy="78" rx="12" ry="2" fill="#d8f0ff" opacity="0.7"/>
<ellipse cx="116" cy="45" rx="16" ry="3" fill="rgba(255,255,255,0.6)"/>
<path d="M104 50 L105 95" stroke="rgba(255,255,255,0.7)" stroke-width="1.8" stroke-linecap="round"/>
<path d="M148 25 L152 108 L184 108 L188 25 Z" fill="url(#b8-glassGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>
<path d="M152 62 L154 108 L182 108 L184 62 Z" fill="url(#b8-liquidGreen)" opacity="0.7"/>
<ellipse cx="168" cy="62" rx="16" ry="2.5" fill="#c0f060" opacity="0.5"/>
<ellipse cx="168" cy="25" rx="20" ry="3.5" fill="rgba(255,255,255,0.65)"/>
<path d="M154 30 L155 95" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round"/>
<rect x="175" y="10" width="4" height="75" rx="2" fill="#88cc40" opacity="0.85"/>
<ellipse cx="175" cy="22" rx="10" ry="10" fill="#78c020" transform="rotate(-30 175 22)"/>
<ellipse cx="175" cy="22" rx="7" ry="7" fill="#a0d840" transform="rotate(-30 175 22)"/>
<line x1="175" y1="12" x2="175" y2="32" stroke="#5a9010" stroke-width="1" transform="rotate(-30 175 22)"/>
<line x1="165" y1="22" x2="185" y2="22" stroke="#5a9010" stroke-width="1" transform="rotate(-30 175 22)"/>
<path d="M200 55 L203 108 L225 108 L228 55 Z" fill="url(#b8-glassGrad)" stroke="rgba(255,255,255,0.8)" stroke-width="1"/>
<path d="M203 82 L204 108 L224 108 L225 82 Z" fill="url(#b8-liquidGreen)" opacity="0.65"/>
<ellipse cx="214" cy="82" rx="11" ry="2" fill="#c0f060" opacity="0.5"/>
<ellipse cx="214" cy="55" rx="14" ry="2.5" fill="rgba(255,255,255,0.6)"/>
<path d="M204 60 L205 95" stroke="rgba(255,255,255,0.65)" stroke-width="1.5" stroke-linecap="round"/>
<ellipse cx="255" cy="102" rx="22" ry="16" fill="url(#b8-lemonGrad)"/>
<ellipse cx="255" cy="100" rx="18" ry="12" fill="#f0d820" opacity="0.4"/>
<ellipse cx="235" cy="100" rx="5" ry="4" fill="#e8c810" transform="rotate(20 235 100)"/>
<ellipse cx="275" cy="104" rx="4" ry="3.5" fill="#e8c810" transform="rotate(-15 275 104)"/>
<path d="M280 108 A18 18 0 0 1 316 108 Z" fill="url(#b8-lemonGrad)"/>
<path d="M280 108 A18 18 0 0 1 316 108" fill="#f5e840" opacity="0.6"/>
<line x1="298" y1="90" x2="298" y2="108" stroke="#d8c010" stroke-width="0.8"/>
<line x1="282" y1="99" x2="314" y2="99" stroke="#d8c010" stroke-width="0.8"/>
<path d="M325 95 Q335 85 348 90 Q360 94 355 105 Q350 115 338 112 Q325 110 320 100 Q316 92 325 95 Z" fill="url(#b8-gingerGrad)"/>
<path d="M348 90 Q358 82 365 88 Q370 93 363 100 Q358 106 350 103" fill="#d8a840"/>
<path d="M325 95 Q318 88 315 93 Q312 98 318 103" fill="#d8a840"/>
<path d="M328 98 Q340 94 350 98" stroke="#c09020" stroke-width="1" fill="none" stroke-linecap="round"/>
<path d="M330 104 Q340 100 348 103" stroke="#c09020" stroke-width="0.8" fill="none" stroke-linecap="round"/>
<ellipse cx="240" cy="88" rx="10" ry="5" fill="#4ab820" transform="rotate(-25 240 88)" opacity="0.9"/>
<ellipse cx="232" cy="83" rx="9" ry="4.5" fill="#5acc28" transform="rotate(10 232 83)" opacity="0.85"/>
<line x1="236" y1="91" x2="244" y2="82" stroke="#3a9010" stroke-width="1"/>
<ellipse cx="95" cy="50" rx="2" ry="3" fill="rgba(255,255,255,0.7)"/>
<ellipse cx="140" cy="38" rx="1.5" ry="2.5" fill="rgba(255,255,255,0.6)"/>
<ellipse cx="195" cy="30" rx="2" ry="3" fill="rgba(255,255,255,0.7)"/>
</svg>`;
