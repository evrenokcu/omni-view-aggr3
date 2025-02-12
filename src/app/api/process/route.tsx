
import { SingleLlmRequest, LlmResponse } from '@/components/types';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {

    try {
        const body: SingleLlmRequest = await request.json();
        const apiUrl = process.env.REST_API_URL;
        if (!apiUrl) {
            throw new Error("REST_API_URL is not defined in environment variables");
        }

        const response = await fetch(apiUrl, {

            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            return NextResponse.json({ error: errorResponse?.detail || "Error from LLM service" }, { status: response.status });
        }


        const data: LlmResponse = await response.json();

        console.log(response.json);

        return NextResponse.json(data)
    } catch (err) {
        console.error('Error in POST handler:', err);
        return NextResponse.json({ error: "An internal server error occurred" }, { status: 500 });
    }
}