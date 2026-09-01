/**
 * WebGPU capability detection.
 *
 * Returns a result object rather than throwing — callers decide how to render
 * the unsupported state.
 */
export interface WebGPUCheckResult {
  supported: boolean;
  reason?: string;
}

export async function checkWebGPU(): Promise<WebGPUCheckResult> {
  // 1. API existence
  if (!navigator.gpu) {
    return {
      supported: false,
      reason:
        'Your browser does not support WebGPU. Please use Chrome or Edge 113+ on desktop, or Chrome 121+ on Android.',
    };
  }

  // 2. Adapter availability (can fail on unsupported hardware)
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        reason:
          'WebGPU is available but no compatible GPU adapter was found. Your device may not have a supported GPU.',
      };
    }
    return { supported: true };
  } catch {
    return {
      supported: false,
      reason:
        'Failed to initialize WebGPU. Your GPU driver may need an update.',
    };
  }
}
