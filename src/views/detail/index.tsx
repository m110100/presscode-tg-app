import { memo, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from '@/components/ui/chart';
import { DataTableCard } from '@/components/common/data-table-card';
import type { IDateRange, ILinkStats, ITimeRange } from '@/shared/schema';
import { CHART_CONFIG, CHART_HEIGHT, TIME_RANGE_OPTIONS } from '@/shared/constants';
import { InviteLinksTable } from './invite-links-table';
import { useGetDetailsChannelStats } from '@/lib/queries';
import { useAuth } from '@/app/provider/auth';
import { DateRangeCalendar, TimeRangeSelector } from '@/components/common/range';
import { useNavigate, useParams } from 'react-router';
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from '@/components/ui/empty';
import { BracesIcon, ChevronLeftIcon } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const formatDateForChart = (date: string): string => {
	return format(new Date(date), "d MMM yyyy'г.'", { locale: ru });
};

const transformInviteLinksData = (data: any[]): ILinkStats[] => {
	if (!data.length) return [];

	return data.map((link) => ({
		id: link.id,
		title: link.title,
		price: link.price,
		limit: link.limit,
		enter: link.enter,
		leave: link.leave,
		kick: link.kick,
		pendingRequests: link.pendingRequests,
		stats: link.refStats,
	}));
};

const getSortedChannelHistory = (channel: any | null | undefined) => {
	if (!channel?.history?.stats) return [];

	return [...channel.history.stats].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
	);
};

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

const ChannelDetailHeader = memo(function ChannelDetailHeader({
	title,
	timeRange,
	onTimeRangeChange,
	isCalendarOpen,
	onCalendarOpenChange,
	onApplyDateRange,
}: {
	title?: string;
	timeRange: ITimeRange;
	onTimeRangeChange: (value: ITimeRange) => void;
	isCalendarOpen: boolean;
	onCalendarOpenChange: (open: boolean) => void;
	onApplyDateRange: (range: IDateRange) => void;
}) {
	return (
		<CardHeader className='flex flex-col items-center gap-4 space-y-0 border-b py-5 lg:flex-row'>
			<div className='grid flex-1 gap-1 w-full'>
				<CardTitle>{`Статистика по каналу ${title ? title : ''}`}</CardTitle>
				<CardDescription>
					Вступления и выходы, заявки за выбранный период
				</CardDescription>
			</div>
			<div className='flex w-full gap-4 lg:w-auto'>
				<TimeRangeSelector value={timeRange} onChange={onTimeRangeChange} />
				<DateRangeCalendar
					isOpen={isCalendarOpen}
					onOpenChange={onCalendarOpenChange}
					onApply={onApplyDateRange}
				/>
			</div>
		</CardHeader>
	);
});

export function DetailedChannelView() {
	const navigate = useNavigate();

	const { user } = useAuth();
	const { channelId } = useParams<{ channelId: string }>();

	const [timeRange, setTimeRange] = useState<ITimeRange>('1d');
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

	const handleTimeRangeChange = (newTimeRange: ITimeRange) => {
		setTimeRange(newTimeRange);
		setCustomDateRange({ from: undefined, to: undefined });
	};

	const handleApplyDateRange = (range: IDateRange) => {
		setCustomDateRange(range);
		setDetailedRefLink(null);
	};

	useEffect(() => {
		setDetailedRefLink(null);
	}, [timeRange]);

	const {
		data: rawData,
		isLoading: isRawDataLoading,
		isError: isRawDataError,
	} = useGetDetailsChannelStats(user, {
		channelId,
		dateFrom,
		dateTo,
	});

	const history = useMemo(() => getSortedChannelHistory(rawData), [rawData]);

	const refLinks = useMemo(
		() => transformInviteLinksData(rawData?.refLinks || []),
		[rawData],
	);
	const [detailedRefLink, setDetailedRefLink] = useState<any | null>(null);

	return (
		<section className='flex flex-col gap-6 p-6 overflow-x-hidden lg:p-12'>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant='outline' size='icon-lg' onClick={() => navigate('/')}>
						<ChevronLeftIcon />
					</Button>
				</TooltipTrigger>
				<TooltipContent>Назад к статистике каналов</TooltipContent>
			</Tooltip>

			{/* Detail Chart */}
			<Card>
				<ChannelDetailHeader
					title={rawData?.title}
					timeRange={timeRange}
					onTimeRangeChange={handleTimeRangeChange}
					isCalendarOpen={isCalendarOpen}
					onCalendarOpenChange={setIsCalendarOpen}
					onApplyDateRange={handleApplyDateRange}
				/>
				<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
					{isRawDataError && (
						<div className='flex h-[250px] items-center justify-center'>
							<span className='text-base font-medium'>
								Произошла неизвестная ошибка
							</span>
						</div>
					)}

					{isRawDataLoading && (
						<div className='flex h-[250px] items-center justify-center'>
							<div className='flex gap-4 items-center'>
								<Spinner className='size-4 mt-0.5' />
								<span className='text-base font-medium'>
									Идет загрузка данных...
								</span>
							</div>
						</div>
					)}

					{!isRawDataLoading &&
						!isRawDataError &&
						rawData?.history?.stats?.length > 0 && (
							<ChartContainer
								className={`aspect-auto ${CHART_HEIGHT} w-full`}
								config={CHART_CONFIG.history}
							>
								<LineChart data={history} margin={{ left: 12, right: 12 }}>
									<CartesianGrid vertical={true} />
									<XAxis
										dataKey='date'
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={formatDateForChart}
									/>
									<ChartTooltip
										content={
											<ChartTooltipContent
												labelFormatter={(value) =>
													formatDateForChart(value)
												}
											/>
										}
										cursor={false}
									/>
									<Line
										dataKey='allEnter'
										type='monotone'
										stroke='var(--chart-1)'
										strokeWidth={2}
										dot
									/>
									<Line
										dataKey='allLeave'
										type='monotone'
										stroke='var(--chart-2)'
										strokeWidth={2}
										dot
									/>
									<ChartLegend content={<ChartLegendContent />} />
								</LineChart>
							</ChartContainer>
						)}
					{!isRawDataLoading &&
						!isRawDataError &&
						rawData?.history?.stats.length === 0 && (
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant='icon'>
										<BracesIcon />
									</EmptyMedia>
									<EmptyTitle>Нет данных за выбранный период</EmptyTitle>
									<EmptyDescription>
										Возможно данные еще не были собраны
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
				</CardContent>
			</Card>

			{/* Detail RefLink */}
			{detailedRefLink && (
				<Card>
					<CardHeader>
						<CardTitle>{`Статистика по пригласительной ссылке ${detailedRefLink?.title ? detailedRefLink.title : ''}`}</CardTitle>
						<CardDescription>
							Количество вступлений, выходов, исключений и заявок на вступление
						</CardDescription>
					</CardHeader>
					<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
						{detailedRefLink.stats.length > 0 && (
							<ChartContainer
								className={`aspect-auto ${CHART_HEIGHT} w-full`}
								config={CHART_CONFIG.refStats}
							>
								<BarChart
									data={detailedRefLink.stats}
									margin={{ left: 12, right: 12 }}
								>
									<CartesianGrid vertical={true} />
									<XAxis
										dataKey='date'
										tickLine={false}
										axisLine={false}
										tickMargin={8}
										tickFormatter={formatDateForChart}
									/>
									<ChartTooltip
										content={
											<ChartTooltipContent
												labelFormatter={(value) =>
													formatDateForChart(value)
												}
											/>
										}
										cursor={false}
									/>
									<Bar
										dataKey='enter'
										type='monotone'
										fill='var(--chart-1)'
									/>
									<Bar
										dataKey='leave'
										type='monotone'
										fill='var(--chart-2)'
									/>
									<Bar dataKey='kick' type='monotone' fill='var(--chart-3)' />
									<Bar
										dataKey='pendingRequests'
										type='monotone'
										fill='var(--chart-5)'
									/>
									<ChartLegend content={<ChartLegendContent />} />
								</BarChart>
							</ChartContainer>
						)}
						{detailedRefLink.stats.length === 0 && (
							<Empty className='h-[250px]'>
								<EmptyHeader>
									<EmptyMedia variant='icon'>
										<BracesIcon />
									</EmptyMedia>
									<EmptyTitle>Нет данных за выбранный период</EmptyTitle>
									<EmptyDescription>
										Возможно данные еще не были собраны
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</CardContent>
				</Card>
			)}

			{/* Tables Section */}
			<DataTableCard
				title={`Пригласительные ссылки канала ${rawData?.title ? rawData.title : ''}`}
				description='Подробная информация по каждой пригласительной ссылке'
			>
				{isRawDataError && (
					<div className='flex h-[250px] items-center justify-center'>
						<span className='text-base font-medium'>
							Произошла неизвестная ошибка
						</span>
					</div>
				)}

				{isRawDataLoading && (
					<div className='flex h-[250px] items-center justify-center'>
						<div className='flex gap-4 items-center'>
							<Spinner className='size-4 mt-0.5' />
							<span className='text-base font-medium'>
								Идет загрузка данных...
							</span>
						</div>
					</div>
				)}

				{!isRawDataLoading && !isRawDataError && rawData && refLinks.length > 0 && (
					<InviteLinksTable
						data={refLinks}
						onRowClick={(link) => setDetailedRefLink(link)}
					/>
				)}

				{!isRawDataLoading && !isRawDataError && !rawData && refLinks.length === 0 && (
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant='icon'>
								<BracesIcon />
							</EmptyMedia>
							<EmptyTitle>Нет данных</EmptyTitle>
							<EmptyDescription>
								Возможно статистика еще не была собрана
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
			</DataTableCard>
		</section>
	);
}
