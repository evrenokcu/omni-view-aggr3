// src/lib/LLMService.tsx
import { AggregatedPrice, AggregatedPriceResponse, LlmModelConfig } from '@/components/types';
import fs from 'fs';
import path from 'path';

/** 
 * Represents a language model.
 */


/**
 * LLMService is responsible for loading the AggregatedPriceResponse from files.
 * It caches the response and reloads it only if the cache is older than one minute.
 *
 * In this updated version, two files are read:
 *
 * 1. aggregatedPriceResponse.json — originally containing pricing data keyed by IDs.
 * 2. llm_registry.json — containing an array of LLM registration entries.
 *
 * The service then merges the two sources: the registry file is used as the base,
 * and when matching pricing data is found in the aggregated file (by computed ID),
 * that pricing and timestamp are added to the entry.
 *
 * Finally, only enabled entries are returned.
 */
export class LLMService {
    // Cached AggregatedPriceResponse.
    private static cache: AggregatedPriceResponse | null = null;
    // Timestamp (in milliseconds) when the cache was last updated.
    private static lastReadTimestamp: number = 0;
    // Cache Time-To-Live: 1 minute (60,000 milliseconds)
    private static readonly cacheTTL = 60 * 1000;
    // Absolute path to the JSON files.
    private static readonly aggregatedFilePath = path.join(
        process.cwd(),
        'config',
        'aggregatedPriceResponse.json'
    );
    private static readonly registryFilePath = path.join(
        process.cwd(),
        'config',
        'llm_registry.json'
    );

    /**
     * Returns the AggregatedPriceResponse. If the cache is empty or stale (older than one minute),
     * it reads the files again to update the cache.
     */
    public static async getAggregatedPriceResponse(): Promise<AggregatedPriceResponse> {
        const now = Date.now();

        if (!this.cache || now - this.lastReadTimestamp > this.cacheTTL) {
            try {
                // Read both files concurrently.
                const [aggregatedContent, registryContent] = await Promise.all([
                    fs.promises.readFile(this.aggregatedFilePath, 'utf8'),
                    fs.promises.readFile(this.registryFilePath, 'utf8')
                ]);

                // Parse the aggregated pricing file.
                const aggregatedData = JSON.parse(aggregatedContent);
                if (typeof aggregatedData !== 'object' || aggregatedData === null || Array.isArray(aggregatedData)) {
                    throw new Error("Invalid format in aggregatedPriceResponse.json: expected an object mapping IDs to entries.");
                }

                // Parse the registry file; expect an array.
                const registryData = JSON.parse(registryContent);
                if (!Array.isArray(registryData)) {
                    throw new Error("Invalid format in llm_registry.json: expected an array of entries.");
                }

                // Create a Map to hold merged AggregatedPrice entries keyed by the computed id.
                const resultMap = new Map<string, AggregatedPrice>();

                // First, process the registry file.
                // For each registry entry, compute the id as `${llm_name}:${model_name}`.
                for (const entry of registryData) {
                    if (!entry.model || !entry.model.llm_name || !entry.model.model_name) {
                        continue; // skip invalid entries
                    }
                    const id = `${entry.model.llm_name}:${entry.model.model_name}`;
                    const config: LlmModelConfig = {
                        model: {
                            llm_name: entry.model.llm_name,
                            model_name: entry.model.model_name,
                            id,
                        },
                        enabled: entry.enabled !== undefined ? entry.enabled : true,
                        color: entry.color !== undefined ? entry.color : "blue",
                        initial_char: entry.initial_char !== undefined ? entry.initial_char : entry.model.llm_name.charAt(0),
                        id,
                    };
                    resultMap.set(id, { config });
                }

                // Next, process the aggregated pricing data.
                // This file is expected to be an object where each key corresponds to a model id.
                for (const key in aggregatedData) {
                    if (Object.prototype.hasOwnProperty.call(aggregatedData, key)) {
                        const entry = aggregatedData[key];

                        // Build the config from aggregated data.
                        // (Note: if the same id exists from the registry, the registry data takes precedence.)
                        const config: LlmModelConfig = {
                            model: {
                                llm_name: entry.model.llm_name,
                                model_name: entry.model.model_name,
                                id: key,
                            },
                            enabled: entry.enabled !== undefined ? entry.enabled : true,
                            color: entry.color !== undefined ? entry.color : "blue",
                            initial_char: entry.initial_char !== undefined ? entry.initial_char : entry.model.llm_name.charAt(0),
                            id: key,
                        };

                        if (resultMap.has(key)) {
                            // Update the existing entry with pricing info.
                            const existingEntry = resultMap.get(key)!;
                            existingEntry.price = entry.pricing;
                            existingEntry.timestamp = entry.timestamp;
                        } else {
                            // Add the aggregated entry if it wasn’t in the registry.
                            resultMap.set(key, { config, price: entry.pricing, timestamp: entry.timestamp });
                        }
                    }
                }

                // Filter out any entries that are not enabled.
                const responses = Array.from(resultMap.values()).filter((agg) => agg.config.enabled);

                // Build the final AggregatedPriceResponse.
                const aggregatedPriceResponse: AggregatedPriceResponse = { responses };

                // Update the cache.
                this.cache = aggregatedPriceResponse;
                this.lastReadTimestamp = now;
            } catch (error) {
                console.error('Error reading AggregatedPriceResponse from file(s):', error);
                throw error;
            }
        }

        return this.cache;
    }
}