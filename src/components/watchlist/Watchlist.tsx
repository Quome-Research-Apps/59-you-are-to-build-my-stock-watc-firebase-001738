"use client";

import React, { useState, useEffect } from 'react';
import { AddStockForm } from './AddStockForm';
import { StockRow } from './StockRow';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const WATCHLIST_STORAGE_KEY = 'stockflash-watchlist';

export default function Watchlist() {
  const [tickers, setTickers] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const savedTickers = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      if (savedTickers) {
        setTickers(JSON.parse(savedTickers));
      }
    } catch (error) {
      console.error("Failed to parse tickers from localStorage", error);
      localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(tickers));
    }
  }, [tickers, isClient]);

  const addTicker = (ticker: string) => {
    const upperCaseTicker = ticker.toUpperCase();
    if (upperCaseTicker && !tickers.includes(upperCaseTicker)) {
      setTickers(prevTickers => [upperCaseTicker, ...prevTickers]);
    }
  };

  const removeTicker = (tickerToRemove: string) => {
    setTickers(prevTickers => prevTickers.filter(ticker => ticker !== tickerToRemove));
  };
  
  if (!isClient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[158px] w-full rounded-lg" />
        <div className="rounded-lg border">
            <Skeleton className="h-12 w-full rounded-t-lg" />
            <div className="p-4 space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AddStockForm onAddTicker={addTicker} />
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] sm:w-[150px] pl-6">Ticker</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="hidden md:table-cell">Change</TableHead>
              <TableHead className="hidden lg:table-cell">AI Alert</TableHead>
              <TableHead className="text-right w-[100px] pr-6">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
              {tickers.length > 0 ? (
                tickers.map(ticker => (
                  <StockRow key={ticker} ticker={ticker} onRemove={removeTicker} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Your watchlist is empty. Add a stock to get started.
                  </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
