import {
	useCallback,
	useMemo,
	useState,
	useEffect,
	type ChangeEvent,
	useDeferredValue,
} from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useAuth } from '@/app/provider/auth';
import { useGetBoards } from '@/lib/queries';
import { ChannelsStats } from './components/channel-stats';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export function DashboardView() {
	const { user } = useAuth();
	const { data: boards = [], isLoading } = useGetBoards(user);

	const [channelName, setChannelName] = useState<string>('');
	const [selectedBots, setSelectedBots] = useState<string[]>([]);

	const debouncedChannelName = useDebounce(channelName, 500);
	const deferredChannelName = useDeferredValue(debouncedChannelName);

	const debouncedChannelNames = useMemo(
		() =>
			deferredChannelName
				.split(',')
				.map((name) => name.trim())
				.filter(Boolean),
		[deferredChannelName],
	);

	const botOptions = useMemo<{ label: string; value: string }[]>(
		() => boards.map((board) => ({ label: board.title, value: board.id })),
		[boards],
	);

	useEffect(() => {
		if (botOptions.length > 0 && selectedBots.length === 0) {
			setSelectedBots([botOptions[0].value]);
		}
	}, [botOptions, selectedBots.length]);

	const handleChannelNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		setChannelName(value);
	}, []);

	return (
		<section className='flex flex-col gap-6 p-6 overflow-x-hidden lg:p-12'>
			<Card className='flex items-center px-6 lg:flex-row md:flex-row sm:flex-col'>
				<div className='w-full grow'>
					{isLoading ? (
						<Skeleton className='h-10 w-full' />
					) : (
						<Input
							id='selectedChannel'
							name='selectedChannel'
							className='min-h-10 text-ellipsis'
							value={channelName}
							onChange={handleChannelNameChange}
							placeholder='Введи название канала или каналов, через запятую...'
						/>
					)}
				</div>
				<div className='w-full grow'>
					{isLoading ? (
						<Skeleton className='h-10 w-full' />
					) : (
						<MultiSelect
							className='min-h-10 w-52'
							hideSelectAll
							options={botOptions}
							defaultValue={[botOptions[0]?.value]}
							placeholder='Выбери ботов'
							searchPlaceholder='Поиск ботов...'
							onValueChange={setSelectedBots}
						/>
					)}
				</div>
			</Card>
			<div className='flex flex-col'>
				{isLoading ? (
					<Skeleton className='h-[400px] w-full' />
				) : (
					<ChannelsStats bots={selectedBots} channelNames={debouncedChannelNames} />
				)}
			</div>
		</section>
	);
}
