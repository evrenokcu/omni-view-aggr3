// src/app/api/aggregated-price/route.ts
import { NextResponse } from 'next/server';
import { LlmConfigService } from '@/lib/LlmService';

export async function GET() {
    try {
        const aggregatedPriceResponse = await LlmConfigService.getLlmConfigurations();
        return NextResponse.json(aggregatedPriceResponse);
    } catch {
        return NextResponse.json(
            { error: 'Failed to load AggregatedPriceResponse.' },
            { status: 500 }
        );
    }
}