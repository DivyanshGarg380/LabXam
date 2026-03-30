type MockFn = jest.Mock;

type MockQueryBuilder = {
  select: MockFn;
  insert: MockFn;
  update: MockFn;
  delete: MockFn;
  eq: MockFn;
};

export const mockSupabase = {
  from: jest.fn((table: string): MockQueryBuilder => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn(),
  })),
};