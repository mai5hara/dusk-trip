import type { ReactElement } from 'react';
import { TOPO_CONTOURS, TOPO_ROUTE, TOPO_STREAM } from './_topo-contours';

const _strokeWidth = (index?: boolean, fill?: boolean): number => {
  if (fill) return 1.2;
  return index ? 1.35 : 0.7;
};

const LostRouteMap = (): ReactElement => {
  return (
    <figure
      aria-hidden="true"
      className="relative h-full min-h-0 w-full overflow-hidden text-surface"
    >
      <svg
        viewBox="0 0 480 600"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="text-text-primary">
          {TOPO_CONTOURS.map((contour) => (
            <path
              key={contour.d}
              d={contour.d}
              fill={contour.fill ? 'currentColor' : 'none'}
              fillOpacity={contour.fill ? 0.08 : 0}
              stroke="currentColor"
              strokeOpacity={contour.index || contour.fill ? 0.55 : 0.28}
              strokeWidth={_strokeWidth(contour.index, contour.fill)}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={TOPO_STREAM}
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeDasharray="3 7"
            strokeOpacity="0.35"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <path
          d={TOPO_ROUTE}
          pathLength="1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="6 10"
          className="opacity-30"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={TOPO_ROUTE}
          pathLength="1"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          className="not-found-route"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx="84" cy="492" r="5" className="fill-current" />
        <circle cx="176" cy="358" r="5" className="fill-current" />
        <g className="not-found-pin">
          <circle
            cx="246"
            cy="252"
            r="14"
            className="fill-current opacity-25"
          />
          <circle cx="246" cy="252" r="6" className="fill-current" />
        </g>
        <circle
          cx="332"
          cy="128"
          r="17"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeDasharray="4 5"
          className="opacity-45"
        />
        <circle cx="332" cy="128" r="4" className="fill-current opacity-40" />
        <path
          d="M 320 142 L 332 118 L 344 142 Z"
          className="fill-current opacity-70"
        />
        <text
          x="98"
          y="486"
          className="fill-current font-mono text-[11px] opacity-80"
        >
          Day 01
        </text>
        <text
          x="190"
          y="350"
          className="fill-current font-mono text-[11px] opacity-80"
        >
          Day 02
        </text>
        <text x="264" y="246" className="fill-current font-mono text-[11px]">
          Last seen
        </text>
        <text
          x="348"
          y="122"
          className="fill-current font-mono text-[10px] opacity-70"
        >
          1847 m
        </text>
      </svg>
      <figcaption className="pointer-events-none absolute right-5 bottom-5 font-mono text-[11px] tracking-wide text-surface/80 lg:right-10 lg:bottom-10">
        Route incomplete
      </figcaption>
    </figure>
  );
};

export default LostRouteMap;
