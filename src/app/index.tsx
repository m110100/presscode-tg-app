import { AuthView } from '@/views/auth';
import { DashboardView } from '@/views/dashboard';
import { Route, Routes } from 'react-router';

export function App() {
	return (
		<Routes>
			<Route path='/' element={<DashboardView />} />
			<Route path='/auth' element={<AuthView />} />
		</Routes>
	);
}
