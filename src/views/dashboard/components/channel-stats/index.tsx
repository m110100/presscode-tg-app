import { useState, useMemo, useEffect, memo } from 'react';
import { useNavigate } from 'react-router';
import { XAxis, CartesianGrid, Bar, BarChart } from 'recharts';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from '@/components/ui/chart';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import {
	Empty,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
	EmptyDescription,
} from '@/components/ui/empty';
import { Settings as SettingsIcon, Braces as BracesIcon } from 'lucide-react';
import { useGetChannelStats, useGetRetentionDays, usePostRetentionDays } from '@/lib/queries';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/provider/auth';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { ChannelsTable } from '../channel-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { IChannelData, ITimeRange, IDateRange } from '@/shared/schema';
import { DataTableCard } from '@/components/common/data-table-card';
import {
	CHART_CONFIG,
	CHART_HEIGHT,
	RETENTION_DAYS_MIN,
	TIME_RANGE_OPTIONS,
} from '@/shared/constants';
import { DateRangeCalendar, TimeRangeSelector } from '@/components/common/range';

const getDateRangeFromTimeRange = (timeRange: ITimeRange): IDateRange => {
	const today = new Date();
	const days = TIME_RANGE_OPTIONS[timeRange].days;
	const from = new Date(today);
	from.setDate(from.getDate() - days);

	return { from, to: today };
};

const formatDateForApi = (from: Date | undefined, to: Date | undefined) => {
	if (!from || !to) return null;
	return {
		dateFrom: format(from, 'yyyy-MM-dd'),
		dateTo: format(to, 'yyyy-MM-dd'),
	};
};

const transformChannelStatsData = (chartData: any[]): IChannelData[] => {
	return chartData.map((ch) => ({
		title: ch.title,
		channelId: ch.channelId,
		enter: ch.enter,
		leave: ch.leave,
		requestCount: ch.requestCount,
	}));
};

const RetentionDaysSettings = ({
	value,
	isLoading,
	onSave,
}: {
	value: string;
	isLoading: boolean;
	onSave: (value: number) => void;
}) => {
	const [inputValue, setInputValue] = useState(value);

	useEffect(() => {
		setInputValue(value);
	}, [value]);

	const handleSave = () => {
		const parsedValue = parseInt(inputValue, 10);
		if (!isNaN(parsedValue) && parsedValue >= RETENTION_DAYS_MIN) {
			onSave(parsedValue);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant='outline' size='icon'>
					<SettingsIcon />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className='min-w-96 flex flex-col w-auto overflow-hidden gap-4'
				align='end'
			>
				<div className='space-y-3'>
					<Label htmlFor='retentionDays'>
						Кол-во дней, которое нужно хранить историю
					</Label>
					<Input
						className='text-ellipsis'
						id='retentionDays'
						name='retentionDays'
						type='number'
						min={RETENTION_DAYS_MIN}
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder='Укажи кол-во дней...'
					/>
				</div>
				<Button
					className='w-full'
					size='sm'
					variant='outline'
					disabled={isLoading}
					onClick={handleSave}
				>
					{isLoading ? 'Применение...' : 'Применить'}
				</Button>
			</PopoverContent>
		</Popover>
	);
};

const ChannelStatsHeader = ({
	timeRange,
	onTimeRangeChange,
	isCalendarOpen,
	onCalendarOpenChange,
	onApplyDateRange,
	retentionDaysValue,
	isPostingRetentionDays,
	onRetentionDaysSave,
}: {
	timeRange: ITimeRange;
	onTimeRangeChange: (value: ITimeRange) => void;
	isCalendarOpen: boolean;
	onCalendarOpenChange: (open: boolean) => void;
	onApplyDateRange: (range: IDateRange) => void;
	retentionDaysValue: string;
	isPostingRetentionDays: boolean;
	onRetentionDaysSave: (value: number) => void;
}) => (
	<CardHeader className='flex flex-col items-center gap-4 space-y-0 border-b py-5 lg:flex-row'>
		<div className='grid flex-1 gap-1 w-full'>
			<CardTitle>Статистика каналов</CardTitle>
			<CardDescription>Вступления и выходы, заявки за выбранный период</CardDescription>
		</div>
		<div className='flex w-full gap-4 lg:w-auto'>
			<TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
			<DateRangeCalendar
				isOpen={isCalendarOpen}
				onOpenChange={onCalendarOpenChange}
				onApply={onApplyDateRange}
			/>
			<RetentionDaysSettings
				value={retentionDaysValue}
				isLoading={isPostingRetentionDays}
				onSave={onRetentionDaysSave}
			/>
		</div>
	</CardHeader>
);

const ChannelsOverviewChart = ({
	data,
	isLoading,
	isError,
}: {
	data: IChannelData[];
	isLoading: boolean;
	isError: boolean;
}) => (
	<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
		{isError && (
			<div className='flex h-[250px] items-center justify-center'>
				<span className='text-base font-medium'>Произошла неизвестная ошибка</span>
			</div>
		)}

		{isLoading && (
			<div className='flex h-[250px] items-center justify-center'>
				<div className='flex gap-4 items-center'>
					<Spinner className='size-4 mt-0.5' />
					<span className='text-base font-medium'>Идет загрузка данных...</span>
				</div>
			</div>
		)}

		{!isLoading && !isError && data.length > 0 && (
			<ChartContainer
				className={`aspect-auto ${CHART_HEIGHT} w-full`}
				config={CHART_CONFIG.channels}
			>
				<BarChart accessibilityLayer data={data} margin={{ left: 12, right: 12 }}>
					<CartesianGrid vertical={false} />
					<XAxis
						dataKey='title'
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						tick={false}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<ChartLegend content={<ChartLegendContent />} />

					<Bar
						dataKey='enter'
						stackId='a'
						fill='var(--chart-1)'
						radius={[0, 0, 0, 0]}
					/>
					<Bar
						dataKey='leave'
						stackId='a'
						fill='var(--chart-2)'
						radius={[0, 0, 0, 0]}
					/>
					<Bar
						dataKey='requestCount'
						stackId='a'
						fill='var(--chart-5)'
						radius={[0, 0, 0, 0]}
					/>
				</BarChart>
			</ChartContainer>
		)}

		{!isLoading && !isError && data.length === 0 && (
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant='icon'>
						<BracesIcon />
					</EmptyMedia>
					<EmptyTitle>Нет данных</EmptyTitle>
					<EmptyDescription>
						Для отображения графика выбери интересующих тебя ботов, минимум одного
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		)}
	</CardContent>
);

type Props = {
	bots: string[];
	channelNames: string[];
};

export const ChannelsStats = memo(function ChannelsStats({ bots, channelNames }: Props) {
	const navigate = useNavigate();

	const { user } = useAuth();
	const { data: retentionDays } = useGetRetentionDays(user);
	const { mutate: postRetentionDays, isPending: isPostingRetentionDays } =
		usePostRetentionDays();

	const [timeRange, setTimeRange] = useState<ITimeRange>('1d');
	const [retentionDaysValue, setRetentionDaysValue] = useState<string>('');
	const [customDateRange, setCustomDateRange] = useState<IDateRange>({
		from: undefined,
		to: undefined,
	});
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);

	const { dateFrom, dateTo } = useMemo(() => {
		let range: IDateRange;

		if (customDateRange.from && customDateRange.to) {
			range = customDateRange;
		} else {
			range = getDateRangeFromTimeRange(timeRange);
		}

		const formatted = formatDateForApi(range.from, range.to);
		return formatted || { dateFrom: '', dateTo: '' };
	}, [timeRange, customDateRange]);

	const {
		data: rawChannelStats,
		isLoading: isRawChannelStatsLoading,
		isError: isRawChannelStatsError,
	} = useGetChannelStats(user, {
		board_key: bots,
		channelName: channelNames,
		dateFrom,
		dateTo,
	});

	const channelStats = useMemo(
		() => transformChannelStatsData(rawChannelStats || []),
		[rawChannelStats],
	);

	useEffect(() => {
		if (retentionDays?.retentionDays) {
			setRetentionDaysValue(retentionDays.retentionDays.toString());
		}
	}, [retentionDays]);

	const handleTimeRangeChange = (newTimeRange: ITimeRange) => {
		setTimeRange(newTimeRange);
		setCustomDateRange({ from: undefined, to: undefined });
	};

	const handleApplyDateRange = (range: IDateRange) => {
		setCustomDateRange(range);
	};

	const handleRetentionDaysSave = (value: number) => {
		if (user) {
			postRetentionDays(
				{
					user,
					params: { retentionDays: value },
				},
				{
					onSuccess: (response) => {
						setRetentionDaysValue(response.retentionDays.toString());
					},
				},
			);
		}
	};

	return (
		<div className='flex flex-col gap-6'>
			{/* Overview Chart */}
			<Card className='pt-0'>
				<ChannelStatsHeader
					timeRange={timeRange}
					onTimeRangeChange={handleTimeRangeChange}
					isCalendarOpen={isCalendarOpen}
					onCalendarOpenChange={setIsCalendarOpen}
					onApplyDateRange={handleApplyDateRange}
					retentionDaysValue={retentionDaysValue}
					isPostingRetentionDays={isPostingRetentionDays}
					onRetentionDaysSave={handleRetentionDaysSave}
				/>
				<ChannelsOverviewChart
					data={channelStats}
					isLoading={isRawChannelStatsLoading}
					isError={isRawChannelStatsError}
				/>
			</Card>

			<DataTableCard
				title='Каналы'
				description='Подробная информация по каждому каналу за выбранный период'
			>
				{isRawChannelStatsError && (
					<div className='flex h-[250px] items-center justify-center'>
						<span className='text-base font-medium'>
							Произошла неизвестная ошибка
						</span>
					</div>
				)}

				{isRawChannelStatsLoading && (
					<div className='flex h-[250px] items-center justify-center'>
						<div className='flex gap-4 items-center'>
							<Spinner className='size-4 mt-0.5' />
							<span className='text-base font-medium'>
								Идет загрузка данных...
							</span>
						</div>
					</div>
				)}

				{!isRawChannelStatsLoading &&
					!isRawChannelStatsError &&
					channelStats.length > 0 && (
						<ChannelsTable
							data={rawChannelStats || []}
							onRowClick={(channel) => {
								navigate('/channel/' + channel.channelId);
							}}
						/>
					)}

				{!isRawChannelStatsLoading &&
					!isRawChannelStatsError &&
					channelStats.length === 0 && (
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant='icon'>
									<BracesIcon />
								</EmptyMedia>
								<EmptyTitle>Нет данных</EmptyTitle>
								<EmptyDescription></EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
			</DataTableCard>
		</div>
	);
});
