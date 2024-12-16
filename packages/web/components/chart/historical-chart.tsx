import { Dec } from "@osmosis-labs/unit";
import {
  AreaData,
  AreaSeriesOptions,
  DeepPartial,
  LineType,
  Time,
} from "lightweight-charts";
import React, { FunctionComponent, memo } from "react";

import { AreaChartController } from "~/components/chart/light-weight-charts/area-chart";
import { priceFormatter } from "~/components/chart/light-weight-charts/utils";
import { SubscriptDecimal } from "~/components/chart/price-historical";
import { Skeleton } from "~/components/ui/skeleton";
import { theme } from "~/tailwind.config";
import { FormatOptions } from "~/utils/formatter";
import { getDecimalCount } from "~/utils/number";

import { Chart } from "./light-weight-charts/chart";

const getSeriesOpt = (config: Style): DeepPartial<AreaSeriesOptions> => {
  let lineColor, topColor, bottomColor, crosshairMarkerBorderColor;

  switch (config) {
    case "bullish":
      lineColor = theme.colors.bullish[500];
      topColor = `${theme.colors.bullish[500]}33`; // 20% opacity
      bottomColor = `${theme.colors.bullish[500]}00`; // 0% opacity
      crosshairMarkerBorderColor = theme.colors.bullish[500];
      break;
    case "bearish":
      lineColor = theme.colors.rust[500];
      topColor = `${theme.colors.rust[500]}33`; // 20% opacity
      bottomColor = `${theme.colors.rust[500]}00`; // 0% opacity
      crosshairMarkerBorderColor = theme.colors.rust[500];
      break;
    case "neutral":
    default:
      lineColor = theme.colors.wosmongton[400];
      topColor = "rgba(70, 42, 223, 0.2)";
      bottomColor = "rgba(165, 19, 153, 0.01)";
      crosshairMarkerBorderColor = theme.colors.osmoverse[900];
      break;
  }

  return {
    lineColor,
    lineWidth: 2,
    lineType: LineType.Simple,
    topColor,
    bottomColor,
    priceLineVisible: false,
    lastValueVisible: false,
    priceScaleId: "right",
    crosshairMarkerBorderWidth: 4,
    crosshairMarkerBorderColor,
    crosshairMarkerRadius: 4,
    priceFormat: {
      type: "custom",
      formatter: priceFormatter,
      minMove: 0.0000000001,
    },
  };
};

type Style = "bullish" | "bearish" | "neutral";

interface HistoricalChartProps {
  data: AreaData<Time>[];
  onPointerHover?: (price: number, time: Time) => void;
  onPointerOut?: () => void;
  style?: Style;
  hideScales?: boolean;
}

export const HistoricalChart = memo((props: HistoricalChartProps) => {
  const {
    data = [],
    onPointerHover,
    onPointerOut,
    style = "neutral",
    hideScales = false,
  } = props;

  const options = hideScales
    ? {
        rightPriceScale: {
          visible: false,
        },
        leftPriceScale: {
          visible: false,
        },
        timeScale: {
          visible: false,
        },
      }
    : {};

  return (
    <Chart
      Controller={AreaChartController}
      options={options}
      series={[
        {
          type: "Area",
          options: {
            ...getSeriesOpt(style),
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
});

export const HistoricalChartHeader: FunctionComponent<{
  hoverData: Dec;
  hoverDate?: string | null;
  maxDecimal?: number;
  formatOptions?: FormatOptions;
  fiatSymbol?: string;
  isLoading?: boolean;
}> = ({
  hoverDate,
  hoverData,
  formatOptions,
  maxDecimal = Math.max(getDecimalCount(hoverData.toString()), 2),
  fiatSymbol,
  isLoading = false,
}) => {
  return (
    <div className="flex flex-col gap-1">
      {isLoading ? (
        <>
          <Skeleton className="h-14 w-60 bg-osmoverse-825" />
          <Skeleton className="h-6 w-20 bg-osmoverse-825" />
        </>
      ) : (
        <>
          <h3 className="font-h3 sm:text-h4 xs:text-h4">
            {fiatSymbol}
            <SubscriptDecimal
              decimal={hoverData}
              maxDecimals={maxDecimal}
              formatOptions={formatOptions}
            />
          </h3>
          {hoverDate !== undefined ? (
            <p className="flex flex-1 flex-col justify-center text-sm font-caption text-wosmongton-200">
              {hoverDate}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
};

export const HistoricalChartSkeleton = ({ hideScales = false }) => {
  return (
    <div className="flex h-full w-full grow flex-row gap-3">
      <div className="flex grow flex-col items-end justify-end">
        <svg
          className="h-auto w-full animate-pulse"
          viewBox="0 0 700 346"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <g clipPath="url(#clip0_2029_22138)">
            <path
              d="M-0.994141 180.793C0.40276 192.571 1.79966 204.35 3.1934 205.054C4.58713 205.759 5.9777 195.389 7.36824 190.27C8.75878 185.15 10.1493 185.28 11.5438 187.764C12.9383 190.248 14.3368 195.085 15.7229 199.198C17.1091 203.311 18.4829 206.7 19.9098 208.668C21.2993 210.585 22.7392 211.155 24.1093 211.697L24.2195 211.741L24.2592 211.757C25.6476 212.308 26.9615 212.829 28.3167 209.375C29.6848 205.887 31.0949 198.349 32.5035 194.865C33.9121 191.382 35.3193 191.955 36.7201 192.895C38.1209 193.836 39.5153 195.144 40.9058 196.011C42.2962 196.878 43.6826 197.303 45.0824 197.31C46.4821 197.317 47.8953 196.906 49.2848 200.069C50.6743 203.232 52.0402 209.968 53.4422 215.981C54.8441 221.994 56.2822 227.283 57.7319 234.527C59.1816 241.771 60.643 250.969 62.0095 254.588C63.376 258.206 64.6476 256.245 65.989 258.314C67.3303 260.383 68.7415 266.482 70.0997 266.091C71.4579 265.701 72.7631 258.822 74.2671 259.756C75.771 260.69 77.4737 269.438 78.8709 275.872C80.2681 282.306 81.3597 286.428 82.6701 279.142C83.9804 271.856 85.5093 253.162 86.9456 245.422C88.382 237.682 89.7257 240.895 91.1077 239.855C92.4896 238.816 93.9098 233.523 95.3067 233.486C96.7036 233.449 98.0772 238.667 99.4678 240.607C100.858 242.548 102.266 241.212 103.661 242.054C105.055 242.895 106.438 245.914 107.826 246.714C109.215 247.514 110.611 246.095 112.005 239.879C113.399 233.663 114.791 222.652 116.186 215.624C117.582 208.597 118.979 205.553 120.365 200.288C121.75 195.023 123.123 187.537 124.546 187.697C125.969 187.858 127.443 195.665 128.846 195.925C130.249 196.185 131.582 188.899 132.925 188.499C134.268 188.098 135.622 194.585 136.988 197.026C138.355 199.468 139.734 197.866 141.177 195.651C142.619 193.436 144.125 190.608 145.519 189.382C146.913 188.156 148.197 188.531 149.556 187.196C150.915 185.862 152.351 182.816 153.741 181.064C155.131 179.311 156.476 178.852 157.854 179.286C159.232 179.721 160.642 181.05 162.078 177.56C163.514 174.069 164.977 165.76 166.403 164.866C167.83 163.973 169.221 170.496 170.568 173.961C171.914 177.427 173.216 177.835 174.591 179.657C175.967 181.479 177.415 184.715 178.815 186.787C180.215 188.859 181.567 189.767 182.942 189.115C184.316 188.462 185.714 186.248 187.108 183.169C188.502 180.09 189.893 176.145 191.286 174.615C192.679 173.085 194.073 173.968 195.468 179.511C196.863 185.053 198.258 195.254 199.653 197.925C201.048 200.597 202.442 195.738 203.836 198.241C205.231 200.744 206.625 210.607 208.017 212.252C209.409 213.897 210.799 207.324 212.19 205.26C213.582 203.196 214.975 205.642 216.369 202.544C217.763 199.446 219.159 190.803 220.551 188.107C221.943 185.412 223.332 188.664 224.724 190.048C226.116 191.433 227.511 190.95 228.903 193.117C230.294 195.283 231.682 200.097 233.074 202.392C234.466 204.688 235.863 204.463 237.259 203.495C238.656 202.527 240.052 200.816 241.463 203.055C242.874 205.294 244.299 211.485 245.7 212.187C247.101 212.889 248.477 208.103 249.862 205.834C251.232 203.59 252.611 203.809 253.99 204.029L254.035 204.036C255.429 204.258 256.825 204.453 258.192 204.003C259.559 203.553 260.897 202.458 262.379 201.911C263.86 201.365 265.484 201.368 266.868 200.252C268.252 199.136 269.396 196.901 270.717 199.529C272.037 202.158 273.532 209.65 274.938 213.319C276.345 216.989 277.661 216.836 279.023 216.673L279.034 216.672C280.393 216.509 281.798 216.342 283.197 217.782C284.6 219.227 285.997 222.289 287.386 224.344C288.775 226.4 290.156 227.448 291.554 226.904C292.952 226.36 294.367 224.222 295.772 220.444C297.177 216.666 298.572 211.246 299.971 207.712C301.371 204.178 302.774 202.528 304.162 203.038C305.551 203.548 306.925 206.217 308.313 206.781C309.702 207.344 311.105 205.802 312.505 205.612C313.904 205.422 315.301 206.584 316.699 207.055C318.096 207.527 319.494 207.309 320.883 208.889C322.272 210.47 323.652 213.849 325.034 213.546C326.417 213.242 327.802 209.257 329.197 204.895C330.592 200.532 331.996 195.794 333.39 194.013C334.784 192.233 336.166 193.411 337.568 193.04C338.97 192.669 340.391 190.748 341.779 190.371C343.168 189.995 344.523 191.162 345.904 191.886C347.284 192.611 348.689 192.893 350.09 194.742C351.49 196.591 352.886 200.008 354.268 198.583C355.651 197.158 357.02 190.89 358.431 191.054C359.842 191.217 361.296 197.812 362.696 197.07C364.096 196.328 365.444 188.251 366.821 178.01C368.197 167.768 369.603 155.363 371.001 152.896C372.398 150.429 373.786 157.899 375.181 159.179C376.576 160.458 377.978 155.547 379.371 150.236C380.764 144.926 382.149 139.215 383.541 137.81C384.933 136.404 386.333 139.303 387.725 135.208C389.117 131.113 390.501 120.023 391.894 117.065C393.286 114.107 394.686 119.281 396.083 120.308C397.48 121.336 398.874 118.217 400.264 116.853C401.615 115.527 402.962 115.855 404.314 116.186L404.433 116.215C405.826 116.553 407.224 116.841 408.625 117.753C410.026 118.665 411.428 120.201 412.819 120.59C414.21 120.979 415.59 120.221 416.984 118.741C418.379 117.261 419.79 115.059 421.184 114.402C422.578 113.746 423.955 114.636 425.342 114.869C426.728 115.102 428.126 114.679 429.523 114.107C430.921 113.535 432.32 112.814 433.71 113.893C435.099 114.972 436.479 117.851 437.874 115.658C439.268 113.465 440.678 106.199 442.074 102.794C443.47 99.3899 444.852 99.8466 446.238 101.946C447.624 104.045 449.015 107.787 450.411 108.802C451.806 109.818 453.207 108.108 454.601 109.202C455.996 110.296 457.385 114.193 458.779 114.558C460.173 114.924 461.572 111.757 462.965 109C464.359 106.243 465.748 103.894 467.141 102.409C468.535 100.923 469.934 100.3 471.33 100.609C472.726 100.917 474.118 102.156 475.509 101.663C476.9 101.17 478.29 98.9455 479.682 98.6807C481.073 98.4159 482.466 100.111 483.86 99.7397C485.255 99.3685 486.652 96.9313 488.043 95.9818C489.435 95.0324 490.822 95.5707 492.215 95.0638C493.608 94.5568 495.006 93.0047 496.402 91.8944C497.797 90.7841 499.189 90.1157 500.58 85.9066C501.97 81.6975 503.36 73.9477 504.752 71.1301C506.145 68.3126 507.541 70.4273 508.94 71.7065C510.34 72.9857 511.744 73.4294 513.137 73.7578C514.53 74.0862 515.914 74.2993 517.308 74.5313L517.412 74.5486C518.773 74.7753 520.144 75.0037 521.498 74.5946C522.886 74.1751 524.257 73.0853 525.646 72.337C527.036 71.5888 528.446 71.1823 529.847 71.3798C531.249 71.5773 532.644 72.3789 534.037 71.6893C535.431 70.9996 536.824 68.8188 538.207 63.6009C539.591 58.383 540.966 50.1282 542.361 49.4426C543.755 48.7569 545.17 55.6404 546.567 59.5499C547.964 63.4594 549.344 64.3948 550.737 64.6755C552.13 64.9561 553.536 64.582 554.928 63.8528C556.32 63.1237 557.697 62.0396 559.088 59.82C560.479 57.6004 561.884 54.2454 563.277 52.2591C564.67 50.2727 566.049 49.6551 567.442 49.5848C568.835 49.5145 570.24 49.9915 571.638 53.2295C573.035 56.4676 574.426 62.4667 575.822 63.8346C577.217 65.2026 578.618 61.9393 580.01 61.5663C581.402 61.1933 582.785 63.7106 584.176 64.3386C585.567 64.9665 586.966 63.705 588.361 60.9637C589.756 58.2225 591.148 54.0014 592.544 52.4174C593.939 50.8335 595.338 51.8866 596.732 53.58C598.126 55.2735 599.516 57.6072 600.895 58.8235C602.274 60.0397 603.643 60.1386 605.03 60.3696C606.418 60.6005 607.825 60.9634 609.227 60.0329C610.629 59.1024 612.027 56.8784 613.42 58.5557C614.813 60.233 616.2 65.8116 617.585 66.8717C618.97 67.9318 620.353 64.4734 621.751 61.9518C623.149 59.4301 624.563 57.8452 625.961 55.917C627.358 53.9889 628.738 51.7175 630.131 51.9237C631.523 52.1298 632.927 54.8134 634.319 51.8518C635.71 48.8901 637.089 40.283 638.488 35.7222C639.887 31.1613 641.307 30.6466 642.691 30.2916C644.075 29.9367 645.423 29.7415 646.802 29.3356C648.181 28.9298 649.591 28.3132 650.993 27.936C652.395 27.5588 653.787 27.421 655.193 30.5434C656.598 33.6658 658.016 40.0484 659.407 42.4046C660.797 44.7609 662.159 43.0907 663.548 41.602C664.938 40.1132 666.354 38.8059 667.751 38.9404C669.148 39.0749 670.525 40.6513 671.91 42.626C673.296 44.6008 674.691 46.9739 676.089 48.5247C677.488 50.0754 678.89 50.8039 680.294 53.7487C681.698 56.6935 683.102 61.8546 684.489 59.5372C685.876 57.2198 687.246 47.424 688.624 39.8245C690.003 32.2251 691.39 26.822 692.785 24.7279C694.179 22.6337 695.581 23.8483 696.983 25.063V346H-0.994141V180.793Z"
              fill="url(#paint0_linear_2029_22138)"
              fillOpacity="0.2"
            />
            <path
              d="M-0.994141 180.793C0.40276 192.571 1.79966 204.35 3.1934 205.054C4.58713 205.759 5.9777 195.389 7.36824 190.27C8.75878 185.15 10.1493 185.28 11.5438 187.764C12.9383 190.248 14.3368 195.085 15.7229 199.198C17.1091 203.311 18.4829 206.7 19.9098 208.668C21.3366 210.636 22.8165 211.185 24.2195 211.741C25.6225 212.297 26.9486 212.862 28.3167 209.375C29.6848 205.887 31.0949 198.349 32.5035 194.865C33.9121 191.382 35.3193 191.955 36.7201 192.895C38.1209 193.836 39.5153 195.144 40.9058 196.011C42.2962 196.878 43.6826 197.303 45.0824 197.31C46.4821 197.317 47.8953 196.906 49.2848 200.069C50.6743 203.232 52.0402 209.968 53.4422 215.981C54.8441 221.994 56.2822 227.283 57.7319 234.527C59.1816 241.771 60.643 250.969 62.0095 254.588C63.376 258.206 64.6476 256.245 65.989 258.314C67.3303 260.383 68.7415 266.482 70.0997 266.091C71.4579 265.701 72.7631 258.822 74.2671 259.756C75.771 260.69 77.4737 269.438 78.8709 275.872C80.2681 282.306 81.3597 286.428 82.67 279.142C83.9804 271.856 85.5093 253.162 86.9456 245.422C88.382 237.682 89.7257 240.895 91.1077 239.855C92.4896 238.816 93.9098 233.523 95.3067 233.486C96.7036 233.449 98.0772 238.667 99.4678 240.607C100.858 242.548 102.266 241.212 103.661 242.054C105.055 242.895 106.438 245.914 107.826 246.714C109.215 247.514 110.611 246.095 112.005 239.879C113.399 233.663 114.791 222.652 116.186 215.624C117.582 208.597 118.979 205.553 120.365 200.288C121.75 195.023 123.123 187.537 124.546 187.697C125.969 187.858 127.443 195.665 128.846 195.925C130.249 196.185 131.582 188.899 132.925 188.499C134.268 188.098 135.622 194.585 136.988 197.026C138.355 199.468 139.734 197.866 141.177 195.651C142.619 193.436 144.125 190.608 145.519 189.382C146.913 188.156 148.197 188.531 149.556 187.196C150.915 185.862 152.351 182.816 153.741 181.064C155.131 179.311 156.476 178.852 157.854 179.286C159.232 179.721 160.642 181.05 162.078 177.56C163.514 174.069 164.977 165.76 166.403 164.866C167.83 163.973 169.221 170.496 170.568 173.961C171.914 177.427 173.216 177.835 174.591 179.657C175.967 181.479 177.415 184.715 178.815 186.787C180.215 188.859 181.567 189.767 182.942 189.115C184.316 188.462 185.714 186.248 187.108 183.169C188.502 180.09 189.893 176.145 191.286 174.615C192.679 173.085 194.073 173.968 195.468 179.511C196.863 185.053 198.258 195.254 199.653 197.925C201.048 200.597 202.442 195.738 203.836 198.241C205.231 200.744 206.625 210.607 208.017 212.252C209.409 213.897 210.799 207.324 212.19 205.26C213.582 203.196 214.975 205.642 216.369 202.544C217.763 199.446 219.159 190.803 220.551 188.107C221.943 185.412 223.332 188.664 224.724 190.048C226.116 191.433 227.511 190.95 228.903 193.116C230.294 195.283 231.682 200.097 233.074 202.392C234.466 204.688 235.863 204.463 237.259 203.495C238.656 202.527 240.052 200.816 241.463 203.055C242.874 205.294 244.299 211.485 245.7 212.187C247.101 212.889 248.477 208.103 249.862 205.834C251.247 203.566 252.641 203.815 254.035 204.036C255.429 204.258 256.825 204.453 258.192 204.003C259.559 203.553 260.897 202.458 262.379 201.911C263.86 201.365 265.484 201.368 266.868 200.252C268.252 199.136 269.396 196.901 270.717 199.529C272.037 202.158 273.532 209.65 274.938 213.319C276.345 216.989 277.661 216.836 279.023 216.673C280.386 216.51 281.795 216.338 283.197 217.782C284.6 219.227 285.997 222.289 287.386 224.344C288.775 226.4 290.156 227.448 291.554 226.904C292.952 226.36 294.367 224.222 295.772 220.444C297.177 216.666 298.572 211.246 299.971 207.712C301.371 204.178 302.774 202.528 304.162 203.038C305.551 203.548 306.925 206.217 308.313 206.781C309.702 207.344 311.105 205.802 312.505 205.612C313.904 205.422 315.301 206.584 316.699 207.055C318.096 207.527 319.494 207.309 320.883 208.889C322.272 210.47 323.652 213.849 325.034 213.546C326.417 213.242 327.802 209.257 329.197 204.895C330.592 200.532 331.996 195.794 333.39 194.013C334.784 192.233 336.166 193.411 337.568 193.04C338.97 192.669 340.391 190.748 341.779 190.371C343.168 189.995 344.523 191.162 345.904 191.886C347.284 192.611 348.689 192.893 350.09 194.742C351.49 196.591 352.886 200.008 354.268 198.583C355.651 197.158 357.02 190.89 358.431 191.054C359.842 191.217 361.296 197.812 362.696 197.07C364.096 196.328 365.444 188.251 366.821 178.01C368.197 167.768 369.603 155.363 371.001 152.896C372.398 150.429 373.786 157.899 375.181 159.179C376.576 160.458 377.978 155.547 379.371 150.236C380.764 144.926 382.149 139.215 383.541 137.81C384.933 136.404 386.333 139.303 387.725 135.208C389.117 131.113 390.501 120.023 391.894 117.065C393.286 114.107 394.686 119.281 396.083 120.308C397.48 121.336 398.874 118.217 400.264 116.853C401.655 115.488 403.041 115.876 404.433 116.215C405.826 116.553 407.224 116.841 408.625 117.753C410.026 118.665 411.428 120.201 412.819 120.59C414.21 120.979 415.59 120.221 416.984 118.741C418.379 117.261 419.79 115.059 421.184 114.402C422.578 113.746 423.955 114.636 425.342 114.869C426.729 115.102 428.126 114.679 429.524 114.107C430.921 113.535 432.32 112.814 433.71 113.893C435.099 114.972 436.479 117.851 437.874 115.658C439.268 113.465 440.678 106.199 442.074 102.794C443.47 99.3899 444.852 99.8466 446.238 101.946C447.624 104.045 449.015 107.787 450.411 108.802C451.806 109.818 453.207 108.108 454.601 109.202C455.996 110.295 457.385 114.193 458.779 114.558C460.173 114.924 461.572 111.757 462.965 109C464.359 106.243 465.748 103.894 467.141 102.409C468.535 100.923 469.934 100.3 471.33 100.609C472.726 100.917 474.118 102.156 475.509 101.663C476.9 101.17 478.29 98.9455 479.682 98.6807C481.073 98.4159 482.466 100.111 483.86 99.7397C485.255 99.3685 486.652 96.9313 488.043 95.9818C489.435 95.0324 490.822 95.5707 492.215 95.0637C493.608 94.5568 495.006 93.0046 496.402 91.8944C497.797 90.7841 499.189 90.1157 500.58 85.9066C501.97 81.6975 503.36 73.9477 504.752 71.1301C506.145 68.3126 507.541 70.4273 508.94 71.7065C510.34 72.9857 511.744 73.4294 513.137 73.7578C514.53 74.0862 515.914 74.2993 517.308 74.5313C518.703 74.7632 520.11 75.0141 521.498 74.5946C522.886 74.1751 524.257 73.0852 525.646 72.337C527.036 71.5888 528.446 71.1823 529.848 71.3798C531.249 71.5773 532.644 72.3789 534.037 71.6893C535.431 70.9996 536.824 68.8187 538.207 63.6009C539.591 58.383 540.966 50.1282 542.361 49.4425C543.755 48.7569 545.17 55.6404 546.567 59.5499C547.964 63.4594 549.344 64.3948 550.737 64.6754C552.13 64.9561 553.536 64.582 554.928 63.8528C556.32 63.1237 557.697 62.0396 559.088 59.82C560.479 57.6004 561.884 54.2454 563.277 52.2591C564.67 50.2727 566.049 49.6551 567.442 49.5848C568.835 49.5145 570.24 49.9914 571.638 53.2295C573.035 56.4676 574.426 62.4667 575.822 63.8346C577.217 65.2026 578.618 61.9393 580.01 61.5663C581.402 61.1933 582.785 63.7106 584.176 64.3386C585.567 64.9665 586.965 63.705 588.361 60.9637C589.756 58.2225 591.148 54.0014 592.544 52.4174C593.939 50.8334 595.338 51.8866 596.732 53.58C598.126 55.2734 599.516 57.6072 600.895 58.8234C602.274 60.0397 603.643 60.1386 605.03 60.3695C606.418 60.6005 607.825 60.9634 609.227 60.0329C610.629 59.1024 612.027 56.8784 613.42 58.5557C614.813 60.233 616.2 65.8116 617.585 66.8717C618.97 67.9318 620.353 64.4734 621.751 61.9517C623.149 59.4301 624.563 57.8452 625.961 55.917C627.358 53.9889 628.738 51.7175 630.131 51.9237C631.523 52.1298 632.927 54.8135 634.319 51.8518C635.71 48.8901 637.089 40.283 638.488 35.7222C639.887 31.1613 641.307 30.6466 642.691 30.2916C644.075 29.9367 645.423 29.7415 646.802 29.3356C648.181 28.9298 649.591 28.3132 650.993 27.936C652.395 27.5588 653.787 27.421 655.193 30.5434C656.598 33.6658 658.016 40.0484 659.407 42.4046C660.797 44.7609 662.159 43.0907 663.548 41.602C664.938 40.1132 666.354 38.8059 667.751 38.9404C669.148 39.0749 670.525 40.6512 671.91 42.626C673.296 44.6007 674.691 46.9739 676.089 48.5246C677.488 50.0754 678.89 50.8039 680.294 53.7487C681.697 56.6934 683.102 61.8546 684.489 59.5372C685.876 57.2198 687.246 47.4239 688.624 39.8245C690.003 32.2251 691.39 26.822 692.785 24.7279C694.179 22.6337 695.581 23.8483 696.983 25.0629"
              stroke="#282750"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear_2029_22138"
              x1="34.2598"
              y1="24.3437"
              x2="34.2598"
              y2="346"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0.1308" stopColor="#736CA3" />
              <stop offset="0.8536" stopColor="#565081" stopOpacity="0" />
            </linearGradient>
            <clipPath id="clip0_2029_22138">
              <rect
                width="702"
                height="346"
                fill="white"
                transform="translate(-2)"
              />
            </clipPath>
          </defs>
        </svg>

        {!hideScales && (
          <div className="flex w-full flex-row justify-between py-3">
            <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
            <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
            <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
            <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
            <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
            <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
            <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          </div>
        )}
      </div>

      {!hideScales && (
        <div className="flex flex-col justify-between pb-7 pt-2">
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
          <Skeleton className="h-[14px] w-11 rounded-xl bg-osmoverse-825" />
        </div>
      )}
    </div>
  );
};
