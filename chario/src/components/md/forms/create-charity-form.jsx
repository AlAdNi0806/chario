'use client'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react'
import { Button } from '@/components/ui/button';
import SingleImageUpload from '../single-image-upload';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

function CreateCharityFormComponent({ form, onSubmit, className }) {
    return (
        <div className={className}>


            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title*</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder='Title'
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e.target.value)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description*</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder='Tell what your charity is about'
                                        value={field.value}
                                        onChange={(e) => {
                                            field.onChange(e.target.value)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <FormField
                            control={form.control}
                            name="target"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Target Amount (ETH)*</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder='0.1'
                                            value={field.value}
                                            type={'number'}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Deadline*</FormLabel>
                                    <FormControl>
                                        <Input
                                            type={'date'}
                                            value={field.value}
                                            onChange={(e) => {
                                                field.onChange(e.target.value)
                                            }}
                                            min={new Date(Date.now() + 3600000).toISOString().split('T')[0]}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <SingleImageUpload
                                        className='mt-2'
                                        file={field.value}
                                        setFile={(file) => {
                                            field.onChange(file)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className={cn(
                                "cursor-pointer",
                                form.formState.isSubmitting && "cursor-default opacity-50"
                            )}
                        >
                            {form.formState.isSubmitting ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                "Continue"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CreateCharityFormComponent