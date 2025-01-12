import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { ButtonFaint } from 'src/components/layouts/Buttons';
import { Spinner } from 'src/components/Spinners';
import { TableBodyRow, TableData, TableHeadRow } from 'src/components/Tables';
import { SubTitleText, Text } from 'src/components/Texts';
import useWindowSize from 'src/hooks/useWindowSize';
import { useStore } from 'src/stores';

const tableWidths = ['25%', '25%', '25%', '25%'];
const tableWidthsOnMobileView = ['30%', '40%', '30%'];

interface Props {
	poolId: string;
}

export const MyBondingsTable = observer(function MyBondingsTable({ poolId }: Props) {
	const { chainStore, accountStore, queriesStore, priceStore } = useStore();

	const { isMobileView } = useWindowSize();

	const account = accountStore.getAccount(chainStore.current.chainId);
	const queries = queriesStore.get(chainStore.current.chainId);
	const poolShareCurrency = queries.osmosis.queryGammPoolShare.getShareCurrency(poolId);

	const lockableDurations = queries.osmosis.queryLockableDurations.lockableDurations;

	return (
		<div>
			<div className="px-5 md:px-0">
				<SubTitleText isMobileView={isMobileView}>My Bondings</SubTitleText>
			</div>
			<table className="w-full">
				<LockupTableHeader isMobileView={isMobileView} />
				<tbody className="w-full">
					{lockableDurations.map(lockableDuration => {
						const lockedCoin = queries.osmosis.queryAccountLocked
							.get(account.bech32Address)
							.getLockedCoinWithDuration(poolShareCurrency, lockableDuration);
						return (
							<LockupTableRow
								key={lockableDuration.humanize()}
								duration={lockableDuration.humanize()}
								lockup={lockedCoin}
								apy={`${queries.osmosis.queryIncentivizedPools
									.computeAPY(poolId, lockableDuration, priceStore, priceStore.getFiatCurrency('usd')!)
									.toString()}%`}
								isMobileView={isMobileView}
							/>
						);
					})}
				</tbody>
			</table>
		</div>
	);
});

interface LockupTableHeaderProps {
	isMobileView: boolean;
}

const LockupTableHeader = observer(({ isMobileView }: LockupTableHeaderProps) => {
	return (
		<thead>
			<TableHeadRow>
				<TableData width={isMobileView ? tableWidthsOnMobileView[0] : tableWidths[0]}>
					<Text isMobileView={isMobileView}>Unbonding Duration</Text>
				</TableData>
				{!isMobileView && (
					<TableData width={tableWidths[1]}>
						<Text isMobileView={isMobileView}>Current APR</Text>
					</TableData>
				)}
				<TableData width={isMobileView ? tableWidthsOnMobileView[1] : tableWidths[2]}>
					<Text isMobileView={isMobileView}>Amount</Text>
				</TableData>
				<TableData width={isMobileView ? tableWidthsOnMobileView[2] : tableWidths[3]}>
					<Text isMobileView={isMobileView}>Action</Text>
				</TableData>
			</TableHeadRow>
		</thead>
	);
});

interface LockupTableRowProps {
	duration: string;
	apy: string;
	lockup: {
		amount: CoinPretty;
		lockIds: string[];
	};
	isMobileView: boolean;
}

const LockupTableRow = observer(function LockupTableRow({ duration, apy, lockup, isMobileView }: LockupTableRowProps) {
	const { chainStore, accountStore } = useStore();

	const account = accountStore.getAccount(chainStore.current.chainId);

	const [isUnlocking, setIsUnlocking] = useState(false);

	return (
		<TableBodyRow>
			<TableData width={isMobileView ? tableWidthsOnMobileView[0] : tableWidths[0]}>
				<Text emphasis="medium" isMobileView={isMobileView}>
					{duration}
				</Text>
			</TableData>
			{!isMobileView && (
				<TableData width={tableWidths[1]}>
					<Text emphasis="medium" isMobileView={isMobileView}>
						{apy}
					</Text>
				</TableData>
			)}
			<TableData width={isMobileView ? tableWidthsOnMobileView[1] : tableWidths[2]}>
				<Text emphasis="medium" isMobileView={isMobileView}>
					{lockup.amount
						.maxDecimals(6)
						.trim(true)
						.toString()}
				</Text>
			</TableData>
			<TableData width={isMobileView ? tableWidthsOnMobileView[2] : tableWidths[3]}>
				<ButtonFaint
					disabled={!account.isReadyToSendMsgs || lockup.amount.toDec().equals(new Dec(0))}
					onClick={async e => {
						e.preventDefault();

						if (account.isReadyToSendMsgs) {
							try {
								setIsUnlocking(true);

								// XXX: Due to the block gas limit, restrict the number of lock id to included in the one tx.
								await account.osmosis.sendBeginUnlockingMsg(lockup.lockIds.slice(0, 10), '', () => {
									setIsUnlocking(false);
								});
							} catch (e) {
								setIsUnlocking(false);
								console.log(e);
							}
						}
					}}>
					{isUnlocking ? (
						<Spinner />
					) : (
						<Text color="gold" isMobileView={isMobileView}>
							Unbond All
						</Text>
					)}
				</ButtonFaint>
			</TableData>
		</TableBodyRow>
	);
});
