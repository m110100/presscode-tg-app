import { z } from 'zod';
import type { TIME_RANGE_OPTIONS } from '../constants';

export const userSchema = z.object({
	login: z.email().nonempty({ error: 'Обязательное поле' }),
	password: z.string().nonempty({ error: 'Обязательное поле' }),
});

export const linkCitySchema = z.object({
	channelId: z.string().nonempty({ error: 'Обязательное поле' }),
	city: z.string().nonempty({ error: 'Обязательное поле' }),
});

export const channelStatsSchema = z.object({
	board_key: z.array(z.string()).nonempty({ error: 'Обязательное поле' }),
	channelName: z.array(z.string()).optional(),
	city: z.string().optional(),
	dateFrom: z.string().optional(),
	dateTo: z.string().optional(),
});

export const inviteLinksSchema = z.object({
	channelId: z.string().nonempty({ error: 'Обязательное поле' }),
	dateFrom: z.string().optional(),
	dateTo: z.string().optional(),
});

export const tgSchemaStart = z.object({
	session_name: z.string().nonempty({ error: 'Обязательное поле' }),
	phone_number: z.string().nonempty({ error: 'Обязательное поле' }),
});

export const tgSchemaComplete = z.object({
	session_name: z.string().nonempty({ error: 'Обязательное поле' }),
	code: z.string().nonempty({ error: 'Обязательное поле' }),
});

export const tgSchema2FA = z.object({
	session_name: z.string().nonempty({ error: 'Обязательное поле' }),
	password: z.string().nonempty({ error: 'Обязательное поле' }),
});

export type ICredentionalsSchema = z.infer<typeof userSchema>;

export type ILinkCitySchema = z.infer<typeof linkCitySchema>;

export type IChannelStatsSchema = z.infer<typeof channelStatsSchema>;

export type IInviteLinksSchema = z.infer<typeof inviteLinksSchema>;

export type ITelegeramStartSchema = z.infer<typeof tgSchemaStart>;

export type ITelegeramCompleteSchema = z.infer<typeof tgSchemaComplete>;

export type ITelegeram2FASchema = z.infer<typeof tgSchema2FA>;

export type IUser = Omit<ICredentionalsSchema, 'password'>;

export type IChannel = {
	id: string;
	title: string;
};

export type IBoard = {
	id: string;
	title: string;
	channels: IChannel[];
};

export interface IChannelStats {
	channelId: number;
	avatar: string;
	title: string;
	city: string;
	enter: number;
	leave: number;
	requestCount: number;
	membersCount: number;
}

export interface ILinkStats {
	id: string;
	title: string;
	price: number;
	limit: number;
	enter: number;
	leave: number;
	kick: number;
	stats: {
		enter: number;
		leave: number;
		kick: number;
		date: string;
	}[];
}

export interface IChannelData {
	title: string;
	channelId: number;
	enter: number;
	leave: number;
	requestCount: number;
	history?: {
		stats: Array<{
			date: string;
			allEnter: number;
			allLeave: number;
		}>;
	};
}

export type ITimeRange = keyof typeof TIME_RANGE_OPTIONS;
export type IDateRange = { from: Date | undefined; to: Date | undefined };
