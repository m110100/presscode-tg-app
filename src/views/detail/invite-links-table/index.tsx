import { useState, useMemo } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, SearchIcon } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
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
import type { ILinkStats } from '@/shared/schema';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

type Props = {
	data: ILinkStats[];
	pageSizeOptions?: number[];
	onRowClick?: (inviteLink: ILinkStats) => void;
};

export function InviteLinksTable({ data, pageSizeOptions = [5, 10, 15], onRowClick }: Props) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: data.length || 10 });

	const debouncedSearchQuery = useDebounce(searchQuery, 300);

	const filteredData = useMemo(() => {
		if (!debouncedSearchQuery.trim()) return data;

		return data.filter((item) =>
			item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
		);
	}, [data, debouncedSearchQuery]);

	const columns = useMemo<ColumnDef<ILinkStats>[]>(
		() => [
			{
				accessorKey: 'title',
				header: () => 'Название',
				cell: (info) => info.getValue(),
				size: 200,
			},
			{
				accessorKey: 'price',
				header: () => 'Стоимость',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
			{
				accessorKey: 'pendingRequests',
				header: () => 'Кол-во заявок',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
			{
				accessorKey: 'enter',
				header: () => 'Кол-во вступлений',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
			{
				accessorKey: 'leave',
				header: () => 'Кол-во выходов',
				cell: (info) => info.getValue(),
				meta: { align: 'right' },
				size: 200,
			},
			{
				accessorKey: 'createdAt',
				header: () => 'Дата создания',
				cell: (info) => {
					const value = info.getValue() as string | null;

					if (!value) {
						return 'Отсутствует';
					}

					return format(new Date(value), 'dd.MM.yyyy HH:mm');
				},
				meta: { align: 'right' },
				size: 200,
			},
		],
		[],
	);

	const table = useReactTable({
		data: filteredData,
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
			{/* Search Input */}
			<div className='relative'>
				<SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
				<Input
					placeholder='Поиск по названию...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='pl-10'
				/>
			</div>

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
								{row.getVisibleCells().map((cell) => {
									const isTitle = cell.column.id === 'title';

									return isTitle ? (
										<Tooltip key={cell.id}>
											<TooltipTrigger asChild>
												<TableCell className='text-muted-foreground truncate overflow-hidden text-ellipsis'>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</TableCell>
											</TooltipTrigger>
											<TooltipContent>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TooltipContent>
										</Tooltip>
									) : (
										<TableCell
											key={cell.id}
											className='text-muted-foreground truncate overflow-hidden text-ellipsis'
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))}
					</TableBody>
				</Table>
				<ScrollBar orientation='horizontal' />
			</ScrollArea>

			{/* Pagination */}
			<div className='flex gap-4 items-center justify-between lg:flex-row md:flex-row flex-col'>
				<div className='text-left w-full text-sm text-muted-foreground'>
					{pagination.pageSize === filteredData.length ? (
						`Всего записей: ${filteredData.length}`
					) : (
						<>
							Страница {table.getState().pagination.pageIndex + 1} из{' '}
							{table.getPageCount()}. Всего записей: {filteredData.length}
						</>
					)}
				</div>
				<div className='flex w-full gap-2 items-center lg:justify-end md:justify-end'>
					<Button
						variant='outline'
						onClick={() => table.previousPage()}
						disabled={
							!table.getCanPreviousPage() ||
							pagination.pageSize === filteredData.length
						}
					>
						Назад
					</Button>
					<Button
						variant='outline'
						onClick={() => table.nextPage()}
						disabled={
							!table.getCanNextPage() ||
							pagination.pageSize === filteredData.length
						}
					>
						Далее
					</Button>
					<Select
						value={
							pagination.pageSize === filteredData.length
								? 'all'
								: String(pagination.pageSize)
						}
						onValueChange={(value) => {
							if (value === 'all') {
								table.setPageSize(filteredData.length);
							} else {
								table.setPageSize(Number(value));
							}
						}}
					>
						<SelectTrigger className='w-[180px]'>
							<SelectValue placeholder='Выберите...' />
						</SelectTrigger>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={String(size)}>
									{size} на странице
								</SelectItem>
							))}
							<SelectItem value='all'>Все</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
