import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowStatesController } from './workflow-states.controller';

describe('WorkflowStatesController', () => {
  let controller: WorkflowStatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkflowStatesController],
    }).compile();

    controller = module.get<WorkflowStatesController>(WorkflowStatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
