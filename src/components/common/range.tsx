import { TIME_RANGE_OPTIONS } from '@/shared/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { IDateRange, ITimeRange } from '@/shared/schema';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarDaysIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { ru } from 'date-fns/locale';

export const TimeRangeSelector = ({
	value,
	onChange,
}: {
	value: ITimeRange;
	onChange: (value: ITimeRange) => void;
}) => (
	<Select
		value={value}
		onValueChange={(newValue) => {
			onChange(newValue as ITimeRange);
		}}
	>
		<SelectTrigger className='rounded-lg grow lg:grow-0'>
			<SelectValue placeholder='Последние 7 дней' />
		</SelectTrigger>
		<SelectContent className='rounded-xl'>
			{Object.entries(TIME_RANGE_OPTIONS).map(([key, option]) => (
				<SelectItem key={key} value={key}>
					{option.label}
				</SelectItem>
			))}
		</SelectContent>
	</Select>
);

export const DateRangeCalendar = ({
	isOpen,
	onOpenChange,
	onApply,
}: {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onApply: (range: IDateRange) => void;
}) => {
	const [pendingRange, setPendingRange] = useState<IDateRange>({
		from: undefined,
		to: undefined,
	});

	return (
		<Popover open={isOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<Button variant='outline' size='icon'>
					<CalendarDaysIcon />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto overflow-hidden p-0' align='end'>
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
							setPendingRange({ from: undefined, to: undefined });
							onOpenChange(false);
						}}
					>
						Отмена
					</Button>
					<Button
						size='sm'
						variant='outline'
						disabled={!pendingRange.from || !pendingRange.to}
						onClick={() => {
							onApply(pendingRange);
							onOpenChange(false);
						}}
					>
						Применить
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};
