import type { ChartConfig } from '@/components/ui/chart';

export const CHART_HEIGHT = 'h-[250px]';

export const CHART_CONFIG = {
	channels: {
		enter: { label: 'Вступления', color: 'var(--chart-1)' },
		leave: { label: 'Выходы', color: 'var(--chart-2)' },
		requestCount: { label: 'Всего заявок', color: 'var(--chart-5)' },
	} as ChartConfig,
	history: {
		allEnter: { label: 'Вступления', color: 'var(--chart-1)' },
		allLeave: { label: 'Выходы', color: 'var(--chart-2)' },
	} as ChartConfig,
	refStats: {
		enter: { label: 'Вступления', color: 'var(--chart-1)' },
		leave: { label: 'Выходы', color: 'var(--chart-2)' },
		kick: { label: 'Исключения', color: 'var(--chart-3)' },
		pendingRequests: { label: 'Заявки на вступление', color: 'var(--chart-5)' },
	} as ChartConfig,
};

export const TIME_RANGE_OPTIONS = {
	'1d': { label: 'последние сутки', days: 1 },
	'7d': { label: 'последние 7 дней', days: 7 },
	'30d': { label: 'последние 30 дней', days: 30 },
	'90d': { label: 'последние 90 дней', days: 90 },
} as const;

export const RETENTION_DAYS_MIN = 1;
