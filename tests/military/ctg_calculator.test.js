import { calculateRelocationBudget } from '../../src/military/ctg_calculator.js';

describe('Relocation CTG Calculator', () => {
  test('Calculates 80% basic pay as CTG grant', () => {
    const budget = calculateRelocationBudget(60000, 3, 800);
    expect(budget.ctgAmount).toBe(48000);
    expect(budget.luggageAllowance).toBe(15000);
    expect(budget.totalGrant).toBe(63000);
  });
});
