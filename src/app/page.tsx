import Watchlist from '@/components/watchlist/Watchlist';
import { CandlestickChart } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 border-b border-border sticky top-0 bg-background/90 backdrop-blur-sm z-10">
        <div className="container mx-auto flex items-center gap-2">
          <CandlestickChart className="size-6 text-primary" />
          <h1 className="text-xl font-headline font-bold text-foreground">
            StockFlash
          </h1>
        </div>
      </header>
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-headline font-bold tracking-tight text-primary">Your Personal Watchlist</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Monitor your favorite stocks in real-time. Add tickers to get started and receive AI-powered alerts on unusual price movements.
          </p>
        </div>
        <Watchlist />
      </main>
       <footer className="p-4 mt-8 border-t border-border">
          <div className="container mx-auto text-center text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} StockFlash. All Rights Reserved. Data provided by Financial Modeling Prep.
          </div>
      </footer>
    </div>
  );
}
