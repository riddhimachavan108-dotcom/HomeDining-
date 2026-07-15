"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getPendingOrderIds } from "@/lib/admin-actions";

/**
 * Keeps a hotel's orders screen "alive": every few seconds it checks for new
 * paid orders and, if any are unacknowledged, plays a repeating ring (like a
 * phone) until staff tap "Order seen". Browsers require one tap first to allow
 * sound, so we show an "enable sound" prompt.
 */
export default function OrderAlarm({ slug }: { slug: string }) {
  const router = useRouter();
  const [pending, setPending] = useState<string[]>([]);
  const [ack, setAck] = useState<string[]>([]);
  const [soundOn, setSoundOn] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const ringRef = useRef<number | null>(null);
  const prevKey = useRef<string>("__init__");
  const ackKey = `hd_ack_${slug}`;

  // load acknowledged ids for this device
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ackKey);
      if (raw) setAck(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [ackKey]);

  const saveAck = useCallback(
    (ids: string[]) => {
      setAck(ids);
      try {
        localStorage.setItem(ackKey, JSON.stringify(ids));
      } catch {
        /* ignore */
      }
    },
    [ackKey]
  );

  // poll for pending (paid, unhandled) orders
  useEffect(() => {
    let alive = true;
    async function poll() {
      let ids: string[] = [];
      try {
        ids = await getPendingOrderIds(slug);
      } catch {
        return;
      }
      if (!alive) return;
      const key = ids.join(",");
      if (key !== prevKey.current) {
        prevKey.current = key;
        setPending(ids);
        router.refresh(); // update the visible order cards
      }
    }
    poll();
    const t = setInterval(poll, 8000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [slug, router]);

  // keep acknowledged list trimmed to what's still pending
  useEffect(() => {
    setAck((prev) => {
      const next = prev.filter((id) => pending.includes(id));
      if (next.length !== prev.length) {
        try {
          localStorage.setItem(ackKey, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }, [pending, ackKey]);

  const unack = pending.filter((id) => !ack.includes(id));
  const ringing = soundOn && unack.length > 0;

  // ring loop while there are unacknowledged orders
  useEffect(() => {
    function ringOnce() {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;
      const beep = (f: number, s: number, d: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = f;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, s);
        g.gain.exponentialRampToValueAtTime(0.5, s + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, s + d);
        o.start(s);
        o.stop(s + d);
      };
      beep(1100, t, 0.16);
      beep(1100, t + 0.26, 0.16); // "tring-tring"
    }
    if (ringing) {
      ringOnce();
      ringRef.current = window.setInterval(ringOnce, 1600);
      return () => {
        if (ringRef.current) {
          clearInterval(ringRef.current);
          ringRef.current = null;
        }
      };
    }
  }, [ringing]);

  function enableSound() {
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctx) return;
      const ctx = ctxRef.current ?? new Ctx();
      ctxRef.current = ctx;
      ctx.resume();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      o.start();
      o.stop(ctx.currentTime + 0.2);
      setSoundOn(true);
    } catch {
      /* ignore */
    }
  }

  function acknowledge() {
    saveAck(Array.from(new Set([...ack, ...pending])));
  }

  if (!soundOn) {
    return (
      <button className="alarm-bar alarm-enable" onClick={enableSound}>
        🔔 Tap to turn on new-order sound alerts
      </button>
    );
  }
  if (ringing) {
    return (
      <div className="alarm-bar alarm-ring">
        <span className="alarm-msg">
          🔔 New order! ({unack.length} waiting)
        </span>
        <button className="alarm-btn" onClick={acknowledge}>
          Order seen — stop
        </button>
      </div>
    );
  }
  return (
    <div className="alarm-bar alarm-idle">
      🔔 Sound alerts are on — keep this screen open to be notified of new orders.
    </div>
  );
}
