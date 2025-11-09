import { AuthView } from '@/views/auth';
import { DashboardView } from '@/views/dashboard';
import { DetailedChannelView } from '@/views/detail';
import { Route, Routes } from 'react-router';

export function App() {
	return (
		<Routes>
			<Route path='/' element={<DashboardView />} />
			<Route path='/channel/:channelId' element={<DetailedChannelView />} />
			<Route path='/auth' element={<AuthView />} />
		</Routes>
	);
}
