'use client';

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import StateNode from './StateNode';
import { Workflow, WorkflowState, WorkflowAction } from '@/lib/api/workflows';

const nodeTypes = {
  stateNode: StateNode,
};

interface WorkflowEditorProps {
  workflow: Workflow;
  onSave: (nodes: Node[], edges: Edge[]) => Promise<void>;
}

export default function WorkflowEditor({ workflow, onSave }: WorkflowEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workflow) {
      const initialNodes: Node[] = workflow.states.map((state: WorkflowState) => ({
        id: state.id,
        type: 'stateNode',
        position: state.position || { x: 0, y: 0 },
        data: {
          label: state.displayName,
          color: state.color,
          icon: state.icon,
          isInitial: state.isInitial,
          isFinal: state.isFinal,
        },
      }));

      const initialEdges: Edge[] = workflow.actions.map((action: WorkflowAction) => ({
        id: action.id,
        source: action.fromStateId,
        target: action.toStateId,
        label: action.name,
        type: action.triggerType === 'AUTO' ? 'smoothstep' : 'default',
        animated: action.triggerType === 'AUTO',
      }));

      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [workflow, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(nodes, edges);
    } catch (error) {
      console.error('Failed to save workflow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[600px] w-full border rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      
      <div className="p-4 border-t flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Workflow'}
        </button>
      </div>
    </div>
  );
}
