import { NextRequest } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
    const isTest = false;
    if (isTest) {
        try {
            const { text, llm } = await request.json() as { text: string, llm: string };

            // Wait randomly between 1 and 10 seconds
            const delay = Math.floor(Math.random() * 6000); // 0 to 2000 ms
            await new Promise((res) => setTimeout(res, delay));

            const processed = `Processed: ${text}`;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const responses: { [key: string]: any } = {
                "Claude": {
                    llm: "Claude",
                    response: `${processed} - Claude's response`,
                    timestamp: new Date().toISOString(),
                    status: "completed"
                },
                "ChatGPT": {
                    llm: "ChatGPT",
                    response: `${processed} - ChatGPT's response`,
                    timestamp: new Date().toISOString(),
                    status: "completed",
                    assessment: "This response was generated by ChatGPT."
                },
                "Gemini": {
                    llm: "Gemini",
                    response: `${processed} - Gemini's response`,
                    timestamp: new Date().toISOString(),
                    status: "completed"
                }
                // ,
                // "Groq": {
                //     llm: "Groq",
                //     response: `${processed} - Groq's response`,
                //     timestamp: new Date().toISOString(),
                //     status: "completed"
                // }

            };

            if (!responses[llm]) {
                return new Response(JSON.stringify({ error: 'Unknown LLM' }), { status: 400 });
            }

            return new Response(JSON.stringify(responses[llm]), { status: 200 });
        } catch {
            return new Response(JSON.stringify({ error: 'Invalid Input' }), { status: 400 });
        }
    }
    else {
        try {
            // Extract input from the request body
            const { text, llm } = await request.json() as { text: string; llm: string };

            // Validate input
            if (!text || !llm) {
                return new Response(JSON.stringify({ error: 'Both text and llm are required' }), { status: 400 });
            }

            const apiUrl = process.env.REST_API_URL;

            if (!apiUrl) {
                throw new Error("REST_API_URL is not defined in environment variables");
            }

            // Call the REST API
            //const response = await fetch('https://step1-597659953171.us-central1.run.app/', {
            const response = await fetch(apiUrl, {

                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    llm_name: llm,
                    prompt: text,
                }),
            });

            if (!response.ok) {
                const errorResponse = await response.json();
                return new Response(JSON.stringify({ error: errorResponse.detail || 'Error from LLM service' }), {
                    status: response.status,
                });
            }

            // Parse the response and return it
            const data = await response.json();
            return new Response(JSON.stringify(data), { status: 200 });
        } catch (err) {
            console.error('Error in POST handler:', err);
            return new Response(JSON.stringify({ error: 'An error occurred' }), { status: 500 });
        }
    }

}