import { useState, useMemo } from 'react';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	type ColumnDef,
	type SortingState,
	getPaginationRowModel,
} from '@tanstack/react-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

type ChannelData = {
	channelId: number;
	title: string;
	membersCount: number;
	requestCount: number;
	enter: number;
	leave: number;
};

type Props = {
	data: ChannelData[];
	pageSizeOptions?: number[];
	onRowClick?: (channel: ChannelData) => void;
};

export function ChannelsTable({ data, pageSizeOptions = [5, 10, 15], onRowClick }: Props) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

	const columns = useMemo<ColumnDef<ChannelData>[]>(
		() => [
			{
				accessorKey: 'title',
				header: () => 'Название',
				cell: (info) => info.getValue(),
				size: 200,
			},
			{
				accessorKey: 'membersCount',
				header: () => 'Участников',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
			{
				accessorKey: 'requestCount',
				header: () => 'Заявок на вступление',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
			{
				accessorKey: 'enter',
				header: () => 'Вступлений',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
			{
				accessorKey: 'leave',
				header: () => 'Выходов',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
		],
		[],
	);

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			pagination,
		},
		onSortingChange: setSorting,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className='flex flex-col gap-4'>
			<ScrollArea className='h-[400px] w-full border rounded-md p-4'>
				<Table className='w-full table-fixed'>
					<TableHeader className='sticky top-0 bg-card'>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead
										key={header.id}
										style={{ width: header.getSize() }}
									>
										<button
											className='flex items-center gap-2 hover:text-foreground transition-colors'
											onClick={header.column.getToggleSortingHandler()}
										>
											{flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
											{header.column.getIsSorted() === 'asc' && (
												<ArrowUpIcon className='h-4 w-4 text-muted-foreground' />
											)}
											{header.column.getIsSorted() === 'desc' && (
												<ArrowDownIcon className='h-4 w-4 text-muted-foreground' />
											)}
											{!header.column.getIsSorted() && (
												<ArrowUpDownIcon className='h-4 w-4 text-muted-foreground' />
											)}
										</button>
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								className='cursor-pointer hover:bg-muted'
								onClick={() => onRowClick?.(row.original)}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id} className='text-muted-foreground'>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext(),
										)}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
				<ScrollBar orientation='horizontal' />
			</ScrollArea>

			{/* Пагинация */}
			<div className='flex gap-4 items-center justify-between lg:flex-row md:flex-row flex-col'>
				<div className='text-left w-full text-sm text-muted-foreground'>
					Страница {table.getState().pagination.pageIndex + 1} из{' '}
					{table.getPageCount()}. Всего записей: {data.length}
				</div>
				<div className='flex w-full gap-2 items-center lg:justify-end md:justify-end'>
					<Button
						variant='outline'
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Назад
					</Button>
					<Button
						variant='outline'
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Далее
					</Button>
					<Select
						value={String(pagination.pageSize)}
						onValueChange={(value) => table.setPageSize(Number(value))}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size} на странице
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
