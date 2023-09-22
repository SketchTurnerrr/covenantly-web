'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const formSchema = z.object({
  email: z.string().email().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  // password: z.string().min(6),
});

export default function SignIn() {
  const supabase = createClientComponentClient();

  const form = useForm<z.infer<typeof formSchema>>({
    //@ts-ignore
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      // password: '',
    },
  });

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
          data: {
            email: values.email,
            name: null,
            avatar_url: null,
          },
        },
      });
    } catch (error) {
      console.log('error :', error);
    }

    console.log(values.email);
  }

  return (
    <div className='h-screen w-full grid place-items-center'>
      <div className='w-full md:max-w-sm'>
        <h1 className='text-center text-4xl font-bold mb-4'>Привіт!</h1>
        <div className='rounded-lg   p-5 '>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    {/* <FormLabel>Email</FormLabel> */}
                    <FormControl>
                      <Input
                        className='py-6'
                        placeholder='Електронна адреса'
                        type='email'
                        {...field}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='border border-gray-400 rounded-sm p-2'>
                <p className='text-gray-400 text-sm'>
                  ✨ Непотрібно ніяких паролів, ми відправимо вам на пошту
                  посилання для входу.
                </p>
              </div>
              <Button
                className='w-full p-6 hover:bg-purple-500 bg-purple-400 text-lg font-bold'
                type='submit'
              >
                Увійти
              </Button>
              <p className='text-center'>або</p>
              <Button
                variant='outline'
                className='w-full p-6  text-lg font-bold'
                type='submit'
                onClick={signInWithGoogle}
              >
                <Image
                  src='/google-logo.svg'
                  alt='Google Logo'
                  className='dark:invert mr-2'
                  width={24}
                  height={24}
                  priority
                />
                Увійти з Google
              </Button>
              {/* <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type='password' {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
