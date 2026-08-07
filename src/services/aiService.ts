import { Equipment, MaintenanceRecord, CalibrationRecord } from '../types';

export interface AIAnalysisResponse {
  result: string;
  task: string;
  timestamp: string;
}

export interface AIChatResponse {
  response: string;
  timestamp: string;
}

export const aiService = {
  /**
   * Universal AI Analysis endpoint (Compliance, Risk, Maintenance, Summary, Explain)
   */
  async analyze(
    task: 'compliance' | 'risk' | 'maintenance' | 'summary' | 'explain',
    payload?: {
      equipment?: Equipment[] | Equipment;
      maintenance?: MaintenanceRecord[];
      calibration?: CalibrationRecord[];
      issueText?: string;
      history?: any[];
      [key: string]: any;
    }
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task, payload }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status ${response.status}`);
      }

      const data: AIAnalysisResponse = await response.json();
      return data.result || 'No analysis generated.';
    } catch (err: any) {
      console.warn(`[AI Service] ${task} analysis request failed:`, err);
      return `⚠️ Unable to connect to Gemini AI Service (${err.message || 'Network failure'}). Please check system status or retry shortly.`;
    }
  },

  /**
   * Compliance Analysis
   */
  async analyzeCompliance(equipmentList: Equipment[], calibrationRecords?: CalibrationRecord[]) {
    return this.analyze('compliance', { equipment: equipmentList, calibration: calibrationRecords });
  },

  /**
   * Risk Analysis
   */
  async analyzeRisk(equipmentList: Equipment[], maintenanceRecords?: MaintenanceRecord[]) {
    return this.analyze('risk', { equipment: equipmentList, maintenance: maintenanceRecords });
  },

  /**
   * Maintenance Prediction
   */
  async predictMaintenance(equipmentList: Equipment[], maintenanceRecords?: MaintenanceRecord[]) {
    return this.analyze('maintenance', { equipment: equipmentList, maintenance: maintenanceRecords });
  },

  /**
   * Equipment Summary
   */
  async summarizeEquipment(equipment: Equipment, history?: any[]) {
    return this.analyze('summary', { equipment, history });
  },

  /**
   * AI Explain Issue
   */
  async explainIssue(issueText: string, equipment?: Equipment) {
    return this.analyze('explain', { issueText, equipment });
  },

  /**
   * Chat Assistant (Non-streaming fallback)
   */
  async chat(
    message: string,
    history: { role: string; content: string }[] = [],
    contextData?: any
  ): Promise<string> {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, contextData }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: AIChatResponse = await response.json();
      return data.response;
    } catch (err: any) {
      console.warn('[AI Service] Chat request failed:', err);
      return `⚠️ MedGuard AI Chat offline: ${err.message || 'Connection error'}. Please try again.`;
    }
  },

  /**
   * Chat Assistant with Real-Time Streaming (Server-Sent Events)
   */
  async chatStream(
    message: string,
    history: { role: string; content: string }[] = [],
    contextData: any = null,
    onChunk: (chunkText: string) => void,
    onError?: (err: Error) => void,
    onComplete?: (fullText: string) => void
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, contextData }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}: Failed to open stream`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep trailing incomplete chunk

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              if (onComplete) onComplete(accumulatedText);
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                onChunk(parsed.text);
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              // Raw text chunk fallback
              accumulatedText += dataStr;
              onChunk(dataStr);
            }
          }
        }
      }

      if (onComplete) onComplete(accumulatedText);
    } catch (err: any) {
      console.error('[AI Service] Chat stream error:', err);
      if (onError) {
        onError(err);
      } else {
        onChunk(`⚠️ Streaming error: ${err.message || 'Connection interrupted'}`);
      }
    }
  }
};
