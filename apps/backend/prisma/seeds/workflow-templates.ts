import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedWorkflowTemplates(adminUserId: string) {
  return prisma.$transaction(async (tx) => {
    const existingTemplates = await tx.workflow.findMany({
      where: {
        customProperties: {
          path: ['template'],
          equals: true,
        },
      },
    });

    if (existingTemplates.length > 0) {
      console.log(`🗑️  既存テンプレート ${existingTemplates.length}件を削除中...`);
      
      for (const template of existingTemplates) {
        await tx.workflow.delete({ where: { id: template.id } });
      }
      
      console.log('✅ 既存テンプレート削除完了');
    }

    console.log('📋 カスタマーサポートワークフロー作成中...');
    const customerSupportWorkflow = await tx.workflow.create({
    data: {
      name: 'カスタマーサポート',
      description: 'お問い合わせ対応のための基本ワークフロー',
      isActive: true,
      customProperties: {
        category: 'support',
        template: true,
      },
      version: 1,
      createdById: adminUserId,
    },
  });

  const newState = await tx.workflowState.create({
    data: {
      workflowId: customerSupportWorkflow.id,
      name: 'new',
      displayName: '新規',
      color: '#0EA5E9', // Sky Blue
      icon: 'inbox',
      position: { x: 100, y: 200 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: true,
      isFinal: false,
    },
  });

  const inProgressState = await tx.workflowState.create({
    data: {
      workflowId: customerSupportWorkflow.id,
      name: 'in_progress',
      displayName: '対応中',
      color: '#10B981', // Emerald Green
      icon: 'clock',
      position: { x: 300, y: 200 },
      requiredProperties: { assigneeId: { required: true } },
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: false,
    },
  });

  const waitingState = await tx.workflowState.create({
    data: {
      workflowId: customerSupportWorkflow.id,
      name: 'waiting',
      displayName: '保留',
      color: '#F59E0B', // Amber
      icon: 'pause',
      position: { x: 300, y: 350 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: false,
    },
  });

  const resolvedState = await tx.workflowState.create({
    data: {
      workflowId: customerSupportWorkflow.id,
      name: 'resolved',
      displayName: '解決済み',
      color: '#8B5CF6', // Purple
      icon: 'check-circle',
      position: { x: 500, y: 200 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: false,
    },
  });

  const closedState = await tx.workflowState.create({
    data: {
      workflowId: customerSupportWorkflow.id,
      name: 'closed',
      displayName: '完了',
      color: '#64748B', // Slate Gray
      icon: 'x-circle',
      position: { x: 700, y: 200 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: true,
    },
  });

  await tx.workflowAction.createMany({
    data: [
      {
        workflowId: customerSupportWorkflow.id,
        name: '担当開始',
        triggerType: 'MANUAL',
        fromStateId: newState.id,
        toStateId: inProgressState.id,
        condition: null,
        sideEffects: { notify: ['assignee'] },
        order: 0,
      },
      {
        workflowId: customerSupportWorkflow.id,
        name: '保留',
        triggerType: 'MANUAL',
        fromStateId: inProgressState.id,
        toStateId: waitingState.id,
        condition: null,
        sideEffects: { notify: ['creator'] },
        order: 1,
      },
      {
        workflowId: customerSupportWorkflow.id,
        name: '再開',
        triggerType: 'MANUAL',
        fromStateId: waitingState.id,
        toStateId: inProgressState.id,
        condition: null,
        sideEffects: {},
        order: 2,
      },
      {
        workflowId: customerSupportWorkflow.id,
        name: '解決',
        triggerType: 'MANUAL',
        fromStateId: inProgressState.id,
        toStateId: resolvedState.id,
        condition: null,
        sideEffects: { notify: ['creator'] },
        order: 3,
      },
      {
        workflowId: customerSupportWorkflow.id,
        name: 'クローズ',
        triggerType: 'AUTO',
        fromStateId: resolvedState.id,
        toStateId: closedState.id,
        condition: { daysAfter: 7 },
        sideEffects: {},
        order: 4,
      },
    ],
  });

  console.log('✅ カスタマーサポートワークフロー作成完了');

  console.log('📋 バグ管理ワークフロー作成中...');
  const bugTrackingWorkflow = await tx.workflow.create({
    data: {
      name: 'バグ管理',
      description: 'ソフトウェアのバグ追跡・管理ワークフロー',
      isActive: true,
      customProperties: {
        category: 'development',
        template: true,
      },
      version: 1,
      createdById: adminUserId,
    },
  });

  const reportedState = await tx.workflowState.create({
    data: {
      workflowId: bugTrackingWorkflow.id,
      name: 'reported',
      displayName: '報告済み',
      color: '#EF4444', // Red
      icon: 'alert-circle',
      position: { x: 100, y: 200 },
      requiredProperties: { priority: { required: true } },
      assignConfig: { autoAssign: false },
      isInitial: true,
      isFinal: false,
    },
  });

  const confirmedState = await tx.workflowState.create({
    data: {
      workflowId: bugTrackingWorkflow.id,
      name: 'confirmed',
      displayName: '確認済み',
      color: '#F59E0B', // Amber
      icon: 'check',
      position: { x: 300, y: 200 },
      requiredProperties: { assigneeId: { required: true } },
      assignConfig: { autoAssign: true, roleId: 'developer' },
      isInitial: false,
      isFinal: false,
    },
  });

  const fixingState = await tx.workflowState.create({
    data: {
      workflowId: bugTrackingWorkflow.id,
      name: 'fixing',
      displayName: '修正中',
      color: '#10B981', // Emerald Green
      icon: 'tool',
      position: { x: 500, y: 200 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: false,
    },
  });

  const testingState = await tx.workflowState.create({
    data: {
      workflowId: bugTrackingWorkflow.id,
      name: 'testing',
      displayName: 'テスト中',
      color: '#8B5CF6', // Purple
      icon: 'flask',
      position: { x: 700, y: 200 },
      requiredProperties: {},
      assignConfig: { autoAssign: true, roleId: 'qa' },
      isInitial: false,
      isFinal: false,
    },
  });

  const fixedState = await tx.workflowState.create({
    data: {
      workflowId: bugTrackingWorkflow.id,
      name: 'fixed',
      displayName: '修正完了',
      color: '#64748B', // Slate Gray
      icon: 'check-circle',
      position: { x: 900, y: 200 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: true,
    },
  });

  await tx.workflowAction.createMany({
    data: [
      {
        workflowId: bugTrackingWorkflow.id,
        name: 'バグ確認',
        triggerType: 'MANUAL',
        fromStateId: reportedState.id,
        toStateId: confirmedState.id,
        condition: null,
        sideEffects: { notify: ['assignee'] },
        order: 0,
      },
      {
        workflowId: bugTrackingWorkflow.id,
        name: '修正開始',
        triggerType: 'MANUAL',
        fromStateId: confirmedState.id,
        toStateId: fixingState.id,
        condition: null,
        sideEffects: {},
        order: 1,
      },
      {
        workflowId: bugTrackingWorkflow.id,
        name: 'テスト依頼',
        triggerType: 'MANUAL',
        fromStateId: fixingState.id,
        toStateId: testingState.id,
        condition: null,
        sideEffects: { notify: ['qa_team'] },
        order: 2,
      },
      {
        workflowId: bugTrackingWorkflow.id,
        name: 'テストOK',
        triggerType: 'MANUAL',
        fromStateId: testingState.id,
        toStateId: fixedState.id,
        condition: null,
        sideEffects: { notify: ['creator', 'assignee'] },
        order: 3,
      },
      {
        workflowId: bugTrackingWorkflow.id,
        name: 'テストNG（修正へ戻す）',
        triggerType: 'MANUAL',
        fromStateId: testingState.id,
        toStateId: fixingState.id,
        condition: null,
        sideEffects: { notify: ['assignee'] },
        order: 4,
      },
    ],
  });

  console.log('✅ バグ管理ワークフロー作成完了');

  console.log('📋 シンプル承認ワークフロー作成中...');
  const approvalWorkflow = await tx.workflow.create({
    data: {
      name: 'シンプル承認',
      description: '上長承認が必要な申請のための簡易ワークフロー',
      isActive: true,
      customProperties: {
        category: 'approval',
        template: true,
      },
      version: 1,
      createdById: adminUserId,
    },
  });

  const draftState = await tx.workflowState.create({
    data: {
      workflowId: approvalWorkflow.id,
      name: 'draft',
      displayName: '下書き',
      color: '#94A3B8', // Gray
      icon: 'file-text',
      position: { x: 100, y: 200 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: true,
      isFinal: false,
    },
  });

  const pendingState = await tx.workflowState.create({
    data: {
      workflowId: approvalWorkflow.id,
      name: 'pending',
      displayName: '承認待ち',
      color: '#F59E0B', // Amber
      icon: 'clock',
      position: { x: 300, y: 200 },
      requiredProperties: { assigneeId: { required: true } },
      assignConfig: { autoAssign: true, roleId: 'manager' },
      isInitial: false,
      isFinal: false,
    },
  });

  const approvedState = await tx.workflowState.create({
    data: {
      workflowId: approvalWorkflow.id,
      name: 'approved',
      displayName: '承認済み',
      color: '#10B981', // Emerald Green
      icon: 'check-circle',
      position: { x: 500, y: 150 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: true,
    },
  });

  const rejectedState = await tx.workflowState.create({
    data: {
      workflowId: approvalWorkflow.id,
      name: 'rejected',
      displayName: '却下',
      color: '#EF4444', // Red
      icon: 'x-circle',
      position: { x: 500, y: 250 },
      requiredProperties: {},
      assignConfig: { autoAssign: false },
      isInitial: false,
      isFinal: true,
    },
  });

  await tx.workflowAction.createMany({
    data: [
      {
        workflowId: approvalWorkflow.id,
        name: '申請',
        triggerType: 'MANUAL',
        fromStateId: draftState.id,
        toStateId: pendingState.id,
        condition: null,
        sideEffects: { notify: ['assignee'] },
        order: 0,
      },
      {
        workflowId: approvalWorkflow.id,
        name: '承認',
        triggerType: 'MANUAL',
        fromStateId: pendingState.id,
        toStateId: approvedState.id,
        condition: null,
        sideEffects: { notify: ['creator'] },
        order: 1,
      },
      {
        workflowId: approvalWorkflow.id,
        name: '却下',
        triggerType: 'MANUAL',
        fromStateId: pendingState.id,
        toStateId: rejectedState.id,
        condition: null,
        sideEffects: { notify: ['creator'] },
        order: 2,
      },
    ],
  });

  console.log('✅ シンプル承認ワークフロー作成完了');

    return {
      customerSupportWorkflow,
      bugTrackingWorkflow,
      approvalWorkflow,
    };
  }); // トランザクション終了
}
