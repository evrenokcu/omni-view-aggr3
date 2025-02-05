import { LlmConfigurationsList, LlmModelConfig } from '@/components/types';
import fs from 'fs/promises'; // Cleaner async handling
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

        try {
            const registryContent = await fs.readFile(this.registryFilePath, 'utf8');
            const registryData: LlmModelConfig[] = JSON.parse(registryContent);

            if (!Array.isArray(registryData)) {
                throw new Error("Invalid format: Expected an array of LlmModelConfig objects");
            }

            // Ensure `id` field is computed and keep only enabled entries
            const responses: LlmModelConfig[] = registryData
                .map(entry => ({
                    ...entry,
                    id: `${entry.model.llm_name}:${entry.model.model_name}`, // Compute id
                }))
                .filter(entry => entry.enabled); // Keep only enabled configurations

            this.cache = { responses };
            this.lastReadTimestamp = now;
            return this.cache;
        } catch (error) {
            console.error('Error loading Llm Configurations:', error);
            throw error;
        }
    }
}