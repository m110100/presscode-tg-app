import { z } from 'zod';

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

export type ICredentionalsSchema = z.infer<typeof userSchema>;

export type ILinkCitySchema = z.infer<typeof linkCitySchema>;

export type IChannelStatsSchema = z.infer<typeof channelStatsSchema>;

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
