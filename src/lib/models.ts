/**
 * Available models for the model picker.
 *
 * Ordered from smallest (default) to largest. IDs must match
 * entries in `prebuiltAppConfig.model_list` from @mlc-ai/web-llm.
 */
export interface ModelOption {
  id: string;
  label: string;
  size: string;
  cutoff: string;
  description: string;
  isHeavyForMobile?: boolean;
  vramEstimate?: string;
}

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen 2.5 0.5B',
    size: '~350 MB',
    cutoff: 'Sep 2024',
    description: 'Fastest download, great for quick tests',
    isHeavyForMobile: false,
    vramEstimate: '~1 GB',
  },
  {
    id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    label: 'Llama 3.2 1B',
    size: '~700 MB',
    cutoff: 'Dec 2023',
    description: 'Good balance of speed and quality',
    isHeavyForMobile: false,
    vramEstimate: '~1.5 GB',
  },
  {
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen 2.5 1.5B',
    size: '~1 GB',
    cutoff: 'Sep 2024',
    description: 'Smarter responses, moderate download',
    isHeavyForMobile: false,
    vramEstimate: '~1.8 GB',
  },
  {
    id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC',
    label: 'Qwen 2.5 Coder 1.5B',
    size: '~1 GB',
    cutoff: 'Sep 2024',
    description: 'Coding specialist model with late 2024 knowledge',
    isHeavyForMobile: false,
    vramEstimate: '~1.8 GB',
  },
  {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    label: 'SmolLM2 1.7B',
    size: '~1 GB',
    cutoff: 'Nov 2024',
    description: 'Compact and highly capable',
    isHeavyForMobile: false,
    vramEstimate: '~1.8 GB',
  },
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    label: 'Llama 3.2 3B',
    size: '~1.8 GB',
    cutoff: 'Dec 2023',
    description: 'Best quality, needs more VRAM',
    isHeavyForMobile: true,
    vramEstimate: '~2.8 GB',
  },
  {
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    label: 'Qwen 2.5 3B',
    size: '~2.3 GB',
    cutoff: 'Sep 2024',
    description: 'Strong general intelligence & recent cutoff',
    isHeavyForMobile: true,
    vramEstimate: '~3.2 GB',
  },
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    label: 'Phi 3.5 Mini',
    size: '~2.2 GB',
    cutoff: 'Oct 2023',
    description: 'Strong reasoning, larger download',
    isHeavyForMobile: true,
    vramEstimate: '~3.2 GB',
  },
  {
    id: 'Phi-4-mini-instruct-q4f16_1-MLC',
    label: 'Phi-4 Mini 3.8B',
    size: '~2.3 GB',
    cutoff: 'Jun 2024',
    description: 'Latest Microsoft model with June 2024 knowledge cutoff',
    isHeavyForMobile: true,
    vramEstimate: '~3.5 GB',
  },
  {
    id: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
    label: 'DeepSeek R1 Distill 7B',
    size: '~5.1 GB',
    cutoff: 'Jul 2024',
    description: 'Advanced reasoning model with July 2024 cutoff',
    isHeavyForMobile: true,
    vramEstimate: '~6.0 GB',
  },
  {
    id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    label: 'Qwen 2.5 7B',
    size: '~5.1 GB',
    cutoff: 'Sep 2024',
    description: 'Full 7B model with September 2024 knowledge cutoff',
    isHeavyForMobile: true,
    vramEstimate: '~6.0 GB',
  },
];

export const DEFAULT_MODEL_ID = AVAILABLE_MODELS[0].id;

/**
 * Returns true if the given model ID is flagged as heavy / resource-intensive for mobile devices.
 */
export function isHeavyModel(modelId: string): boolean {
  const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
  return !!model?.isHeavyForMobile;
}
