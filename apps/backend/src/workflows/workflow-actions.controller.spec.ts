import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowActionsController } from './workflow-actions.controller';

describe('WorkflowActionsController', () => {
  let controller: WorkflowActionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowActionsController],
    }).compile();

    controller = module.get<WorkflowActionsController>(WorkflowActionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
