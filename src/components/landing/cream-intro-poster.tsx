export function CreamIntroPoster() {
  return (
    <svg
      className="cream-intro-fallback"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cream-poster-base" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cream-light, #f6ebd0)" />
          <stop offset=".5" stopColor="var(--cream-base, #efe0bf)" />
          <stop offset="1" stopColor="var(--cream-light, #f8efd8)" />
        </linearGradient>
        <filter
          id="cream-poster-fold"
          x="-20%"
          y="-25%"
          width="140%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".0045 .013"
            numOctaves="3"
            seed="29"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="88"
            xChannelSelector="R"
            yChannelSelector="B"
            result="bent"
          />
          <feGaussianBlur in="bent" stdDeviation="8" />
        </filter>
        <filter
          id="cream-poster-ridge"
          x="-20%"
          y="-25%"
          width="140%"
          height="150%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".006 .018"
            numOctaves="2"
            seed="11"
            result="warp"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="warp"
            scale="52"
            xChannelSelector="G"
            yChannelSelector="R"
            result="bent"
          />
          <feGaussianBlur in="bent" stdDeviation="5" />
        </filter>
        <filter
          id="cream-poster-grain"
          x="0"
          y="0"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".42"
            numOctaves="2"
            seed="7"
            result="noise"
          />
          <feColorMatrix
            in="noise"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .035 0"
          />
        </filter>
      </defs>

      <rect width="1600" height="900" fill="url(#cream-poster-base)" />

      <g fill="none" strokeLinecap="round" filter="url(#cream-poster-fold)">
        <path d="M-180 36 C170 150 260 42 510 90S830 128 1030 6 1390 90 1780-8" stroke="var(--cream-light, #fbf2d8)" strokeWidth="300" />
        <path d="M-140 490 C120 350 310 512 570 402S910 330 1110 500 1430 570 1770 410" stroke="var(--cream-base, #f7eccf)" strokeWidth="330" />
        <path d="M-190 878 C110 710 340 825 620 736S970 750 1190 870 1500 980 1780 760" stroke="var(--cream-light, #f9efd4)" strokeWidth="310" />
        <path d="M-120 730 C80 620 155 530 236 340S420 94 530-90" stroke="var(--cream-ribbon-a, #d8868b)" strokeOpacity=".5" strokeWidth="180" />
        <path d="M715 1010 C695 790 820 630 760 438S748 120 900-120" stroke="var(--cream-ribbon-b, #d77883)" strokeOpacity=".48" strokeWidth="205" />
        <path d="M1345 1030 C1230 820 1360 620 1265 420S1280 120 1455-140" stroke="var(--cream-ribbon-a, #dc8b8c)" strokeOpacity=".49" strokeWidth="215" />
        <path d="M-80 210 C220 250 360 170 630 245S970 315 1210 205 1510 190 1700 285" stroke="var(--cream-light, #fff8e7)" strokeOpacity=".74" strokeWidth="122" />
        <path d="M-90 660 C190 585 390 680 620 590S1010 540 1210 660 1510 720 1710 610" stroke="var(--cream-light, #fff9e6)" strokeOpacity=".7" strokeWidth="132" />
      </g>

      <g
        fill="none"
        strokeLinecap="round"
        filter="url(#cream-poster-ridge)"
        opacity=".24"
      >
        <path d="M-120 308 C170 250 365 380 620 300S950 218 1200 330 1510 390 1720 300" stroke="var(--cream-ribbon-b, #6e5b48)" strokeWidth="17" />
        <path d="M-120 754 C180 690 370 800 635 714S990 650 1210 770 1515 824 1725 716" stroke="var(--cream-ribbon-b, #77634d)" strokeWidth="18" />
        <path d="M300 1040 C205 800 380 650 332 435S318 90 500-130" stroke="var(--cream-ribbon-b, #75574d)" strokeWidth="16" />
        <path d="M900 1040 C790 810 920 640 860 424S860 90 1025-130" stroke="var(--cream-ribbon-b, #76554d)" strokeWidth="18" />
        <path d="M1500 1030 C1360 820 1490 620 1400 420S1425 120 1585-130" stroke="var(--cream-ribbon-b, #75544d)" strokeWidth="18" />
      </g>

      <rect width="1600" height="900" filter="url(#cream-poster-grain)" opacity=".45" />
    </svg>
  );
}
