import type { NextPage } from "next";
import { observer } from "mobx-react-lite";
import { FunctionComponent, useState, useEffect } from "react";
import { PricePretty } from "@keplr-wallet/unit";
import { ObservableQueryPool } from "@osmosis-labs/stores";
import { makeLocalStorageKVStore } from "../../stores/kv-store";
import { useStore } from "../../stores";
import { ObservableTransferUIConfig } from "../../stores/assets";
import { AssetsTable } from "../../components/table/assets-table";
import { DepoolingTable } from "../../components/table/depooling-table";
import { ShowMoreButton } from "../../components/buttons/show-more";
import { PoolCard } from "../../components/cards/";
import { Metric } from "../../components/types";
import { MetricLoader } from "../../components/loaders";
import { priceFormatter } from "../../components/utils";
import {
  IbcTransferModal,
  BridgeTransferModal,
  TransferAssetSelectModal,
} from "../../modals";
import { ConnectNonIbcWallet } from "../../modals/connect-non-ibc-wallet";
import { useWindowSize, useAmplitudeAnalytics } from "../../hooks";
import { WalletConnectQRModal } from "../../modals";
import { EventName } from "../../config";

const INIT_POOL_CARD_COUNT = 6;

const Assets: NextPage = observer(() => {
  const { isMobile } = useWindowSize();
  const {
    assetsStore,
    chainStore: {
      osmosis: { chainId },
    },
    accountStore,
    navBarStore,
  } = useStore();
  const { nativeBalances, ibcBalances } = assetsStore;
  const account = accountStore.getAccount(chainId);

  const [transferConfig] = useState(
    () =>
      new ObservableTransferUIConfig(
        assetsStore,
        account,
        makeLocalStorageKVStore("transfer-ui-config")
      )
  );

  // set up user analytics
  const { logEvent, setUserProperty } = useAmplitudeAnalytics({
    onLoadEvent: [EventName.Assets.pageViewed],
  });
  useEffect(() => {
    setUserProperty(
      "osmoBalance",
      nativeBalances[0].balance.maxDecimals(6).hideDenom(true).toString()
    );
  }, [nativeBalances[0].balance.maxDecimals(6).hideDenom(true).toString()]);

  // set nav bar ctas
  useEffect(() => {
    navBarStore.callToActionButtons = [
      {
        label: "Deposit",
        onClick: () => {
          transferConfig.startTransfer("deposit");
          logEvent([EventName.Assets.depositClicked]);
        },
      },
      {
        label: "Withdraw",
        onClick: () => {
          transferConfig.startTransfer("withdraw");
          logEvent([EventName.Assets.withdrawClicked]);
        },
      },
    ];
  }, []);

  return (
    <main className="flex flex-col gap-20 bg-background p-8">
      <AssetsOverview />
      {transferConfig.assetSelectModal && (
        <TransferAssetSelectModal {...transferConfig.assetSelectModal} />
      )}
      {transferConfig.connectNonIbcWalletModal && (
        <ConnectNonIbcWallet {...transferConfig.connectNonIbcWalletModal} />
      )}
      {transferConfig.ibcTransferModal && (
        <IbcTransferModal {...transferConfig.ibcTransferModal} />
      )}
      {transferConfig.bridgeTransferModal && (
        <BridgeTransferModal {...transferConfig.bridgeTransferModal} />
      )}
      {transferConfig.walletConnectEth.sessionConnectUri && (
        <WalletConnectQRModal
          isOpen={true}
          uri={transferConfig.walletConnectEth.sessionConnectUri || ""}
          onRequestClose={() => transferConfig.walletConnectEth.disable()}
        />
      )}
      <AssetsTable
        nativeBalances={nativeBalances}
        ibcBalances={ibcBalances}
        onDepositIntent={() => transferConfig.startTransfer("deposit")}
        onWithdrawIntent={() => transferConfig.startTransfer("withdraw")}
        onDeposit={(chainId, coinDenom) =>
          transferConfig.transferAsset("deposit", chainId, coinDenom)
        }
        onWithdraw={(chainId, coinDenom) =>
          transferConfig.transferAsset("withdraw", chainId, coinDenom)
        }
      />
      {!isMobile && <PoolAssets />}
      <section className="bg-surface">
        <DepoolingTable
          className="p-10 md:p-5 max-w-container mx-auto"
          tableClassName="md:w-screen md:-mx-5"
        />
      </section>
    </main>
  );
});

const AssetsOverview: FunctionComponent = observer(() => {
  const { assetsStore } = useStore();

  const totalAssetsValue = assetsStore.calcValueOf([
    ...assetsStore.availableBalance,
    ...assetsStore.lockedCoins,
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);
  const availableAssetsValue = assetsStore.calcValueOf(
    assetsStore.availableBalance
  );
  const bondedAssetsValue = assetsStore.calcValueOf(assetsStore.lockedCoins);
  const stakedAssetsValue = assetsStore.calcValueOf([
    assetsStore.stakedBalance,
    assetsStore.unstakingBalance,
  ]);

  // set up user analytics
  const { setUserProperty } = useAmplitudeAnalytics();
  useEffect(() => {
    setUserProperty("totalAssetsPrice", totalAssetsValue.toString());
    setUserProperty("unbondedAssetsPrice", availableAssetsValue.toString());
    setUserProperty("bondedAssetsPrice", bondedAssetsValue.toString());
    setUserProperty("stakedOsmoPrice", stakedAssetsValue.toString());
  }, [
    totalAssetsValue.toString(),
    availableAssetsValue.toString(),
    bondedAssetsValue.toString(),
    stakedAssetsValue.toString(),
  ]);

  const Metric: FunctionComponent<Metric> = ({ label, value }) => (
    <div className="flex flex-col gap-5">
      <h6>{label}</h6>
      <h2 className="text-wosmongton-100">{value}</h2>
    </div>
  );

  return (
    <div className="w-full flex items-center gap-[100px] bg-osmoverse-800 rounded-[32px] px-20 py-10">
      <Metric label="Total assets" value={totalAssetsValue.toString()} />
      <Metric label="Bonded" value={bondedAssetsValue.toString()} />
      <Metric label="Unbonded" value={availableAssetsValue.toString()} />
    </div>
  );
});

const PoolAssets: FunctionComponent = observer(() => {
  const { chainStore, accountStore, queriesStore } = useStore();
  const { setUserProperty } = useAmplitudeAnalytics();

  const { chainId } = chainStore.osmosis;
  const { bech32Address } = accountStore.getAccount(chainId);
  const ownedPoolIds = queriesStore
    .get(chainId)
    .osmosis!.queryGammPoolShare.getOwnPools(bech32Address);
  const [showAllPools, setShowAllPools] = useState(false);

  useEffect(() => {
    setUserProperty("myPoolsCount", ownedPoolIds.length);
  }, [ownedPoolIds.length]);

  if (ownedPoolIds.length === 0) {
    return null;
  }

  return (
    <section>
      <h5>My Pools</h5>
      <PoolCards {...{ showAllPools, ownedPoolIds, setShowAllPools }} />
    </section>
  );
});

const PoolCards: FunctionComponent<{
  showAllPools: boolean;
  ownedPoolIds: string[];
  setShowAllPools: (show: boolean) => void;
}> = observer(({ showAllPools, ownedPoolIds, setShowAllPools }) => {
  const { logEvent } = useAmplitudeAnalytics();
  return (
    <>
      <div className="my-5 grid grid-cards">
        <PoolCardsDisplayer
          poolIds={
            showAllPools
              ? ownedPoolIds
              : ownedPoolIds.slice(0, INIT_POOL_CARD_COUNT)
          }
        />
      </div>
      {ownedPoolIds.length > INIT_POOL_CARD_COUNT && (
        <ShowMoreButton
          className="m-auto"
          isOn={showAllPools}
          onToggle={() => {
            logEvent([
              EventName.Assets.assetsListMoreClicked,
              {
                isOn: !showAllPools,
              },
            ]);
            setShowAllPools(!showAllPools);
          }}
        />
      )}
    </>
  );
});

const PoolCardsDisplayer: FunctionComponent<{ poolIds: string[] }> = observer(
  ({ poolIds }) => {
    const {
      chainStore,
      queriesStore,
      queriesExternalStore,
      priceStore,
      accountStore,
    } = useStore();

    const queriesOsmosis = queriesStore.get(chainStore.osmosis.chainId)
      .osmosis!;
    const { bech32Address } = accountStore.getAccount(
      chainStore.osmosis.chainId
    );

    const pools = poolIds
      .map((poolId) => {
        const pool = queriesOsmosis.queryGammPools.getPool(poolId);

        if (!pool) {
          return undefined;
        }
        const tvl = pool.computeTotalValueLocked(priceStore);
        const shareRatio =
          queriesOsmosis.queryGammPoolShare.getAllGammShareRatio(
            bech32Address,
            pool.id
          );
        const actualShareRatio = shareRatio.moveDecimalPointLeft(2);

        const lockedShareRatio =
          queriesOsmosis.queryGammPoolShare.getLockedGammShareRatio(
            bech32Address,
            pool.id
          );
        const actualLockedShareRatio =
          lockedShareRatio.moveDecimalPointRight(2);

        return [
          pool,
          tvl.mul(actualShareRatio).moveDecimalPointRight(2),
          [
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "APR",
                  value: (
                    <MetricLoader
                      isLoading={
                        queriesOsmosis.queryIncentivizedPools.isAprFetching
                      }
                    >
                      {queriesOsmosis.queryIncentivizedPools
                        .computeMostAPY(poolId, priceStore)
                        .maxDecimals(2)
                        .toString()}
                    </MetricLoader>
                  ),
                }
              : {
                  label: "Fee APY",
                  value: (() => {
                    const queriesExternal = queriesExternalStore.get();
                    const poolWithFeeMetrics =
                      queriesExternal.queryGammPoolFeeMetrics.makePoolWithFeeMetrics(
                        pool,
                        priceStore
                      );
                    return queriesExternal.queryGammPoolFeeMetrics.get7dPoolFeeApy(
                      poolWithFeeMetrics,
                      priceStore
                    );
                  })()
                    .maxDecimals(2)
                    .toString(),
                },
            {
              label: "Pool Liquidity",
              value: priceFormatter(pool.computeTotalValueLocked(priceStore)),
            },
            queriesOsmosis.queryIncentivizedPools.isIncentivized(poolId)
              ? {
                  label: "Bonded",
                  value: tvl.mul(actualLockedShareRatio).toString(),
                }
              : {
                  label: "My Liquidity",
                  value: tvl
                    .mul(actualShareRatio)
                    .moveDecimalPointRight(2)
                    .toString(),
                },
          ],
        ] as [ObservableQueryPool, PricePretty, Metric[]];
      })
      .filter(
        (p): p is [ObservableQueryPool, PricePretty, Metric[]] =>
          p !== undefined
      )
      .sort(([, aFiatValue], [, bFiatValue]) => {
        // desc by fiat value
        if (aFiatValue.toDec().gt(bFiatValue.toDec())) return -1;
        if (aFiatValue.toDec().lt(bFiatValue.toDec())) return 1;
        return 0;
      });
    const { logEvent } = useAmplitudeAnalytics();

    return (
      <>
        {pools.map(([pool, _, metrics]) => (
          <PoolCard
            key={pool.id}
            poolId={pool.id}
            poolAssets={pool.poolAssets.map((asset) => asset.amount.currency)}
            poolMetrics={metrics}
            isSuperfluid={queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
              pool.id
            )}
            onClick={() =>
              logEvent([
                EventName.Assets.myPoolsCardClicked,
                {
                  poolId: pool.id,
                  poolName: pool.poolAssets
                    .map((poolAsset) => poolAsset.amount.denom)
                    .join(" / "),
                  poolWeight: pool.poolAssets
                    .map((poolAsset) => poolAsset.weightFraction.toString())
                    .join(" / "),
                  isSuperfluidPool:
                    queriesOsmosis.querySuperfluidPools.isSuperfluidPool(
                      pool.id
                    ),
                },
              ])
            }
          />
        ))}
      </>
    );
  }
);

export default Assets;
