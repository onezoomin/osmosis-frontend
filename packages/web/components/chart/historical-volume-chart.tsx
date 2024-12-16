import {
  AreaData,
  DeepPartial,
  HistogramData,
  HistogramSeriesOptions,
  Time,
  TimeChartOptions,
} from "lightweight-charts";
import React, { memo } from "react";

import { HistogramChartController } from "~/components/chart/light-weight-charts/histogram-chart";
import { priceFormatter } from "~/components/chart/light-weight-charts/utils";
import { Skeleton } from "~/components/ui/skeleton";
import { theme } from "~/tailwind.config";

import { Chart } from "./light-weight-charts/chart";

const seriesOpt: DeepPartial<HistogramSeriesOptions> = {
  priceLineVisible: false,
  lastValueVisible: false,
  priceScaleId: "right",
  color: theme.colors.ammelia[500],
  priceFormat: {
    type: "custom",
    formatter: priceFormatter,
    minMove: 0.0000001,
  },
};

interface HistoricalVolumeChartProps {
  data: HistogramData<Time>[];
  onPointerHover?: (price: number, time: Time) => void;
  onPointerOut?: () => void;
}

const chartOptions: DeepPartial<TimeChartOptions> = {
  rightPriceScale: {
    autoScale: true,
    borderVisible: false,
    ticksVisible: false,
    entireTextOnly: true,
    scaleMargins: {
      top: 0.25,
      bottom: 0,
    },
  },
  leftPriceScale: {
    autoScale: true,
    borderVisible: false,
    ticksVisible: false,
    entireTextOnly: true,
    scaleMargins: {
      top: 0.25,
      bottom: 0,
    },
  },
  crosshair: {
    horzLine: {
      visible: false,
      labelVisible: false,
    },
    vertLine: {
      visible: false,
      labelVisible: false,
    },
  },
};

export const HistoricalVolumeChart = memo(
  (props: HistoricalVolumeChartProps) => {
    const { data = [], onPointerHover, onPointerOut } = props;

    return (
      <Chart
        Controller={HistogramChartController}
        options={chartOptions}
        series={[
          {
            type: "Histogram",
            options: {
              ...seriesOpt,
              autoscaleInfoProvider: () => {
                const values = data
                  .map((entry) => entry.value)
                  .filter((entry) => entry >= 0);

                return {
                  priceRange: {
                    minValue: Math.min(...values),
                    maxValue: Math.max(...values),
                  },
                };
              },
            },
            data,
          },
        ]}
        onDataPointHover={(params) => {
          if (params.seriesData.size > 0) {
            const [data] = [...params.seriesData.values()] as AreaData[];

            onPointerHover?.(data.value, data.time);
          } else {
            onPointerOut?.();
          }
        }}
      />
    );
  }
);

export const HistoricalVolumeChartSkeleton = () => {
  return (
    <div className="flex h-full w-full flex-1 flex-row gap-3">
      <div className="flex flex-1 flex-col items-end justify-end">
        <svg
          className="h-auto w-full animate-pulse"
          viewBox="0 0 700 346"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.2"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 100.964C0 99.8595 0.895431 98.964 2 98.964H14.2791C15.3836 98.964 16.2791 99.8595 16.2791 100.964V343.962C16.2791 345.067 15.3836 345.962 14.2791 345.962H2C0.895429 345.962 0 345.067 0 343.962V100.964ZM24.418 298.562C24.418 297.458 25.3134 296.562 26.418 296.562H38.697C39.8016 296.562 40.697 297.458 40.697 298.562V343.962C40.697 345.067 39.8016 345.962 38.697 345.962H26.418C25.3134 345.962 24.418 345.067 24.418 343.962V298.562ZM50.8369 302.374C49.7323 302.374 48.8369 303.269 48.8369 304.374V343.962C48.8369 345.066 49.7323 345.962 50.8369 345.962H63.116C64.2206 345.962 65.116 345.066 65.116 343.962V304.374C65.116 303.269 64.2206 302.374 63.116 302.374H50.8369ZM73.2559 324.715C73.2559 323.61 74.1513 322.715 75.2559 322.715H87.5349C88.6395 322.715 89.5349 323.61 89.5349 324.715V343.962C89.5349 345.066 88.6395 345.962 87.5349 345.962H75.2559C74.1513 345.962 73.2559 345.066 73.2559 343.962V324.715ZM99.6738 273.315C98.5693 273.315 97.6738 274.211 97.6738 275.315V343.962C97.6738 345.066 98.5693 345.962 99.6738 345.962H111.953C113.057 345.962 113.953 345.066 113.953 343.962V275.315C113.953 274.211 113.057 273.315 111.953 273.315H99.6738ZM122.093 307.28C122.093 306.176 122.988 305.28 124.093 305.28H136.372C137.476 305.28 138.372 306.176 138.372 307.28V343.962C138.372 345.067 137.476 345.962 136.372 345.962H124.093C122.988 345.962 122.093 345.067 122.093 343.962V307.28ZM148.512 296.562C147.407 296.562 146.512 297.458 146.512 298.562V343.962C146.512 345.067 147.407 345.962 148.512 345.962H160.791C161.895 345.962 162.791 345.067 162.791 343.962V298.562C162.791 297.458 161.895 296.562 160.791 296.562H148.512ZM170.931 231.727C170.931 230.623 171.826 229.727 172.931 229.727H185.21C186.314 229.727 187.21 230.623 187.21 231.727V343.962C187.21 345.066 186.314 345.962 185.21 345.962H172.931C171.826 345.962 170.931 345.066 170.931 343.962V231.727ZM197.35 215.198C196.245 215.198 195.35 216.094 195.35 217.198V343.962C195.35 345.066 196.245 345.962 197.35 345.962H209.629C210.733 345.962 211.629 345.066 211.629 343.962V217.198C211.629 216.094 210.733 215.198 209.629 215.198H197.35ZM219.768 318.903C219.768 317.799 220.663 316.903 221.768 316.903H234.047C235.151 316.903 236.047 317.799 236.047 318.903V343.962C236.047 345.066 235.151 345.962 234.047 345.962H221.768C220.663 345.962 219.768 345.066 219.768 343.962V318.903ZM246.186 311.092C245.081 311.092 244.186 311.987 244.186 313.092V343.962C244.186 345.067 245.081 345.962 246.186 345.962H258.465C259.569 345.962 260.465 345.067 260.465 343.962V313.092C260.465 311.987 259.569 311.092 258.465 311.092H246.186ZM268.605 324.715C268.605 323.61 269.5 322.715 270.605 322.715H282.884C283.988 322.715 284.884 323.61 284.884 324.715V343.962C284.884 345.066 283.988 345.962 282.884 345.962H270.605C269.5 345.962 268.605 345.066 268.605 343.962V324.715ZM295.023 311.092C293.919 311.092 293.023 311.987 293.023 313.092V343.962C293.023 345.067 293.919 345.962 295.023 345.962H307.303C308.407 345.962 309.303 345.067 309.303 343.962V313.092C309.303 311.987 308.407 311.092 307.303 311.092H295.023ZM317.442 327.621C317.442 326.516 318.338 325.621 319.442 325.621H331.721C332.826 325.621 333.721 326.516 333.721 327.621V343.962C333.721 345.067 332.826 345.962 331.721 345.962H319.442C318.338 345.962 317.442 345.067 317.442 343.962V327.621ZM343.861 331.433C342.757 331.433 341.861 332.328 341.861 333.433V343.962C341.861 345.066 342.757 345.962 343.861 345.962H356.14C357.245 345.962 358.14 345.066 358.14 343.962V333.433C358.14 332.328 357.245 331.433 356.14 331.433H343.861ZM366.279 324.715C366.279 323.61 367.175 322.715 368.279 322.715H380.558C381.663 322.715 382.558 323.61 382.558 324.715V343.962C382.558 345.066 381.663 345.962 380.558 345.962H368.279C367.175 345.962 366.279 345.066 366.279 343.962V324.715ZM392.697 319.809C391.593 319.809 390.697 320.705 390.697 321.809V343.962C390.697 345.067 391.593 345.962 392.697 345.962H404.976C406.081 345.962 406.976 345.067 406.976 343.962V321.809C406.976 320.705 406.081 319.809 404.976 319.809H392.697ZM415.116 330.527C415.116 329.423 416.012 328.527 417.116 328.527H429.395C430.5 328.527 431.395 329.423 431.395 330.527V343.962C431.395 345.067 430.5 345.962 429.395 345.962H417.116C416.012 345.962 415.116 345.067 415.116 343.962V330.527ZM441.535 311.092C440.431 311.092 439.535 311.987 439.535 313.092V343.962C439.535 345.067 440.431 345.962 441.535 345.962H453.814C454.919 345.962 455.814 345.067 455.814 343.962V313.092C455.814 311.987 454.919 311.092 453.814 311.092H441.535ZM463.953 313.092C463.953 311.987 464.849 311.092 465.953 311.092H478.232C479.337 311.092 480.232 311.987 480.232 313.092V343.962C480.232 345.067 479.337 345.962 478.232 345.962H465.953C464.849 345.962 463.953 345.067 463.953 343.962V313.092ZM490.372 296.562C489.267 296.562 488.372 297.458 488.372 298.562V343.962C488.372 345.067 489.267 345.962 490.372 345.962H502.651C503.756 345.962 504.651 345.067 504.651 343.962V298.562C504.651 297.458 503.756 296.562 502.651 296.562H490.372ZM512.791 281.127C512.791 280.022 513.686 279.127 514.791 279.127H527.07C528.175 279.127 529.07 280.022 529.07 281.127V343.962C529.07 345.066 528.175 345.962 527.07 345.962H514.791C513.686 345.962 512.791 345.066 512.791 343.962V281.127ZM539.21 197.764C538.105 197.764 537.21 198.659 537.21 199.764V343.962C537.21 345.067 538.105 345.962 539.21 345.962H551.489C552.594 345.962 553.489 345.067 553.489 343.962V199.764C553.489 198.659 552.594 197.764 551.489 197.764H539.21ZM561.628 252.068C561.628 250.964 562.523 250.068 563.628 250.068H575.907C577.012 250.068 577.907 250.964 577.907 252.068V343.962C577.907 345.066 577.012 345.962 575.907 345.962H563.628C562.523 345.962 561.628 345.066 561.628 343.962V252.068ZM588.047 284.939C586.942 284.939 586.047 285.835 586.047 286.939V343.962C586.047 345.067 586.942 345.962 588.047 345.962H600.326C601.431 345.962 602.326 345.067 602.326 343.962V286.939C602.326 285.835 601.431 284.939 600.326 284.939H588.047ZM610.465 228.822C610.465 227.718 611.36 226.822 612.465 226.822H624.744C625.849 226.822 626.744 227.718 626.744 228.822V343.962C626.744 345.067 625.849 345.962 624.744 345.962H612.465C611.36 345.962 610.465 345.067 610.465 343.962V228.822ZM636.884 299.469C635.779 299.469 634.884 300.364 634.884 301.469V343.962C634.884 345.067 635.779 345.962 636.884 345.962H649.163C650.267 345.962 651.163 345.067 651.163 343.962V301.469C651.163 300.364 650.267 299.469 649.163 299.469H636.884ZM659.302 307.28C659.302 306.176 660.197 305.28 661.302 305.28H673.581C674.685 305.28 675.581 306.176 675.581 307.28V343.962C675.581 345.067 674.685 345.962 673.581 345.962H661.302C660.197 345.962 659.302 345.067 659.302 343.962V307.28ZM685.721 116.399C684.616 116.399 683.721 117.295 683.721 118.399V343.962C683.721 345.067 684.616 345.962 685.721 345.962H698C699.104 345.962 700 345.067 700 343.962V118.399C700 117.295 699.104 116.399 698 116.399H685.721Z"
            fill="url(#paint0_linear_2029_22324)"
          />
          <defs>
            <linearGradient
              id="paint0_linear_2029_22324"
              x1="-3.91281e-06"
              y1="98.9999"
              x2="700"
              y2="346"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#736CA3" />
              <stop offset="1" stopColor="#565081" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>

        <div className="flex w-full flex-row justify-between py-3">
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        </div>
      </div>

      <div className="flex flex-col justify-between pb-7 pt-2">
        <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
      </div>
    </div>
  );
};
