import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Upload, Edit3, ArrowRightLeft, CheckCircle2, AlertTriangle, Link2 } from 'lucide-react';
import { HashChip } from './HashChip.js';
import type { ProvenanceEvent } from '../lib/api.js';

interface TimelineProps {
  events: ProvenanceEvent[];
  chainIntact?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({ events, chainIntact = true }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center text-ops-muted font-mono text-xs border border-ops-border rounded-xl bg-ops-surface">
        NO PROVENANCE EVENTS LOGGED FOR THIS ASSET
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CREATE':
        return <PlusCircle className="w-4 h-4 text-ops-phosphor" />;
      case 'UPLOAD':
        return <Upload className="w-4 h-4 text-cyan-400" />;
      case 'MODIFY':
        return <Edit3 className="w-4 h-4 text-ops-amber" />;
      case 'TRANSFER':
        return <ArrowRightLeft className="w-4 h-4 text-purple-400" />;
      case 'VERIFY':
        return <CheckCircle2 className="w-4 h-4 text-ops-phosphorBright" />;
      default:
        return <Link2 className="w-4 h-4 text-ops-muted" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'CREATE':
        return 'border-ops-phosphor/50 bg-ops-phosphor/10';
      case 'UPLOAD':
        return 'border-cyan-400/50 bg-cyan-400/10';
      case 'MODIFY':
        return 'border-ops-amber/50 bg-ops-amber/10';
      case 'TRANSFER':
        return 'border-purple-400/50 bg-purple-400/10';
      case 'VERIFY':
        return 'border-ops-phosphorBright/50 bg-ops-phosphorBright/10';
      default:
        return 'border-ops-border bg-ops-surface';
    }
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6">
      {/* Continuous vertical connecting line */}
      <div
        className={`absolute left-3.5 sm:left-4.5 top-3 bottom-4 w-0.5 ${
          chainIntact
            ? 'bg-gradient-to-b from-ops-phosphor via-ops-phosphor/60 to-ops-border'
            : 'bg-ops-red'
        }`}
      />

      {events.map((event, index) => {
        let details: any = {};
        try {
          details = JSON.parse(event.details_json);
        } catch {}

        const isGenesis = event.prev_event_hash.startsWith('0000000000000000');

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.1 }}
            className="relative"
          >
            {/* Node Icon indicator */}
            <div
              className={`absolute -left-6 sm:-left-8 top-1.5 w-7 h-7 rounded-full border flex items-center justify-center shadow-sm z-10 ${getEventColor(
                event.event_type
              )}`}
            >
              {getEventIcon(event.event_type)}
            </div>

            {/* Event Card */}
            <div className="p-4 rounded-xl bg-ops-card border border-ops-border hover:border-ops-phosphor/30 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2 font-mono">
                  <span className="font-bold text-xs text-white">
                    #{index + 1} {event.event_type}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-ops-surface text-ops-muted">
                    ACTOR: {event.actor_user_id.substring(0, 8)}...
                  </span>
                </div>
                <span className="text-[11px] font-mono text-ops-dim">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>

              {/* Event Notes / Context */}
              {details.notes && (
                <p className="text-xs text-ops-text mb-3 font-sans">{details.notes}</p>
              )}
              {details.action && !details.notes && (
                <p className="text-xs text-ops-muted mb-3 font-sans">
                  Action: <span className="text-white">{details.action}</span>
                </p>
              )}

              {/* Cryptographic hash chaining visualization */}
              <div className="pt-2 mt-2 border-t border-ops-borderSubtle grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-ops-dim block mb-0.5">PREVIOUS EVENT HASH</span>
                  <HashChip
                    hash={event.prev_event_hash}
                    label={isGenesis ? 'GENESIS' : 'PARENT'}
                    length={8}
                  />
                </div>
                <div>
                  <span className="text-[10px] text-ops-dim block mb-0.5">CURRENT EVENT HASH</span>
                  <HashChip hash={event.event_hash} label="BLOCK" length={8} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
