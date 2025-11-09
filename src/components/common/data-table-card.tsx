import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const DataTableCard = ({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) => (
	<Card>
		<CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
			<div className='grid flex-1 gap-1'>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</div>
		</CardHeader>
		<CardContent className='px-2 pt-4 sm:px-6 sm:pt-6 flex flex-col gap-4'>
			{children}
		</CardContent>
	</Card>
);
