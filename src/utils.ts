import core from '@actions/core';

export function getInputArray(name: string): string[] {
  const rawInput = core.getInput(name);
  return rawInput !== '' ? rawInput.split(',') : [];
}
