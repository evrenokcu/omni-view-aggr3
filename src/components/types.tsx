
export interface LlmModel {
    llm_name: string; // e.g. "ChatGPT", "CLAUDE", "Gemini"
    model_name: string;
    // Computed field (typically computed as `${llm_name}:${model_name}`)
    //id: string;
}

/**
 * Represents the configuration for an LLM model.
 */
export interface LlmModelConfig {
    model: LlmModel;
    enabled: boolean;
    color: string;
    initial_char: string; // expected to be a single character
    // Computed field (using the nested model's id)
    id: string;
}
export interface SingleLlmRequest {
    llm: LlmModel;
    prompt: string;
}

// /**
//  * Represents an aggregated price entry.
//  * (We include pricing here in case you want to use it; if not, you can ignore it.)
//  */
// export interface LlmModelConfigurations {
//     config: LlmModelConfig;
//     // price?: ModelPrice;
//     // Optionally, you could also include a timestamp if needed.
//     // timestamp?: string;
// }

/**
 * Represents the overall aggregated price response.
 */
// export interface LlmConfigurationsList {
//     responses: LlmModelConfig[];
// }

// LlmConfigurationsList with dictionary structure
export interface LlmConfigurationsList {
    responses: {
        [modelId: string]: LlmModelConfig; // Dictionary for O(1) look-up
    };

    // Method to get LlmModelConfig by LlmModel
    getLlmModelConfig: (model: LlmModel) => LlmModelConfig | undefined;
    // Add getRandomLlm method to the interface
    getRandomLlm: () => LlmModel;
}

export interface LlmModel {
    llm_name: string; // e.g. "ChatGPT", "CLAUDE", "Gemini"
    model_name: string;
    // Computed field (typically computed as `${llm_name}:${model_name}`)
    id: string;
}

export interface LlmResponse {
    llm: LlmModel;
    response: string;
    timestamp: string;
    status: string;
    assessment?: string;
    response_time: number;
    token_count: number;
    price: number;
    estimated_cost: number;
    input_tokens: number;
    output_tokens: number;
}

export interface LlmResponses {
    responses: Array<LlmResponse>;
    summary: LlmResponse;
}
export class DefaultLlmResponse implements LlmResponse {
    llm: LlmModel;
    response: string;
    timestamp: string;
    status: string;
    assessment?: string;
    response_time: number;
    token_count: number;
    price: number;
    estimated_cost: number;
    input_tokens: number;
    output_tokens: number;

    constructor(llm: LlmModel, status: string) {
        this.llm = llm;
        this.response = "";
        this.timestamp = new Date().toISOString();
        this.status = status;
        this.assessment = undefined;
        this.response_time = 0;
        this.token_count = 0;
        this.price = 0;
        this.estimated_cost = 0;
        this.input_tokens = 0;
        this.output_tokens = 0;
    }

    // Factory method to create a response with status 'pending'
    static createPending(llm: LlmModel): DefaultLlmResponse {
        return new DefaultLlmResponse(llm, "pending");
    }

    // Factory method to create a response with status 'created'
    static createCreated(llm: LlmModel): DefaultLlmResponse {
        return new DefaultLlmResponse(llm, "created");
    }
    static createError(llm: LlmModel): DefaultLlmResponse {
        return new DefaultLlmResponse(llm, "error");
    }
}


export class DefaultLlmResponses implements LlmResponses {
    responses: Array<LlmResponse>;
    summary: LlmResponse;

    constructor(aggregatedPriceData?: LlmConfigurationsList) {
        // Extract models from the responses dictionary using Object.values()
        const models = aggregatedPriceData
            ? Object.values(aggregatedPriceData.responses).map(entry => entry.model)
            : [];

        this.responses = models.map((name) => DefaultLlmResponse.createPending(name));
        this.summary = DefaultLlmResponse.createCreated(models[0]);
    }
}

export function updateLlmResponses(
    llmResponsesArray: LlmResponses[],
    idx: number,
    updateFn: (item: LlmResponses) => LlmResponses
): LlmResponses[] {
    if (idx < 0 || idx >= llmResponsesArray.length) {
        throw new Error("Index out of bounds");
    }
    const updated = [...llmResponsesArray];
    const currentResponses = { ...updated[idx] };
    updated[idx] = updateFn(currentResponses);
    return updated;
}
export function insertLlmResponses(
    llmResponsesArray: LlmResponses[],
    newIndex: number,
    llmIndex: number,
    updateFn: () => LlmResponse
): LlmResponses[] {
    //Ensure the index is valid
    if (llmIndex < 0 || llmIndex > llmResponsesArray.length + 1) {
        throw new Error("Index out of bounds");
    }
    const updated = [...llmResponsesArray];
    const currentResponses = { ...updated[newIndex] };
    const newResponses = [...currentResponses.responses];
    newResponses[llmIndex] = updateFn();
    currentResponses.responses = newResponses;
    updated[newIndex] = currentResponses;
    return updated;
}

export function formatTimestamp(isoString: string): string {
    const timestamp = new Date(isoString);
    const today = new Date();

    // Check if the timestamp is today
    const isToday =
        timestamp.getDate() === today.getDate() &&
        timestamp.getMonth() === today.getMonth() &&
        timestamp.getFullYear() === today.getFullYear();

    if (isToday) {
        // Return time only if it's today
        return timestamp.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    // Otherwise, return date and time
    return `${timestamp.toLocaleDateString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })} ${timestamp.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
    })}`;
}
