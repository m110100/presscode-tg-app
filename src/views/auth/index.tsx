import { useForm } from 'react-hook-form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { userSchema, type ICredentionalsSchema } from '@/shared/schema';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useAuth } from '@/app/provider/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const defaultValues: ICredentionalsSchema = {
	login: '',
	password: '',
};

export function AuthView() {
	const form = useForm<ICredentionalsSchema>({
		defaultValues,
		resolver: standardSchemaResolver(userSchema),
	});

	const { loginFn } = useAuth();

	return (
		<section className='flex flex-col justify-center items-center grow'>
			<div className='w-full flex flex-col items-center justify-center px-6'>
				<Card className='max-w-sm w-full'>
					<CardHeader>
						<CardTitle>Вход в аккаунт PressCode</CardTitle>
						<CardDescription>Введи свои учетные данные для входа</CardDescription>
					</CardHeader>
					<CardContent>
						<Form {...form}>
							<form className='space-y-4' onSubmit={form.handleSubmit(loginFn)}>
								<FormField
									control={form.control}
									name='login'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Логин</FormLabel>
											<FormControl>
												<Input
													placeholder='Введите логин...'
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name='password'
									render={({ field }) => (
										<FormItem>
											<FormLabel>Пароль</FormLabel>
											<FormControl>
												<Input
													type='password'
													placeholder='Введите пароль...'
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<Button type='submit' className='w-full mt-6'>
									Войти в аккаунт
								</Button>
							</form>
						</Form>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
