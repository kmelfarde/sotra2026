// Web Audio API Continuous Repeating Sound Alert / Ringtone for New Orders
// Rings non-stop until the store manager/admin receives the order ("استلام الطلب")

class OrderAlarmService {
  private audioCtx: AudioContext | null = null;
  private intervalId: any = null;
  private isRunning: boolean = false;

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    // If was running but waiting for gesture
    if (this.isRunning && !this.intervalId) {
      this.start();
    }
  }

  private playTone(freq: number, startTime: number, duration: number, gainValue = 0.3, type: OscillatorType = 'triangle') {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Slight upward pitch sweep for an energetic ring feel
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + duration * 0.4);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainValue, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      console.error('Error playing tone:', e);
    }
  }

  public playSingleRingtoneCycle() {
    this.initContext();
    if (!this.audioCtx) return;

    try {
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      const now = this.audioCtx.currentTime;

      // Note 1: E5 (659Hz)
      this.playTone(659.25, now + 0.00, 0.18, 0.35, 'triangle');
      // Note 2: G5 (784Hz)
      this.playTone(783.99, now + 0.14, 0.18, 0.35, 'triangle');
      // Note 3: C6 (1046Hz)
      this.playTone(1046.50, now + 0.28, 0.22, 0.4, 'triangle');
      // Note 4: E6 (1318Hz)
      this.playTone(1318.51, now + 0.42, 0.3, 0.45, 'triangle');

      // Double-bell accent chord (C6 + G6) at +0.70s with chime resonance
      this.playTone(1046.50, now + 0.68, 0.5, 0.35, 'sine');
      this.playTone(1567.98, now + 0.68, 0.6, 0.4, 'sine');
      this.playTone(2093.00, now + 0.72, 0.45, 0.25, 'triangle');
    } catch (err) {
      console.error('Order ringtone play error:', err);
    }
  }

  public start() {
    if (this.isRunning && this.intervalId) return;
    this.isRunning = true;

    this.initContext();

    // Play initial cycle immediately
    this.playSingleRingtoneCycle();

    // Clear any previous interval before starting
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Repeat melodious ringtone every 1.5 seconds continuously until stop() is invoked
    this.intervalId = setInterval(() => {
      if (!this.isRunning) {
        this.stop();
        return;
      }
      this.playSingleRingtoneCycle();
    }, 1500);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isActive(): boolean {
    return this.isRunning;
  }
}

export const orderAlarm = new OrderAlarmService();

// Auto-unlock AudioContext on first user interaction anywhere in the window
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    orderAlarm.resumeContext();
  };
  window.addEventListener('click', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}

// LocalStorage helpers for tracking acknowledged / received orders
const KEY_ACKNOWLEDGED = 'sotra_acknowledged_orders';

export function getAcknowledgedOrderIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY_ACKNOWLEDGED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markOrdersAsAcknowledged(orderIds: string[]) {
  try {
    const current = getAcknowledgedOrderIds();
    const merged = Array.from(new Set([...current, ...orderIds]));
    localStorage.setItem(KEY_ACKNOWLEDGED, JSON.stringify(merged));
    orderAlarm.stop();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sotra_orders_acknowledged', { detail: { orderIds: merged } }));
    }
  } catch (e) {
    console.error(e);
  }
}
