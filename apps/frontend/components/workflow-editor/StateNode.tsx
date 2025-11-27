'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

export interface StateNodeData {
  label: string;
  color: string;
  icon: string;
  isInitial: boolean;
  isFinal: boolean;
}

function StateNode({ data }: NodeProps<StateNodeData>) {
  return (
    <div
      className="px-4 py-2 shadow-md rounded-md border-2 min-w-[150px]"
      style={{
        borderColor: data.color,
        backgroundColor: `${data.color}20`,
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="flex items-center gap-2">
        <span className="text-xl">{data.icon}</span>
        <div>
          <div className="font-bold text-sm">{data.label}</div>
          {data.isInitial && (
            <div className="text-xs text-gray-500">Initial State</div>
          )}
          {data.isFinal && (
            <div className="text-xs text-gray-500">Final State</div>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

export default memo(StateNode);
