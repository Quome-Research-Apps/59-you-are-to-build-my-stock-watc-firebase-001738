'use server';

/**
 * @fileOverview An AI agent for detecting unusual price changes in stocks.
 *
 * - analyzePriceChange - A function that analyzes stock price changes and provides alerts.
 * - AnalyzePriceChangeInput - The input type for the analyzePriceChange function.
 * - AnalyzePriceChangeOutput - The return type for the analyzePriceChange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePriceChangeInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock.'),
  currentPrice: z.number().describe('The current price of the stock.'),
  historicalData: z
    .array(z.number())
    .describe('An array of recent historical prices for the stock.'),
});
export type AnalyzePriceChangeInput = z.infer<typeof AnalyzePriceChangeInputSchema>;

const AnalyzePriceChangeOutputSchema = z.object({
  isUnusual: z
    .boolean()
    .describe(
      'Whether the current price change is unusual compared to historical data.'
    ),
  alertMessage: z
    .string()
    .describe(
      'A message describing the price change and why it is considered unusual.'
    ),
});
export type AnalyzePriceChangeOutput = z.infer<typeof AnalyzePriceChangeOutputSchema>;

export async function analyzePriceChange(
  input: AnalyzePriceChangeInput
): Promise<AnalyzePriceChangeOutput> {
  return analyzePriceChangeFlow(input);
}

const analyzePriceChangePrompt = ai.definePrompt({
  name: 'analyzePriceChangePrompt',
  input: {schema: AnalyzePriceChangeInputSchema},
  output: {schema: AnalyzePriceChangeOutputSchema},
  prompt: `You are an expert financial analyst. You will analyze stock price data to determine if recent price movements are unusual compared to its historical data.

  Ticker Symbol: {{{ticker}}}
  Current Price: {{{currentPrice}}}
  Historical Data: {{{historicalData}}}

  Determine if the current price is significantly different from the historical data. Consider factors like volatility and recent trends.

  If the price change is unusual, set isUnusual to true and provide an alertMessage explaining the situation. If the price change is within the normal range, set isUnusual to false and provide a message indicating that the price change is normal.

  Ensure that the alertMessage is concise and informative.
`,
});

const analyzePriceChangeFlow = ai.defineFlow(
  {
    name: 'analyzePriceChangeFlow',
    inputSchema: AnalyzePriceChangeInputSchema,
    outputSchema: AnalyzePriceChangeOutputSchema,
  },
  async input => {
    const {output} = await analyzePriceChangePrompt(input);
    return output!;
  }
);
