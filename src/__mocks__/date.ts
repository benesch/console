const NativeDate = Date;

export class MockDate extends Date {
  static referenceDate = new NativeDate(2022, 1, 1);
  constructor() {
    super();
    return MockDate.referenceDate;
  }
  static now() {
    return +MockDate.referenceDate;
  }
}

export const mockDate = (date: Date) => {
  MockDate.referenceDate = date;
  global.Date = MockDate as unknown as DateConstructor;
  (jest.spyOn(global, "Date") as any).mockImplementation(() => new MockDate());
};
