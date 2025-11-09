import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
	useAuthTelegram2FA,
	useAuthTelegramComplete,
	useAuthTelegramStart,
} from '@/lib/queries';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import {
	tgSchema2FA,
	tgSchemaComplete,
	tgSchemaStart,
	type ITelegeram2FASchema,
	type ITelegeramCompleteSchema,
	type ITelegeramStartSchema,
} from '@/shared/schema';
import { useAuth } from '@/app/provider/auth';
import { AUTH_TG_KEY } from '@/lib/local-storage';

type AuthStep = 'form' | 'confirm' | 'twofa' | 'completed';

export function AuthTelegram() {
	const [tgUser, setTgUser] = useState<string | null>(null);
	const [authStep, setAuthStep] = useState<AuthStep>('form');
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { mutate: auth, isPending: isAuthPending } = useAuthTelegramStart();
	const { mutate: confirmAuth, isPending: isConfirmAuthPending } = useAuthTelegramComplete();
	const { mutate: twoFA, isPending: isTwoFAPending } = useAuthTelegram2FA();

	const { user } = useAuth();

	const authForm = useForm<ITelegeramStartSchema>({
		resolver: standardSchemaResolver(tgSchemaStart),
		defaultValues: {
			session_name: user?.login,
			phone_number: '',
		},
	});

	const confirmAuthForm = useForm<ITelegeramCompleteSchema>({
		resolver: standardSchemaResolver(tgSchemaComplete),
		defaultValues: {
			session_name: user?.login,
			code: '',
		},
	});

	const twoFAForm = useForm<ITelegeram2FASchema>({
		resolver: standardSchemaResolver(tgSchema2FA),
		defaultValues: {
			session_name: user?.login,
			password: '',
		},
	});

	function onAuthSubmit(data: ITelegeramStartSchema) {
		auth(data, {
			onSuccess: (response) => {
				if (response.status === 'code_sent') {
					setAuthStep('confirm');
				}
			},
		});
	}

	function onConfirmAuthSubmit(data: ITelegeramCompleteSchema) {
		confirmAuth(data, {
			onSuccess: (response) => {
				if (response.status === '2fa_required') {
					setAuthStep('twofa');
				}
			},
		});
	}

	function onTwoFASubmit(data: ITelegeram2FASchema) {
		twoFA(data, {
			onSuccess: (response) => {
				if (response.status === 'ok') {
					if (response.user) {
						localStorage.setItem(AUTH_TG_KEY, response.user?.id);
						setTgUser(response.user?.id);
					}

					setAuthStep('completed');
					setIsDialogOpen(false);
				}
			},
		});
	}

	useEffect(() => {
		const tgUserFromStorage = localStorage.getItem(AUTH_TG_KEY);

		if (tgUserFromStorage) {
			setTgUser(tgUserFromStorage);
		}
	}, []);

	if (tgUser) return null;

	return (
		<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
			<DialogTrigger asChild>
				<Button variant='outline'>Авторизоваться через Telegram</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Авторизация через Telegram</DialogTitle>
					<DialogDescription>
						После авторизации будет доступна статистика по реферальным ссылкам
					</DialogDescription>
				</DialogHeader>

				{authStep === 'form' && (
					<Form {...authForm}>
						<form
							onSubmit={authForm.handleSubmit(onAuthSubmit)}
							className='space-y-6'
						>
							<FormField
								control={authForm.control}
								name='phone_number'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Номер телефона</FormLabel>
										<FormControl>
											<Input type='text' {...field} />
										</FormControl>
										<FormDescription>
											Введи номер телефона в формате +7, все цифры слитно
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button className='w-full' type='submit' disabled={isAuthPending}>
								Отправить
							</Button>
						</form>
					</Form>
				)}

				{authStep === 'confirm' && (
					<Form {...confirmAuthForm}>
						<form
							onSubmit={confirmAuthForm.handleSubmit(onConfirmAuthSubmit)}
							className='space-y-6'
						>
							<FormField
								control={confirmAuthForm.control}
								name='code'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Код подтверждения</FormLabel>
										<FormControl>
											<InputOTP maxLength={5} {...field}>
												<InputOTPGroup>
													<InputOTPSlot index={0} />
													<InputOTPSlot index={1} />
													<InputOTPSlot index={2} />
													<InputOTPSlot index={3} />
													<InputOTPSlot index={4} />
												</InputOTPGroup>
											</InputOTP>
										</FormControl>
										<FormDescription>
											Введи код, отправленный в Telegram
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button
								className='w-full'
								type='submit'
								disabled={isConfirmAuthPending}
							>
								Отправить
							</Button>
						</form>
					</Form>
				)}

				{authStep === 'twofa' && (
					<Form {...twoFAForm}>
						<form
							onSubmit={twoFAForm.handleSubmit(onTwoFASubmit)}
							className='space-y-6'
						>
							<FormField
								control={twoFAForm.control}
								name='password'
								render={({ field }) => (
									<FormItem>
										<FormLabel>Облачный пароль</FormLabel>
										<FormControl>
											<Input type='text' {...field} />
										</FormControl>
										<FormDescription>
											Введи облачный пароль для подтверждения учетной
											записи
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button className='w-full' type='submit' disabled={isTwoFAPending}>
								Отправить
							</Button>
						</form>
					</Form>
				)}
			</DialogContent>
		</Dialog>
	);
}
