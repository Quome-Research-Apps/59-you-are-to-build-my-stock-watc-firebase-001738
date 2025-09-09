"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { analyzePriceChange } from '@/ai/flows/price-change-alerts';
import { useToast } from '@/hooks/use-toast';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, AlertTriangle, TrendingUp, TrendingDown, CircleDot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;

interface StockData {
  name: string;
  price: number;
  change: number;
  changesPercentage: number;
}

interface StockRowProps {
  ticker: string;
  onRemove: (ticker: string) => void;
}

export function StockRow({ ticker, onRemove }: StockRowProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiAlert, setAiAlert] = useState<{ isUnusual: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const fetchStockData = useCallback(async () => {
    if (!API_KEY) {
        setError("API key is not configured.");
        setIsLoading(false);
        return;
    }
    
    try {
      setError(null);
      const quoteRes = await fetch(`https://financialmodelingprep.com/api/v3/quote/${ticker}?apikey=${API_KEY}`);
      if (!quoteRes.ok) throw new Error('Failed to fetch quote data.');
      const quoteData = await quoteRes.json();

      if (!quoteData || quoteData.length === 0 || quoteData[0].price === 0) {
        throw new Error('Invalid ticker or no data available.');
      }
      
      const { name, price, change, changesPercentage } = quoteData[0];
      setData({ name, price, change, changesPercentage });

      const historyRes = await fetch(`https://financialmodelingprep.com/api/v3/historical-price-full/${ticker}?timeseries=30&apikey=${API_KEY}`);
      if (!historyRes.ok) {
        console.warn(`Could not fetch historical data for ${ticker} for AI analysis.`);
        return;
      };
      const historyData = await historyRes.json();
      
      if (historyData.historical) {
        const historicalPrices = historyData.historical.map((d: any) => d.close).reverse();
        if (price && historicalPrices.length > 1) {
          const aiInput = {
            ticker: ticker,
            currentPrice: price,
            historicalData: historicalPrices,
          };
          const analysis = await analyzePriceChange(aiInput);
          if (analysis.isUnusual && aiAlert?.message !== analysis.alertMessage) {
              setAiAlert({ isUnusual: true, message: analysis.alertMessage });
              toast({
                  title: `Unusual Activity for ${ticker}`,
                  description: analysis.alertMessage,
                  variant: 'destructive',
              });
          } else if (!analysis.isUnusual) {
              setAiAlert({ isUnusual: false, message: 'Price activity is within normal range.' });
          }
        }
      }

    } catch (err: any) {
      setError(err.message || 'Failed to fetch data.');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [ticker, toast, aiAlert?.message]);

  useEffect(() => {
    fetchStockData();
    const interval = setInterval(fetchStockData, 60000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  if (isLoading) {
    return (
      <TableRow className="opacity-50">
        <TableCell>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </TableCell>
        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
        <TableCell className="text-right">
          <Skeleton className="h-9 w-9 inline-block rounded-md" />
        </TableCell>
      </TableRow>
    );
  }

  if (error) {
    return (
      <TableRow className="bg-destructive/10" role="alert">
        <TableCell>
          <div className="font-bold text-destructive">{ticker}</div>
          <div className="text-xs text-destructive/80">{error}</div>
        </TableCell>
        <TableCell colSpan={3}></TableCell>
        <TableCell className="text-right">
          <Button variant="ghost" size="icon" onClick={() => onRemove(ticker)} aria-label={`Remove ${ticker}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  if (!data) return null;

  const isPositive = data.change >= 0;

  return (
    <TableRow className="transition-colors duration-500 ease-in-out hover:bg-card/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
                {data.name ? data.name.charAt(0) : ticker.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold">{ticker}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-xs">{data.name}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="font-mono font-semibold text-lg">
        ${data.price?.toFixed(2)}
      </TableCell>
      <TableCell className={cn("font-mono hidden md:table-cell", isPositive ? 'text-positive' : 'text-negative')}>
        <div className="flex items-center gap-2">
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{data.change?.toFixed(2)} ({data.changesPercentage?.toFixed(2)}%)</span>
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        {aiAlert ? (
                            aiAlert.isUnusual ? (
                                <Badge variant="destructive" className="animate-pulse cursor-help">
                                    <AlertTriangle className="mr-1 h-3 w-3" />
                                    Unusual
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="cursor-help">
                                    <CircleDot className="mr-1 h-3 w-3 text-positive" />
                                    Normal
                                </Badge>
                            )
                        ) : (
                            <Badge variant="outline">Analyzing...</Badge>
                        )}
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{aiAlert?.message || "AI analysis in progress..."}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell className="text-right">
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onRemove(ticker)} aria-label={`Remove ${ticker} from watchlist`}>
                        <Trash2 className="h-4 w-4 text-muted-foreground transition-colors hover:text-destructive" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Remove {ticker}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}
