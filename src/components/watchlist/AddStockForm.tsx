"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

const formSchema = z.object({
  ticker: z.string()
    .min(1, { message: 'Ticker symbol is required.' })
    .max(10, { message: 'Ticker must be 10 characters or less.' })
    .regex(/^[A-Z0-9.-]+$/, { message: "Invalid characters in ticker." })
    .transform(value => value.toUpperCase()),
});

interface AddStockFormProps {
  onAddTicker: (ticker: string) => void;
}

export function AddStockForm({ onAddTicker }: AddStockFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticker: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddTicker(values.ticker);
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-headline">
          <PlusCircle className="text-primary" />
          Add a Stock
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row items-start gap-4">
            <FormField
              control={form.control}
              name="ticker"
              render={({ field }) => (
                <FormItem className="w-full sm:w-auto sm:flex-grow">
                  <FormControl>
                    <Input 
                      placeholder="e.g., AAPL, GOOG"
                      aria-label="Stock Ticker"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Add to Watchlist
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
