import { useState, useMemo, useEffect, memo } from 'react';
import { LineChart, Line, XAxis, CartesianGrid, Bar, BarChart } from 'recharts';
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
	type ChartConfig,
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
import { BracesIcon, CalendarDays, SettingsIcon } from 'lucide-react';
import { useGetChannelStats, useGetRetentionDays, usePostRetentionDays } from '@/lib/queries';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ru } from 'date-fns/locale';
import { useAuth } from '@/app/provider/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { ChannelsTable } from '../channel-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const channelChartConfig: ChartConfig = {
	enter: { label: 'Вступления', color: 'var(--chart-1)' },
	leave: { label: 'Выходы', color: 'var(--chart-2)' },
	requestCount: { label: 'Всего заявок', color: 'var(--chart-5)' },
};

const historyChannelChartConfig: ChartConfig = {
	allEnter: { label: 'Вступления', color: 'var(--chart-1)' },
	allLeave: { label: 'Выходы', color: 'var(--chart-2)' },
};

type Props = {
	bots: string[];
	channelNames: string[];
};

export const ChannelsStats = memo(function ChannelsStats({ bots, channelNames }: Props) {
	const { user } = useAuth();
	const { data: retentionDays } = useGetRetentionDays(user);
	const { mutate: postRetentionDays, isPending: isPostingRetentionDays } =
		usePostRetentionDays();

	const [timeRange, setTimeRange] = useState('7d');
	const [retentionDaysValue, setRetentionDaysValue] = useState<string>('');
	const [customRange, setCustomRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({
		from: undefined,
		to: undefined,
	});
	const [pendingRange, setPendingRange] = useState<{
		from: Date | undefined;
		to: Date | undefined;
	}>({ from: undefined, to: undefined });
	const [isCalendarOpened, setIsCalendarOpened] = useState(false);

	const [selectedChannel, setSelectedChannel] = useState<null | any>(null);

	const { dateFrom, dateTo } = useMemo(() => {
		if (customRange.from && customRange.to) {
			return {
				dateFrom: format(customRange.from, 'yyyy-MM-dd'),
				dateTo: format(customRange.to, 'yyyy-MM-dd'),
			};
		}

		const days = timeRange === '90d' ? 90 : timeRange === '30d' ? 30 : 7;
		const today = new Date();
		const from = new Date(today);
		from.setDate(from.getDate() - days);

		return {
			dateFrom: format(from, 'yyyy-MM-dd'),
			dateTo: format(today, 'yyyy-MM-dd'),
		};
	}, [timeRange, customRange]);

	const {
		data: chartData,
		isLoading,
		isError,
	} = useGetChannelStats(user, {
		board_key: bots,
		channelName: channelNames,
		dateFrom,
		dateTo,
	});

	const mainData = useMemo(() => {
		if (!chartData) return [];

		return chartData.map((ch) => ({
			title: ch.title,
			channelId: ch.channelId,
			enter: ch.enter,
			leave: ch.leave,
			requestCount: ch.requestCount,
		}));
	}, [chartData]);

	const detailData = useMemo(() => {
		if (!selectedChannel?.history?.stats) return [];
		return [...selectedChannel.history.stats].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
	}, [selectedChannel]);

	useEffect(() => {
		setSelectedChannel(null);
	}, [timeRange]);

	useEffect(() => {
		if (retentionDays?.retentionDays) {
			setRetentionDaysValue(retentionDays.retentionDays.toString());
		}
	}, [retentionDays]);

	return (
		<div className='flex flex-col gap-6'>
			<div
				className={`grid grid-cols-1 gap-6 ${selectedChannel ? 'lg:grid-cols-2' : ''}`}
			>
				{/* Основная карточка со сводной статистикой */}
				<Card className='pt-0'>
					<CardHeader className='flex flex-col items-center gap-4 space-y-0 border-b py-5 lg:flex-row'>
						<div className='grid flex-1 gap-1 w-full'>
							<CardTitle>Статистика каналов</CardTitle>
							<CardDescription>
								Вступления и выходы, заявки за выбранный период
							</CardDescription>
						</div>
						<div className='flex w-full gap-4 lg:w-auto'>
							<Select
								value={timeRange}
								onValueChange={(value) => {
									setTimeRange(value);
									setCustomRange({ from: undefined, to: undefined });
								}}
							>
								<SelectTrigger className='rounded-lg grow lg:grow-0'>
									<SelectValue placeholder='Последние 7 дней' />
								</SelectTrigger>
								<SelectContent className='rounded-xl'>
									<SelectItem value='90d'>последние 90 дней</SelectItem>
									<SelectItem value='30d'>последние 30 дней</SelectItem>
									<SelectItem value='7d'>последние 7 дней</SelectItem>
								</SelectContent>
							</Select>
							<Popover open={isCalendarOpened} onOpenChange={setIsCalendarOpened}>
								<PopoverTrigger asChild>
									<Button variant='outline' size='icon'>
										<CalendarDays />
									</Button>
								</PopoverTrigger>
								<PopoverContent
									className='w-auto overflow-hidden p-0'
									align='end'
								>
									<Calendar
										mode='range'
										numberOfMonths={2}
										locale={ru}
										selected={pendingRange}
										onSelect={(range) => {
											if (range) {
												setPendingRange({
													from: range.from ?? undefined,
													to: range.to ?? undefined,
												});
											}
										}}
									/>
									<div className='flex justify-end gap-2 p-3'>
										<Button
											size='sm'
											variant='ghost'
											onClick={() => {
												setPendingRange({
													from: undefined,
													to: undefined,
												});
												setIsCalendarOpened(false);
											}}
										>
											Отмена
										</Button>
										<Button
											size='sm'
											variant='outline'
											disabled={!pendingRange.from || !pendingRange.to}
											onClick={() => {
												setCustomRange({ ...pendingRange });
												setSelectedChannel(null);
											}}
										>
											Применить
										</Button>
									</div>
								</PopoverContent>
							</Popover>
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
											value={retentionDaysValue}
											onChange={(e) =>
												setRetentionDaysValue(e.target.value)
											}
											placeholder='Укажи кол-во дней, которое нужно хранить историю...'
										/>
									</div>
									<div className='flex grow'>
										<Button
											className='grow'
											size='sm'
											variant='outline'
											disabled={isPostingRetentionDays}
											onClick={() => {
												const value = parseInt(retentionDaysValue, 10);
												if (!isNaN(value) && value > 0 && user) {
													postRetentionDays(
														{
															user,
															params: { retentionDays: value },
														},
														{
															onSuccess: (response) => {
																setRetentionDaysValue(
																	response.retentionDays.toString(),
																);
															},
														},
													);
												}
											}}
										>
											{isPostingRetentionDays
												? 'Применение...'
												: 'Применить'}
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</CardHeader>

					<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
						{isError && (
							<div className='flex h-[250px] items-center justify-center '>
								<span className='text-base font-medium'>
									Произошла неизвестная ошибка
								</span>
							</div>
						)}
						{isLoading && (
							<div className='flex h-[250px] items-center justify-center'>
								<div className='flex gap-4 items-center'>
									<Spinner className='size-4 mt-0.5' />
									<span className='text-base font-medium'>
										Идет загрузка данных...
									</span>
								</div>
							</div>
						)}

						{/* Главный график */}
						{!isLoading && !isError && mainData.length > 0 && (
							<ChartContainer
								className='aspect-auto h-[250px] w-full'
								config={channelChartConfig}
							>
								<BarChart
									accessibilityLayer
									data={mainData}
									margin={{ left: 12, right: 12 }}
									onClick={(e: any) => {
										const channel = chartData?.find(
											(ch: any) => ch.title === e?.activeLabel,
										);

										if (channel) {
											setSelectedChannel(
												selectedChannel?.channelId === channel.channelId
													? null
													: channel,
											);
										}
									}}
								>
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

									{/* Стекбар — Вступления / Выходы / Заявки */}
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

						{/* Нет данных */}
						{!isLoading && !isError && mainData.length === 0 && (
							<Empty>
								<EmptyHeader>
									<EmptyMedia variant='icon'>
										<BracesIcon />
									</EmptyMedia>
									<EmptyTitle>Нет данных</EmptyTitle>
									<EmptyDescription>
										Для отображения графика выбери интересующих тебя ботов,
										минимум одного
									</EmptyDescription>
								</EmptyHeader>
							</Empty>
						)}
					</CardContent>
				</Card>
				{/* Детализированная карточка */}
				<AnimatePresence>
					{selectedChannel && detailData.length > 0 && (
						<motion.div
							initial={{ opacity: 0, x: -100, scale: 0.95 }}
							animate={{ opacity: 1, x: 0, scale: 1 }}
							exit={{ opacity: 0, x: -100, scale: 0.95 }}
							transition={{
								duration: 0.4,
								ease: 'easeOut',
							}}
						>
							<Card>
								<CardHeader className='border-b pb-4'>
									<CardTitle>
										Детализация канала {selectedChannel.title}
									</CardTitle>
									<CardDescription>
										История вступлений и выходов, а также заявкам, разбитая
										по датам
									</CardDescription>
								</CardHeader>
								<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
									<ChartContainer
										className='aspect-auto h-[250px] w-full'
										config={historyChannelChartConfig}
									>
										<LineChart
											data={detailData}
											margin={{ left: 12, right: 12 }}
										>
											<CartesianGrid vertical={false} />
											<XAxis
												dataKey='date'
												tickLine={false}
												axisLine={false}
												tickMargin={8}
												tickFormatter={(value) => {
													return format(
														new Date(value),
														"d MMM yyyy'г.'",
														{ locale: ru },
													);
												}}
											/>
											<ChartTooltip
												content={
													<ChartTooltipContent
														labelFormatter={(value) => {
															return format(
																new Date(value),
																"d MMM yyyy'г.'",
																{ locale: ru },
															);
														}}
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
								</CardContent>
							</Card>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Таблица с данными каналов */}
			{!isLoading && !isError && mainData.length > 0 && (
				<Card>
					<CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
						<div className='grid flex-1 gap-1'>
							<CardTitle>Данные каналов</CardTitle>
							<CardDescription>
								Подробная информация по каждому каналу за выбранный период
							</CardDescription>
						</div>
					</CardHeader>
					<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6 flex flex-col gap-4'>
						<ChannelsTable
							data={chartData || []}
							onRowClick={(channel) => setSelectedChannel(channel)}
						/>
					</CardContent>
				</Card>
			)}
		</div>
	);
});
