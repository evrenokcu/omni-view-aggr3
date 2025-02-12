import { LlmConfigurationsList, LlmModelConfig, LlmModel } from '@/components/types';
import fs from 'fs/promises';
import path from 'path';

export class LlmConfigService {
    private static cache: LlmConfigurationsList | null = null;
    private static lastReadTimestamp = 0;
    private static readonly cacheTTL = 60 * 1000; // 1 minute
    private static readonly configDir = process.env.CACHE_DIR || path.join(process.cwd(), 'config');
    private static readonly registryFilePath = path.join(this.configDir, 'llm_registry.json');

    public static async getLlmConfigurations(): Promise<LlmConfigurationsList> {
        const now = Date.now();
        if (this.cache && now - this.lastReadTimestamp <= this.cacheTTL) return this.cache;
        const defaultModel: LlmModel = {
            llm_name: "DefaultLLM",
            model_name: "default",
            id: "DefaultLLM:default",
        };
        try {
            const registryContent = await fs.readFile(this.registryFilePath, 'utf8');
            const registryData: LlmModelConfig[] = JSON.parse(registryContent);

            if (!Array.isArray(registryData)) {
                throw new Error("Invalid format: Expected an array of LlmModelConfig objects");
            }

            // Convert to dictionary where id is the key
            const responses: { [modelId: string]: LlmModelConfig } = registryData
                .map(entry => ({
                    ...entry,
                    id: `${entry.model.llm_name}:${entry.model.model_name}`, // Compute id
                }))
                .filter(entry => entry.enabled) // Keep only enabled configurations
                .reduce((acc, entry) => {
                    acc[entry.id] = entry; // Add to dictionary with id as the key
                    return acc;
                }, {} as { [modelId: string]: LlmModelConfig });

            // Add the `getLlmModelConfig` and `getRandomLlm` methods to the object
            const llmConfigurations: LlmConfigurationsList = {
                responses,
                getLlmModelConfig: function (model: LlmModel) {
                    return this.responses[model.id];
                },


                getRandomLlm: function () {
                    const keys = Object.keys(this.responses);
                    if (keys.length === 0) return defaultModel// Return undefined if no models

                    const randomIndex = Math.floor(Math.random() * keys.length);
                    const randomKey = keys[randomIndex];
                    return this.responses[randomKey].model;
                },
            };

            // Store the cache
            this.cache = llmConfigurations;
            this.lastReadTimestamp = now;
            return this.cache;
        } catch (error) {
            console.error('Error loading Llm Configurations:', error);
            throw error;
        }
    }
}
