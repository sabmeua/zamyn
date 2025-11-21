'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: '新規' },
    position: { x: 250, y: 50 },
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'アサイン待ち' },
    position: { x: 100, y: 200 },
  },
  {
    id: '3',
    type: 'default',
    data: { label: '対応中' },
    position: { x: 400, y: 200 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

export default function WorkflowEditorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(4);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addNode = () => {
    const newNode: Node = {
      id: `${nodeIdCounter}`,
      type: 'default',
      data: { label: `ステート${nodeIdCounter}` },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((c) => c + 1);
  };

  const saveWorkflow = () => {
    const workflow = {
      nodes,
      edges,
    };
    console.log('Workflow saved:', JSON.stringify(workflow, null, 2));
  };

  return (
    <div className="h-screen w-full flex flex-col">
      <div className="p-4 border-b bg-white">
        <h1 className="text-2xl font-bold mb-4">ワークフローエディター</h1>
        <div className="flex gap-2">
          <Button onClick={addNode}>ステート追加</Button>
          <Button onClick={saveWorkflow} variant="outline">
            保存
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
