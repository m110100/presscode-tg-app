import { useQuery, useMutation } from '@tanstack/react-query';
import { baseUrl } from '@/shared/env';
import type {
	IBoard,
	IChannel,
	IChannelStats,
	IChannelStatsSchema,
	ICredentionalsSchema,
	IInviteLinksSchema,
	ITelegeram2FASchema,
	ITelegeramCompleteSchema,
	ITelegeramStartSchema,
	IUser,
} from '@/shared/schema';

export async function fetchBoards(user: IUser | null): Promise<IBoard[]> {
	if (!user) return [];

	const response = await fetch(`${baseUrl}/pressCode/getBoards?login=${user.login}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch boards: ${response.statusText}`);
	}

	const data = await response.json();

	return data.boards.map(
		(board: any) =>
			({
				id: board.board,
				title: board.title,
				channels: board.channels.map(
					(channel: any) =>
						({
							id: channel.id,
							title: channel.title,
						}) satisfies IChannel,
				),
			}) satisfies IBoard,
	);
}

export async function fetchCities(): Promise<string[]> {
	const response = await fetch(`${baseUrl}/cityList`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch cities: ${response.statusText}`);
	}

	const data = await response.json();

	return data;
}

export async function fetchUser(credentials: ICredentionalsSchema): Promise<void> {
	const response = await fetch(`${baseUrl}/pressCode/auth`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new Error(`Login failed: ${response.statusText}`);
	}
}

export async function fetchTelegramStart(
	credentials: ITelegeramStartSchema,
): Promise<{ status: string }> {
	const response = await fetch(`${baseUrl}/telegram/authStart`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new Error(`Login failed: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchTelegramComplete(
	credentials: ITelegeramCompleteSchema,
): Promise<{ status: string }> {
	const response = await fetch(`${baseUrl}/telegram/authComplete`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new Error(`Login failed: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchTelegram2FA(
	credentials: ITelegeram2FASchema,
): Promise<{ status: string; user?: { id: string; name: string } }> {
	const response = await fetch(`${baseUrl}/telegram/auth2FA`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(credentials),
	});

	if (!response.ok) {
		throw new Error(`Login failed: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchChannelStats(
	user: IUser | null,
	params: IChannelStatsSchema,
): Promise<IChannelStats[]> {
	if (!user) return [];

	const response = await fetch(`${baseUrl}/getStats?login=${user.login}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch channel stats: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchDetailChannelStats(user: IUser | null, params: any): Promise<any> {
	if (!user) return null;

	const response = await fetch(`${baseUrl}/getDetailsStats?login=${user.login}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch detail channel stats: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchRetentionDaysConfig(
	user: IUser | null,
	params: { retentionDays: number },
): Promise<{ retentionDays: number }> {
	if (!user) return { retentionDays: 15 };

	const response = await fetch(`${baseUrl}/config?login=${user.login}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch retention days config: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchRetentionDays(
	user: IUser | null,
): Promise<{ retentionDays: number }> {
	if (!user) return { retentionDays: 15 };

	const response = await fetch(`${baseUrl}/config?login=${user.login}`, {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch retention days config: ${response.statusText}`);
	}

	return response.json();
}

export async function fetchInviteLinks(
	user: IUser | null,
	params: IInviteLinksSchema,
): Promise<any> {
	if (!user) return [];

	const response = await fetch(`${baseUrl}/getInviteLinks?login=${user.login}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(params),
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch invite links: ${response.statusText}`);
	}

	return response.json();
}

export function useGetBoards(user: IUser | null) {
	return useQuery({
		queryKey: ['boards', user?.login],
		queryFn: () => fetchBoards(user),
		// enabled: !!user,
		staleTime: 5 * 60 * 1000,
	});
}

export function useGetCities() {
	return useQuery({
		queryKey: ['cities'],
		queryFn: fetchCities,
		staleTime: 30 * 60 * 1000,
	});
}

export function useGetChannelStats(user: IUser | null, params: IChannelStatsSchema) {
	return useQuery({
		queryKey: [
			'channelStats',
			user?.login,
			params.board_key,
			params.dateFrom,
			params.dateTo,
			params.city,
			params.channelName,
		],
		queryFn: () => fetchChannelStats(user, params),
		enabled: !!user && params.board_key.length > 0,
		staleTime: 5 * 60 * 1000,
	});
}

export function useGetDetailsChannelStats(user: IUser | null, params: any) {
	return useQuery({
		queryKey: [
			'detailedChannelStats',
			user?.login,
			params.channelId,
			params.dateFrom,
			params.dateTo,
		],
		queryFn: () => fetchDetailChannelStats(user, params),
		enabled: !!user && !!params.channelId,
		staleTime: 5 * 60 * 1000,
	});
}

export function useGetRetentionDays(user: IUser | null) {
	return useQuery({
		queryKey: ['retentionDays', user?.login],
		queryFn: () => fetchRetentionDays(user),
		staleTime: 30 * 60 * 1000,
	});
}

export function useGetInviteLinks(user: IUser | null, params: IInviteLinksSchema) {
	return useQuery({
		queryKey: [
			'inviteLinks',
			user?.login,
			params.channelId,
			params.dateFrom,
			params.dateTo,
		],
		queryFn: () => fetchInviteLinks(user, params),
		staleTime: 5 * 60 * 1000,
		enabled: !!params.channelId,
	});
}

export function usePostRetentionDays() {
	return useMutation({
		mutationFn: ({
			user,
			params,
		}: {
			user: IUser | null;
			params: { retentionDays: number };
		}) => fetchRetentionDaysConfig(user, params),
	});
}

export function useLogin() {
	return useMutation({
		mutationFn: fetchUser,
	});
}

export function useAuthTelegramStart() {
	return useMutation({
		mutationFn: fetchTelegramStart,
	});
}

export function useAuthTelegramComplete() {
	return useMutation({
		mutationFn: fetchTelegramComplete,
	});
}

export function useAuthTelegram2FA() {
	return useMutation({
		mutationFn: fetchTelegram2FA,
	});
}
