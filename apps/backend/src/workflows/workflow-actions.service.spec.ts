import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowActionsService } from './workflow-actions.service';

describe('WorkflowActionsService', () => {
  let service: WorkflowActionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkflowActionsService],
    }).compile();

    service = module.get<WorkflowActionsService>(WorkflowActionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
